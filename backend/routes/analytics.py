"""
Analytics and reporting routes for WorkZen HRMS.

Endpoints (Admin only):
- GET /analytics/attendance-summary?year=&month=
- GET /analytics/leave-summary
- GET /analytics/payroll-summary?year=
- GET /analytics/employee-stats

"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from database import get_db
from models import Attendance, LeaveRequest, Payroll, User, UserRole
from utils.permissions import get_current_user, require_admin
from schemas import AttendanceSummaryItem, LeaveSummaryItem, PayrollSummaryItem, EmployeeStatsResponse


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/attendance-summary", response_model=List[AttendanceSummaryItem])
async def attendance_summary(year: int = Query(None), month: int = Query(None), db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Return counts of attendance statuses for a given month and year.

    Returns list of {"status": <status>, "count": <n>}.
    """
    if not year or not month:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="year and month are required")

    q = db.query(Attendance.status, func.count(Attendance.id)).filter(func.extract('year', Attendance.date) == year, func.extract('month', Attendance.date) == month).group_by(Attendance.status)
    rows = q.all()
    result = [{"status": r[0].value if hasattr(r[0], 'value') else str(r[0]), "count": r[1]} for r in rows]
    return result


@router.get("/leave-summary", response_model=List[LeaveSummaryItem])
async def leave_summary(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Return counts of leave requests by status (Pending/Approved/Rejected)."""
    q = db.query(LeaveRequest.status, func.count(LeaveRequest.id)).group_by(LeaveRequest.status)
    rows = q.all()
    result = [{"status": r[0].value if hasattr(r[0], 'value') else str(r[0]), "count": r[1]} for r in rows]
    return result


@router.get("/payroll-summary", response_model=List[PayrollSummaryItem])
async def payroll_summary(year: int = Query(None), db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Return payroll summary grouped by month for a given year.

    Each item: {"month": <int>, "count": <employees_paid>, "payout": <total_net_salary>}.
    """
    if not year:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="year is required")

    q = db.query(Payroll.month, func.count(Payroll.id), func.sum(Payroll.net_salary)).filter(Payroll.year == year).group_by(Payroll.month).order_by(Payroll.month)
    rows = q.all()
    result = [{"month": int(r[0]), "count": int(r[1]), "payout": float(r[2] or 0.0)} for r in rows]
    return result


@router.get("/employee-stats", response_model=EmployeeStatsResponse)
async def employee_stats(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Return general employee statistics: total, by role, active vs inactive."""
    total = db.query(func.count(User.id)).scalar() or 0

    # By role distribution
    role_rows = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    by_role = [{"role": r[0].value if hasattr(r[0], 'value') else str(r[0]), "count": r[1]} for r in role_rows]

    # Active vs inactive
    active = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    inactive = db.query(func.count(User.id)).filter(User.is_active == False).scalar() or 0

    return {"total_employees": int(total), "by_role": by_role, "active": int(active), "inactive": int(inactive)}
