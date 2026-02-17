const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/login', authController.login);
router.post('/register', protect, allowRoles('ROLE_ADMIN'), authController.register);

module.exports = router;