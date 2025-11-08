"""
Database initialization script for WorkZen HRMS.
Creates tables and inserts default admin and HR users.
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from database import SessionLocal, engine
from models import Base, User, UserRole
from utils.security import get_password_hash

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def create_default_users():
    """Create default admin and HR users."""
    db = SessionLocal()
    try:
        print("Creating default users...")
        
        # Check if admin already exists
        admin = db.query(User).filter(User.email == 'admin@workzen.com').first()
        if not admin:
            admin_user = User(
                email='admin@workzen.com',
                password_hash=get_password_hash('Admin123!'),
                full_name='System Administrator',
                phone='+1-555-0001',
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print("✅ Admin user created: admin@workzen.com / Admin123!")
        else:
            print("ℹ️  Admin user already exists")

        # Check if HR already exists  
        hr = db.query(User).filter(User.email == 'hr@workzen.com').first()
        if not hr:
            hr_user = User(
                email='hr@workzen.com',
                password_hash=get_password_hash('HR123!'),
                full_name='HR Officer',
                phone='+1-555-0002',
                role=UserRole.HR_OFFICER,
                is_active=True
            )
            db.add(hr_user)
            print("✅ HR user created: hr@workzen.com / HR123!")
        else:
            print("ℹ️  HR user already exists")

        db.commit()
        print("✅ Default users created successfully!")
        
        # Print credentials
        print("\n" + "="*50)
        print("DEFAULT LOGIN CREDENTIALS")
        print("="*50)
        print("Admin Login:")
        print("  Email: admin@workzen.com")
        print("  Password: Admin123!")
        print("")
        print("HR Officer Login:")
        print("  Email: hr@workzen.com")
        print("  Password: HR123!")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Initialize the database with tables and default users."""
    try:
        create_tables()
        create_default_users()
        print("\n🎉 Database initialization completed successfully!")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

if __name__ == "__main__":
    main()