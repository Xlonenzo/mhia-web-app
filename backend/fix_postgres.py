"""
Fix PostgreSQL connection issues on Windows
This script helps identify and fix common Windows + PostgreSQL + Python encoding issues
"""
import os
import sys

def fix_environment():
    """Set proper environment variables for Windows + PostgreSQL"""
    print("Setting up environment variables...")
    
    # Set Python to use UTF-8 by default
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    os.environ['PYTHONLEGACYWINDOWSSTDIO'] = '1'
    
    # Set PostgreSQL client encoding
    os.environ['PGCLIENTENCODING'] = 'UTF8'
    
    # Set console encoding for Windows
    if sys.platform == 'win32':
        os.system('chcp 65001 > nul 2>&1')
    
    print("Environment configured for UTF-8")

def test_different_connection_strings():
    """Try different connection string formats"""
    
    connection_strings = [
        "postgresql://postgres:password@localhost:5432/mhia",
        "postgresql://postgres:password@127.0.0.1:5432/mhia",
        "postgresql+psycopg2://postgres:password@localhost:5432/mhia",
        "postgresql://postgres:password@localhost/mhia",
    ]
    
    fix_environment()
    
    # Import after setting environment
    sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
    
    from sqlalchemy import create_engine, text
    
    for i, url in enumerate(connection_strings, 1):
        print(f"\n--- Test {i}: {url} ---")
        
        try:
            engine = create_engine(
                url,
                pool_pre_ping=True,
                connect_args={
                    "client_encoding": "utf8",
                    "application_name": "mhia_test"
                },
                echo=False
            )
            
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test")).fetchone()
                if result and result[0] == 1:
                    print(f"SUCCESS: Connection working with {url}")
                    
                    # Test database creation
                    try:
                        conn.execute(text("SELECT 1 FROM pg_database WHERE datname='mhia'"))
                        print("Database 'mhia' exists or connection successful")
                    except:
                        print("Database 'mhia' may not exist, but connection is working")
                    
                    return url
                    
        except Exception as e:
            print(f"FAILED: {str(e)[:100]}...")
            continue
    
    return None

def create_working_env_file(working_url):
    """Create a working .env file with the successful connection string"""
    
    env_content = f"""DATABASE_URL={working_url}
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=["http://localhost:3000"]

# Windows PostgreSQL fix
PYTHONIOENCODING=utf-8
PGCLIENTENCODING=UTF8"""
    
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"\nUpdated .env file with working connection string")

def main():
    print("PostgreSQL Connection Fix for Windows")
    print("=" * 50)
    
    # Test different connection approaches
    working_url = test_different_connection_strings()
    
    if working_url:
        print(f"\nSUCCESS! Found working connection: {working_url}")
        create_working_env_file(working_url)
        
        print("\nNext steps:")
        print("1. Manually create database 'mhia' using pgAdmin if it doesn't exist")
        print("2. Start the backend server: python -m uvicorn app.main:app --reload")
        
    else:
        print("\nAll connection attempts failed.")
        print("\nManual steps required:")
        print("1. Open pgAdmin")
        print("2. Create database 'mhia' with UTF8 encoding")
        print("3. Ensure postgres user password is 'password'")
        print("4. Restart PostgreSQL service if needed")
        
        print("\nAlternatively, check if PostgreSQL is running:")
        print("  net start postgresql-x64-15")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
    except Exception as e:
        print(f"Unexpected error: {e}")
        print("Please create the database manually using pgAdmin")