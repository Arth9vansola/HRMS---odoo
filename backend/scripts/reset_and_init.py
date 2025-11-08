#!/usr/bin/env python3
"""
Database reset and initialization script.
This script drops all tables and recreates them with the latest schema.
"""
import os
import sys
from datetime import datetime

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, get_db
from models import Base, User, UserRole
from utils.security import get_password_hash


def reset_database():
    """Drop all tables and recreate them."""
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tables dropped successfully!")
    
    print("🏗️  Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")


def create_default_users():
    """Create default admin and HR users."""
    print("👤 Creating default users...")
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@workzen.com").first()
        if existing_admin:
            print("⚠️  Admin user already exists, skipping creation")
        else:
            # Create Admin user
            admin_user = User(
                email="admin@workzen.com",
                login_id="ADMIN001",
                password_hash=get_password_hash("Admin123!"),
                full_name="System Administrator",
                phone="1234567890",
                role=UserRole.ADMIN,
                company_name="WorkZen Corp",
                company_logo=None,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            print("✅ Admin user created: admin@workzen.com / Admin123!")

        # Check if HR user already exists
        existing_hr = db.query(User).filter(User.email == "hr@workzen.com").first()
        if existing_hr:
            print("⚠️  HR user already exists, skipping creation")
        else:
            # Create HR Officer user
            hr_user = User(
                email="hr@workzen.com",
                login_id="HR001",
                password_hash=get_password_hash("HRManager123!"),
                full_name="HR Manager",
                phone="0987654321",
                role=UserRole.HR_OFFICER,
                company_name="WorkZen Corp",
                company_logo=None,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(hr_user)
            print("✅ HR user created: hr@workzen.com / HRManager123!")

        db.commit()
        print("✅ Default users created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


def main():
    """Main function to reset and initialize database."""
    print("🚀 Starting database reset and initialization...")
    
    try:
        reset_database()
        create_default_users()
        print("🎉 Database reset and initialization completed successfully!")
        print("\n📝 Default Login Credentials:")
        print("Admin: admin@workzen.com / Admin123!")
        print("HR:    hr@workzen.com / HRManager123!")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()