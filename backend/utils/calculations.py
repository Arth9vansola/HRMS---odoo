"""
Payroll calculation utilities for WorkZen HRMS.

This module provides functions for calculating Indian payroll components
including PF contributions, professional tax, attendance-based adjustments,
and complete salary breakdowns according to Indian labor laws.
"""

from datetime import datetime, date, timedelta
from typing import Tuple, Dict
from calendar import monthrange
from sqlalchemy.orm import Session
from models import Attendance, AttendanceStatus


def calculate_professional_tax(salary: float) -> float:
    """
    Calculate professional tax based on salary slabs as per Indian regulations.
    
    Args:
        salary (float): Gross salary amount
        
    Returns:
        float: Professional tax amount
        
    Professional Tax Slabs:
    - Up to ₹10,000: No tax
    - ₹10,001 to ₹30,000: ₹150 per month
    - Above ₹30,000: ₹200 per month
    
    Example:
        >>> calculate_professional_tax(25000)
        150.0
        >>> calculate_professional_tax(8000)
        0.0
        >>> calculate_professional_tax(45000)
        200.0
    """
    if salary <= 10000:
        return 0.0
    elif salary <= 30000:
        return 150.0
    else:
        return 200.0


def get_working_days(year: int, month: int) -> int:
    """
    Calculate total working days in a month (Monday to Friday).
    
    Args:
        year (int): Year (e.g., 2025)
        month (int): Month (1-12)
        
    Returns:
        int: Number of working days excluding weekends
        
    This function counts weekdays (Monday=0 to Friday=4) and excludes
    weekends (Saturday=5, Sunday=6) from the total days in the month.
    
    Example:
        >>> get_working_days(2025, 1)  # January 2025
        23
        >>> get_working_days(2025, 2)  # February 2025  
        20
    """
    # Get first day of month and total days in month
    _, total_days = monthrange(year, month)
    
    working_days = 0
    
    # Count weekdays in the month
    for day in range(1, total_days + 1):
        current_date = date(year, month, day)
        weekday = current_date.weekday()  # Monday=0, Sunday=6
        
        # Count only Monday to Friday (0-4)
        if weekday < 5:  # Monday to Friday
            working_days += 1
    
    return working_days


def get_attended_days(employee_id: int, year: int, month: int, db: Session) -> float:
    """
    Calculate total attended days for an employee in a specific month.
    
    Args:
        employee_id (int): Employee's database ID
        year (int): Year for attendance calculation
        month (int): Month for attendance calculation (1-12)
        db (Session): Database session
        
    Returns:
        float: Total attended days (Present=1, Half Day=0.5, Absent=0)
        
    This function queries attendance records and calculates:
    - Present status: 1.0 day
    - Half Day status: 0.5 day
    - Absent status: 0.0 day
    
    Example:
        >>> get_attended_days(1, 2025, 1, db)
        22.5  # 22 full days + 1 half day
    """
    # Create date range for the month
    start_date = date(year, month, 1)
    _, last_day = monthrange(year, month)
    end_date = date(year, month, last_day)
    
    # Query attendance records for the month
    attendance_records = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= start_date,
        Attendance.date <= end_date
    ).all()
    
    total_attended = 0.0
    
    # Calculate attended days based on status
    for record in attendance_records:
        if record.status == AttendanceStatus.PRESENT:
            total_attended += 1.0
        elif record.status == AttendanceStatus.HALF_DAY:
            total_attended += 0.5
        # Absent records add 0.0
    
    return total_attended


def calculate_salary_per_day(basic_salary: float, allowances: float, working_days: int) -> float:
    """
    Calculate daily salary rate based on monthly components.
    
    Args:
        basic_salary (float): Monthly basic salary
        allowances (float): Monthly allowances
        working_days (int): Working days in the month
        
    Returns:
        float: Daily salary rate
        
    Example:
        >>> calculate_salary_per_day(30000, 5000, 22)
        1590.91
    """
    if working_days == 0:
        return 0.0
    
    gross_monthly = basic_salary + allowances
    return round(gross_monthly / working_days, 2)


