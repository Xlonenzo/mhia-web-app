@echo off
cls
color 0C
title MHIA - Stop Local Development

echo.
echo ===============================================
echo    MHIA Web App - Stop Services (Windows)
echo ===============================================
echo.

echo [INFO] Stopping Backend...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq MHIA Backend*" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Backend stopped
) else (
    echo [WARNING] Backend was not running
)

echo [INFO] Stopping Frontend...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq MHIA Frontend*" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Frontend stopped
) else (
    echo [WARNING] Frontend was not running
)

echo.
set /p stop_db=Stop PostgreSQL database? (y/n): 
if /i "%stop_db%"=="y" (
    echo [INFO] Stopping PostgreSQL...
    docker stop mhia-postgres >nul 2>&1
    if %errorlevel%==0 (
        echo [OK] PostgreSQL stopped
    ) else (
        echo [WARNING] PostgreSQL was not running
    )
) else (
    echo [INFO] PostgreSQL kept running
)

echo.
echo ===============================================
echo           All services stopped!
echo ===============================================
echo.
pause