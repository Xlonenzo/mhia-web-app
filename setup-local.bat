@echo off
echo ===== MHIA Local Development Setup =====
echo.

echo [1/4] Creating Python virtual environment for backend...
cd backend
python -m venv venv
call venv\Scripts\activate
echo Installing backend dependencies...
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Creating .env files...
if not exist backend\.env (
    echo Creating backend .env file...
    (
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia
        echo REDIS_URL=redis://localhost:6379/0
        echo SECRET_KEY=your-secret-key-change-in-production
        echo ALLOWED_HOSTS=["http://localhost:3000"]
    ) > backend\.env
)

if not exist frontend\.env.local (
    echo Creating frontend .env.local file...
    (
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ) > frontend\.env.local
)

echo.
echo [4/4] Setup complete!
echo.
echo ===== NEXT STEPS =====
echo.
echo 1. Make sure PostgreSQL is installed and running on port 5432
echo    - Database: mhia
echo    - User: postgres
echo    - Password: password
echo.
echo 2. Make sure Redis is installed and running on port 6379
echo.
echo 3. To start the application:
echo    - Run 'start-local.bat' to start both frontend and backend
echo.
pause