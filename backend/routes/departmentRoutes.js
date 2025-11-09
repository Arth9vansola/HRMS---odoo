const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName email');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/departments/:id
// @desc    Get single department
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName email');
    
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Get employees in this department
    const employees = await Employee.find({ department: req.params.id }).select('firstName lastName email designation');

    res.status(200).json({ success: true, data: { ...department._doc, employees } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (HR, Admin)
router.post('/', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (HR, Admin)
router.put('/:id', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin)
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
