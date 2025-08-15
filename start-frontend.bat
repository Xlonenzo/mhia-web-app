@echo off
title MHIA Frontend Starter
color 0B
echo.
echo  ███╗   ███╗██╗  ██╗██╗ █████╗ 
echo  ████╗ ████║██║  ██║██║██╔══██╗
echo  ██╔████╔██║███████║██║███████║
echo  ██║╚██╔╝██║██╔══██║██║██╔══██║
echo  ██║ ╚═╝ ██║██║  ██║██║██║  ██║
echo  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
echo.
echo ===== Starting MHIA Frontend Only =====
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version: 
node --version

echo [INFO] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Dependencies installed
) else (
    echo [SUCCESS] Dependencies already installed
)

echo [INFO] Starting React development server...
echo [INFO] This will open the application at http://localhost:3000
echo.

cd frontend
start "MHIA React App" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo ===== Frontend Started Successfully =====
echo.
echo 🌐 React Application: http://localhost:3000
echo.
echo [INFO] The application will open automatically in 3 seconds...
echo [INFO] Press Ctrl+C in the React terminal to stop the server
echo.

timeout /t 3 /nobreak > nul
start "" "http://localhost:3000"

echo Frontend is now running in a separate window.
echo Close this window or press any key to exit this launcher.
pause > nul