const express = require('express');
const router = express.Router();
const { getAllEmployees, updateEmployee, deleteEmployee, getDashboardStats } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin', 'manager'));

router.route('/')
  .get(getAllEmployees);

router.route('/stats')
  .get(getDashboardStats);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
