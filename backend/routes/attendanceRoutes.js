const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // If regular employee, only show their records
    if (req.employee.role === 'employee') {
      query.employee = req.employee.id;
    } else if (employeeId) {
      query.employee = employeeId;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: attendance,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/attendance/checkin
// @desc    Check in attendance
// @access  Private
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.employee.id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await Attendance.create({
      employee: req.employee.id,
      date: today,
      checkIn: new Date(),
      status: 'Present',
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out attendance
// @access  Private
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.employee.id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    
    // Calculate work hours
    const checkInTime = new Date(attendance.checkIn);
    const checkOutTime = new Date(attendance.checkOut);
    const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    attendance.workHours = parseFloat(workHours.toFixed(2));

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance (Admin/HR)
// @access  Private (HR, Admin)
router.post('/', authMiddleware, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance
// @access  Private (HR, Admin)
router.put('/:id', authMiddleware, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
