"""
Role-based access control (RBAC) utilities for WorkZen HRMS.

This module provides authentication and authorization decorators
for FastAPI endpoints based on user roles and permissions.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
from utils.security import decode_token


# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticate user from JWT token and return user object.
    
    Args:
        credentials (HTTPAuthCredential): Bearer token credentials
        db (Session): Database session dependency
        
    Returns:
        User: Authenticated user object from database
        
    Raises:
        HTTPException: 401 if token is invalid or user not found
        
    This function extracts the JWT token from the Authorization header,
    validates it, and returns the corresponding user from the database.
    """
    # Extract token from credentials
    token = credentials.credentials
    
    # Decode token to get user ID
    user_id = decode_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Query user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require Admin role for endpoint access.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        User: Validated admin user
        
    Raises:
        HTTPException: 403 if user is not an Admin
        
    This dependency ensures only users with Admin role
    can access protected endpoints.
    """
    if current_user.role.value != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Insufficient privileges."
        )
    
    return current_user


async def require_hr_officer(current_user: User = Depends(get_current_user)) -> User:
    """
    Require HR Officer or Admin role for endpoint access.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        User: Validated HR Officer or Admin user
        
    Raises:
        HTTPException: 403 if user is not HR Officer or Admin
        
    This dependency allows both HR Officers and Admins
    to access HR-related endpoints.
    """
    allowed_roles = ["Admin", "HR Officer"]
    
    if current_user.role.value not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR Officer access required. Insufficient privileges."
        )
    
    return current_user


async def require_payroll_officer(current_user: User = Depends(get_current_user)) -> User:
    """
    Require Payroll Officer or Admin role for endpoint access.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        User: Validated Payroll Officer or Admin user
        
    Raises:
        HTTPException: 403 if user is not Payroll Officer or Admin
        
    This dependency allows both Payroll Officers and Admins
    to access payroll-related endpoints.
    """
    allowed_roles = ["Admin", "Payroll Officer"]
    
    if current_user.role.value not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Payroll Officer access required. Insufficient privileges."
        )
    
    return current_user


async def require_employee(current_user: User = Depends(get_current_user)) -> User:
    """
    Require Employee or Admin role for endpoint access.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        User: Validated Employee or Admin user
        
    Raises:
        HTTPException: 403 if user is not Employee or Admin
        
    This dependency allows Employees and Admins to access
    employee-specific endpoints like personal attendance.
    """
    allowed_roles = ["Employee", "Admin"]
    
    if current_user.role.value not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required. Insufficient privileges."
        )
    
    return current_user


async def require_hr_or_payroll(current_user: User = Depends(get_current_user)) -> User:
    """
    Require HR Officer, Payroll Officer, or Admin role for endpoint access.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        User: Validated HR Officer, Payroll Officer, or Admin user
        
    Raises:
        HTTPException: 403 if user doesn't have required role
        
    This dependency allows HR Officers, Payroll Officers, and Admins
    to access endpoints that require either HR or Payroll privileges.
    """
    allowed_roles = ["Admin", "HR Officer", "Payroll Officer"]
    
    if current_user.role.value not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR Officer or Payroll Officer access required. Insufficient privileges."
        )
    
    return current_user


def check_user_permissions(user: User, required_role: str) -> bool:
    """
    Check if user has required role permissions.
    
    Args:
        user (User): User object to check
        required_role (str): Required role for access
        
    Returns:
        bool: True if user has required permissions, False otherwise
        
    This utility function can be used for custom permission
    checking in business logic beyond endpoint protection.
    """
    role_hierarchy = {
        "Admin": 4,
        "HR Officer": 3,
        "Payroll Officer": 2,
        "Employee": 1
    }
    
    user_level = role_hierarchy.get(user.role.value, 0)
    required_level = role_hierarchy.get(required_role, 0)
    
    # Admin has access to everything
    if user.role.value == "Admin":
        return True
    
    # Check if user has at least the required level
    return user_level >= required_level