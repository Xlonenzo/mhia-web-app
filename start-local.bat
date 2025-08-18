@echo off
cls
color 0A
title MHIA - Start Local Development

echo.
echo ===============================================
echo    MHIA Web App - Local Development (Windows)
echo ===============================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [INFO] Starting PostgreSQL database...
docker ps | findstr mhia-postgres >nul 2>&1
if errorlevel 1 (
    docker run -d ^
        --name mhia-postgres ^
        --restart unless-stopped ^
        -e POSTGRES_DB=mhia_db ^
        -e POSTGRES_USER=postgres ^
        -e POSTGRES_PASSWORD=password ^
        -p 5432:5432 ^
        -v mhia_postgres_data:/var/lib/postgresql/data ^
        postgres:15
    timeout /t 10 /nobreak >nul
) else (
    echo [INFO] PostgreSQL already running
)

echo.
echo [INFO] Starting Backend...
cd backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate
) else (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
)

echo [INFO] Installing backend dependencies...
pip install -r requirements.txt >nul 2>&1

echo [INFO] Creating .env file...
if not exist .env (
    echo DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia_db > .env
    echo SECRET_KEY=local-development-secret-key >> .env
    echo ALGORITHM=HS256 >> .env
    echo ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
    echo REDIS_URL=redis://localhost:6379 >> .env
    echo ENVIRONMENT=development >> .env
)

echo [INFO] Running migrations...
alembic upgrade head >nul 2>&1

echo [INFO] Starting backend server...
start "MHIA Backend" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo.
echo [INFO] Starting Frontend...
cd frontend

echo [INFO] Installing frontend dependencies...
call npm install >nul 2>&1

echo [INFO] Starting frontend server...
start "MHIA Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ===============================================
echo           Services Started!
echo ===============================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo Database:  localhost:5432
echo.
echo Press any key to open the app in browser...
pause >nul
start http://localhost:3000