const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/leave
// @desc    Get leave requests
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // If regular employee, only show their records
    if (req.employee.role === 'employee') {
      query.employee = req.employee.id;
    }
    
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appliedDate: -1 });

    const count = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leaves,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/leave/:id
// @desc    Get single leave request
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName');
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/leave
// @desc    Apply for leave
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: req.employee.id,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve leave request
// @access  Private (HR, Admin, Manager)
router.put('/:id/approve', authMiddleware, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Leave request already processed' });
    }

    leave.status = 'Approved';
    leave.approvedBy = req.employee.id;
    leave.approvedDate = new Date();

    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/leave/:id/reject
// @desc    Reject leave request
// @access  Private (HR, Admin, Manager)
router.put('/:id/reject', authMiddleware, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Leave request already processed' });
    }

    leave.status = 'Rejected';
    leave.approvedBy = req.employee.id;
    leave.approvedDate = new Date();
    leave.rejectionReason = rejectionReason;

    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/leave/:id
// @desc    Delete leave request
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Only allow deletion if it's the employee's own request and it's pending
    if (leave.employee.toString() !== req.employee.id && req.employee.role === 'employee') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete processed leave request' });
    }

    await leave.deleteOne();

    res.status(200).json({ success: true, message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
