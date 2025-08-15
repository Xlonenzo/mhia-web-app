@echo off
cls
title MHIA Web App - Master Control Panel
color 0E

:main_menu
cls
echo.
echo  ███╗   ███╗██╗  ██╗██╗ █████╗     ╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗
echo  ████╗ ████║██║  ██║██║██╔══██╗    ║║║╠═╣╚═╗ ║ ║╣ ╠╦╝
echo  ██╔████╔██║███████║██║███████║    ╩ ╩╩ ╩╚═╝ ╩ ╚═╝╩╚═
echo  ██║╚██╔╝██║██╔══██║██║██╔══██║    
echo  ██║ ╚═╝ ██║██║  ██║██║██║  ██║    Control Panel v2.0
echo  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝    
echo.
echo ================================================================
echo                    MAIN MENU - Choose Category
echo ================================================================
echo.
echo   [1] LOCAL DEVELOPMENT
echo   [2] DOCKER OPERATIONS  
echo   [3] DEPLOYMENT & SETUP
echo   [4] TESTING & DIAGNOSTICS
echo   [5] UTILITIES
echo   [6] EXIT
echo.
echo ================================================================
set /p main_choice=Enter your choice (1-6): 

if "%main_choice%"=="1" goto local_dev
if "%main_choice%"=="2" goto docker_ops
if "%main_choice%"=="3" goto deployment
if "%main_choice%"=="4" goto testing
if "%main_choice%"=="5" goto utilities
if "%main_choice%"=="6" exit /b

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto main_menu

:local_dev
cls
echo.
echo ================================================================
echo                    LOCAL DEVELOPMENT
echo ================================================================
echo.
echo   [1] Start Full Stack (Frontend + Backend)
echo   [2] Start Frontend Only
echo   [3] Start Backend Only
echo   [4] Setup Local Environment
echo   [5] Stop All Services
echo   [6] Back to Main Menu
echo.
echo ================================================================
set /p dev_choice=Enter your choice (1-6): 

if "%dev_choice%"=="1" (
    echo Starting full stack development environment...
    call scripts\start-local.bat
    pause
    goto local_dev
)
if "%dev_choice%"=="2" (
    echo Starting frontend development server...
    call scripts\start-frontend.bat
    pause
    goto local_dev
)
if "%dev_choice%"=="3" (
    echo Starting backend API server...
    cd backend
    if exist venv\Scripts\activate.bat (
        call venv\Scripts\activate
    ) else (
        echo [WARNING] Virtual environment not found, using global Python
    )
    start "MHIA Backend" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    cd ..
    echo Backend started at http://localhost:8000
    pause
    goto local_dev
)
if "%dev_choice%"=="4" (
    echo Setting up local environment...
    call scripts\setup-local.bat
    pause
    goto local_dev
)
if "%dev_choice%"=="5" (
    echo Stopping all services...
    call scripts\stop-local.bat
    pause
    goto local_dev
)
if "%dev_choice%"=="6" goto main_menu

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto local_dev

:docker_ops
cls
echo.
echo ================================================================
echo                    DOCKER OPERATIONS
echo ================================================================
echo.
echo   [1] Start All Containers (docker-compose up)
echo   [2] Stop All Containers (docker-compose down)
echo   [3] Rebuild Containers
echo   [4] View Container Logs
echo   [5] Clean Docker (Remove volumes)
echo   [6] Back to Main Menu
echo.
echo ================================================================
set /p docker_choice=Enter your choice (1-6): 

if "%docker_choice%"=="1" (
    echo Starting Docker containers...
    docker-compose up -d
    echo.
    echo Containers started. Services available at:
    echo - Frontend: http://localhost:3000
    echo - Backend: http://localhost:8000
    echo - PostgreSQL: localhost:5432
    echo - Redis: localhost:6379
    pause
    goto docker_ops
)
if "%docker_choice%"=="2" (
    echo Stopping Docker containers...
    docker-compose down
    pause
    goto docker_ops
)
if "%docker_choice%"=="3" (
    echo Rebuilding Docker containers...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    pause
    goto docker_ops
)
if "%docker_choice%"=="4" (
    echo Available services: frontend, backend, postgres, redis
    set /p service=Enter service name (or 'all' for all logs): 
    if "%service%"=="all" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %service%
    )
    goto docker_ops
)
if "%docker_choice%"=="5" (
    echo WARNING: This will remove all Docker volumes and data!
    set /p confirm=Are you sure? (y/n): 
    if /i "%confirm%"=="y" (
        docker-compose down -v
        docker system prune -f
        echo Docker cleaned successfully.
    )
    pause
    goto docker_ops
)
if "%docker_choice%"=="6" goto main_menu

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto docker_ops

:deployment
cls
echo.
echo ================================================================
echo                    DEPLOYMENT & SETUP
echo ================================================================
echo.
echo   [1] Production Deployment Wizard
echo   [2] Generate Secure Secrets
echo   [3] Setup GitHub Repository
echo   [4] AWS EC2 Deployment
echo   [5] Setup Database
echo   [6] Back to Main Menu
echo.
echo ================================================================
set /p deploy_choice=Enter your choice (1-6): 

