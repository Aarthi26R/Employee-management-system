const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, reviewLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyLeave)
  .get(protect, authorize('admin', 'manager'), getAllLeaves);

router.route('/myleaves')
  .get(protect, getMyLeaves);

router.route('/:id/review')
  .put(protect, authorize('admin', 'manager'), reviewLeave);

module.exports = router;
