"""
Leave management routes for WorkZen HRMS.

Endpoints:
- POST   /leaves/allocate          -> Allocate leaves to employee (HR Officer/Admin)
- GET    /leaves/balance           -> Get current user's leave balances
- POST   /leaves/apply             -> Apply for leave (Employee)
- GET    /leaves/requests          -> List pending leave requests (Payroll Officer/Admin)
- PUT    /leaves/requests/{id}     -> Approve/Reject leave request (Payroll Officer/Admin)

"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import date
from database import get_db
from models import LeaveAllocation, LeaveRequest, LeaveType, LeaveStatus, Employee
from schemas import LeaveRequestCreate, LeaveRequestResponse, MessageResponse
from utils.permissions import get_current_user, require_hr_officer, require_payroll_officer


router = APIRouter(prefix="/leaves", tags=["leaves"])


@router.post("/allocate", response_model=MessageResponse)
async def allocate_leave(employee_id: int, year: int, leave_type: str, total_days: int, db: Session = Depends(get_db), current_user = Depends(require_hr_officer)):
    """Allocate leave days for an employee for a given year and leave type. HR Officers and Admins only."""
    # Validate employee
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Validate leave type
    try:
        lt = LeaveType(leave_type)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid leave type")

    if total_days < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="total_days must be non-negative")

    # Upsert allocation
    alloc = db.query(LeaveAllocation).filter(LeaveAllocation.employee_id == employee_id, LeaveAllocation.year == year, LeaveAllocation.leave_type == lt).first()
    if alloc:
        alloc.total_days = total_days
    else:
        alloc = LeaveAllocation(employee_id=employee_id, year=year, leave_type=lt, total_days=total_days, used_days=0)
        db.add(alloc)

    db.commit()

    return {"message": "Leave allocated", "success": True}


@router.get("/balance", response_model=Dict[str, Dict[str, int]])
async def get_leave_balance(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Return leave balances for current user across all leave types.

    Response format:
    { "Casual": {"total_days": X, "used_days": Y, "remaining": Z}, ... }
    """
    emp = getattr(current_user, 'employee', None)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    allocations = db.query(LeaveAllocation).filter(LeaveAllocation.employee_id == emp.id).all()
    result = {}
    for a in allocations:
        remaining = a.total_days - a.used_days
        result[a.leave_type.value] = {"total_days": a.total_days, "used_days": a.used_days, "remaining": remaining}

    return result


@router.post("/apply", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def apply_leave(payload: LeaveRequestCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Employee applies for leave. Validates balance and creates a pending request."""
    emp = getattr(current_user, 'employee', None)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    # Validate leave type
    try:
        lt = LeaveType(payload.leave_type)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid leave type")

    # Calculate days (inclusive)
    days = (payload.end_date - payload.start_date).days + 1
    if days <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range")

    # Fetch allocation for the year of start_date
    year = payload.start_date.year
    alloc = db.query(LeaveAllocation).filter(LeaveAllocation.employee_id == emp.id, LeaveAllocation.year == year, LeaveAllocation.leave_type == lt).first()
    if not alloc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No leave allocation found for this employee/year/type")

    if alloc.used_days + days > alloc.total_days:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient leave balance")

    # Create leave request
    lr = LeaveRequest(employee_id=emp.id, leave_type=lt, start_date=payload.start_date, end_date=payload.end_date, reason=payload.reason or "", status=LeaveStatus.PENDING, approver_id=None)
    db.add(lr)
    db.commit()
    db.refresh(lr)

    return lr


@router.get("/requests", response_model=List[LeaveRequestResponse])
async def list_pending_requests(db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """List pending leave requests. Payroll Officers and Admins only."""
    requests = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).order_by(LeaveRequest.created_at.desc()).all()
    # Optionally join employee name in response via Pydantic from_attributes
    return requests


@router.put("/requests/{request_id}", response_model=LeaveRequestResponse)
async def decide_request(request_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """Approve or reject a pending leave request. Payroll Officers and Admins only.

    If approved, update the corresponding LeaveAllocation.used_days.
    """
    try:
        new_status = LeaveStatus(status)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")

    lr = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not lr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    if lr.status != LeaveStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be decided")

    # If approving, ensure allocation updated
    if new_status == LeaveStatus.APPROVED:
        year = lr.start_date.year
        alloc = db.query(LeaveAllocation).filter(LeaveAllocation.employee_id == lr.employee_id, LeaveAllocation.year == year, LeaveAllocation.leave_type == lr.leave_type).first()
        if not alloc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Leave allocation not found for this employee/year/type")

        days = (lr.end_date - lr.start_date).days + 1
        if alloc.used_days + days > alloc.total_days:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient leave balance at approval time")

        alloc.used_days += days
        db.add(alloc)

    lr.status = new_status
    lr.approver_id = getattr(current_user, 'employee', None).id if getattr(current_user, 'employee', None) else None
    db.add(lr)
    db.commit()
    db.refresh(lr)

    return lr
