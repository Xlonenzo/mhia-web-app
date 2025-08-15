"""
Alternative database setup script that handles Windows encoding issues
"""
import os
import subprocess
import sys

def setup_database():
    """Setup MHIA database using psql command line"""
    
    # Set environment variables for PostgreSQL
    env = os.environ.copy()
    env['PGUSER'] = 'postgres'
    env['PGPASSWORD'] = 'password'
    env['PGHOST'] = 'localhost'
    env['PGPORT'] = '5432'
    env['PGCLIENTENCODING'] = 'UTF8'
    
    try:
        # Check if database exists
        print("Checking if database exists...")
        result = subprocess.run([
            'psql', '-d', 'postgres', '-t', '-c',
            "SELECT 1 FROM pg_database WHERE datname='mhia';"
        ], env=env, capture_output=True, text=True)
        
        if result.returncode != 0:
            print("Error connecting to PostgreSQL. Please ensure:")
            print("1. PostgreSQL is installed and in PATH")
            print("2. PostgreSQL is running on port 5432")
            print("3. User 'postgres' has password 'password'")
            return False
            
        if result.stdout.strip():
            print("Database 'mhia' already exists.")
        else:
            # Create database
            print("Creating database 'mhia'...")
            result = subprocess.run([
                'psql', '-d', 'postgres', '-c',
                "CREATE DATABASE mhia WITH ENCODING 'UTF8' TEMPLATE template0;"
            ], env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("Database 'mhia' created successfully!")
            else:
                print(f"Error creating database: {result.stderr}")
                return False
        
        # Test connection to mhia database
        print("Testing connection to 'mhia' database...")
        result = subprocess.run([
            'psql', '-d', 'mhia', '-c', 'SELECT version();'
        ], env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Connection successful!")
            return True
        else:
            print(f"Connection failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("Error: 'psql' command not found.")
        print("Please install PostgreSQL and add it to your PATH.")
        print("Or use pgAdmin to manually create a database named 'mhia'")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    if not success:
        print("\nAs an alternative, you can manually create the database using pgAdmin:")
        print("1. Open pgAdmin")
        print("2. Right-click on 'Databases'")
        print("3. Select 'Create' > 'Database...'")
        print("4. Name: mhia")
        print("5. Encoding: UTF8")
        print("6. Click 'Save'")
        sys.exit(1)
    else:
        print("\nDatabase setup complete!")