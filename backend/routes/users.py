"""
User and Employee management routes for WorkZen HRMS.

This module provides endpoints to manage user profiles and employee
records. Endpoints enforce role-based permissions using the
utilities in `utils.permissions`.

Endpoints included:
- GET  /users/me
- PUT  /users/{user_id}
- DELETE /users/{user_id}
- GET  /employees
- POST /employees

"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Employee, UserRole
from schemas import UserResponse, EmployeeCreate, EmployeeResponse, MessageResponse
from utils.permissions import get_current_user, require_admin, require_hr_officer, require_employee


router = APIRouter(prefix="", tags=["users"])


@router.get("/users/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return profile of the currently authenticated user."""
    return current_user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, payload: UserResponse, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a user's basic profile.

    Admins can update any user. Regular users can update only their own profile.
    """
    # Permission check: allow admin or the user themselves
    if current_user.role.value != "Admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges to update this user")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update allowed fields
    user.full_name = payload.full_name
    user.phone = payload.phone
    # Admin can change role
    if current_user.role.value == "Admin":
        try:
            user.role = UserRole(payload.role)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Delete a user account. Admin-only operation."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted", "success": True}


@router.get("/employees", response_model=List[EmployeeResponse])
async def list_employees(db: Session = Depends(get_db), current_user: User = Depends(require_hr_officer)):
    """List all employee profiles. HR Officers and Admins only."""
    employees = db.query(Employee).all()
    return employees


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_hr_officer)):
    """Create an employee profile. Only HR Officers and Admins may call this endpoint.

    This creates an Employee record. The associated `user_id` must refer
    to an existing `User` row; validation is performed.
    """
    # Validate associated user if provided
    if payload.user_id is not None:
        user = db.query(User).filter(User.id == payload.user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Associated user not found")

    # Create the employee record
    new_emp = Employee(
        user_id=payload.user_id,
        department=payload.department,
        position=payload.position,
        basic_salary=payload.basic_salary,
        allowances=payload.allowances,
        date_of_joining=payload.date_of_joining,
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return new_emp
