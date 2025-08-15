@echo off
echo ========================================================
echo MHIA Environment Test - Simple Version
echo ========================================================
echo.

echo Checking required tools...
echo.

echo [1/6] Node.js:
node --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND

echo.
echo [2/6] npm:
npm --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND

echo.
echo [3/6] Python:
python --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND

echo.
echo [4/6] Git:
git --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND

echo.
echo [5/6] Docker:
docker --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND

echo.
echo [6/6] AWS CLI:
aws --version 2>nul && echo    Status: OK || echo    Status: NOT FOUND (Optional)

echo.
echo ========================================================
echo Test Complete
echo ========================================================
echo.
echo If any required tools show NOT FOUND, please install them:
echo - Node.js: https://nodejs.org/
echo - Python: https://www.python.org/
echo - Git: https://git-scm.com/download/win
echo - Docker: https://www.docker.com/products/docker-desktop
echo - AWS CLI: https://aws.amazon.com/cli/ (optional)
echo.
pause