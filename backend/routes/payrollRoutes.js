const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { employeeId, month, year, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // If regular employee, only show their records
    if (req.employee.role === 'employee') {
      query.employee = req.employee.id;
    } else if (employeeId) {
      query.employee = employeeId;
    }
    
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1, month: -1 });

    const count = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payrolls,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get single payroll record
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email');
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Employee can only view their own payroll
    if (req.employee.role === 'employee' && payroll.employee._id.toString() !== req.employee.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payroll
// @desc    Create payroll record
// @access  Private (HR, Admin)
router.post('/', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const {
      employee,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      bonus,
      overtime,
      workingDays,
      presentDays,
    } = req.body;

    // Calculate gross salary
    const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + val, 0);
    const grossSalary = basicSalary + totalAllowances + bonus + (overtime?.amount || 0);

    // Calculate net salary
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + val, 0);
    const netSalary = grossSalary - totalDeductions;

    const payroll = await Payroll.create({
      employee,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      bonus,
      overtime,
      grossSalary,
      netSalary,
      workingDays,
      presentDays,
    });

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record
// @access  Private (HR, Admin)
router.put('/:id', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/payroll/:id/process
// @desc    Process payroll
// @access  Private (HR, Admin)
router.put('/:id/process', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.status = 'Processed';
    await payroll.save();

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/payroll/:id/pay
// @desc    Mark payroll as paid
// @access  Private (HR, Admin)
router.put('/:id/pay', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.status = 'Paid';
    payroll.paymentDate = new Date();
    payroll.paymentMethod = paymentMethod || 'Bank Transfer';

    await payroll.save();

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
