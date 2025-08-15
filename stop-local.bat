@echo off
title MHIA Development Stopper
color 0C
echo.
echo  ███╗   ███╗██╗  ██╗██╗ █████╗ 
echo  ████╗ ████║██║  ██║██║██╔══██╗
echo  ██╔████╔██║███████║██║███████║
echo  ██║╚██╔╝██║██╔══██║██║██╔══██║
echo  ██║ ╚═╝ ██║██║  ██║██║██║  ██║
echo  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
echo.
echo ===== Stopping MHIA Development Services =====
echo.

echo [INFO] Stopping Node.js development servers...
taskkill /f /im node.exe >nul 2>&1
if errorlevel 1 (
    echo [INFO] No Node.js processes found
) else (
    echo [SUCCESS] Node.js processes stopped
)

echo [INFO] Stopping Python/Uvicorn servers...
taskkill /f /im python.exe >nul 2>&1
if errorlevel 1 (
    echo [INFO] No Python processes found
) else (
    echo [SUCCESS] Python processes stopped
)

echo [INFO] Stopping any remaining development processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo [INFO] Stopping process on port 3000 (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo [INFO] Stopping process on port 8000 (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

echo [INFO] Closing development command windows...
taskkill /f /fi "WindowTitle eq MHIA Frontend*" >nul 2>&1
taskkill /f /fi "WindowTitle eq MHIA Backend*" >nul 2>&1

timeout /t 2 /nobreak > nul

echo.
echo ===== All Services Stopped =====
echo.
echo ✅ Frontend server stopped
echo ✅ Backend server stopped  
echo ✅ Development processes terminated
echo.
echo To restart services, run: start-local.bat
echo.
pause