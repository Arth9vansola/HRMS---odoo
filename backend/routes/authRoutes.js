const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { authMiddleware } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register new employee
// @access  Public (in production, this should be admin only)
router.post('/register', async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, password, phone, dateOfBirth, gender, department, designation, joiningDate, salary } = req.body;

    // Check if employee exists
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: 'Employee already exists' });
    }

    // Create employee
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      department,
      designation,
      joiningDate,
      salary,
    });

    // Generate token
    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      data: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login employee
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for employee
    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(employee._id);

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in employee
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).populate('department');
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
