const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/login', authController.login);
router.post('/register', protect, allowRoles('ROLE_ADMIN'), authController.register);
router.get('/users', protect, allowRoles('ROLE_ADMIN'), authController.getAllUsers);
router.delete('/users/:id', protect, allowRoles('ROLE_ADMIN'), authController.deleteUser);

module.exports = router;