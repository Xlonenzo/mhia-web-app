@echo off
title MHIA Quick Dev
color 0E
echo.
echo ===== MHIA Quick Development Mode =====
echo.
echo Choose an option:
echo.
echo [1] Start Frontend Only (React App)
echo [2] Start Full Stack (Frontend + Backend)
echo [3] Stop All Services
echo [4] Install/Update Dependencies
echo [5] Build for Production
echo [Q] Quit
echo.
set /p choice="Enter your choice (1-5, Q): "

if /i "%choice%"=="1" goto frontend
if /i "%choice%"=="2" goto fullstack
if /i "%choice%"=="3" goto stop
if /i "%choice%"=="4" goto install
if /i "%choice%"=="5" goto build
if /i "%choice%"=="q" goto quit
echo Invalid choice. Please try again.
pause
goto :eof

:frontend
echo.
echo [INFO] Starting Frontend Only...
call start-frontend.bat
goto :eof

:fullstack
echo.
echo [INFO] Starting Full Stack...
call start-local.bat
goto :eof

:stop
echo.
echo [INFO] Stopping All Services...
call stop-local.bat
goto :eof

:install
echo.
echo [INFO] Installing/Updating Dependencies...
echo.
echo [INFO] Updating Frontend Dependencies...
cd frontend
npm install
echo.
echo [INFO] Updating Backend Dependencies...
cd ..\backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat && pip install -r requirements.txt
) else (
    echo [WARNING] Virtual environment not found. Install manually.
)
cd ..
echo.
echo [SUCCESS] Dependencies updated!
pause
goto :eof

:build
echo.
echo [INFO] Building for Production...
echo.
echo [INFO] Building Frontend...
cd frontend
npm run build
echo.
echo [SUCCESS] Build completed! Check the 'dist' folder.
cd ..
pause
goto :eof

:quit
echo.
echo Goodbye!
timeout /t 1 /nobreak > nul
exit