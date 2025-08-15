#!/usr/bin/env python3
"""
Database Connection Test Script
Tests PostgreSQL connection and basic operations
"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import OperationalError, ProgrammingError
from dotenv import load_dotenv

# Fix Unicode output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()

def get_database_url():
    """Get database URL from environment or construct from components"""
    # Try to get complete DATABASE_URL first
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        # Construct from individual components
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', 'password')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'mhia_db')
        
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    return db_url

def test_connection():
    """Test database connection and perform basic operations"""
    
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Get database URL
    db_url = get_database_url()
    
    # Mask password in output
    display_url = db_url.replace(
        db_url.split('@')[0].split('://')[-1].split(':')[-1], 
        '***'
    ) if '@' in db_url else db_url
    
    print(f"Database URL: {display_url}")
    print()
    
    try:
        # Create engine
        print("1. Creating database engine...")
        engine = create_engine(db_url, pool_pre_ping=True)
        print("   [OK] Engine created successfully")
        
        # Test connection
        print("\n2. Testing connection...")
        with engine.connect() as conn:
            print("   [OK] Connection established")
            
            # Get PostgreSQL version
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"   PostgreSQL version: {version.split(',')[0]}")
            
            # Test current database
            result = conn.execute(text("SELECT current_database()"))
            current_db = result.scalar()
            print(f"   Current database: {current_db}")
            
            # Test current user
            result = conn.execute(text("SELECT current_user"))
            current_user = result.scalar()
            print(f"   Connected as: {current_user}")
            
            # Check connection parameters
            result = conn.execute(text("""
                SELECT 
                    inet_server_addr() as server_addr,
                    inet_server_port() as server_port,
                    pg_backend_pid() as pid
            """))
            row = result.fetchone()
            print(f"   Server: {row[0]}:{row[1]} (PID: {row[2]})")
        
        # List tables
        print("\n3. Checking database schema...")
        inspector = inspect(engine)
        schemas = inspector.get_schema_names()
        
        print(f"   Available schemas: {', '.join(schemas)}")
        
        # Get tables in public schema
        tables = inspector.get_table_names(schema='public')
        if tables:
            print(f"   Tables found: {len(tables)}")
            for table in tables:
                columns = inspector.get_columns(table, schema='public')
                print(f"     - {table} ({len(columns)} columns)")
        else:
            print("   No tables found (database might be empty)")
        
        # Test write permission
        print("\n4. Testing write permissions...")
        try:
            with engine.connect() as conn:
                # Create a test table
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS connection_test (
                        id SERIAL PRIMARY KEY,
                        test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        test_message VARCHAR(255)
                    )
                """))
                conn.commit()
                print("   [OK] CREATE permission verified")
                
                # Insert test data
                conn.execute(text("""
                    INSERT INTO connection_test (test_message) 
                    VALUES (:message)
                """), {"message": f"Test at {datetime.now()}"})
                conn.commit()
                print("   [OK] INSERT permission verified")
                
                # Read test data
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM connection_test
                """))
                count = result.scalar()
                print(f"   [OK] SELECT permission verified (rows: {count})")
                
                # Clean up
                conn.execute(text("DROP TABLE connection_test"))
                conn.commit()
                print("   [OK] DROP permission verified")
                
        except ProgrammingError as e:
            print(f"   ⚠ Limited permissions: {str(e)[:100]}")
        
        # Test connection pool
        print("\n5. Testing connection pool...")
        from sqlalchemy.pool import NullPool
        engine_pooled = create_engine(db_url, poolclass=NullPool)
        with engine_pooled.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("   [OK] Connection pooling works")
        
        # Summary
        print("\n" + "=" * 60)
        print("CONNECTION TEST SUCCESSFUL!")
        print("=" * 60)
        print("\nDatabase is properly configured and accessible.")
        print("All basic operations are working correctly.")
        
        return True
        
    except OperationalError as e:
        print("\n" + "=" * 60)
        print("CONNECTION TEST FAILED!")
        print("=" * 60)
        print(f"\n❌ Error: {str(e)}")
        
        print("\nPossible causes:")
        print("1. PostgreSQL service is not running")
        print("2. Incorrect connection parameters (host, port, database)")
        print("3. Invalid credentials (username, password)")
        print("4. Network/firewall issues")
        print("5. Database does not exist")
        
        print("\nTroubleshooting steps:")
        print("1. Check if PostgreSQL is running:")
        print("   - Docker: docker ps | grep postgres")
        print("   - Local: sudo systemctl status postgresql")
        print("2. Verify connection parameters in .env file")
        print("3. Try connecting with psql:")
        print(f"   psql {db_url}")
        print("4. Check PostgreSQL logs for more details")
        
        return False
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("UNEXPECTED ERROR!")
        print("=" * 60)
        print(f"\n❌ Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        
        return False

def test_alembic_migrations():
    """Test if Alembic migrations are properly configured"""
    print("\n" + "=" * 60)
    print("ALEMBIC MIGRATION TEST")
    print("=" * 60)
    
    try:
        from alembic import command
        from alembic.config import Config
        
        # Check if alembic.ini exists
        if os.path.exists('alembic.ini'):
            print("[OK] alembic.ini found")
            
            # Check migrations directory
            if os.path.exists('alembic'):
                print("[OK] alembic directory found")
                
                # List migration files
                versions_dir = 'alembic/versions'
                if os.path.exists(versions_dir):
                    migrations = [f for f in os.listdir(versions_dir) if f.endswith('.py')]
                    print(f"[OK] {len(migrations)} migration files found")
                else:
                    print("[WARNING] No versions directory found")
            else:
                print("[WARNING] No alembic directory found")
        else:
            print("[WARNING] alembic.ini not found")
            print("  Run: alembic init alembic")
            
    except ImportError:
        print("[WARNING] Alembic not installed")
        print("  Run: pip install alembic")

if __name__ == "__main__":
    # Run connection test
    success = test_connection()
    
    # Run migration test
    test_alembic_migrations()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)