"""
Payroll management routes for WorkZen HRMS.

Endpoints:
- POST /payroll/generate            -> Generate payroll for an employee for a month (Payroll Officer)
- GET  /payroll/list                -> List payruns with filters and pagination (Payroll Officer)
- GET  /payroll/{id}                -> Get payroll details
- PUT  /payroll/{id}                -> Edit payroll and recalculate (Payroll Officer)
- POST /payroll/generate-payslips   -> Generate payslips for processed payruns (Payroll Officer)

Uses `calculate_payroll` from utils.calculations for payroll calculations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from models import Payroll, Payslip, Employee
from schemas import PayrollResponse, PayslipResponse, MessageResponse
from utils.permissions import get_current_user, require_payroll_officer
from utils.calculations import calculate_payroll


router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.post("/generate", response_model=PayrollResponse)
async def generate_payrun(employee_id: int, month: int, year: int, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """Generate payroll for an employee for a month. Payroll Officers and Admins only."""
    # Validate employee
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Check not already generated
    existing = db.query(Payroll).filter(Payroll.employee_id == employee_id, Payroll.month == month, Payroll.year == year).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payroll already generated for this period")

    # Calculate payroll
    calc = calculate_payroll(emp, year, month, db)

    # Create Payroll record
    payroll = Payroll(
        employee_id=employee_id,
        month=month,
        year=year,
        basic_salary=calc["basic_salary"],
        allowances=calc["allowances"],
        gross_salary=calc["gross_salary"],
        pf_contribution=calc["pf_contribution"],
        professional_tax=calc["professional_tax"],
        net_salary=calc["net_salary"],
        status="Processed"
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)

    return payroll


@router.get("/list", response_model=List[PayrollResponse])
async def list_payruns(page: int = Query(1, ge=1), month: Optional[int] = None, year: Optional[int] = None, employee_id: Optional[int] = None, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """List payroll records with optional filters. Pagination: 25 per page."""
    per_page = 25
    q = db.query(Payroll)
    if month:
        q = q.filter(Payroll.month == month)
    if year:
        q = q.filter(Payroll.year == year)
    if employee_id:
        q = q.filter(Payroll.employee_id == employee_id)

    offset = (page - 1) * per_page
    records = q.order_by(Payroll.year.desc(), Payroll.month.desc()).offset(offset).limit(per_page).all()
    return records


@router.get("/{payroll_id}", response_model=PayrollResponse)
async def get_payroll(payroll_id: int, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """Get payroll details for a specific payroll record."""
    pr = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not pr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found")
    return pr


@router.put("/{payroll_id}", response_model=PayrollResponse)
async def edit_payroll(payroll_id: int, basic_salary: Optional[float] = None, allowances: Optional[float] = None, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """Edit payroll components and recalculate payroll. Payroll Officers only."""
    pr = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not pr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found")

    # Update inputs
    if basic_salary is not None:
        pr.basic_salary = basic_salary
    if allowances is not None:
        pr.allowances = allowances

    # Recalculate using current employee data (but override basic/allowances)
    emp = db.query(Employee).filter(Employee.id == pr.employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated employee not found")

    # Temporarily set employee salary values for calculation
    emp_basic_backup = emp.basic_salary
    emp_allow_backup = emp.allowances
    emp.basic_salary = pr.basic_salary
    emp.allowances = pr.allowances

    calc = calculate_payroll(emp, pr.year, pr.month, db)

    # Restore employee values
    emp.basic_salary = emp_basic_backup
    emp.allowances = emp_allow_backup

    # Update payroll fields
    pr.gross_salary = calc["gross_salary"]
    pr.pf_contribution = calc["pf_contribution"]
    pr.professional_tax = calc["professional_tax"]
    pr.net_salary = calc["net_salary"]

    db.add(pr)
    db.commit()
    db.refresh(pr)

    return pr


@router.post("/generate-payslips", response_model=MessageResponse)
async def generate_payslips(month: int, year: int, db: Session = Depends(get_db), current_user = Depends(require_payroll_officer)):
    """Generate payslips for all processed payrolls in a given month/year."""
    processed = db.query(Payroll).filter(Payroll.month == month, Payroll.year == year, Payroll.status == "Processed").all()
    count = 0
    today = date.today()
    for p in processed:
        existing = db.query(Payslip).filter(Payslip.payroll_id == p.id).first()
        if existing:
            continue

        payslip = Payslip(payroll_id=p.id, employee_id=p.employee_id, payout_date=today)
        db.add(payslip)
        count += 1

    db.commit()
    return {"message": f"Payslips generated: {count}", "success": True}
