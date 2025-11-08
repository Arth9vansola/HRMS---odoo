"""
Attendance management routes for WorkZen HRMS.

Endpoints:
- POST /attendance/mark         -> Mark attendance for current employee (Employee)
- GET  /attendance/my-logs      -> Get current employee's attendance logs (Employee)
- GET  /attendance/all          -> Get all attendance records (HR Officer/Admin) with pagination
- GET  /attendance/monthly/{employee_id}/{month} -> Monthly attendance + stats
- PUT  /attendance/{id}         -> Edit attendance record (HR Officer/Admin)

All endpoints include proper role checks and error handling.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from database import get_db
from models import Attendance, Employee, AttendanceStatus
from schemas import AttendanceCreate, AttendanceResponse, MessageResponse
from utils.permissions import get_current_user, require_employee, require_hr_officer


router = APIRouter(prefix="/attendance", tags=["attendance"])


def _get_employee_or_404(user):
    """Helper to fetch employee record from a User and raise 404 if missing."""
    emp = getattr(user, "employee", None)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found for user")
    return emp


@router.post("/mark", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Mark attendance for the current employee.

    Employee users may mark attendance for themselves. Duplicate entries for the same
    date are rejected.
    """
    # Ensure caller is an employee
    awaitable = require_employee(current_user)  # not used directly, permission check below
    # The require_employee dependency would normally be used via Depends; emulate check
    if current_user.role.value not in ("Employee", "Admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employee access required")

    emp = _get_employee_or_404(current_user)

    att_date = payload.attendance_date

    # Check for duplicate
    existing = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == att_date).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attendance already marked for this date")

    # Validate status value
    try:
        status_enum = AttendanceStatus(payload.status)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attendance status")

    new_att = Attendance(employee_id=emp.id, date=att_date, status=status_enum)
    db.add(new_att)
    db.commit()
    db.refresh(new_att)

    return new_att


@router.get("/my-logs", response_model=List[AttendanceResponse])
async def my_logs(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return attendance records for the current authenticated employee."""
    emp = _get_employee_or_404(current_user)
    records = db.query(Attendance).filter(Attendance.employee_id == emp.id).order_by(Attendance.date.desc()).all()
    return records


@router.get("/all", response_model=List[AttendanceResponse])
async def all_attendance(page: int = Query(1, ge=1), db: Session = Depends(get_db), current_user=Depends(require_hr_officer)):
    """Return all attendance records. HR Officers and Admins only.

    Pagination: 50 records per page.
    """
    per_page = 50
    offset = (page - 1) * per_page
    records = db.query(Attendance).order_by(Attendance.date.desc()).offset(offset).limit(per_page).all()
    return records


@router.get("/monthly/{employee_id}/{month}")
async def monthly_attendance(employee_id: int, month: int, year: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(require_hr_officer)):
    """Return attendance records and summary stats for a given employee and month.

    Query parameters:
    - year (optional, defaults to current year)

    Returns JSON: { records: [...], stats: { total_days, present, absent, half_day } }
    """
    if month < 1 or month > 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid month value")

    year = year or datetime.utcnow().year

    # Validate employee exists
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Compute date range
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year, 12, 31)
    else:
        end_date = date(year, month + 1, 1) - datetime.resolution

    records = db.query(Attendance).filter(Attendance.employee_id == employee_id, Attendance.date >= start_date, Attendance.date <= end_date).order_by(Attendance.date.asc()).all()

    # Summarize
    total = len(records)
    present = sum(1 for r in records if r.status.value == AttendanceStatus.PRESENT.value)
    absent = sum(1 for r in records if r.status.value == AttendanceStatus.ABSENT.value)
    half = sum(1 for r in records if r.status.value == AttendanceStatus.HALF_DAY.value)

    stats = {
        "total_days": total,
        "present": present,
        "absent": absent,
        "half_day": half,
    }

    return {"records": records, "stats": stats}


@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def edit_attendance(attendance_id: int, payload: AttendanceCreate, db: Session = Depends(get_db), current_user=Depends(require_hr_officer)):
    """Edit an attendance record. HR Officers and Admins only.

    Fields editable: date, status, (check_in/check_out/remarks are supported by model but
    the payload uses AttendanceCreate; for extended edits a separate schema could be used).
    """
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")

    # Check duplicate when changing date
    if payload.attendance_date != record.date:
        dup = db.query(Attendance).filter(Attendance.employee_id == record.employee_id, Attendance.date == payload.attendance_date).first()
        if dup:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Another attendance already exists for this date")

    # Validate status and update
    try:
        status_enum = AttendanceStatus(payload.status)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attendance status")

    record.date = payload.attendance_date
    record.status = status_enum

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
