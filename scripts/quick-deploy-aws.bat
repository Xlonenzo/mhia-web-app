@echo off
cls
title MHIA - Quick AWS Deployment
color 0A

echo.
echo ================================================================
echo        MHIA Web App - Quick AWS Deployment
echo ================================================================
echo.
echo This will deploy your app FAST with:
echo   - PostgreSQL in Docker (only database uses Docker)
echo   - Backend running natively with Python
echo   - Frontend running natively with Node.js
echo   - Nginx as reverse proxy
echo.
echo ================================================================
echo.

REM Check if SSH key exists
if not exist "scripts\xlon-diego.pem" (
    echo [ERROR] SSH key not found: scripts\xlon-diego.pem
    pause
    exit /b 1
)

REM Get EC2 IP
set /p EC2_IP=Enter your EC2 IP address: 
if "%EC2_IP%"=="" (
    echo [ERROR] EC2 IP is required
    pause
    exit /b 1
)

echo.
echo [INFO] Uploading deployment script...
scp -i scripts\xlon-diego.pem scripts\deploy-aws-simple.sh ubuntu@%EC2_IP%:~/

echo.
echo [INFO] Connecting to EC2 and running deployment...
echo [INFO] This will take about 5-10 minutes...
echo.

ssh -i scripts\xlon-diego.pem ubuntu@%EC2_IP% "chmod +x ~/deploy-aws-simple.sh && ~/deploy-aws-simple.sh"

echo.
echo ================================================================
echo        Deployment Complete!
echo ================================================================
echo.
echo Your app should now be running at:
echo   http://%EC2_IP%
echo.
echo API Documentation:
echo   http://%EC2_IP%/docs
echo.
echo To check status, SSH to your server and run:
echo   sudo systemctl status mhia-backend
echo   sudo systemctl status mhia-frontend
echo   sudo docker ps
echo.
pause