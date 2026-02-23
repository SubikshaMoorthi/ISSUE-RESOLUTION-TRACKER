const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VALID_DEPARTMENTS = ['IT', 'MAINTENANCE', 'HOSTEL', 'ACCOUNTS', 'LIBRARY', 'SPORTS'];

// Unified Register: Handles auto-assignment for User/Admin and specific Dept for Resolvers
exports.register = async (req, res) => {
    try {
        let { name, email, password, role, department } = req.body;

        // 1. Logic: Auto-assign departments based on role
        if (role === 'ROLE_USER') {
            department = 'USER';
        } else if (role === 'ROLE_ADMIN') {
            department = 'ADMIN';
        } else if (role === 'ROLE_RESOLVER') {
            // Validation for Resolver department selection
            if (!department || !VALID_DEPARTMENTS.includes(department.toUpperCase())) {
                return res.status(400).json({ 
                    message: `Invalid department. Choose from: ${VALID_DEPARTMENTS.join(', ')}` 
                });
            }
            department = department.toUpperCase();
        }

        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: "User exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, department]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. New: Get all users for the "Users Info" page
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, department FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Login Logic (Updated to return name for the "Welcome" message)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            role: user.role, 
            userId: user.id, 
            name: user.name,
            department: user.department 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Delete User (Admin only)
exports.deleteUser = async (req, res) => {
    let connection;
    try {
        const userId = Number(req.params.id);
        if (!userId) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        
        // Prevent deleting self
        if (userId === Number(req.user.id)) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [targetUsers] = await connection.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [userId]
        );

        if (targetUsers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "User not found" });
        }

        const targetRole = targetUsers[0].role;

        if (targetRole === 'ROLE_USER') {
            // Remove issues raised by this user to satisfy FK constraints.
            await connection.execute('DELETE FROM issues WHERE reporter_id = ?', [userId]);
        } else if (targetRole === 'ROLE_RESOLVER') {
            // Keep issues, unassign resolver, and re-open unresolved ones.
            await connection.execute(
                `UPDATE issues
                 SET resolver_id = NULL,
                     status = CASE
                         WHEN UPPER(status) = 'RESOLVED' THEN 'RESOLVED'
                         ELSE 'OPEN'
                     END
                 WHERE resolver_id = ?`,
                [userId]
            );
        }

        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        await connection.commit();

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
