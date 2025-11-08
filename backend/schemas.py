"""
Pydantic schemas for WorkZen HRMS API request and response validation.

This module contains all Pydantic models used for data validation,
serialization, and documentation in the FastAPI application.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime, date
from typing import Optional, List
import re


class UserRegister(BaseModel):
    """
    Schema for user registration request.
    
    Validates user registration data including email format
    and password strength requirements.
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    phone: str = Field(..., min_length=10, max_length=15, description="User's phone number")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    company_logo: Optional[str] = Field(None, description="Base64 encoded company logo")
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength requirements."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if not re.match(r'^\+?[\d\s\-\(\)]+$', v):
            raise ValueError('Invalid phone number format')
        return v


class UserLogin(BaseModel):
    """
    Schema for user login request.
    
    Validates user credentials for authentication.
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class Token(BaseModel):
    """
    Schema for authentication token response.
    
    Returns JWT access token for authenticated sessions.
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class LoginResponse(BaseModel):
    """
    Schema for login response including token and user data.
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: "UserResponse" = Field(..., description="User information")


class UserResponse(BaseModel):
    """
    Schema for user data response.
    
    Returns user information without sensitive data like password.
    """
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User's email address")
    login_id: str = Field(None, description="Auto-generated login identifier for the user")
    full_name: str = Field(..., description="User's full name")
    phone: str = Field(..., description="User's phone number")
    role: str = Field(..., description="User's role in the system")
    company_name: Optional[str] = Field(None, description="User's company name")
    company_logo: Optional[str] = Field(None, description="User's company logo")
    
    class Config:
        from_attributes = True


class EmployeeCreate(BaseModel):
    """
    Schema for creating employee profile.
    
    Validates employee organizational and salary information.
    """
    department: str = Field(..., min_length=2, max_length=100, description="Employee's department")
    position: str = Field(..., min_length=2, max_length=100, description="Employee's job position")
    basic_salary: float = Field(..., gt=0, description="Employee's basic salary")
    allowances: float = Field(default=0.0, ge=0, description="Employee's allowances")
    date_of_joining: date = Field(..., description="Employee's joining date")
    user_id: Optional[int] = Field(None, description="Associated user ID")
    
    @validator('basic_salary')
    def validate_basic_salary(cls, v):
        """Validate basic salary is positive."""
        if v <= 0:
            raise ValueError('Basic salary must be greater than 0')
        return v
    
    @validator('date_of_joining')
    def validate_joining_date(cls, v):
        """Validate joining date is not in the future."""
        if v > date.today():
            raise ValueError('Joining date cannot be in the future')
        return v


class EmployeeResponse(BaseModel):
    """
    Schema for employee data response.
    
    Returns complete employee profile information.
    """
    id: int = Field(..., description="Employee ID")
    user_id: int = Field(..., description="Associated user ID")
    department: str = Field(..., description="Employee's department")
    position: str = Field(..., description="Employee's job position")
    basic_salary: float = Field(..., description="Employee's basic salary")
    allowances: float = Field(..., description="Employee's allowances")
    date_of_joining: date = Field(..., description="Employee's joining date")
    
    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    """
    Schema for creating attendance record.
    
    Validates attendance data for daily tracking.
    """
    attendance_date: date = Field(..., description="Attendance date")
    status: str = Field(..., description="Attendance status (Present/Absent/Half Day)")
    
    @validator('status')
    def validate_status(cls, v):
        """Validate attendance status values."""
        allowed_statuses = ["Present", "Absent", "Half Day"]
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @validator('attendance_date')
    def validate_date(cls, v):
        """Validate attendance date is not in the future."""
        if v > date.today():
            raise ValueError('Attendance date cannot be in the future')
        return v


class AttendanceResponse(BaseModel):
    """
    Schema for attendance data response.
    
    Returns attendance record with check-in/check-out times.
    """
    id: int = Field(..., description="Attendance record ID")
    employee_id: int = Field(..., description="Employee ID")
    attendance_date: date = Field(..., description="Attendance date")
    status: str = Field(..., description="Attendance status")
    check_in: datetime = Field(..., description="Check-in time")
    check_out: datetime = Field(..., description="Check-out time")
    remarks: Optional[str] = Field(None, description="Additional remarks")
    
    class Config:
        from_attributes = True


class LeaveRequestCreate(BaseModel):
    """
    Schema for creating leave request.
    
    Validates leave application data.
    """
    leave_type: str = Field(..., description="Leave type (Casual/Sick/Personal/Annual)")
    start_date: date = Field(..., description="Leave start date")
    end_date: date = Field(..., description="Leave end date")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for leave")
    
    @validator('leave_type')
    def validate_leave_type(cls, v):
        """Validate leave type values."""
        allowed_types = ["Casual", "Sick", "Personal", "Annual"]
        if v not in allowed_types:
            raise ValueError(f'Leave type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        """Validate end date is after start date."""
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after or equal to start date')
        return v
    
    @validator('start_date')
    def validate_start_date(cls, v):
        """Validate start date is not in the past."""
        if v < date.today():
            raise ValueError('Leave start date cannot be in the past')
        return v


class LeaveRequestResponse(BaseModel):
    """
    Schema for leave request response.
    
    Returns leave request information with status.
    """
    id: int = Field(..., description="Leave request ID")
    employee_id: int = Field(..., description="Employee ID")
    leave_type: str = Field(..., description="Leave type")
    start_date: date = Field(..., description="Leave start date")
    end_date: date = Field(..., description="Leave end date")
    reason: Optional[str] = Field(None, description="Reason for leave")
    status: str = Field(..., description="Leave status (Pending/Approved/Rejected)")
    created_at: datetime = Field(..., description="Request creation time")
    
    class Config:
        from_attributes = True


class PayrollResponse(BaseModel):
    """
    Schema for payroll data response.
    
    Returns complete payroll calculation with all components.
    """
    id: int = Field(..., description="Payroll record ID")
    employee_id: int = Field(..., description="Employee ID")
    month: int = Field(..., description="Payroll month (1-12)")
    year: int = Field(..., description="Payroll year")
    basic_salary: float = Field(..., description="Basic salary amount")
    allowances: float = Field(..., description="Total allowances")
    gross_salary: float = Field(..., description="Gross salary (basic + allowances)")
    pf_contribution: float = Field(..., description="Provident Fund contribution (12%)")
    professional_tax: float = Field(..., description="Professional tax deduction")
    net_salary: float = Field(..., description="Net salary after deductions")
    status: str = Field(..., description="Payroll status (Draft/Processed)")
    created_at: datetime = Field(..., description="Record creation time")
    
    class Config:
        from_attributes = True


class PayslipResponse(BaseModel):
    """
    Schema for payslip response.
    
    Returns payslip generation information.
    """
    id: int = Field(..., description="Payslip ID")
    payroll_id: int = Field(..., description="Associated payroll ID")
    employee_id: int = Field(..., description="Employee ID")
    payout_date: date = Field(..., description="Salary payout date")
    document_url: Optional[str] = Field(None, description="Payslip document URL")
    generated_at: datetime = Field(..., description="Generation timestamp")
    
    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    """
    Schema for dashboard statistics response.
    
    Returns aggregated statistics for dashboard display.
    """
    total_employees: int = Field(..., description="Total number of employees")
    present_today: int = Field(..., description="Employees present today")
    absent_today: int = Field(..., description="Employees absent today")
    pending_leaves: int = Field(..., description="Pending leave requests")
    monthly_payroll: float = Field(..., description="Monthly payroll total")


class MessageResponse(BaseModel):
    """
    Schema for general message responses.
    
    Returns success or error messages from API operations.
    """
    message: str = Field(..., description="Response message")
    success: bool = Field(default=True, description="Operation success status")


class AttendanceSummaryItem(BaseModel):
    """Response item for attendance summary."""
    status: str = Field(..., description="Attendance status (Present/Absent/Half Day)")
    count: int = Field(..., description="Number of occurrences")


class LeaveSummaryItem(BaseModel):
    """Response item for leave summary."""
    status: str = Field(..., description="Leave request status (Pending/Approved/Rejected)")
    count: int = Field(..., description="Number of requests")


class PayrollSummaryItem(BaseModel):
    """Payroll summary item grouped by month."""
    month: int = Field(..., description="Month number (1-12)")
    count: int = Field(..., description="Number of payrolls/employees paid")
    payout: float = Field(..., description="Total net payout for the month")


class RoleCount(BaseModel):
    role: str = Field(..., description="Role name")
    count: int = Field(..., description="Number of users in this role")


class EmployeeStatsResponse(BaseModel):
    total_employees: int = Field(..., description="Total number of employees/users")
    by_role: List[RoleCount] = Field(..., description="Distribution of users by role")
    active: int = Field(..., description="Number of active users")
    inactive: int = Field(..., description="Number of inactive users")

