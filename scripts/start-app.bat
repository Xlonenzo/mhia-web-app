@echo off
setlocal enabledelayedexpansion

echo ===== MHIA Application Startup =====
echo.

REM Check if Python virtual environment exists
if not exist "backend\venv" (
    echo [ERROR] Python virtual environment not found!
    echo Please run setup-local.bat first to setup the development environment.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found!
    echo Please run setup-local.bat first to setup the development environment.
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting backend server (FastAPI)...
start "MHIA Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && echo Backend server starting on http://localhost:8000 && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo [2/3] Starting frontend server (Next.js)...
start "MHIA Frontend" cmd /k "cd /d "%~dp0frontend" && echo Frontend server starting on http://localhost:3000 && npm run dev"

echo [3/3] Services started successfully!
echo.
echo ===== Application URLs =====
echo Frontend:        http://localhost:3000
echo Backend API:     http://localhost:8000
echo API Docs:        http://localhost:8000/api/v1/docs
echo API ReDoc:       http://localhost:8000/api/v1/redoc
echo.
echo ===== Process Management =====
echo - Backend and frontend are running in separate command windows
echo - Close those windows to stop the respective services
echo - Or use stop-app.bat to stop all services at once
echo.

REM Wait a bit more then open browser
echo Opening application in your default browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo Press any key to exit this window (services will continue running)...
pause > nul