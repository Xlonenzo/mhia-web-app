@echo off
setlocal

echo ========================================================
echo MHIA Web App - Full Deployment Setup
echo ========================================================
echo.

REM Get user input
set /p GITHUB_USER=GitHub username [Xlonenzo]: 
if "%GITHUB_USER%"=="" set GITHUB_USER=Xlonenzo

set /p REPO_NAME=Repository name [mhia-web-app]: 
if "%REPO_NAME%"=="" set REPO_NAME=mhia-web-app

set /p DOMAIN=Domain (leave empty for IP only): 
set /p EMAIL=Email for SSL: 

echo.
echo ========================================================
echo Configuration Summary:
echo ========================================================
echo GitHub: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo Domain: %DOMAIN%
echo Email: %EMAIL%
echo.

pause

echo.
echo ========================================================
echo Step 1: Generating Secrets
echo ========================================================

REM Generate secrets using Python
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(64))" > temp_jwt.txt
python -c "import secrets; print('DB_PASSWORD=' + secrets.token_urlsafe(32))" > temp_db.txt

set /p JWT_SECRET=<temp_jwt.txt
set /p DB_PASSWORD=<temp_db.txt

del temp_jwt.txt temp_db.txt

REM Save to file
(
echo # MHIA Deployment Secrets
echo # Generated: %date% %time%
echo.
echo %JWT_SECRET%
echo %DB_PASSWORD%
echo.
echo # AWS Configuration - Fill these manually:
echo AWS_ACCESS_KEY_ID=your_key_here
echo AWS_SECRET_ACCESS_KEY=your_secret_here
echo EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
echo EC2_PUBLIC_IP=x.x.x.x
) > deployment-secrets-%date:~-4,4%%date:~-10,2%%date:~-7,2%.txt

echo Secrets saved to: deployment-secrets-%date:~-4,4%%date:~-10,2%%date:~-7,2%.txt
echo.

echo ========================================================
echo Step 2: Git Commands
echo ========================================================
echo.
echo Run these commands to setup GitHub:
echo.
echo git init
echo git add .
echo git commit -m "Initial commit: MHIA Web Application"
echo git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo git push -u origin main
echo.

echo ========================================================
echo Step 3: AWS Commands
echo ========================================================
echo.
echo Create AWS infrastructure:
echo.
echo aws iam create-user --user-name mhia-deployment
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
echo aws iam create-access-key --user-name mhia-deployment
echo.
echo aws s3 mb s3://mhia-backups-%GITHUB_USER%
echo.
echo aws ecr create-repository --repository-name mhia-backend
echo aws ecr create-repository --repository-name mhia-frontend
echo.

echo ========================================================
echo Step 4: EC2 Deployment
echo ========================================================
echo.
echo 1. Create EC2 instance (Ubuntu 22.04, t3.medium)
echo 2. SSH to instance
echo 3. Run setup script:
echo.
echo    curl -O https://raw.githubusercontent.com/%GITHUB_USER%/%REPO_NAME%/main/deployment/scripts/setup-ec2.sh
echo    chmod +x setup-ec2.sh
echo    ./setup-ec2.sh
echo.
echo 4. Deploy application:
echo.
echo    cd /opt/mhia-app
echo    git clone https://github.com/%GITHUB_USER%/%REPO_NAME%.git .
echo    cp .env.production .env
echo    ./deployment/scripts/deploy-app.sh --fresh
echo.

if not "%DOMAIN%"=="" (
    echo 5. Setup SSL:
    echo.
    echo    ./deployment/scripts/ssl-setup.sh %DOMAIN% %EMAIL%
    echo.
)

echo ========================================================
echo Next Steps:
echo ========================================================
echo.
echo 1. Add secrets to GitHub: https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/secrets/actions
echo 2. Create AWS resources using commands above
echo 3. Deploy to EC2 following the instructions
echo.

pause
endlocal