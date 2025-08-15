@echo off
cls
title MHIA Web App Deployment

echo ========================================================
echo       MHIA Web App - Deployment Tool
echo ========================================================
echo.

:menu
echo Choose an option:
echo.
echo   1 - Test Environment
echo   2 - Generate Secrets  
echo   3 - Setup GitHub Repository
echo   4 - View Deployment Guide
echo   5 - Exit
echo.

set /p choice=Enter choice (1-5): 

if "%choice%"=="1" goto test
if "%choice%"=="2" goto secrets
if "%choice%"=="3" goto github
if "%choice%"=="4" goto guide
if "%choice%"=="5" goto exit

echo Invalid choice. Please try again.
echo.
goto menu

:test
cls
echo ========================================================
echo Testing Environment...
echo ========================================================
echo.
python deployment\windows\test_environment.py
echo.
pause
cls
goto menu

:secrets
cls
echo ========================================================
echo Generating Secure Secrets...
echo ========================================================
echo.

REM Generate timestamp for filename
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%

REM Generate secrets
echo Generating JWT Secret Key...
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(64))" > secrets_%timestamp%.txt

echo Generating Database Password...
python -c "import secrets; print('DB_PASSWORD=' + secrets.token_urlsafe(32))" >> secrets_%timestamp%.txt

echo.
echo Secrets generated and saved to: secrets_%timestamp%.txt
echo.
echo Contents:
echo ----------------------------------------
type secrets_%timestamp%.txt
echo ----------------------------------------
echo.
echo IMPORTANT: Keep this file secure and never commit to Git!
echo.
pause
cls
goto menu

:github
cls
echo ========================================================
echo GitHub Repository Setup
echo ========================================================
echo.

set /p username=Enter your GitHub username [Xlonenzo]: 
if "%username%"=="" set username=Xlonenzo

echo.
echo Follow these steps:
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/%username%
echo    Repository name: mhia-web-app
echo.
echo 2. Initialize and push your code:
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit: MHIA Web Application"  
echo    git remote add origin https://github.com/%username%/mhia-web-app.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Add secrets to GitHub:
echo    Go to: https://github.com/%username%/mhia-web-app/settings/secrets/actions
echo    Add the secrets from your secrets file
echo.
pause
cls
goto menu

:guide
cls
echo ========================================================
echo Deployment Guide
echo ========================================================
echo.
echo Full deployment process:
echo.
echo 1. TEST ENVIRONMENT
echo    - Run option 1 to verify all tools are installed
echo    - Install any missing tools
echo.
echo 2. GENERATE SECRETS
echo    - Run option 2 to create secure passwords
echo    - Save the secrets file securely
echo.
echo 3. SETUP GITHUB
echo    - Run option 3 for GitHub instructions
echo    - Create repository and push code
echo    - Add secrets to GitHub settings
echo.
echo 4. CREATE AWS RESOURCES
echo    - Create IAM user with deployment permissions
echo    - Launch EC2 instance (Ubuntu 22.04, t3.medium)
echo    - Create S3 bucket for backups (optional)
echo.
echo 5. DEPLOY TO EC2
echo    - SSH to your EC2 instance
echo    - Run the setup and deployment scripts
echo    - Configure domain and SSL (optional)
echo.
echo For detailed instructions, see:
echo - deployment\GITHUB_AWS_DEPLOYMENT_GUIDE.md
echo - deployment\windows\README.md
echo.
pause
cls
goto menu

:exit
echo.
echo Thank you for using MHIA Deployment Tool!
echo.
exit /b