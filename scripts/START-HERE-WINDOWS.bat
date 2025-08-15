@echo off
echo ========================================================
echo MHIA Web App - Windows Deployment Launcher
echo ========================================================
echo.
echo Welcome! This script will help you deploy your MHIA Web Application.
echo.
echo Choose your deployment path:
echo.
echo 1. Test your local environment first (RECOMMENDED)
echo 2. Complete guided deployment setup
echo 3. Setup GitHub repository only
echo 4. Generate secure secrets only
echo 5. Open documentation
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Testing your environment...
    cd deployment\windows
    test-local-setup.bat
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Starting complete deployment setup...
    cd deployment\windows
    quick-start.bat
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Setting up GitHub repository...
    cd deployment\windows
    setup-github.bat
    goto end
)

if "%choice%"=="4" (
    echo.
    echo Generating secure secrets...
    cd deployment\windows
    powershell -ExecutionPolicy Bypass -File generate-secrets.ps1 -ShowSecrets
    if errorlevel 1 (
        echo PowerShell not available, using basic method...
        echo Please run: deployment\windows\quick-start.bat
    )
    goto end
)

if "%choice%"=="5" (
    echo.
    echo Opening documentation...
    start deployment\windows\README.md
    start deployment\GITHUB_AWS_DEPLOYMENT_GUIDE.md
    goto end
)

echo Invalid choice. Please run the script again and choose 1-5.

:end
echo.
pause