if "%deploy_choice%"=="1" (
    echo Starting deployment wizard...
    call scripts\DEPLOY.bat
    pause
    goto deployment
)
if "%deploy_choice%"=="2" (
    echo Generating secure secrets...
    set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
    set timestamp=%timestamp: =0%
    
    echo JWT_SECRET_KEY=^> secrets_%timestamp%.txt
    python -c "import secrets; print(secrets.token_urlsafe(64))" >> secrets_%timestamp%.txt
    
    echo DB_PASSWORD=^> secrets_%timestamp%.txt
    python -c "import secrets; print(secrets.token_urlsafe(32))" >> secrets_%timestamp%.txt
    
    echo REDIS_PASSWORD=^> secrets_%timestamp%.txt
    python -c "import secrets; print(secrets.token_urlsafe(32))" >> secrets_%timestamp%.txt
    
    echo.
    echo Secrets saved to: secrets_%timestamp%.txt
    type secrets_%timestamp%.txt
    echo.
    echo IMPORTANT: Keep this file secure!
    pause
    goto deployment
)
if "%deploy_choice%"=="3" (
    echo GitHub Repository Setup...
    set /p username=Enter your GitHub username: 
    echo.
    echo 1. Create repository at: https://github.com/%username%/mhia-web-app
    echo 2. Run these commands:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    echo    git remote add origin https://github.com/%username%/mhia-web-app.git
    echo    git push -u origin main
    pause
    goto deployment
)
if "%deploy_choice%"=="4" (
    echo AWS EC2 Deployment Guide...
    echo.
    echo 1. Launch EC2 instance (Ubuntu 22.04, t3.medium)
    echo 2. Configure security groups (ports 80, 443, 22)
    echo 3. SSH to instance and run:
    echo    git clone https://github.com/yourusername/mhia-web-app.git
    echo    cd mhia-web-app
    echo    ./scripts/setup-production.sh
    pause
    goto deployment
)
if "%deploy_choice%"=="5" (
    echo Setting up database...
    call scripts\setup_db.bat
    pause
    goto deployment
)
if "%deploy_choice%"=="6" goto main_menu

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto deployment

:testing
cls
echo.
echo ================================================================
echo                    TESTING & DIAGNOSTICS
echo ================================================================
echo.
echo   [1] Test Environment (Check all dependencies)
echo   [2] Run Backend Tests (pytest)
echo   [3] Run Frontend Tests (Jest)
echo   [4] Test Database Connection
echo   [5] Check API Health
echo   [6] Back to Main Menu
echo.
echo ================================================================
set /p test_choice=Enter your choice (1-6): 

if "%test_choice%"=="1" (
    echo Testing environment...
    call scripts\TEST-ENVIRONMENT.bat
    pause
    goto testing
)
if "%test_choice%"=="2" (
    echo Running backend tests...
    cd backend
    if exist venv\Scripts\activate.bat call venv\Scripts\activate
    pytest
    cd ..
    pause
    goto testing
)
if "%test_choice%"=="3" (
    echo Running frontend tests...
    cd frontend
    npm test
    cd ..
    pause
    goto testing
)
if "%test_choice%"=="4" (
    echo Testing database connection...
    cd backend
    python -c "from app.database import engine; engine.connect(); print('Database connection successful!')"
    cd ..
    pause
    goto testing
)
if "%test_choice%"=="5" (
    echo Checking API health...
    curl -f http://localhost:8000/health || echo API is not responding
    pause
    goto testing
)
if "%test_choice%"=="6" goto main_menu

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto testing

:utilities
cls
echo.
echo ================================================================
echo                    UTILITIES
echo ================================================================
echo.
echo   [1] Install Dependencies (npm & pip)
echo   [2] Database Migrations (Alembic)
echo   [3] Clear Cache & Temp Files
echo   [4] Generate TypeScript Types
echo   [5] Format Code (Black & Prettier)
echo   [6] Open Documentation
echo   [7] Back to Main Menu
echo.
echo ================================================================
set /p util_choice=Enter your choice (1-7): 

if "%util_choice%"=="1" (
    echo Installing dependencies...
    echo.
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
    echo Installing backend dependencies...
    cd backend
    if exist venv\Scripts\activate.bat call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
    pause
    goto utilities
)
if "%util_choice%"=="2" (
    echo Running database migrations...
    cd backend
    if exist venv\Scripts\activate.bat call venv\Scripts\activate
    alembic upgrade head
    cd ..
    pause
    goto utilities
)
if "%util_choice%"=="3" (
    echo Clearing cache and temp files...
    if exist frontend\node_modules\.cache rd /s /q frontend\node_modules\.cache
    if exist backend\__pycache__ rd /s /q backend\__pycache__
    if exist backend\.pytest_cache rd /s /q backend\.pytest_cache
    del /s /q *.pyc 2>nul
    echo Cache cleared successfully.
    pause
    goto utilities
)
if "%util_choice%"=="4" (
    echo Generating TypeScript types...
    cd frontend
    npm run type-check
    cd ..
    pause
    goto utilities
)
if "%util_choice%"=="5" (
    echo Formatting code...
    echo.
    echo Formatting Python code with Black...
    cd backend
    if exist venv\Scripts\activate.bat call venv\Scripts\activate
    black .
    cd ..
    echo.
    echo Formatting JavaScript/TypeScript with Prettier...
    cd frontend
    npx prettier --write "src/**/*.{js,jsx,ts,tsx,css}"
    cd ..
    pause
    goto utilities
)
if "%util_choice%"=="6" (
    echo Opening documentation...
    start "" "http://localhost:8000/docs"
    start "" "http://localhost:3000"
    pause
    goto utilities
)
if "%util_choice%"=="7" goto main_menu

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto utilities