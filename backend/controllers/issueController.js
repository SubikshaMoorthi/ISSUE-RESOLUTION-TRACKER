const db = require('../config/db');

// 1. Raise Issue with AUTO-ASSIGNMENT & LOAD BALANCING
exports.raiseIssue = async (req, res) => {
    const { title, description, category } = req.body;

    try {
        // Find resolver in matching department with the least unresolved tasks
        const [resolvers] = await db.execute(`
            SELECT u.id, COUNT(i.id) AS active_tasks
            FROM users u
            LEFT JOIN issues i ON u.id = i.resolver_id AND i.status != 'RESOLVED'
            WHERE u.role = 'ROLE_RESOLVER' AND u.department = ?
            GROUP BY u.id
            ORDER BY active_tasks ASC
            LIMIT 1
        `, [category.toUpperCase()]);

        const assignedResolverId = resolvers.length > 0 ? resolvers[0].id : null;
        const status = assignedResolverId ? 'IN_PROGRESS' : 'OPEN';

        await db.execute(
            'INSERT INTO issues (title, description, category, status, reporter_id, resolver_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, category.toUpperCase(), status, req.user.id, assignedResolverId]
        );

        res.status(201).json({ 
            message: assignedResolverId 
                ? `Issue raised and automatically assigned to ${category} resolver.` 
                : `Issue raised. No resolver currently available for ${category}.` 
        });

    } catch (error) {
        res.status(500).json({ message: "Error in auto-assignment", error: error.message });
    }
};

