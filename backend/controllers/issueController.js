const db = require('../config/db');

// 1. Raise Issue with AUTO-ASSIGNMENT & LOAD BALANCING
exports.raiseIssue = async (req, res) => {
    const { title, description, category } = req.body;

    try {
        // Find resolver in the matching department with the least active (unresolved) tasks
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
        await db.execute('UPDATE issues SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
        res.json({ message: "Status updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Get All Issues with SEARCH & FILTERS (Admin View)
exports.getAllIssues = async (req, res) => {
    try {
        const { status, category } = req.query; // Capture ?status=OPEN etc.
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
        const [issues] = await db.execute(`
            SELECT i.*, u.name AS reporter_name 
            FROM issues i
            JOIN users u ON i.reporter_id = u.id
            WHERE i.resolver_id = ?
        `, [req.params.resolverId]);
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Get my issues (Student View)
exports.getMyIssues = async (req, res) => {
    try {
        const [issues] = await db.execute(
            'SELECT * FROM issues WHERE reporter_id = ? ORDER BY created_at DESC', 
            [req.params.userId]
        );
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Get Dashboard Stats (Admin)
exports.getStats = async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM issues 
            GROUP BY status
        `);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};