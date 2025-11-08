"""
Configuration module for WorkZen HRMS FastAPI application.

This module handles environment variables, database connections,
and application settings for the HRMS system.
"""

import os
from sqlalchemy import create_engine


class Settings:
    """
    Application settings class containing all configuration variables.
    
    This class centralizes all environment-based configuration
    for the WorkZen HRMS application including database, security,
    and CORS settings.
    """
    
    def __init__(self):
        """Initialize settings from environment variables."""
        # Database Configuration
        self.DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            "postgresql://workzen_user:workzen123@localhost:5432/workzen_db"
        )
        """Database connection URL for PostgreSQL"""
        
        # Security Configuration
        self.SECRET_KEY: str = os.getenv(
            "SECRET_KEY", 
            "your-super-secret-key-change-this-in-production"
        )
        """Secret key for JWT token encoding/decoding"""
        
        self.ALGORITHM: str = "HS256"
        """Algorithm used for JWT token encoding"""
        
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        """JWT access token expiration time in minutes"""
        
        # CORS Configuration
        self.CORS_ORIGINS: list = [
            "http://localhost:3000",  # React frontend
            "http://localhost:8000"   # FastAPI docs/development
        ]
        """Allowed origins for CORS (Cross-Origin Resource Sharing)"""


# Database Engine Configuration
settings = Settings()

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    echo=False  # Set to True for SQL query logging in development
)
"""
SQLAlchemy database engine instance.

Features:
- Connection pooling for better performance
- Pre-ping to handle disconnections
- Configured for PostgreSQL database
"""


def get_settings() -> Settings:
    """
    Get application settings instance.
    
    Returns:
        Settings: Application configuration object
        
    This function provides a way to access settings throughout
    the application and can be easily mocked for testing.
    """
    return settings
