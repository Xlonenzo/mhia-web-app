@echo off
cls
title MHIA - Deploy to AWS EC2
color 0A

echo.
echo  ███╗   ███╗██╗  ██╗██╗ █████╗     ╔═╗╦ ╦╔═╗  ╔╦╗╔═╗╔═╗╦  ╔═╗╦ ╦
echo  ████╗ ████║██║  ██║██║██╔══██╗    ╠═╣║║║╚═╗   ║║║╣ ╠═╝║  ║ ║╚╦╝
echo  ██╔████╔██║███████║██║███████║    ╩ ╩╚╩╝╚═╝  ═╩╝╚═╝╩  ╩═╝╚═╝ ╩ 
echo  ██║╚██╔╝██║██╔══██║██║██╔══██║    
echo  ██║ ╚═╝ ██║██║  ██║██║██║  ██║    Remote AWS Deployment
echo  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝    
echo.
echo ================================================================
echo                   AWS EC2 Deployment Tool
echo ================================================================
echo.

REM Check if SSH key exists
if not exist "scripts\xlon-diego.pem" (
    echo [ERROR] SSH key file not found: scripts\xlon-diego.pem
    echo Please ensure your SSH key is in the scripts directory
    pause
    exit /b 1
)

REM Get EC2 IP address
set /p EC2_IP=Enter your EC2 instance IP address: 
if "%EC2_IP%"=="" (
    echo [ERROR] EC2 IP address is required
    pause
    exit /b 1
)

echo.
echo ================================================================
echo Choose deployment option:
echo ================================================================
echo.
echo   [1] Fresh deployment (clean install)
echo   [2] Update deployment (git pull + restart)
echo   [3] Deploy local changes (upload + restart)
echo   [4] Just connect to server (SSH)
echo   [5] View server logs
echo   [6] Restart services only
echo   [7] Exit
echo.
echo ================================================================
set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" goto fresh_deploy
if "%choice%"=="2" goto update_deploy
if "%choice%"=="3" goto deploy_local
if "%choice%"=="4" goto ssh_connect
if "%choice%"=="5" goto view_logs
if "%choice%"=="6" goto restart_services
if "%choice%"=="7" exit /b

echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto menu

:fresh_deploy
cls
echo ================================================================
echo                   FRESH DEPLOYMENT
echo ================================================================
echo.
echo This will:
echo 1. Connect to your EC2 instance
echo 2. Install all dependencies
echo 3. Clone the repository
echo 4. Run the full setup script
echo.
set /p confirm=Continue with fresh deployment? (y/n): 
if /i not "%confirm%"=="y" goto menu

echo.
echo [INFO] Connecting to EC2 instance...
echo [INFO] Running fresh deployment...

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "
    set -e
    echo '[INFO] Updating system...'
    sudo apt update
    
    echo '[INFO] Installing git if not present...'
    sudo apt install -y git
    
    echo '[INFO] Removing old installation if exists...'
    rm -rf mhia-web-app
    
    echo '[INFO] Cloning repository...'
    git clone https://github.com/Xlonenzo/mhia-web-app.git
    cd mhia-web-app
    
    echo '[INFO] Making setup script executable...'
    chmod +x scripts/setup-production-ubuntu-fixed.sh
    
    echo '[INFO] Running production setup...'
    ./scripts/setup-production-ubuntu-fixed.sh
    
    echo '[SUCCESS] Fresh deployment completed!'
    echo 'Your app should be available at: http://%EC2_IP%'
"

echo.
echo [SUCCESS] Fresh deployment completed!
echo [INFO] Your app should be available at: http://%EC2_IP%
pause
goto menu

:update_deploy
cls
echo ================================================================
echo                   UPDATE DEPLOYMENT
echo ================================================================
echo.
echo This will:
echo 1. Pull latest changes from GitHub
echo 2. Rebuild frontend if needed
echo 3. Restart all services
echo.

echo [INFO] Updating deployment...

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "
    set -e
    cd mhia-web-app || {
        echo '[ERROR] Application directory not found. Run fresh deployment first.'
        exit 1
    }
    
    echo '[INFO] Pulling latest changes...'
    git pull origin main
    
    echo '[INFO] Updating backend dependencies...'
    cd backend
    source venv/bin/activate
    pip install -r requirements.txt
    
    echo '[INFO] Running database migrations...'
    alembic upgrade head || echo '[WARNING] Migration failed or not needed'
    deactivate
    cd ..
    
    echo '[INFO] Updating frontend...'
    cd frontend
    npm install
    npm run build
    cd ..
    
    echo '[INFO] Restarting services...'
    sudo supervisorctl restart all
    sudo systemctl restart nginx
    
    echo '[INFO] Checking service status...'
    sudo supervisorctl status
    
    echo '[SUCCESS] Update deployment completed!'
