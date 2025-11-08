"""
Database models for WorkZen HRMS System.

This module contains all SQLAlchemy models representing the core entities
of the HRMS system including Users, Employees, Attendance, Leave Management,
and Payroll processing.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Boolean, 
    Enum, ForeignKey, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from database import Base


# Enum Definitions
class UserRole(str, enum.Enum):
    """User roles in the HRMS system."""
    ADMIN = "Admin"
    HR_OFFICER = "HR Officer"
    PAYROLL_OFFICER = "Payroll Officer"
    EMPLOYEE = "Employee"


class AttendanceStatus(str, enum.Enum):
    """Attendance status options."""
    PRESENT = "Present"
    ABSENT = "Absent"
    HALF_DAY = "Half Day"


class LeaveType(str, enum.Enum):
    """Leave type options."""
    CASUAL = "Casual"
    SICK = "Sick"
    PERSONAL = "Personal"
    ANNUAL = "Annual"


class LeaveStatus(str, enum.Enum):
    """Leave request status options."""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


# TABLE 1 - User Model
class User(Base):
    """
    User authentication and basic information model.
    
    Represents system users with authentication credentials and role assignment.
    Each user can have one employee profile associated.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # auto-generated login identifier (e.g. OIJODO20220001)
    login_id = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    # Company information for registration
    company_name = Column(String(255), nullable=True)
    company_logo = Column(String(1000), nullable=True)  # Base64 or URL
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="user", uselist=False)


# TABLE 2 - Employee Model
class Employee(Base):
    """
    Employee profile and organizational information model.
    
    Contains detailed employee information including department, salary,
    and reporting structure. Links to user authentication.
    """
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    basic_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0.0, nullable=False)
    date_of_joining = Column(Date, nullable=False)
    reporting_manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="employee")
    reporting_manager = relationship("Employee", remote_side=[id])
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan", foreign_keys="LeaveRequest.employee_id")
    leave_allocations = relationship("LeaveAllocation", back_populates="employee", cascade="all, delete-orphan")
    payroll_records = relationship("Payroll", back_populates="employee", cascade="all, delete-orphan")
    payslips = relationship("Payslip", back_populates="employee", cascade="all, delete-orphan")


# TABLE 3 - Attendance Model
class Attendance(Base):
    """
    Employee attendance tracking model.
    
    Records daily attendance with check-in/check-out times and status.
    Indexed for efficient querying by employee and date.
    """
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.ABSENT)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    remarks = Column(String(500), nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='unique_employee_date_attendance'),
        Index('idx_employee_date', 'employee_id', 'date'),
    )


# TABLE 4 - LeaveRequest Model
class LeaveRequest(Base):
    """
    Employee leave request management model.
    
    Handles leave applications with approval workflow.
    Tracks leave type, duration, and approval status.
    """
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(500), nullable=False)
    status = Column(Enum(LeaveStatus), nullable=False, default=LeaveStatus.PENDING)
    approver_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_requests", foreign_keys=[employee_id])
    approver = relationship("Employee", foreign_keys=[approver_id])


# TABLE 5 - LeaveAllocation Model
class LeaveAllocation(Base):
    """
    Annual leave allocation tracking model.
    
    Manages yearly leave entitlements and usage tracking
    for different leave types per employee.
    """
    __tablename__ = "leave_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    total_days = Column(Integer, nullable=False)
    used_days = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_allocations")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('employee_id', 'year', 'leave_type', name='unique_employee_year_leave_type'),
        Index('idx_employee_year', 'employee_id', 'year'),
    )


# TABLE 6 - Payroll Model
class Payroll(Base):
    """
    Monthly payroll calculation and processing model.
    
    Stores detailed salary calculations including basic pay, allowances,
    deductions (PF, Professional Tax), and net salary computation.
    """
    __tablename__ = "payroll"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    basic_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0.0, nullable=False)
    gross_salary = Column(Float, nullable=False)
    pf_contribution = Column(Float, default=0.0, nullable=False)  # 12% of basic salary
    professional_tax = Column(Float, default=0.0, nullable=False)
    net_salary = Column(Float, nullable=False)
    status = Column(String(20), default="Draft", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="payroll_records")
    payslip = relationship("Payslip", back_populates="payroll", uselist=False, cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('employee_id', 'month', 'year', name='unique_employee_month_year_payroll'),
        Index('idx_employee_payroll_period', 'employee_id', 'year', 'month'),
    )


# TABLE 7 - Payslip Model
class Payslip(Base):
    """
    Generated payslip document model.
    
    Links to payroll record and tracks payslip generation
    with document storage capability.
    """
    __tablename__ = "payslips"
    
    id = Column(Integer, primary_key=True, index=True)
    payroll_id = Column(Integer, ForeignKey("payroll.id"), unique=True, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    payout_date = Column(Date, nullable=False)
    document_url = Column(String(500), nullable=True)  # URL to stored payslip document
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    payroll = relationship("Payroll", back_populates="payslip")
    employee = relationship("Employee", back_populates="payslips")


# TABLE 8 - Role Model
class Role(Base):
    """
    Role-based access control model.
    
    Defines system roles and their associated permissions
    for fine-grained access control.
    """
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False, index=True)
    permissions = Column(JSON, nullable=False)  # Store permissions as JSON
    
    def __repr__(self):
        return f"<Role(role_name='{self.role_name}')>"


# Create all model indexes for performance optimization
def create_indexes():
    """
    Create additional database indexes for performance optimization.
    
    This function can be called during database setup to ensure
    optimal query performance for frequently accessed data.
    """
    pass  # Indexes are defined in table args above
