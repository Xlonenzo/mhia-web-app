#!/bin/bash
# MHIA Web App - Universal Deployment Script
# Works on Ubuntu/Linux servers for production deployment

set -e

echo "======================================"
echo "   MHIA Web App - Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running on Ubuntu/Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}This script is for Linux/Ubuntu servers only${NC}"
    exit 1
fi

# Function to print colored status
print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Parse command line arguments
ACTION=${1:-start}

case $ACTION in
    install)
        print_status "Installing MHIA Web App from scratch..."
        
        # Update system
        print_status "Updating system packages..."
        sudo apt update && sudo apt upgrade -y
        
        # Install dependencies
        print_status "Installing system dependencies..."
        sudo apt install -y git curl nginx supervisor software-properties-common build-essential
        
        # Install Docker
        print_status "Installing Docker..."
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        fi
        sudo systemctl enable docker
        sudo systemctl start docker
        
        # Install Node.js 18
        print_status "Installing Node.js 18..."
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        # Install Python 3.11
        print_status "Installing Python 3.11..."
        if ! command -v python3.11 &> /dev/null; then
            sudo add-apt-repository -y ppa:deadsnakes/ppa
            sudo apt update
            sudo apt install -y python3.11 python3.11-venv python3.11-dev
        fi
        
        # Clone repository
        print_status "Cloning repository..."
        if [ -d ~/mhia-web-app ]; then
            print_warning "Repository already exists, pulling latest changes..."
            cd ~/mhia-web-app
            git pull origin main
        else
            cd ~
            git clone https://github.com/Xlonenzo/mhia-web-app.git
            cd mhia-web-app
        fi
        
        # Setup PostgreSQL
        print_status "Setting up PostgreSQL database..."
        if ! sudo docker ps | grep -q mhia-postgres; then
            sudo docker run -d \
                --name mhia-postgres \
                --restart unless-stopped \
                -e POSTGRES_DB=mhia_db \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=password \
                -p 5432:5432 \
                -v mhia_postgres_data:/var/lib/postgresql/data \
                postgres:15
            sleep 10
        fi
        
        # Setup Backend
        print_status "Setting up backend..."
        cd ~/mhia-web-app/backend
        python3.11 -m venv venv || python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip setuptools wheel
        pip install -r requirements.txt
        
        # Create .env if doesn't exist
        if [ ! -f .env ]; then
            cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
ENVIRONMENT=production
EOF
        fi
        
        alembic upgrade head || print_warning "Migrations failed or not needed"
        deactivate
        
        # Setup Frontend
        print_status "Setting up frontend..."
        cd ~/mhia-web-app/frontend
        npm install
        npm run build
        
        # Configure Nginx
        print_status "Configuring Nginx..."
        sudo tee /etc/nginx/sites-available/mhia > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
EOF
        sudo ln -sf /etc/nginx/sites-available/mhia /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl restart nginx
        
        print_status "Installation complete! Use './deploy.sh start' to start the application"
        ;;
        
    start)
        print_status "Starting MHIA Web App..."
        
        # Update from git
        cd ~/mhia-web-app
        print_status "Pulling latest changes..."
        git pull origin main
        
        # Start Database
        if ! sudo docker ps | grep -q mhia-postgres; then
            print_status "Starting PostgreSQL..."
            sudo docker start mhia-postgres || sudo docker run -d \
                --name mhia-postgres \
                --restart unless-stopped \
                -e POSTGRES_DB=mhia_db \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=password \
                -p 5432:5432 \
                -v mhia_postgres_data:/var/lib/postgresql/data \
                postgres:15
            sleep 5
        fi
        
        # Update and start Backend
        cd ~/mhia-web-app/backend
        source venv/bin/activate
        print_status "Updating backend dependencies..."
        pip install -r requirements.txt
        print_status "Starting backend..."
        nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > ~/backend.log 2>&1 &
        deactivate
        
        # Update and start Frontend
        cd ~/mhia-web-app/frontend
        print_status "Updating frontend dependencies..."
        npm install
        print_status "Building frontend..."
        npm run build
        print_status "Starting frontend..."
        nohup npm start > ~/frontend.log 2>&1 &
        
        sleep 3
        print_status "Application started!"
        echo ""
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_IP")
        echo "Access URLs:"
        echo "  Frontend: http://$PUBLIC_IP"
        echo "  Backend:  http://$PUBLIC_IP:8000"
        echo "  API Docs: http://$PUBLIC_IP:8000/docs"
        ;;
        
    stop)
        print_status "Stopping MHIA Web App..."
        pkill -f uvicorn || print_warning "Backend not running"
        pkill -f "npm start" || print_warning "Frontend not running"
        print_status "Application stopped!"
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo "======================================"
        echo "         Service Status"
        echo "======================================"
        
        # Backend
        if pgrep -f uvicorn > /dev/null; then
            echo -e "${GREEN}✓${NC} Backend is running"
        else
            echo -e "${RED}✗${NC} Backend is not running"
        fi
        
        # Frontend
        if pgrep -f "npm start" > /dev/null; then
            echo -e "${GREEN}✓${NC} Frontend is running"
        else
            echo -e "${RED}✗${NC} Frontend is not running"
        fi
        
        # Database
        if sudo docker ps | grep -q mhia-postgres; then
            echo -e "${GREEN}✓${NC} PostgreSQL is running"
        else
            echo -e "${RED}✗${NC} PostgreSQL is not running"
        fi
        
        # Nginx
        if systemctl is-active --quiet nginx; then
            echo -e "${GREEN}✓${NC} Nginx is running"
        else
            echo -e "${RED}✗${NC} Nginx is not running"
        fi
        ;;
        
    logs)
        echo "======================================"
        echo "         Application Logs"
        echo "======================================"
        echo ""
        echo "Backend logs (last 20 lines):"
        tail -20 ~/backend.log 2>/dev/null || echo "No backend logs found"
        echo ""
        echo "Frontend logs (last 20 lines):"
        tail -20 ~/frontend.log 2>/dev/null || echo "No frontend logs found"
        ;;
        
    *)
        echo "Usage: $0 {install|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  install  - Fresh installation of the application"
        echo "  start    - Start the application (with git pull)"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        echo "  status   - Check service status"
        echo "  logs     - View application logs"
        exit 1
        ;;
esac