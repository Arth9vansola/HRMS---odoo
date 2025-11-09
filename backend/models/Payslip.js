const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  payPeriod: {
    type: String,
    required: true, // e.g., "October 2025"
  },
  // Employee Details
  employeeCode: String,
  employeeName: String,
  designation: String,
  department: String,
  location: String,
  dateOfJoining: Date,
  pan: String,
  uan: String,
  bankAccount: String,
  
  // Attendance
  workedDays: {
    type: Number,
    required: true,
    default: 0,
  },
  paidTimeOff: {
    type: Number,
    default: 0,
  },
  unpaidLeave: {
    type: Number,
    default: 0,
  },
  totalDaysInMonth: {
    type: Number,
    required: true,
  },
  
  // Earnings
  basicSalary: {
    type: Number,
    required: true,
  },
  hra: {
    rate: Number,
    amount: Number,
  },
  standardAllowance: {
    rate: Number,
    amount: Number,
  },
  performanceBonus: {
    rate: Number,
    amount: Number,
  },
  lta: {
    rate: Number,
    amount: Number,
  },
  fixedAllowance: {
    rate: Number,
    amount: Number,
  },
  
  grossSalary: {
    type: Number,
    required: true,
  },
  
  // Deductions
  employeePF: {
    rate: Number,
    amount: Number,
  },
  employerPF: {
    rate: Number,
    amount: Number,
  },
  professionalTax: {
    amount: Number,
  },
  tds: {
    amount: { type: Number, default: 0 },
  },
  otherDeductions: {
    amount: { type: Number, default: 0 },
  },
  
  totalDeductions: {
    type: Number,
    required: true,
  },
  
  netSalary: {
    type: Number,
    required: true,
  },
  
  // Employer Cost
  employerCost: {
    type: Number,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Computed', 'Validated', 'Done'],
    default: 'Draft',
  },
  
  // Computed amounts
  computedAmount: Number,
  
  // Validation
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  validatedAt: Date,
  
  // Payment
  paidAt: Date,
  paymentMethod: String,
  
  notes: String,
}, {
  timestamps: true,
});

// Create compound index
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
