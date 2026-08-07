const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, department, designation, role, leaveBalances } = req.body;

  try {
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.role = role || employee.role;
    if (leaveBalances) {
      employee.leaveBalances = {
        sickLeave: leaveBalances.sickLeave !== undefined ? Number(leaveBalances.sickLeave) : employee.leaveBalances.sickLeave,
        casualLeave: leaveBalances.casualLeave !== undefined ? Number(leaveBalances.casualLeave) : employee.leaveBalances.casualLeave,
        paidLeave: leaveBalances.paidLeave !== undefined ? Number(leaveBalances.paidLeave) : employee.leaveBalances.paidLeave,
        unpaidLeave: leaveBalances.unpaidLeave !== undefined ? Number(leaveBalances.unpaidLeave) : employee.leaveBalances.unpaidLeave
      };
    }

    const updatedEmployee = await employee.save();
    res.json({
      _id: updatedEmployee._id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      role: updatedEmployee.role,
      department: updatedEmployee.department,
      designation: updatedEmployee.designation,
      leaveBalances: updatedEmployee.leaveBalances
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an Admin user' });
    }

    await LeaveRequest.deleteMany({ employee: id });
    await User.findByIdAndDelete(id);

    res.json({ message: 'Employee and their requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: { $ne: 'admin' } });
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: 'rejected' });

    const categoriesStats = await LeaveRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$leaveType', count: { $sum: '$daysCount' } } }
    ]);

    res.json({
      totalEmployees,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      categoriesStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllEmployees, updateEmployee, deleteEmployee, getDashboardStats };