// 2. Assign Issue (Manual Override for Admin)
exports.assignIssue = async (req, res) => {
    try {
        await db.execute('UPDATE issues SET resolver_id = ?, status = "IN_PROGRESS" WHERE id = ?', 
            [req.body.resolverId, req.params.id]);
        res.json({ message: "Issue assigned manually" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Update Status (Resolver/Admin)
exports.updateStatus = async (req, res) => {
    try {
        const nextStatus = String(req.body.status || '').trim().toUpperCase();
        if (!nextStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Support both schemas: some DBs may not have updated_at yet.
        try {
            await db.execute(
                'UPDATE issues SET status = ?, updated_at = NOW() WHERE id = ?',
                [nextStatus, req.params.id]
            );
        } catch (err) {
            if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054)) {
                await db.execute(
                    'UPDATE issues SET status = ? WHERE id = ?',
                    [nextStatus, req.params.id]
                );
            } else {
                throw err;
            }
        }
        res.json({ message: "Status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Get All Issues with SEARCH & FILTERS (Admin View)
exports.getAllIssues = async (req, res) => {
    try {
        const { status, category } = req.query;
        let query = `
            SELECT i.*, 
                   u1.name AS reporter_name, 
                   u2.name AS resolver_name 
            FROM issues i
            LEFT JOIN users u1 ON i.reporter_id = u1.id
            LEFT JOIN users u2 ON i.resolver_id = u2.id
            WHERE 1=1
        `;
        const params = [];

        if (status) { query += " AND i.status = ?"; params.push(status); }
        if (category) { query += " AND i.category = ?"; params.push(category.toUpperCase()); }

        query += " ORDER BY i.created_at DESC";

        const [issues] = await db.execute(query, params);
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Get assigned issues (Resolver View)
exports.getAssignedIssues = async (req, res) => {
    try {
        const requestedResolverId = Number(req.params.resolverId);
        const loggedInResolverId = Number(req.user?.id || req.user?.userId);
        if (!Number.isNaN(requestedResolverId) && requestedResolverId !== loggedInResolverId) {
            return res.status(403).json({ message: 'Unauthorized resolver access' });
        }

        const [issues] = await db.execute(`
            SELECT i.*, u.name AS reporter_name 
            FROM issues i
            JOIN users u ON i.reporter_id = u.id
            WHERE i.resolver_id = ?
            ORDER BY i.created_at DESC
        `, [req.params.resolverId]);
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Get my issues (Student View)
exports.getMyIssues = async (req, res) => {
    try {
        const requestedUserId = Number(req.params.userId);
        const loggedInUserId = Number(req.user?.id || req.user?.userId);
        if (!Number.isNaN(requestedUserId) && requestedUserId !== loggedInUserId) {
            return res.status(403).json({ message: 'Unauthorized user access' });
        }

        const [issues] = await db.execute(`
            SELECT i.*, u.name AS resolver_name
            FROM issues i
            LEFT JOIN users u ON i.resolver_id = u.id
            WHERE i.reporter_id = ?
            ORDER BY i.created_at DESC
        `, [req.params.userId]);
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Get Dashboard Stats (Enhanced for Admin Performance)
exports.getStats = async (req, res) => {
    try {
        // Status Counts (For the curved boxes)
        const [stats] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM issues 
            GROUP BY status
        `);

        // Department-wise counts (For the Pie Chart)
        const [deptStats] = await db.execute(`
            SELECT category AS label, COUNT(*) AS count 
            FROM issues 
            GROUP BY category
        `);

        // Resolver Ratings Distribution (For the Donut Chart)
        const [resolverRatings] = await db.execute(`
            SELECT 
                CASE 
                    WHEN rating >= 4.5 THEN '5 Stars'
                    WHEN rating >= 3.5 THEN '4 Stars'
                    WHEN rating >= 2.5 THEN '3 Stars'
                    WHEN rating >= 1.5 THEN '2 Stars'
                    ELSE '1 Star'
                END AS name,
                COUNT(*) AS count
            FROM issues
            WHERE rating IS NOT NULL
            GROUP BY name
        `);

        // Total Users Count
        const [totalUsersResult] = await db.execute(`
            SELECT COUNT(*) as total FROM users
        `);
        const totalUsers = totalUsersResult[0].total;

        res.json({ stats, deptStats, resolverRatings, totalUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Get Resolver Feedbacks with Resolver Info
exports.getFeedbacks = async (req, res) => {
    try {
        const [feedbacks] = await db.execute(`
            SELECT 
                i.id,
                u1.name AS 'from',
                u2.name AS 'to',
                i.rating,
                i.feedback_type,
                i.feedback_text AS comment,
                i.created_at
            FROM issues i
            JOIN users u1 ON i.reporter_id = u1.id
            LEFT JOIN users u2 ON i.resolver_id = u2.id
            WHERE i.feedback_text IS NOT NULL AND i.resolver_id IS NOT NULL
            ORDER BY i.created_at DESC
        `);
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Submit Feedback & Rating (User Action)
exports.submitFeedback = async (req, res) => {
    const { feedback_text, feedback_type, rating } = req.body;
    try {
        const normalizedFeedbackType = String(feedback_type || '').trim().toUpperCase();
        const allowedFeedbackTypes = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
        if (!allowedFeedbackTypes.includes(normalizedFeedbackType)) {
            return res.status(400).json({ message: 'Invalid feedback type. Use POSITIVE, NEUTRAL, or NEGATIVE.' });
        }

        const [rows] = await db.execute(
            'SELECT id, reporter_id, resolver_id, status, feedback_text, rating FROM issues WHERE id = ?',
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const issue = rows[0];
        if (Number(issue.reporter_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'You can submit feedback only for your own issue' });
        }

        if (String(issue.status || '').toUpperCase() !== 'RESOLVED') {
            return res.status(400).json({ message: 'Feedback can be submitted only for resolved issues' });
        }

        if (!issue.resolver_id) {
            return res.status(400).json({ message: 'Cannot submit feedback: no resolver assigned to this issue' });
        }

        if (issue.feedback_text !== null || issue.rating !== null) {
            return res.status(409).json({ message: 'Feedback already submitted for this issue' });
        }

        const [result] = await db.execute(
            `UPDATE issues
             SET feedback_text = ?, feedback_type = ?, rating = ?
             WHERE id = ? AND reporter_id = ? AND feedback_text IS NULL AND rating IS NULL`,
            [feedback_text, normalizedFeedbackType, rating, req.params.id, req.user.id]
        );

        if (!result.affectedRows) {
            return res.status(409).json({ message: 'Feedback already submitted for this issue' });
        }

        res.json({ message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Get Resolved Issues for a Resolver
exports.getResolvedIssues = async (req, res) => {
    try {
        const requestedResolverId = Number(req.params.resolverId);
        const loggedInResolverId = Number(req.user?.id || req.user?.userId);
        if (!Number.isNaN(requestedResolverId) && requestedResolverId !== loggedInResolverId) {
            return res.status(403).json({ message: 'Unauthorized resolver access' });
        }

        const [issues] = await db.execute(`
            SELECT i.*, u.name AS reporter_name 
            FROM issues i
            JOIN users u ON i.reporter_id = u.id
            WHERE i.resolver_id = ? AND UPPER(i.status) = 'RESOLVED'
            ORDER BY i.updated_at DESC
        `, [req.params.resolverId]);
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 11. Get Resolver Stats (Assigned, Resolved, Pending for a specific resolver)
exports.getResolverStats = async (req, res) => {
    try {
        const resolverId = req.params.resolverId;
        const requestedResolverId = Number(resolverId);
        const loggedInResolverId = Number(req.user?.id || req.user?.userId);
        if (!Number.isNaN(requestedResolverId) && requestedResolverId !== loggedInResolverId) {
            return res.status(403).json({ message: 'Unauthorized resolver access' });
        }
        
        // Get stats for this specific resolver
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_assigned,
                SUM(CASE WHEN UPPER(status) = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN UPPER(status) != 'RESOLVED' THEN 1 ELSE 0 END) as pending
            FROM issues
            WHERE resolver_id = ?
        `, [resolverId]);

        // Get average rating for this resolver
        const [ratingData] = await db.execute(`
            SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings
            FROM issues
            WHERE resolver_id = ? AND rating IS NOT NULL
        `, [resolverId]);

        // Get department info
        const [userInfo] = await db.execute(`
            SELECT department FROM users WHERE id = ?
        `, [resolverId]);

        const department = userInfo?.[0]?.department || 'UNKNOWN';

        // Get department-wide resolver rankings
        const [departmentRankings] = await db.execute(`
            SELECT 
                u.id,
                u.name,
                COUNT(i.id) as total_resolved,
                AVG(i.rating) as avg_rating
            FROM users u
            LEFT JOIN issues i ON u.id = i.resolver_id AND UPPER(i.status) = 'RESOLVED'
            WHERE u.role = 'ROLE_RESOLVER' AND u.department = ?
            GROUP BY u.id, u.name
            ORDER BY total_resolved DESC
        `, [department]);

        // Get rating distribution for this resolver
        const [ratingDistribution] = await db.execute(`
            SELECT 
                CASE 
                    WHEN rating >= 4.5 THEN '5 Stars'
                    WHEN rating >= 3.5 THEN '4 Stars'
                    WHEN rating >= 2.5 THEN '3 Stars'
                    WHEN rating >= 1.5 THEN '2 Stars'
                    ELSE '1 Star'
                END AS name,
                COUNT(*) AS count
            FROM issues
            WHERE resolver_id = ? AND rating IS NOT NULL
            GROUP BY name
        `, [resolverId]);

        res.json({
            stats: stats[0] || { total_assigned: 0, resolved: 0, pending: 0 },
            ratingData: ratingData[0] || { avg_rating: 0, total_ratings: 0 },
            departmentRankings: departmentRankings || [],
            ratingDistribution: ratingDistribution || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 12. Get Feedbacks for a Specific Resolver
exports.getResolverFeedbacks = async (req, res) => {
    try {
        const requestedResolverId = Number(req.params.resolverId);
        const loggedInResolverId = Number(req.user?.id || req.user?.userId);
        if (!Number.isNaN(requestedResolverId) && requestedResolverId !== loggedInResolverId) {
            return res.status(403).json({ message: 'Unauthorized resolver access' });
        }

        const [feedbacks] = await db.execute(`
            SELECT 
                i.id,
                u.name AS from_user,
                i.feedback_type,
                i.rating,
                i.feedback_text AS comment,
                i.created_at
            FROM issues i
            JOIN users u ON i.reporter_id = u.id
            WHERE i.resolver_id = ? AND i.feedback_text IS NOT NULL
            ORDER BY i.created_at DESC
        `, [req.params.resolverId]);
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
