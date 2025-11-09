const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  employeeCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Department', departmentSchema);
