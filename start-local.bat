@echo off
title MHIA Development Starter
color 0A
echo.
echo  ███╗   ███╗██╗  ██╗██╗ █████╗ 
echo  ████╗ ████║██║  ██║██║██╔══██╗
echo  ██╔████╔██║███████║██║███████║
echo  ██║╚██╔╝██║██╔══██║██║██╔══██║
echo  ██║ ╚═╝ ██║██║  ██║██║██║  ██║
echo  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
echo.
echo ===== Starting MHIA Local Development =====
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo [INFO] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo [INFO] Starting backend server...
start "MHIA Backend" cmd /k "cd backend && (if exist venv\Scripts\activate.bat (venv\Scripts\activate) else echo [WARNING] Virtual environment not found, using global Python) && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [INFO] Starting frontend server...
start "MHIA Frontend" cmd /k "cd frontend && npm start"

timeout /t 2 /nobreak > nul

echo.
echo ===== Services Started Successfully =====
echo.
echo 🌐 Frontend (React):     http://localhost:3000
echo 🚀 Backend API:          http://localhost:8000
echo 📚 API Documentation:    http://localhost:8000/docs
echo 📊 Interactive API:      http://localhost:8000/redoc
echo.
echo [INFO] Application will open automatically in 5 seconds...
echo [INFO] Press any key to open now or Ctrl+C to cancel
timeout /t 5 /nobreak > nul

start "" "http://localhost:3000"

echo.
echo ===== Development Environment Ready =====
echo.
echo To stop all services, run: stop-local.bat
echo.
pause