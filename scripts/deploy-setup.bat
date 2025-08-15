@echo off
cls
echo ========================================================
echo MHIA Web App - Deployment Setup
echo ========================================================
echo.

REM Simple menu without special characters
echo Select an option:
echo.
echo 1. Test Environment
echo 2. Generate Secrets
echo 3. Setup GitHub
echo 4. Full Deployment Setup
echo 5. Exit
echo.

choice /c 12345 /n /m "Enter your choice (1-5): "

if errorlevel 5 goto end
if errorlevel 4 goto deploy
if errorlevel 3 goto github
if errorlevel 2 goto secrets
if errorlevel 1 goto test

:test
echo.
echo Running environment test...
python deployment\windows\test_environment.py
pause
goto end

:secrets
echo.
echo Generating secure secrets...
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(64)); print('DB_PASSWORD=' + secrets.token_urlsafe(32))" > deployment-secrets.txt
echo.
echo Secrets saved to: deployment-secrets.txt
type deployment-secrets.txt
echo.
pause
goto end

:github
echo.
echo GitHub Setup Instructions:
echo.
echo 1. Create repository at: https://github.com/Xlonenzo
echo 2. Run these commands:
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin https://github.com/Xlonenzo/mhia-web-app.git
echo    git push -u origin main
echo.
pause
goto end

:deploy
echo.
echo Starting full deployment setup...
echo.
call deployment\windows\deploy-full.bat
pause
goto end

:end
exit /b