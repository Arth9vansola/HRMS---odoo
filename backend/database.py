"""
Database configuration module for WorkZen HRMS.

This module sets up SQLAlchemy database sessions, base models,
and database dependency injection for the FastAPI application.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import engine
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database session configuration
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
"""
SQLAlchemy session factory.
- autocommit=False: Manual transaction control
- autoflush=False: Manual flush control for better performance
"""

# Base class for all database models
Base = declarative_base()
"""
SQLAlchemy declarative base class.
All database models will inherit from this base class.
"""


async def get_db():
    """
    Database dependency for FastAPI dependency injection.
    
    Yields:
        SessionLocal: Database session instance
        
    This function provides a database session for each request
    and ensures proper cleanup after the request is completed.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
