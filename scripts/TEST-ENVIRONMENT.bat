@echo off
echo Running environment test...
echo.
python deployment\windows\test_environment.py
if errorlevel 1 (
    echo.
    echo [ERROR] Environment test failed. Please install missing tools.
) else (
    echo.
    echo [SUCCESS] Environment is ready for deployment!
)
pause