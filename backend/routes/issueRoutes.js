const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/raise', protect, allowRoles('ROLE_USER'), issueController.raiseIssue);
router.get('/admin/all', protect, allowRoles('ROLE_ADMIN'), issueController.getAllIssues);
router.get('/admin/stats', protect, allowRoles('ROLE_ADMIN'), issueController.getStats);

// CRITICAL: This route fixes the blank Feedback page
router.get('/admin/feedbacks', protect, allowRoles('ROLE_ADMIN'), issueController.getFeedbacks);

router.put('/:id/assign', protect, allowRoles('ROLE_ADMIN'), issueController.assignIssue);
router.put('/:id/status', protect, allowRoles('ROLE_RESOLVER', 'ROLE_ADMIN'), issueController.updateStatus);

// Resolver-specific routes (MUST come before /resolver/:resolverId route)
router.get('/resolver/:resolverId/resolved', protect, allowRoles('ROLE_RESOLVER'), issueController.getResolvedIssues);
router.get('/resolver/:resolverId/stats', protect, allowRoles('ROLE_RESOLVER'), issueController.getResolverStats);
router.get('/resolver/:resolverId/feedbacks', protect, allowRoles('ROLE_RESOLVER'), issueController.getResolverFeedbacks);

// General resolver route (MUST come after specific routes)
router.get('/resolver/:resolverId', protect, allowRoles('ROLE_RESOLVER'), issueController.getAssignedIssues);

router.get('/user/:userId', protect, allowRoles('ROLE_USER'), issueController.getMyIssues);
router.put('/:id/feedback', protect, allowRoles('ROLE_USER'), issueController.submitFeedback);

module.exports = router;