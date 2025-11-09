const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get employee from token
    req.employee = await Employee.findById(decoded.id).select('-password');

    if (!req.employee) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.employee.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
