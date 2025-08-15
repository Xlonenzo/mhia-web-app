"""
Test database connection script
"""
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    print("Testing database connection...")
    print("=" * 50)
    
    # Import after adding to path
    from app.core.config import settings
    print(f"Database URL: {settings.DATABASE_URL}")
    
    from app.core.database import engine
    
    print("Attempting to connect...")
    with engine.connect() as connection:
        result = connection.execute("SELECT version()").fetchone()
        print(f"✅ Connection successful!")
        print(f"PostgreSQL Version: {result[0][:100]}...")
        
        # Test creating a simple table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50)
            )
        """)
        connection.commit()
        
        # Clean up
        connection.execute("DROP TABLE IF EXISTS test_table")
        connection.commit()
        
        print("✅ Database operations successful!")
        print("\n🎉 Your PostgreSQL database is ready!")
        print("\nYou can now start the backend server:")
        print("   python -m uvicorn app.main:app --reload")
        
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\n🔧 Troubleshooting steps:")
    print("1. Ensure PostgreSQL is running")
    print("2. Create database 'mhia' manually using pgAdmin:")
    print("   - Right-click 'Databases' → Create → Database")
    print("   - Name: mhia")
    print("   - Encoding: UTF8")
    print("3. Check that postgres user password is 'password'")
    print("4. Verify PostgreSQL is on port 5432")
    print("\nSee DATABASE_SETUP.md for detailed instructions.")
    sys.exit(1)