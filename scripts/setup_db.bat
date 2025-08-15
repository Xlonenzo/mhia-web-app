@echo off
echo Setting up MHIA Database...

echo.
echo Attempting to create database using PostgreSQL...
echo.

REM Set environment variables for PostgreSQL
set PGUSER=postgres
set PGPASSWORD=password
set PGHOST=localhost
set PGPORT=5432
set PGCLIENTENCODING=UTF8

REM Try to find PostgreSQL installation
set "PG_PATH="
for /f "tokens=*" %%i in ('where psql 2^>nul') do set "PG_PATH=%%i"

if not defined PG_PATH (
    echo PostgreSQL psql command not found in PATH.
    echo.
    echo Please either:
    echo 1. Add PostgreSQL bin directory to your PATH, OR
    echo 2. Use pgAdmin to manually create database "mhia" with UTF8 encoding
    echo.
    echo Common PostgreSQL locations:
    echo   C:\Program Files\PostgreSQL\15\bin
    echo   C:\Program Files\PostgreSQL\14\bin
    echo   C:\Program Files\PostgreSQL\13\bin
    echo.
    pause
    exit /b 1
)

echo Found PostgreSQL at: %PG_PATH%
echo.

REM Check if database exists
echo Checking if database exists...
psql -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='mhia';" > temp_result.txt 2>&1

if errorlevel 1 (
    echo Error connecting to PostgreSQL.
    echo Please ensure:
    echo 1. PostgreSQL is running
    echo 2. User 'postgres' has password 'password'
    echo 3. PostgreSQL is listening on port 5432
    echo.
    type temp_result.txt
    del temp_result.txt
    pause
    exit /b 1
)

findstr /C:"1" temp_result.txt >nul
if %errorlevel%==0 (
    echo Database 'mhia' already exists.
) else (
    echo Creating database 'mhia'...
    psql -d postgres -c "CREATE DATABASE mhia WITH ENCODING 'UTF8' TEMPLATE template0;"
    if errorlevel 1 (
        echo Error creating database.
        del temp_result.txt
        pause
        exit /b 1
    )
    echo Database 'mhia' created successfully!
)

del temp_result.txt

REM Test connection
echo.
echo Testing connection to 'mhia' database...
psql -d mhia -c "SELECT version();" >nul 2>&1
if errorlevel 1 (
    echo Connection test failed.
    pause
    exit /b 1
)

echo Connection successful!
echo.
echo Database setup complete! You can now run the backend server:
echo   python -m uvicorn app.main:app --reload
echo.
pause