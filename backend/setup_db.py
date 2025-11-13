"""
Database setup script
Run this script ONLY when you need to create database tables manually.
For production, use Alembic migrations instead.

Usage:
    python setup_db.py

Note: This should NOT run automatically on server start.
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models import User, Farm, Expense, Yield

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()


