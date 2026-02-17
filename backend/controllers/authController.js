const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VALID_DEPARTMENTS = ['IT', 'MAINTENANCE', 'HOSTEL', 'ACCOUNTS', 'LIBRARY', 'SPORTS'];

exports.register = async (req, res) => {
    try {
        let { name, email, password, role, department } = req.body;

        if (role === 'ROLE_USER') {
            department = 'USER';
        } else if (role === 'ROLE_ADMIN') {
            department = 'ADMIN';
        } else if (role === 'ROLE_RESOLVER') {
            if (!department || !VALID_DEPARTMENTS.includes(department.toUpperCase())) {
                return res.status(400).json({ message: `Invalid department. Choose from: ${VALID_DEPARTMENTS.join(', ')}` });
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};