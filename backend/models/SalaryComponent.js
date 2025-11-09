const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  totalWage: {
    type: Number,
    required: true,
  },
  // Allowances
  hra: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  standardAllowance: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  performanceBonus: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  lta: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  fixedAllowance: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  // Deductions
  employeePF: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: true },
    percentage: { type: Number, default: 12 }, // 12% of basic
  },
  employerPF: {
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: true },
    percentage: { type: Number, default: 12 }, // 12% of basic
  },
  professionalTax: {
    amount: { type: Number, default: 200 },
    isPercentage: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate amounts before saving
salaryComponentSchema.pre('save', function(next) {
  const component = this;
  
  // Calculate HRA
  if (component.hra.isPercentage) {
    component.hra.amount = (component.basicSalary * component.hra.percentage) / 100;
  }
  
  // Calculate Standard Allowance
  if (component.standardAllowance.isPercentage) {
    component.standardAllowance.amount = (component.basicSalary * component.standardAllowance.percentage) / 100;
  }
  
  // Calculate Performance Bonus
  if (component.performanceBonus.isPercentage) {
    component.performanceBonus.amount = (component.basicSalary * component.performanceBonus.percentage) / 100;
  }
  
  // Calculate LTA
  if (component.lta.isPercentage) {
    component.lta.amount = (component.basicSalary * component.lta.percentage) / 100;
  }
  
  // Calculate Fixed Allowance
  if (component.fixedAllowance.isPercentage) {
    component.fixedAllowance.amount = (component.basicSalary * component.fixedAllowance.percentage) / 100;
  }
  
  // Calculate PF
  if (component.employeePF.isPercentage) {
    component.employeePF.amount = (component.basicSalary * component.employeePF.percentage) / 100;
  }
  
  if (component.employerPF.isPercentage) {
    component.employerPF.amount = (component.basicSalary * component.employerPF.percentage) / 100;
  }
  
  // Calculate Gross Salary (Basic + All Allowances)
  component.grossSalary = component.basicSalary 
    + component.hra.amount 
    + component.standardAllowance.amount 
    + component.performanceBonus.amount 
    + component.lta.amount 
    + component.fixedAllowance.amount;
  
  // Calculate Total Deductions (Employee PF + Professional Tax)
  component.totalDeductions = component.employeePF.amount + component.professionalTax.amount;
  
  // Calculate Net Salary
  component.netSalary = component.grossSalary - component.totalDeductions;
  
  next();
});

// Create index for employee and effectiveDate
salaryComponentSchema.index({ employee: 1, effectiveDate: -1 });

module.exports = mongoose.model('SalaryComponent', salaryComponentSchema);
