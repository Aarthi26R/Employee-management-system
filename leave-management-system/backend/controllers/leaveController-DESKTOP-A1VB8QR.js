const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

const applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  try {
    const employee = await User.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (leaveType !== 'unpaidLeave') {
      const balance = employee.leaveBalances[leaveType];
      if (balance === undefined) {
        return res.status(400).json({ message: 'Invalid leave type' });
      }
      if (balance < daysCount) {
        return res.status(400).json({ message: `Insufficient leave balance. Required: ${daysCount}, Available: ${balance}` });
      }
    }

    const leaveRequest = await LeaveRequest.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('employee', 'name email department designation leaveBalances')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const reviewLeave = async (req, res) => {
  const { id } = req.params;
  const { status, statusRemarks } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const employee = await User.findById(leaveRequest.employee);
    if (!employee) {
      return res.status(404).json({ message: 'Employee associated with this leave request not found' });
    }

    const oldStatus = leaveRequest.status;
    const newStatus = status;

    if (oldStatus !== newStatus) {
      const leaveType = leaveRequest.leaveType;
      if (leaveType !== 'unpaidLeave') {
        // Refund if moving AWAY from approved
        if (oldStatus === 'approved') {
          employee.leaveBalances[leaveType] += leaveRequest.daysCount;
        }
        // Deduct if moving TO approved
        if (newStatus === 'approved') {
          const balance = employee.leaveBalances[leaveType];
          if (balance < leaveRequest.daysCount) {
            return res.status(400).json({ message: 'Employee has insufficient leave balance to approve this request' });
          }
          employee.leaveBalances[leaveType] -= leaveRequest.daysCount;
        }
        await employee.save();
      }
    }

    leaveRequest.status = status;
    leaveRequest.statusRemarks = statusRemarks !== undefined ? statusRemarks : leaveRequest.statusRemarks;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();

    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
