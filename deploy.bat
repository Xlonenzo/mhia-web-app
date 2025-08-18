@echo off
cls
color 0A
title MHIA - Fast AWS Deployment

echo.
echo ===============================================
echo    MHIA Web App - Fast AWS Deployment
echo ===============================================
echo.
echo This will deploy:
echo  + Backend (Python FastAPI)
echo  + Frontend (React/Next.js)  
echo  + Database (PostgreSQL Docker)
echo.

REM Get EC2 IP
set /p EC2_IP=Enter your EC2 IP address: 
if "%EC2_IP%"=="" (
    echo [ERROR] EC2 IP is required
    pause
    exit /b 1
)

echo.
echo [INFO] Connecting to %EC2_IP% and deploying...
echo [INFO] This will take 5-10 minutes...
echo.

REM Upload and run deployment script
echo [INFO] Uploading deployment script...
scp -i xlon-diego.pem deploy.sh ubuntu@%EC2_IP%:~/

echo [INFO] Running deployment...
ssh -i xlon-diego.pem ubuntu@%EC2_IP% "chmod +x ~/deploy.sh && ~/deploy.sh"

echo.
echo ===============================================
echo            Deployment Complete!
echo ===============================================
echo.
echo Your app is running at:
echo   http://%EC2_IP%
echo.
echo API Documentation:
echo   http://%EC2_IP%/docs
echo.
pause