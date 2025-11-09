const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees (all authenticated users can see the list)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query)
      .populate('department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee (full data for own/admin/hr/manager, limited data for others)
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if user is viewing their own profile or has admin/hr/manager role
    const isOwnProfile = employee._id.toString() === req.employee._id.toString();
    const hasFullAccess = ['admin', 'hr', 'manager', 'payroll'].includes(req.employee.role);

    // If regular employee viewing another employee, return limited public info
    if (!isOwnProfile && !hasFullAccess) {
      const publicData = {
        _id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        department: employee.department,
        joiningDate: employee.joiningDate,
        status: employee.status,
        // No salary, bank details, or address
      };
      return res.status(200).json({ success: true, data: publicData, isPublicView: true });
    }

    // Return full data for own profile or admin/hr/manager
    res.status(200).json({ success: true, data: employee, isPublicView: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (HR, Admin)
router.post('/', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    // Check if employeeId already exists (in case of duplicate)
    if (req.body.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
      if (existingEmployee) {
        // Generate a new unique ID with a different serial number
        const year = new Date(req.body.joiningDate).getFullYear();
        const firstNamePart = req.body.firstName.substring(0, 2).toUpperCase();
        const lastNamePart = req.body.lastName.substring(0, 2).toUpperCase();
        
        // Find the highest serial number for this pattern
        const pattern = `OI${firstNamePart}${lastNamePart}${year}`;
        const existingEmployees = await Employee.find({ 
          employeeId: { $regex: `^${pattern}` } 
        }).sort({ employeeId: -1 }).limit(1);
        
        let serial = 1001;
        if (existingEmployees.length > 0) {
          const lastSerial = parseInt(existingEmployees[0].employeeId.slice(-4));
          serial = lastSerial + 1;
        }
        
        req.body.employeeId = `${pattern}${serial}`;
      }
    }

    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (HR, Admin)
router.put('/:id', authMiddleware, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin)
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
