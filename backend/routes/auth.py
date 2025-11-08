"""
Authentication routes for WorkZen HRMS.

This module implements HR/Admin-provisioned registration, login, and
profile retrieval endpoints. Registration is restricted to users with
Admin or HR Officer roles; employees cannot self-register.

It also auto-generates a company login ID in the format:
  OI + first2(firstname) + first2(lastname) + YYYY + 4-digit serial
Example: OIJODO20220001

Endpoints:
- POST /auth/register  (HR/Admin only) -> Token
- POST /auth/login     (public)        -> Token
- GET  /auth/me        (authenticated) -> UserResponse

"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from database import get_db
from models import User, UserRole, Employee
from schemas import UserRegister, UserLogin, Token, UserResponse, LoginResponse
from utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.permissions import get_current_user, require_hr_officer

router = APIRouter(prefix="/auth", tags=["authentication"])


def _generate_login_id(full_name: str, joining_year: int, db: Session) -> str:
	"""Generate a unique login_id using full name, joining year and a per-year serial.

	Format: OI + first2(firstname) + first2(lastname) + YYYY + 4-digit serial
	Example: OIJODO20220001
	"""
	# Normalize and split name
	parts = [p for p in full_name.strip().split() if p]
	first = parts[0] if parts else "XX"
	last = parts[-1] if len(parts) > 1 else "XX"

	code = (first[:2] + last[:2]).upper()
	year = str(joining_year)

	# Count existing employees for the year to form a serial number
	# Serial is per year and starts at 1
	existing_count = db.query(Employee).filter(Employee.date_of_joining.between(datetime(joining_year,1,1), datetime(joining_year,12,31))).count()
	serial = existing_count + 1
	serial_str = f"{serial:04d}"

	return f"OI{code}{year}{serial_str}"


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db), current_user: User = Depends(require_hr_officer)):
	"""Register a new employee. Only HR Officers and Admins may call this endpoint.

	The endpoint creates a User with role Employee and an associated Employee
	record should be created separately by HR if needed. A unique auto-generated
	login_id is assigned using the employee's name and joining year.
	"""
	# Ensure email isn't already used
	existing = db.query(User).filter(User.email == user_data.email).first()
	if existing:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

	# Hash password
	hashed = get_password_hash(user_data.password)

	# For the purposes of this registration flow we assume joining year is current year
	joining_year = datetime.utcnow().year
	login_id = _generate_login_id(user_data.full_name, joining_year, db)

	# Create user instance with Employee role
	new_user = User(
		email=user_data.email, 
		password_hash=hashed, 
		full_name=user_data.full_name, 
		phone=user_data.phone, 
		role=UserRole.EMPLOYEE,
		company_name=user_data.company_name,
		company_logo=user_data.company_logo
	)
	new_user.login_id = login_id

	db.add(new_user)
	db.commit()
	db.refresh(new_user)

	# Create token
	expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	token = create_access_token({"sub": str(new_user.id), "role": str(new_user.role)}, expires_delta=expires)

	return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=LoginResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
	"""Authenticate user by email and password and return a JWT token with user data."""
	user = db.query(User).filter(User.email == user_data.email).first()
	if not user or not verify_password(user_data.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

	expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	token = create_access_token({"sub": str(user.id), "role": str(user.role)}, expires_delta=expires)

	return {
		"access_token": token, 
		"token_type": "bearer",
		"user": {
			"id": user.id,
			"email": user.email,
			"login_id": user.login_id,
			"full_name": user.full_name,
			"phone": user.phone,
			"role": user.role.value,
			"company_name": user.company_name,
			"company_logo": user.company_logo
		}
	}


@router.get("/me", response_model=UserResponse)
async def get_current_profile(current_user: User = Depends(get_current_user)):
	"""Return profile of the currently authenticated user."""
	return current_user
