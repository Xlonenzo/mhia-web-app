@echo off
cls
color 0E
title MHIA - Status Check

echo.
echo ===============================================
echo    MHIA Web App - Status (Windows)
echo ===============================================
echo.

echo Checking services...
echo.

REM Check Backend
netstat -an | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Backend is running on port 8000
) else (
    echo [X] Backend is NOT running
)

REM Check Frontend
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Frontend is running on port 3000
) else (
    echo [X] Frontend is NOT running
)

REM Check PostgreSQL
docker ps | findstr mhia-postgres >nul 2>&1
if %errorlevel%==0 (
    echo [OK] PostgreSQL is running in Docker
) else (
    echo [X] PostgreSQL is NOT running
)

echo.
echo ===============================================
echo              Access URLs
echo ===============================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
pause