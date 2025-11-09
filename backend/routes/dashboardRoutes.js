const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = {};

    // Total employees
    stats.totalEmployees = await Employee.countDocuments({ status: 'Active' });

    // Total departments
    stats.totalDepartments = await Department.countDocuments({ status: 'Active' });

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.todayPresent = await Attendance.countDocuments({
      date: today,
      status: 'Present',
    });

    // Pending leave requests
    stats.pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // Monthly payroll summary (current month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyPayroll = await Payroll.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: '$netSalary' },
          processedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Processed'] }, 1, 0] },
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] },
          },
        },
      },
    ]);

    stats.monthlyPayroll = monthlyPayroll[0] || {
      totalPayroll: 0,
      processedCount: 0,
      paidCount: 0,
    };

    // Employee by department
    stats.employeesByDepartment = await Employee.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      {
        $project: {
          name: '$department.name',
          count: 1,
        },
      },
    ]);

    // Recent leave requests
    stats.recentLeaves = await Leave.find()
      .populate('employee', 'firstName lastName')
      .sort({ appliedDate: -1 })
      .limit(5);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/attendance-summary
// @desc    Get attendance summary for a period
// @access  Private
router.get('/attendance-summary', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to current month
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      
      query.date = { $gte: start, $lte: end };
    }

    const summary = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
