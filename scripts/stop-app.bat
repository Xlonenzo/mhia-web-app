@echo off
echo ===== MHIA Application Shutdown =====
echo.

echo [1/4] Stopping backend server (FastAPI on port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    set PID=%%a
    if defined PID (
        echo Found backend process with PID: !PID!
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! equ 0 (
            echo Backend server stopped successfully.
        ) else (
            echo Failed to stop backend server.
        )
    )
)

echo [2/4] Stopping frontend server (Next.js on port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set PID=%%a
    if defined PID (
        echo Found frontend process with PID: !PID!
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! equ 0 (
            echo Frontend server stopped successfully.
        ) else (
            echo Failed to stop frontend server.
        )
    )
)

echo [3/4] Stopping any remaining MHIA-related processes...
REM Close any command windows with MHIA in the title
taskkill /F /FI "WINDOWTITLE eq MHIA Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MHIA Frontend*" >nul 2>&1

REM Stop any Python/Node processes that might be related to MHIA
wmic process where "commandline like '%%uvicorn%%app.main:app%%'" delete >nul 2>&1
wmic process where "commandline like '%%npm run dev%%' and commandline like '%%frontend%%'" delete >nul 2>&1

echo [4/4] Cleanup completed.
echo.
echo ===== Shutdown Summary =====
echo All MHIA application processes have been terminated.
echo You can now safely start the application again using start-app.bat
echo.

REM Verify ports are free
echo Verifying ports are free...
netstat -an | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo ✓ Port 3000 is free
) else (
    echo ⚠ Port 3000 is still in use
)

netstat -an | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo ✓ Port 8000 is free
) else (
    echo ⚠ Port 8000 is still in use
)

echo.
pause