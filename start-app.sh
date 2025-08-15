#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${CYAN}"
echo "  ███╗   ███╗██╗  ██╗██╗ █████╗ "
echo "  ████╗ ████║██║  ██║██║██╔══██╗"
echo "  ██╔████╔██║███████║██║███████║"
echo "  ██║╚██╔╝██║██╔══██║██║██╔══██║"
echo "  ██║ ╚═╝ ██║██║  ██║██║██║  ██║"
echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo
echo -e "${BLUE}===== Starting MHIA Local Development =====${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    echo
    exit 1
fi

# Check if Python is installed (try both python and python3)
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}[ERROR] Python is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Python from https://python.org/${NC}"
    echo
    exit 1
fi

echo -e "${GREEN}[INFO] Node.js version: $(node --version)${NC}"
echo -e "${GREEN}[INFO] Python version: $($PYTHON_CMD --version)${NC}"
echo

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}[WARNING] Python virtual environment not found!${NC}"
    echo -e "${YELLOW}Please run setup-local.sh first to setup the development environment.${NC}"
    echo
    exit 1
fi

# Check if frontend dependencies exist
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}[INFO] Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install frontend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}[SUCCESS] Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}[SUCCESS] Frontend dependencies already installed${NC}"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}[WARNING] Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Check if ports are available
echo -e "${BLUE}[INFO] Checking port availability...${NC}"
check_port 8000
BACKEND_PORT_FREE=$?

check_port 3000
FRONTEND_PORT_FREE=$?

if [ $BACKEND_PORT_FREE -ne 0 ] || [ $FRONTEND_PORT_FREE -ne 0 ]; then
    echo -e "${RED}Please stop any existing services or use stop-app.sh first${NC}"
    echo
    exit 1
fi

echo -e "${BLUE}[1/3] Starting backend server (FastAPI)...${NC}"
cd backend
source venv/bin/activate
nohup $PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"
cd ..

echo -e "${BLUE}Waiting 3 seconds for backend to initialize...${NC}"
sleep 3

echo -e "${BLUE}[2/3] Starting frontend server (React + Vite)...${NC}"
cd frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"
cd ..

echo -e "${BLUE}[3/3] Services started successfully!${NC}"
echo

echo -e "${CYAN}===== Application URLs =====${NC}"
echo -e "${GREEN}🌐 Frontend (React):     http://localhost:3000${NC}"
echo -e "${GREEN}🚀 Backend API:          http://localhost:8000${NC}"
echo -e "${GREEN}📚 API Documentation:    http://localhost:8000/docs${NC}"
echo -e "${GREEN}📊 Interactive API:      http://localhost:8000/redoc${NC}"
echo

echo -e "${CYAN}===== Process Management =====${NC}"
echo -e "${PURPLE}Backend PID:     $BACKEND_PID (logged to backend.log)${NC}"
echo -e "${PURPLE}Frontend PID:    $FRONTEND_PID (logged to frontend.log)${NC}"
echo -e "${YELLOW}Use stop-app.sh to stop all services${NC}"
echo

echo -e "${CYAN}===== Log Files =====${NC}"
echo -e "${PURPLE}Backend logs:    tail -f backend.log${NC}"
echo -e "${PURPLE}Frontend logs:   tail -f frontend.log${NC}"
echo

# Try to open browser (works on most Linux distros and macOS)
echo -e "${BLUE}[INFO] Application will open automatically in 3 seconds...${NC}"
sleep 3

if command -v xdg-open > /dev/null; then
    echo -e "${GREEN}Opening application in browser...${NC}"
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    echo -e "${GREEN}Opening application in browser...${NC}"
    open http://localhost:3000
fi

echo
echo -e "${GREEN}===== Development Environment Ready =====${NC}"
echo -e "${YELLOW}Application is now running. Use stop-app.sh to shutdown.${NC}"
echo