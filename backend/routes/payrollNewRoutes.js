const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');
const SalaryComponent = require('../models/SalaryComponent');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Middleware to check payroll access
const checkPayrollAccess = (req, res, next) => {
  if (req.employee.role !== 'admin' && req.employee.role !== 'payroll') {
    return res.status(403).json({ message: 'Access denied. Admin or Payroll Officer only.' });
  }
  next();
};

// GET /api/payroll-new/warnings - Get payroll warnings
router.get('/warnings', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    // Find employees without bank account
    const noBankAccount = await Employee.find({
      status: 'Active',
      $or: [
        { bankAccount: { $exists: false } },
        { bankAccount: null },
        { bankAccount: '' }
      ]
    }).select('firstName lastName employeeId');

    // Find employees without manager
    const noManager = await Employee.find({
      status: 'Active',
      $or: [
        { manager: { $exists: false } },
        { manager: null }
      ]
    }).select('firstName lastName employeeId');

    res.json({
      noBankAccount,
      noManager,
    });
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payroll-new/payruns - Get payrun history
router.get('/payruns', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const payruns = await Payslip.aggregate([
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          payslipCount: { $sum: 1 },
          totalCost: { $sum: '$employerCost' },
          monthName: { $first: '$payPeriod' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          monthName: '$monthName',
          payslipCount: 1,
          totalCost: 1,
        },
      },
      { $sort: { year: -1, month: -1 } },
      { $limit: 12 },
    ]);

    res.json(payruns);
  } catch (error) {
    console.error('Error fetching payruns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payroll-new/charts - Get chart data
router.get('/charts', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar'];
    const monthNumbers = [1, 2, 3];
    
    const employerCost = [];
    const employeeCount = [];
    
    for (const monthNum of monthNumbers) {
      const payslips = await Payslip.find({
        month: monthNum,
        year: currentYear,
      });
      
      const cost = payslips.reduce((sum, p) => sum + (p.employerCost || 0), 0);
      employerCost.push(cost);
      employeeCount.push(payslips.length);
    }
    
    res.json({
      months: months.map(m => `${m} ${currentYear}`),
      employerCost,
      employeeCount,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payroll-new/payslips/:month/:year - Get payslips for a month
router.get('/payslips/:month/:year', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const payslips = await Payslip.find({
      month: parseInt(month),
      year: parseInt(year),
    }).populate('employee', 'firstName lastName employeeId');
    
    if (!payslips || payslips.length === 0) {
      return res.status(404).json({ message: 'No payslips found for this period' });
    }
    
    res.json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payroll-new/generate-payrun - Generate payrun for all employees
router.post('/generate-payrun', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Check if payrun already exists
    const existing = await Payslip.findOne({ month, year });
    if (existing) {
      return res.status(400).json({ message: 'Payrun already exists for this period' });
    }
    
    // Get all active employees
    const employees = await Employee.find({ status: 'Active' });
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const payPeriod = `${monthNames[month - 1]} ${year}`;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    
    const payslips = [];
    
    for (const employee of employees) {
      // Get salary component
      const salaryComponent = await SalaryComponent.findOne({
        employee: employee._id,
      }).sort({ effectiveDate: -1 });
      
      if (!salaryComponent) {
        console.log(`No salary component for ${employee.firstName} ${employee.lastName}`);
        continue;
      }
      
      // Get attendance for the month
      const attendance = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
        status: 'Present',
      });
      
      // Get leaves for the month
      const leaves = await Leave.find({
        employee: employee._id,
        status: 'Approved',
        startDate: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      });
      
      const workedDays = attendance.length;
      const paidTimeOff = leaves.filter(l => l.leaveType === 'Paid').length;
      const unpaidLeave = leaves.filter(l => l.leaveType === 'Unpaid').length;
      
      // Calculate prorated salary based on attendance
      const totalWorkableDays = totalDaysInMonth;
      const totalPaidDays = workedDays + paidTimeOff;
      const salaryFactor = totalPaidDays / totalWorkableDays;
      
      // Calculate amounts
      const basicSalary = salaryComponent.basicSalary * salaryFactor;
      const hra = salaryComponent.hra.amount * salaryFactor;
      const standardAllowance = salaryComponent.standardAllowance.amount * salaryFactor;
      const performanceBonus = salaryComponent.performanceBonus.amount * salaryFactor;
      const lta = salaryComponent.lta.amount * salaryFactor;
      const fixedAllowance = salaryComponent.fixedAllowance.amount * salaryFactor;
      
      const grossSalary = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
      
      // Deductions
      const employeePF = salaryComponent.employeePF.amount * salaryFactor;
      const employerPF = salaryComponent.employerPF.amount * salaryFactor;
      const professionalTax = salaryComponent.professionalTax.amount;
      
      const totalDeductions = employeePF + professionalTax;
      const netSalary = grossSalary - totalDeductions;
      const employerCost = netSalary + employerPF;
      
      // Create payslip
      const payslip = new Payslip({
        employee: employee._id,
        month,
        year,
        payPeriod,
        employeeCode: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        designation: employee.designation,
        department: employee.department?.name,
        location: employee.location,
        dateOfJoining: employee.joiningDate,
        pan: employee.pan,
        uan: employee.uan,
        bankAccount: employee.bankAccount,
        workedDays,
        paidTimeOff,
        unpaidLeave,
        totalDaysInMonth,
        basicSalary: Math.round(basicSalary),
        hra: {
          rate: salaryComponent.hra.percentage || 0,
          amount: Math.round(hra),
        },
        standardAllowance: {
          rate: salaryComponent.standardAllowance.percentage || 0,
          amount: Math.round(standardAllowance),
        },
        performanceBonus: {
          rate: salaryComponent.performanceBonus.percentage || 0,
          amount: Math.round(performanceBonus),
        },
        lta: {
          rate: salaryComponent.lta.percentage || 0,
          amount: Math.round(lta),
        },
        fixedAllowance: {
          rate: salaryComponent.fixedAllowance.percentage || 0,
          amount: Math.round(fixedAllowance),
        },
        grossSalary: Math.round(grossSalary),
        employeePF: {
          rate: salaryComponent.employeePF.percentage || 0,
          amount: Math.round(employeePF),
        },
        employerPF: {
          rate: salaryComponent.employerPF.percentage || 0,
          amount: Math.round(employerPF),
        },
        professionalTax: {
          amount: Math.round(professionalTax),
        },
        totalDeductions: Math.round(totalDeductions),
        netSalary: Math.round(netSalary),
        employerCost: Math.round(employerCost),
        computedAmount: Math.round(netSalary),
        status: 'Computed',
      });
      
      payslips.push(payslip);
    }
    
    await Payslip.insertMany(payslips);
    
    res.json({ 
      message: `Payrun generated successfully for ${payPeriod}`,
      count: payslips.length,
    });
  } catch (error) {
    console.error('Error generating payrun:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/payroll-new/validate-payrun - Validate all payslips for a month
router.post('/validate-payrun', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    await Payslip.updateMany(
      { month, year, status: { $ne: 'Done' } },
      { 
        status: 'Validated',
        validatedBy: req.employee._id,
        validatedAt: new Date(),
      }
    );
    
    res.json({ message: 'Payslips validated successfully' });
  } catch (error) {
    console.error('Error validating payrun:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payroll-new/payslip/:id - Get single payslip details
router.get('/payslip/:id', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId');
    
    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }
    
    res.json(payslip);
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payroll-new/compute-payslip/:id - Compute single payslip
router.post('/compute-payslip/:id', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    
    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }
    
    payslip.status = 'Computed';
    await payslip.save();
    
    res.json({ message: 'Payslip computed successfully', payslip });
  } catch (error) {
    console.error('Error computing payslip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payroll-new/validate-payslip/:id - Validate single payslip
router.post('/validate-payslip/:id', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    
    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }
    
    payslip.status = 'Done';
    payslip.validatedBy = req.employee._id;
    payslip.validatedAt = new Date();
    await payslip.save();
    
    res.json({ message: 'Payslip validated successfully', payslip });
  } catch (error) {
    console.error('Error validating payslip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payroll-new/salary-statement/:employeeId/:year - Get salary statement
router.get('/salary-statement/:employeeId/:year', authMiddleware, checkPayrollAccess, async (req, res) => {
  try {
    const { employeeId, year } = req.params;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const salaryComponent = await SalaryComponent.findOne({
      employee: employeeId,
    }).sort({ effectiveDate: -1 });
    
    if (!salaryComponent) {
      return res.status(404).json({ message: 'No salary component found for this employee' });
    }
    
    res.json({
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
      },
      salaryComponent,
      year: parseInt(year),
    });
  } catch (error) {
    console.error('Error fetching salary statement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
