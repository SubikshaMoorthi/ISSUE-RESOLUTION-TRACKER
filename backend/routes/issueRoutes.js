const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/raise', protect, allowRoles('ROLE_USER'), issueController.raiseIssue);
router.get('/admin/all', protect, allowRoles('ROLE_ADMIN'), issueController.getAllIssues);
router.put('/:id/assign', protect, allowRoles('ROLE_ADMIN'), issueController.assignIssue);
router.put('/:id/status', protect, allowRoles('ROLE_RESOLVER', 'ROLE_ADMIN'), issueController.updateStatus);
router.get('/resolver/:resolverId', protect, allowRoles('ROLE_RESOLVER'), issueController.getAssignedIssues);
router.get('/user/:userId', protect, allowRoles('ROLE_USER'), issueController.getMyIssues);
router.get('/admin/stats', protect, allowRoles('ROLE_ADMIN'), issueController.getStats);

module.exports = router;