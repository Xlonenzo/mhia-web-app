@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo 🚀 MHIA Web App - Windows Quick Start Deployment
echo ========================================================
echo.

echo Let's set up your MHIA application deployment!
echo This will help you:
echo 1. 📝 Prepare your GitHub repository
echo 2. 🔐 Generate secure secrets
echo 3. ☁️  Set up AWS infrastructure commands
echo 4. 🚀 Create deployment instructions
echo.

:: Get user input
set /p GITHUB_USER="What's your GitHub username [Xlonenzo]: " || set GITHUB_USER=Xlonenzo
set /p REPO_NAME="Repository name [mhia-web-app]: " || set REPO_NAME=mhia-web-app
set /p DOMAIN="Your domain (or leave empty for IP-only deployment): "
set /p EMAIL="Your email for SSL certificates: "
set /p AWS_REGION="AWS region [us-east-1]: " || set AWS_REGION=us-east-1

echo.
echo ========================================================
echo 📋 Deployment Summary
echo ========================================================
echo GitHub: https://github.com/%GITHUB_USER%/%REPO_NAME%
if defined DOMAIN (echo Domain: %DOMAIN%) else (echo Domain: Will use EC2 public IP)
echo AWS Region: %AWS_REGION%
echo Email: %EMAIL%
echo.

set /p confirm="Continue with these settings? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================================
echo 🔐 Step 1: Generating Secure Secrets
echo ========================================================

:: Generate secrets using PowerShell
echo Generating secure secrets...
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(64, 10)"') do set JWT_SECRET=%%i
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 5)"') do set DB_PASSWORD=%%i

echo ✓ JWT Secret Key: %JWT_SECRET:~0,20%...
echo ✓ Database Password: %DB_PASSWORD:~0,15%...
echo.

:: Save secrets to file
set SECRETS_FILE=deployment-secrets-%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
set SECRETS_FILE=%SECRETS_FILE: =0%

