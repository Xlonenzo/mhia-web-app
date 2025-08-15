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
echo -e "${RED}"
echo "  ███╗   ███╗██╗  ██╗██╗ █████╗ "
echo "  ████╗ ████║██║  ██║██║██╔══██╗"
echo "  ██╔████╔██║███████║██║███████║"
echo "  ██║╚██╔╝██║██╔══██║██║██╔══██║"
echo "  ██║ ╚═╝ ██║██║  ██║██║██║  ██║"
echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo
echo -e "${RED}===== Stopping MHIA Development Services =====${NC}"
echo

# Function to stop process by PID file
stop_by_pid_file() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${BLUE}Stopping $service_name (PID: $PID)...${NC}"
            kill -TERM "$PID"
            
            # Wait up to 10 seconds for graceful shutdown
            for i in {1..10}; do
                if ! kill -0 "$PID" 2>/dev/null; then
                    echo -e "${GREEN}$service_name stopped gracefully.${NC}"
                    break
                fi
                sleep 1
            done
            
            # Force kill if still running
            if kill -0 "$PID" 2>/dev/null; then
                echo -e "${YELLOW}Force stopping $service_name...${NC}"
                kill -KILL "$PID"
            fi
        else
            echo -e "${YELLOW}$service_name was not running (stale PID file).${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}No PID file found for $service_name.${NC}"
    fi
}

# Function to stop processes by port
stop_by_port() {
    local port=$1
    local service_name=$2
    
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo -e "${BLUE}Stopping $service_name on port $port (PID: $PID)...${NC}"
        kill -TERM $PID 2>/dev/null
        sleep 2
        
        # Check if still running and force kill
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}Force stopping $service_name...${NC}"
            kill -KILL $PID 2>/dev/null
        fi
        echo -e "${GREEN}$service_name stopped.${NC}"
    else
        echo -e "${YELLOW}No process found running on port $port.${NC}"
    fi
}

echo -e "${BLUE}[1/4] Stopping backend server (FastAPI on port 8000)...${NC}"
stop_by_pid_file "Backend" "backend.pid"
stop_by_port 8000 "Backend"

echo -e "${BLUE}[2/4] Stopping frontend server (React + Vite on port 3000)...${NC}"
stop_by_pid_file "Frontend" "frontend.pid"
stop_by_port 3000 "Frontend"

echo -e "${BLUE}[3/4] Cleaning up any remaining MHIA processes...${NC}"
# Kill any remaining uvicorn processes for this app
if pkill -f "uvicorn.*app.main:app" 2>/dev/null; then
    echo -e "${GREEN}Stopped uvicorn processes${NC}"
fi

# Kill any remaining npm/vite processes in frontend directory
if pkill -f "vite.*frontend" 2>/dev/null; then
    echo -e "${GREEN}Stopped Vite processes${NC}"
fi

# Kill any remaining Node.js processes for this project
if pkill -f "node.*frontend" 2>/dev/null; then
    echo -e "${GREEN}Stopped Node.js processes${NC}"
fi

echo -e "${BLUE}[4/4] Cleanup completed.${NC}"
echo

echo -e "${CYAN}===== Shutdown Summary =====${NC}"
echo -e "${GREEN}✅ Frontend server stopped${NC}"
echo -e "${GREEN}✅ Backend server stopped${NC}"  
echo -e "${GREEN}✅ Development processes terminated${NC}"
echo

# Verify ports are free
echo -e "${BLUE}Verifying ports are free...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠ Port 3000 is still in use${NC}"
else
    echo -e "${GREEN}✓ Port 3000 is free${NC}"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠ Port 8000 is still in use${NC}"
else
    echo -e "${GREEN}✓ Port 8000 is free${NC}"
fi

# Clean up log files option
echo
echo -e "${YELLOW}Do you want to clear log files? (y/N): ${NC}"
read -n 1 -r REPLY
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f backend.log frontend.log
    echo -e "${GREEN}Log files cleared.${NC}"
fi

echo
echo -e "${GREEN}===== All Services Stopped =====${NC}"
echo -e "${BLUE}To restart services, run: ./start-app.sh${NC}"
echo