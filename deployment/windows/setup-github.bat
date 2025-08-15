@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo 📝 GitHub Repository Setup for Windows
echo ========================================================
echo.

:: Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    echo Then restart this script.
    pause
    exit /b 1
)

echo ✓ Git is available
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    if not exist "backend\requirements.txt" (
        echo ❌ Please run this script from the project root directory
        echo Expected: C:\Users\User\Development\XLON\xlon_estudo_hibrido\mhia-web-app
        pause
        exit /b 1
    )
)

echo ✓ In project directory
echo.

:: Get repository information
set /p GITHUB_USER="GitHub username [Xlonenzo]: " || set GITHUB_USER=Xlonenzo
set /p REPO_NAME="Repository name [mhia-web-app]: " || set REPO_NAME=mhia-web-app

echo.
echo Repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.

set /p confirm="Is this correct? (y/N): "
if /i not "%confirm%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================================
echo 🔄 Setting up Git Repository
echo ========================================================

:: Initialize Git if not already done
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)

:: Set main branch
echo Setting main branch...
git branch -M main
echo ✓ Main branch set

:: Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo Creating .gitignore...
    copy deployment\windows\.gitignore-template .gitignore >nul
    echo ✓ .gitignore created
) else (
    echo ✓ .gitignore already exists
)

:: Add remote origin
echo Adding remote origin...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo ✓ Remote origin added

:: Stage all files
echo Staging files...
git add .
echo ✓ Files staged

:: Check status
echo.
echo Current status:
git status --short

:: Create commit
echo.
echo Creating initial commit...
git commit -m "Initial commit: MHIA Web Application with AWS deployment

Features:
- FastAPI backend with PostgreSQL and Redis
- Next.js frontend with TypeScript  
- Docker deployment configuration
- AWS EC2 deployment scripts and CI/CD
- Nginx reverse proxy with SSL support
- Automated backup and monitoring

🤖 Generated with Claude Code"

if errorlevel 1 (
    echo ❌ Commit failed. Please check for issues.
    pause
    exit /b 1
)

echo ✓ Initial commit created

echo.
echo ========================================================
echo 🚀 Pushing to GitHub
echo ========================================================

echo.
echo Before pushing, make sure you have:
echo 1. Created the repository on GitHub: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo 2. Don't initialize with README (we have existing code)
echo.

set /p push_confirm="Ready to push to GitHub? (y/N): "
if /i not "%push_confirm%"=="y" (
    echo Push cancelled. You can push later with:
    echo git push -u origin main
    pause
    exit /b 0
)

echo Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Push failed. Possible reasons:
    echo 1. Repository doesn't exist on GitHub
    echo 2. Authentication failed
    echo 3. Network issues
    echo.
    echo Create the repository first at: https://github.com/%GITHUB_USER%
    echo Then try: git push -u origin main
    pause
    exit /b 1
)

echo ✓ Successfully pushed to GitHub

echo.
echo ========================================================
echo 🎉 GitHub Setup Complete!
echo ========================================================
echo.
echo Your code is now available at:
echo https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Add repository secrets for deployment
echo 3. Run the AWS setup commands
echo 4. Deploy to EC2
echo.
echo Use the quick-start.bat script for the complete setup process.
echo.
pause