"

echo.
echo [SUCCESS] Update deployment completed!
pause
goto menu

:deploy_local
cls
echo ================================================================
echo                   DEPLOY LOCAL CHANGES
echo ================================================================
echo.
echo This will:
echo 1. Create a local archive of your project
echo 2. Upload it to the EC2 instance
echo 3. Extract and restart services
echo.
echo [WARNING] This will overwrite remote changes!
echo.
set /p confirm=Continue with local deployment? (y/n): 
if /i not "%confirm%"=="y" goto menu

echo.
echo [INFO] Creating local archive...

REM Create temporary directory for upload
if exist temp_upload rmdir /s /q temp_upload
mkdir temp_upload

REM Copy important directories
echo [INFO] Copying files...
xcopy backend temp_upload\backend\ /E /I /Q /Y
xcopy frontend temp_upload\frontend\ /E /I /Q /Y
xcopy scripts temp_upload\scripts\ /E /I /Q /Y
copy *.md temp_upload\ 2>nul
copy *.yml temp_upload\ 2>nul
copy *.json temp_upload\ 2>nul

REM Create archive (requires tar or 7zip)
echo [INFO] Creating archive...
tar -czf mhia-local.tar.gz -C temp_upload .

echo [INFO] Uploading to EC2...
scp -i scripts\xlon-diego.pem mhia-local.tar.gz ubuntu@%EC2_IP%:~/

echo [INFO] Deploying on remote server...
ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "
    set -e
    echo '[INFO] Backing up current deployment...'
    cp -r mhia-web-app mhia-web-app-backup-$(date +%%Y%%m%%d-%%H%%M%%S) || echo '[WARNING] No existing deployment to backup'
    
    echo '[INFO] Extracting new files...'
    rm -rf mhia-web-app-new
    mkdir mhia-web-app-new
    tar -xzf mhia-local.tar.gz -C mhia-web-app-new
    
    echo '[INFO] Stopping services...'
    sudo supervisorctl stop all || echo '[WARNING] Services may not be running'
    
    echo '[INFO] Moving new files...'
    rm -rf mhia-web-app
    mv mhia-web-app-new mhia-web-app
    cd mhia-web-app
    
    echo '[INFO] Setting up backend...'
    cd backend
    if [ ! -d venv ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ..
    
    echo '[INFO] Building frontend...'
    cd frontend
    npm install
    npm run build
    cd ..
    
    echo '[INFO] Starting services...'
    sudo supervisorctl start all
    sudo systemctl restart nginx
    
    echo '[INFO] Checking status...'
    sudo supervisorctl status
    
    echo '[SUCCESS] Local deployment completed!'
    rm ~/mhia-local.tar.gz
"

REM Cleanup
del mhia-local.tar.gz
rmdir /s /q temp_upload

echo.
echo [SUCCESS] Local deployment completed!
pause
goto menu

:ssh_connect
cls
echo ================================================================
echo                   SSH CONNECTION
echo ================================================================
echo.
echo [INFO] Connecting to EC2 instance...
echo [INFO] Use 'exit' to close the SSH connection
echo.

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP%

echo.
echo [INFO] SSH connection closed
pause
goto menu

:view_logs
cls
echo ================================================================
echo                   VIEW SERVER LOGS
echo ================================================================
echo.

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "
    echo '=== Service Status ==='
    sudo supervisorctl status
    echo
    echo '=== Backend Logs (last 20 lines) ==='
    tail -20 /var/log/mhia/backend.out.log 2>/dev/null || echo 'Backend log not found'
    echo
    echo '=== Frontend Logs (last 20 lines) ==='
    tail -20 /var/log/mhia/frontend.out.log 2>/dev/null || echo 'Frontend log not found'
    echo
    echo '=== Nginx Error Logs (last 10 lines) ==='
    sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo 'Nginx error log not found'
    echo
    echo '=== System Info ==='
    df -h | head -5
    free -h
    echo 'Public IP:' \$(curl -s ifconfig.me)
"

echo.
pause
goto menu

:restart_services
cls
echo ================================================================
echo                   RESTART SERVICES
echo ================================================================
echo.

echo [INFO] Restarting services on remote server...

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "
    echo '[INFO] Restarting backend and frontend...'
    sudo supervisorctl restart all
    
    echo '[INFO] Restarting nginx...'
    sudo systemctl restart nginx
    
    echo '[INFO] Checking service status...'
    sudo supervisorctl status
    sudo systemctl status nginx --no-pager -l
    
    echo '[SUCCESS] Services restarted!'
"

echo.
echo [SUCCESS] Services restarted!
pause
goto menu

:menu
cls
goto :EOF