def apply_attendance_adjustment(gross_salary: float, working_days: int, attended_days: float) -> float:
    """
    Apply salary adjustment based on attendance.
    
    Args:
        gross_salary (float): Full monthly gross salary
        working_days (int): Total working days in month
        attended_days (float): Days actually attended
        
    Returns:
        float: Adjusted gross salary based on attendance
        
    Example:
        >>> apply_attendance_adjustment(35000, 22, 20.5)
        32613.64  # Proportional to attended days
    """
    if working_days == 0:
        return 0.0
    
    attendance_ratio = attended_days / working_days
    adjusted_salary = gross_salary * attendance_ratio
    return round(adjusted_salary, 2)


def calculate_payroll(employee, year: int, month: int, db: Session) -> Dict:
    """
    Calculate complete payroll breakdown for an employee.
    
    Args:
        employee: Employee model object with salary details
        year (int): Payroll year
        month (int): Payroll month (1-12)
        db (Session): Database session
        
    Returns:
        Dict: Complete payroll calculation with all components
        
    The calculation includes:
    - Basic salary and allowances
    - Gross salary calculation
    - PF contribution (12% of basic salary)
    - Professional tax based on salary slabs
    - Attendance-based adjustments
    - Net salary after deductions
    
    Example:
        >>> employee = Employee(basic_salary=30000, allowances=5000)
        >>> calculate_payroll(employee, 2025, 1, db)
        {
            'basic_salary': 30000.0,
            'allowances': 5000.0,
            'gross_salary': 35000.0,
            'pf_contribution': 3600.0,
            'professional_tax': 200.0,
            'net_salary': 31200.0,
            'working_days': 23,
            'attended_days': 22.0
        }
    """
    # Get salary components from employee
    basic_salary = float(employee.basic_salary)
    allowances = float(employee.allowances)
    
    # Calculate gross salary
    gross_salary = basic_salary + allowances
    
    # Calculate deductions
    pf_contribution = basic_salary * 0.12  # 12% of basic salary
    professional_tax = calculate_professional_tax(basic_salary)
    
    # Get working and attended days
    working_days = get_working_days(year, month)
    attended_days = get_attended_days(employee.id, year, month, db)
    
    # Apply attendance-based adjustment to gross salary
    adjusted_gross = apply_attendance_adjustment(gross_salary, working_days, attended_days)
    
    # Apply attendance adjustment to basic salary for PF calculation
    attendance_ratio = attended_days / working_days if working_days > 0 else 0
    adjusted_basic = basic_salary * attendance_ratio
    adjusted_pf = adjusted_basic * 0.12
    
    # Professional tax is fixed monthly (not prorated)
    # But only if employee worked any days in the month
    final_prof_tax = professional_tax if attended_days > 0 else 0.0
    
    # Calculate net salary
    net_salary = adjusted_gross - adjusted_pf - final_prof_tax
    
    return {
        "basic_salary": round(basic_salary, 2),
        "allowances": round(allowances, 2),
        "gross_salary": round(adjusted_gross, 2),
        "pf_contribution": round(adjusted_pf, 2),
        "professional_tax": round(final_prof_tax, 2),
        "net_salary": round(net_salary, 2),
        "working_days": working_days,
        "attended_days": attended_days,
        "attendance_ratio": round(attendance_ratio, 3)
    }


def validate_payroll_data(basic_salary: float, allowances: float) -> Tuple[bool, str]:
    """
    Validate payroll input data for calculation.
    
    Args:
        basic_salary (float): Basic salary amount
        allowances (float): Allowances amount
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
        
    Example:
        >>> validate_payroll_data(30000, 5000)
        (True, "")
        >>> validate_payroll_data(-1000, 2000)
        (False, "Basic salary cannot be negative")
    """
    if basic_salary < 0:
        return False, "Basic salary cannot be negative"
    
    if allowances < 0:
        return False, "Allowances cannot be negative"
    
    if basic_salary == 0:
        return False, "Basic salary must be greater than zero"
    
    return True, ""