echo # MHIA Web App Deployment Secrets - %date% %time% > %SECRETS_FILE%
echo # KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT >> %SECRETS_FILE%
echo. >> %SECRETS_FILE%
echo # Application Configuration >> %SECRETS_FILE%
echo GITHUB_USER=%GITHUB_USER% >> %SECRETS_FILE%
echo REPO_NAME=%REPO_NAME% >> %SECRETS_FILE%
echo DOMAIN=%DOMAIN% >> %SECRETS_FILE%
echo EMAIL=%EMAIL% >> %SECRETS_FILE%
echo AWS_REGION=%AWS_REGION% >> %SECRETS_FILE%
echo. >> %SECRETS_FILE%
echo # Generated Secrets >> %SECRETS_FILE%
echo JWT_SECRET_KEY=%JWT_SECRET% >> %SECRETS_FILE%
echo DB_PASSWORD=%DB_PASSWORD% >> %SECRETS_FILE%
echo. >> %SECRETS_FILE%
echo # AWS Secrets (fill these in manually) >> %SECRETS_FILE%
echo AWS_ACCESS_KEY_ID=your_aws_access_key_id >> %SECRETS_FILE%
echo AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key >> %SECRETS_FILE%
echo. >> %SECRETS_FILE%
echo # EC2 Information (fill after instance creation) >> %SECRETS_FILE%
echo EC2_INSTANCE_ID=i-xxxxxxxxxxxxx >> %SECRETS_FILE%
echo EC2_PUBLIC_IP=x.x.x.x >> %SECRETS_FILE%
echo. >> %SECRETS_FILE%
echo # Application URLs >> %SECRETS_FILE%
if defined DOMAIN (echo API_URL=https://%DOMAIN% >> %SECRETS_FILE%) else (echo API_URL=http://your-ec2-ip:8000 >> %SECRETS_FILE%)

echo ✓ Secrets saved to: %SECRETS_FILE%
echo.

echo ========================================================
echo 📝 Step 2: Updating Configuration Files
echo ========================================================

:: Update .env.production file
if exist "..\.env.production" (
    echo Updating .env.production...
    powershell -command "(gc '..\.env.production') -replace 'your_secure_password_here','%DB_PASSWORD%' | Out-File -encoding ASCII '..\.env.production'"
    powershell -command "(gc '..\.env.production') -replace 'your_very_long_random_secret_key_here_change_this_in_production','%JWT_SECRET%' | Out-File -encoding ASCII '..\.env.production'"
    if defined DOMAIN (
        powershell -command "(gc '..\.env.production') -replace 'https://your-domain.com','https://%DOMAIN%' | Out-File -encoding ASCII '..\.env.production'"
        powershell -command "(gc '..\.env.production') -replace 'your-domain.com','%DOMAIN%' | Out-File -encoding ASCII '..\.env.production'"
    )
    echo ✓ .env.production updated
)

echo ✓ Configuration files updated
echo.

echo ========================================================
echo ☁️  Step 3: AWS Setup Commands
echo ========================================================

echo Copy and run these AWS CLI commands to set up your infrastructure:
echo.

echo :: 1. Create IAM user for deployment
echo aws iam create-user --user-name mhia-deployment
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonECRFullAccess
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonSSMFullAccess
echo aws iam create-access-key --user-name mhia-deployment
echo.

echo :: 2. Create S3 bucket for backups
echo aws s3 mb s3://mhia-backups-%GITHUB_USER%-%date:~-4,4%%date:~-10,2%%date:~-7,2%
echo.

echo :: 3. Create ECR repositories
echo aws ecr create-repository --repository-name mhia-backend
echo aws ecr create-repository --repository-name mhia-frontend
echo.

:: Save AWS commands to file
set AWS_COMMANDS_FILE=aws-setup-commands.bat
echo @echo off > %AWS_COMMANDS_FILE%
echo :: AWS Setup Commands for MHIA Web App >> %AWS_COMMANDS_FILE%
echo :: Generated on %date% %time% >> %AWS_COMMANDS_FILE%
echo. >> %AWS_COMMANDS_FILE%
echo echo Creating IAM user... >> %AWS_COMMANDS_FILE%
echo aws iam create-user --user-name mhia-deployment >> %AWS_COMMANDS_FILE%
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess >> %AWS_COMMANDS_FILE%
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonECRFullAccess >> %AWS_COMMANDS_FILE%
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess >> %AWS_COMMANDS_FILE%
echo aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonSSMFullAccess >> %AWS_COMMANDS_FILE%
echo aws iam create-access-key --user-name mhia-deployment >> %AWS_COMMANDS_FILE%
echo. >> %AWS_COMMANDS_FILE%
echo echo Creating S3 bucket... >> %AWS_COMMANDS_FILE%
echo aws s3 mb s3://mhia-backups-%GITHUB_USER%-%date:~-4,4%%date:~-10,2%%date:~-7,2% >> %AWS_COMMANDS_FILE%
echo. >> %AWS_COMMANDS_FILE%
echo echo Creating ECR repositories... >> %AWS_COMMANDS_FILE%
echo aws ecr create-repository --repository-name mhia-backend >> %AWS_COMMANDS_FILE%
echo aws ecr create-repository --repository-name mhia-frontend >> %AWS_COMMANDS_FILE%
echo. >> %AWS_COMMANDS_FILE%
echo pause >> %AWS_COMMANDS_FILE%

echo ✓ AWS commands saved to: %AWS_COMMANDS_FILE%
echo.

echo ========================================================
echo 📋 Next Steps Checklist
echo ========================================================

echo Manual steps to complete:
echo.
echo □ 1. Create GitHub repository:
echo    - Go to https://github.com/%GITHUB_USER%
echo    - Create new repository: %REPO_NAME%
echo    - Don't initialize (we have existing code)
echo.
echo □ 2. Push code to GitHub:
echo    cd %cd%\..\..
echo    git init
echo    git add .
echo    git commit -m "Initial commit: MHIA Web Application"
echo    git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo □ 3. Add GitHub secrets:
echo    - Go to: https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/secrets/actions
echo    - Add all secrets from: %SECRETS_FILE%
echo.
echo □ 4. Run AWS commands:
echo    - Execute: %AWS_COMMANDS_FILE%
echo.
echo □ 5. Create EC2 instance:
echo    - Launch Ubuntu 22.04 LTS t3.medium
echo    - Use security group: mhia-web-app
echo    - Create/select key pair
echo    - Note the instance ID and public IP
echo.
echo □ 6. Update GitHub secrets with EC2 info:
echo    - EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
echo    - EC2_PUBLIC_IP=x.x.x.x
echo.

if defined DOMAIN (
    echo □ 7. Configure domain:
    echo    - Point %DOMAIN% to your EC2 public IP
    echo.
)

echo ========================================================
echo 🎉 Setup Complete!
echo ========================================================
echo.
echo Your deployment configuration is ready!
echo Important files created:
echo - 🔐 %SECRETS_FILE% (keep secure, don't commit)
echo - ⚙️ %AWS_COMMANDS_FILE% (AWS setup commands)
echo - 📝 Updated .env.production file
echo.
echo Next: Follow the checklist above to complete deployment.
echo.
pause