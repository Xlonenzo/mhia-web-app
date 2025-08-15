"""
Script to create the MHIA database if it doesn't exist.
Run this before starting the backend server.
"""
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

def create_database():
    """Create MHIA database if it doesn't exist"""
    
    # Connection parameters
    dbname = 'mhia'
    user = 'postgres'
    password = 'password'
    host = 'localhost'
    port = '5432'
    
    try:
        # Connect to PostgreSQL server (default postgres database)
        print("Connecting to PostgreSQL server...")
        conn = psycopg2.connect(
            dbname='postgres',
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (dbname,)
        )
        exists = cursor.fetchone()
        
        if not exists:
            # Create database with UTF-8 encoding
            print(f"Creating database '{dbname}'...")
            cursor.execute(
                sql.SQL("CREATE DATABASE {} WITH ENCODING 'UTF8' LC_COLLATE='English_United States.1252' LC_CTYPE='English_United States.1252' TEMPLATE=template0").format(
                    sql.Identifier(dbname)
                )
            )
            print(f"Database '{dbname}' created successfully!")
        else:
            print(f"Database '{dbname}' already exists.")
        
        cursor.close()
        conn.close()
        
        # Test connection to the new database
        print(f"\nTesting connection to '{dbname}' database...")
        test_conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
            client_encoding='utf8'
        )
        test_conn.close()
        print("Connection successful!")
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"\nError: Could not connect to PostgreSQL server.")
        print(f"Details: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is installed and running")
        print("2. The postgres user has password 'password'")
        print("3. PostgreSQL is listening on localhost:5432")
        print("\nTo change the postgres password, run:")
        print("psql -U postgres -c \"ALTER USER postgres PASSWORD 'password';\"")
        return False
        
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    if not success:
        sys.exit(1)
    else:
        print("\nDatabase setup complete! You can now run the backend server.")
        print("Run: python -m uvicorn app.main:app --reload")