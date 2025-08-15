"""Create a test user for development"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.auth import get_password_hash
from app.models.models import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_user():
    """Create a test user for development"""
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        
        if existing_user:
            logger.info("Test user already exists")
            return existing_user
        
        # Create test user
        test_user = User(
            username="testuser",
            email="test@mhia.com",
            full_name="Test User",
            hashed_password=get_password_hash("testpass123"),
            is_active=True,
            is_superuser=False
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        logger.info(f"Test user created successfully: {test_user.username}")
        return test_user
        
    except Exception as e:
        logger.error(f"Error creating test user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
    print("Test user created successfully!")
    print("Username: testuser")
    print("Password: testpass123")