"""
Security utilities for WorkZen HRMS authentication and authorization.

This module provides password hashing, JWT token generation and validation
for secure user authentication in the HRMS system.
"""

from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
import os


# Password hashing context using pbkdf2_sha256 (more reliable than bcrypt)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# JWT Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def get_password_hash(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password (str): Plain text password to hash
        
    Returns:
        str: Bcrypt hashed password
        
    This function uses the configured CryptContext to generate
    a secure bcrypt hash of the provided password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password (str): Plain text password to verify
        hashed (str): Previously hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
        
    This function safely compares the provided password against
    the stored hash using constant-time comparison.
    """
    return pwd_context.verify(plain_password, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with user data and expiration.
    
    Args:
        data (dict): User data to encode in token (typically user_id)
        expires_delta (Optional[timedelta]): Custom expiration time
        
    Returns:
        str: JWT access token string
        
    The token includes the provided data and an expiration timestamp.
    If no custom expiration is provided, defaults to 15 minutes.
    """
    # Create a copy of data to avoid mutating the original
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # Add expiration to token payload
    to_encode.update({"exp": expire})
    
    # Encode and return JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[int]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token (str): JWT token string to decode
        
    Returns:
        Optional[int]: User ID from token if valid, None if invalid
        
    This function decodes the JWT token, validates its signature
    and expiration, then extracts and returns the user ID.
    Returns None if the token is invalid or expired.
    """
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user ID from 'sub' claim
        user_id = payload.get("sub")
        
        # Return user ID as integer if present
        if user_id is not None:
            return int(user_id)
        
        return None
        
    except JWTError:
        # Token is invalid, expired, or malformed
        return None
    except (ValueError, TypeError):
        # Error converting user_id to integer
        return None


def create_user_token(user_id: int) -> str:
    """
    Create an access token for a specific user.
    
    Args:
        user_id (int): Database ID of the user
        
    Returns:
        str: JWT access token with default expiration
        
    This is a convenience function that creates a token
    with the user ID as the subject claim.
    """
    token_data = {"sub": str(user_id)}
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(data=token_data, expires_delta=expires_delta)


def validate_token_and_get_user_id(token: str) -> Optional[int]:
    """
    Validate a token and extract user ID with additional checks.
    
    Args:
        token (str): JWT token to validate
        
    Returns:
        Optional[int]: User ID if token is valid, None otherwise
        
    This function provides additional validation beyond basic
    token decoding, including format and content verification.
    """
    if not token or not isinstance(token, str):
        return None
    
    # Remove 'Bearer ' prefix if present
    if token.startswith('Bearer '):
        token = token[7:]
    
    return decode_token(token)