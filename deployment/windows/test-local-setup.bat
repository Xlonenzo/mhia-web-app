@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo MHIA Local Setup Test for Windows
echo ========================================================
echo.

echo Testing your local development environment...
echo.

:: Check Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo Please install Node.js from: https://nodejs.org/
    set NODE_OK=0
) else (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! found
    set NODE_OK=1
)

:: Check npm
echo.
echo [2/6] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found
    set NPM_OK=0
) else (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION! found
    set NPM_OK=1
)

:: Check Python
echo.
echo [3/6] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found
    echo Please install Python from: https://www.python.org/
    set PYTHON_OK=0
) else (
    for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] Python !PYTHON_VERSION! found
    set PYTHON_OK=1
)

:: Check Git
echo.
echo [4/6] Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found
    echo Please install Git from: https://git-scm.com/download/win
    set GIT_OK=0
) else (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git !GIT_VERSION! found
    set GIT_OK=1
)

:: Check Docker
echo.
echo [5/6] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    set DOCKER_OK=0
) else (
    for /f "tokens=3" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [OK] Docker !DOCKER_VERSION! found
    set DOCKER_OK=1
)

:: Check AWS CLI
echo.
echo [6/6] Checking AWS CLI...
aws --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] AWS CLI not found (optional for deployment)
    echo Install from: https://aws.amazon.com/cli/
    set AWS_OK=0
) else (
    for /f "tokens=1" %%i in ('aws --version') do set AWS_VERSION=%%i
    echo [OK] !AWS_VERSION! found
    set AWS_OK=1
)

echo.
echo ========================================================
echo Environment Summary
echo ========================================================

:: Calculate score
set SCORE=0
if %NODE_OK%==1 set /a SCORE+=1
if %NPM_OK%==1 set /a SCORE+=1
if %PYTHON_OK%==1 set /a SCORE+=1
if %GIT_OK%==1 set /a SCORE+=1
if %DOCKER_OK%==1 set /a SCORE+=1
if %AWS_OK%==1 set /a SCORE+=1

if %NODE_OK%==1 (echo [OK] Node.js - Ready) else (echo [ERROR] Node.js - Missing)
if %NPM_OK%==1 (echo [OK] npm - Ready) else (echo [ERROR] npm - Missing)
if %PYTHON_OK%==1 (echo [OK] Python - Ready) else (echo [ERROR] Python - Missing)
if %GIT_OK%==1 (echo [OK] Git - Ready) else (echo [ERROR] Git - Missing)
if %DOCKER_OK%==1 (echo [OK] Docker - Ready) else (echo [ERROR] Docker - Missing)
if %AWS_OK%==1 (echo [OK] AWS CLI - Ready) else (echo [WARNING] AWS CLI - Optional)

echo.
echo Score: %SCORE%/6 tools available

if %SCORE% geq 5 (
    echo.
    echo Your environment is ready for development!
    echo You can proceed with the deployment setup.
) else (
    echo.
    echo [WARNING] Some tools are missing. Please install them before proceeding.
    echo Required: Node.js, npm, Python, Git, Docker
    echo Optional: AWS CLI (needed for deployment)
)

echo.
echo ========================================================
echo Testing Project Dependencies
echo ========================================================

:: Test backend dependencies
if exist "backend\requirements.txt" (
    echo.
    echo Testing Python backend...
    cd backend
    python -c "import sys; print('Python version:', sys.version)" 2>nul
    if errorlevel 1 (
        echo [ERROR] Python environment issues
    ) else (
        echo [OK] Python environment working
    )
    
    if exist ".env" (
        echo [OK] Backend .env file exists
        python test_db_connection.py >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] Database connection test failed (database may not be running)
        ) else (
            echo [OK] Database connection test passed
        )
    ) else (
        echo [WARNING] Backend .env file missing
    )
    cd ..
)

:: Test frontend dependencies  
if exist "frontend\package.json" (
    echo.
    echo Testing Node.js frontend...
    cd frontend
    if exist "node_modules" (
        echo [OK] Frontend dependencies installed
    ) else (
        echo [WARNING] Frontend dependencies not installed (run: npm install)
    )
    cd ..
)

:: Test Docker setup
if %DOCKER_OK%==1 (
    echo.
    echo Testing Docker...
    docker ps >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker daemon not running
        echo Please start Docker Desktop
    ) else (
        echo [OK] Docker daemon running
        
        :: Check if containers are running
        for /f %%i in ('docker ps -q') do set RUNNING_CONTAINERS=%%i
        if defined RUNNING_CONTAINERS (
            echo [OK] Docker containers are running
            docker ps --format "table {{.Names}}\t{{.Status}}"
        ) else (
            echo [INFO] No Docker containers currently running
        )
    )
)

echo.
echo ========================================================
echo Next Steps
echo ========================================================

if %SCORE% geq 5 (
    echo Your environment is ready! You can now:
    echo.
    echo 1. 🚀 Run quick-start.bat for complete deployment setup
    echo 2. 🐳 Start local development with Docker:
    echo    docker-compose up
    echo 3. 🔧 Start local development manually:
    echo    - Frontend: cd frontend ^&^& npm run dev
    echo    - Backend: cd backend ^&^& python -m uvicorn app.main:app --reload
    echo.
) else (
    echo Please install missing tools first:
    if %NODE_OK%==0 echo - Install Node.js: https://nodejs.org/
    if %PYTHON_OK%==0 echo - Install Python: https://www.python.org/
    if %GIT_OK%==0 echo - Install Git: https://git-scm.com/download/win
    if %DOCKER_OK%==0 echo - Install Docker: https://www.docker.com/products/docker-desktop
    echo.
)

echo Run this script again after installing missing tools.
echo.
pause