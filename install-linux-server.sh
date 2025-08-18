#!/bin/bash

# ====================================================================
# MHIA Web App - Complete Installation Script for Linux Server
# ====================================================================
# This script installs and configures both frontend and backend
# Run with: bash install-linux-server.sh
# ====================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=8000
APP_DIR=$(pwd)

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}MHIA Web App - Server Installation${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "This script is designed for Linux systems only"
    exit 1
fi

# ====================================================================
# SYSTEM DEPENDENCIES
# ====================================================================
echo -e "\n${BLUE}Installing System Dependencies...${NC}"

# Update system packages
print_info "Updating system packages..."
sudo apt-get update -y

# Install Node.js 18.x if not present
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node -v)"
fi

# Install Python 3.11 if not present
if ! command -v python3.11 &> /dev/null; then
    print_info "Installing Python 3.11..."
    sudo apt-get install -y software-properties-common
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt-get update
    sudo apt-get install -y python3.11 python3.11-venv python3.11-dev
else
    print_status "Python 3.11 already installed"
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    print_info "Installing PostgreSQL..."
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    print_status "PostgreSQL already installed"
fi

# Install Redis if not present
if ! command -v redis-cli &> /dev/null; then
    print_info "Installing Redis..."
    sudo apt-get install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
else
    print_status "Redis already installed"
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    sudo apt-get install -y nginx
else
    print_status "Nginx already installed"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 already installed"
fi

# Install pnpm globally (better for cross-platform)
if ! command -v pnpm &> /dev/null; then
    print_info "Installing pnpm..."
    sudo npm install -g pnpm
else
    print_status "pnpm already installed"
fi

# ====================================================================
# DATABASE SETUP
# ====================================================================
echo -e "\n${BLUE}Setting up PostgreSQL Database...${NC}"

# Create database and user
sudo -u postgres psql <<EOF 2>/dev/null || true
CREATE USER mhia_user WITH PASSWORD 'mhia_password';
CREATE DATABASE mhia_db OWNER mhia_user;
GRANT ALL PRIVILEGES ON DATABASE mhia_db TO mhia_user;
EOF

print_status "Database configured"

# ====================================================================
# BACKEND INSTALLATION
# ====================================================================
echo -e "\n${BLUE}Installing Backend...${NC}"

cd "$APP_DIR/backend" || exit 1

# Create Python virtual environment
print_info "Creating Python virtual environment..."
python3.11 -m venv venv

# Activate virtual environment and install dependencies
print_info "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if not exists
if [ ! -f .env ]; then
    print_info "Creating backend .env file..."
    cat > .env <<EOF
# Database
DATABASE_URL=postgresql://mhia_user:mhia_password@localhost/mhia_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:$FRONTEND_PORT"]

# API
API_V1_STR=/api/v1

# Server
HOST=0.0.0.0
PORT=$BACKEND_PORT

# Environment
ENVIRONMENT=production
EOF
    print_status "Backend .env created"
fi

# Run database migrations
print_info "Running database migrations..."
alembic upgrade head || print_warning "Migrations failed or not configured"

# Create PM2 ecosystem file for backend
cat > ecosystem.backend.config.js <<EOF
module.exports = {
  apps: [{
    name: 'mhia-backend',
    script: 'venv/bin/python',
    args: '-m uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT',
    cwd: '$APP_DIR/backend',
    env: {
      'ENVIRONMENT': 'production',
      'PORT': $BACKEND_PORT
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true
  }]
};
EOF

print_status "Backend installation complete"
deactivate

# ====================================================================
# FRONTEND INSTALLATION
# ====================================================================
echo -e "\n${BLUE}Installing Frontend...${NC}"

cd "$APP_DIR/frontend" || exit 1

# Clean previous installations
print_info "Cleaning previous frontend installations..."
rm -rf node_modules package-lock.json pnpm-lock.yaml .vite dist

# Clear npm cache
npm cache clean --force

# Create .npmrc for Linux
cat > .npmrc <<EOF
# Linux-specific npm configuration
omit=optional
engine-strict=false
auto-install-peers=true
EOF

# Install dependencies using pnpm (better cross-platform support)
print_info "Installing frontend dependencies with pnpm..."
pnpm install

# Install Linux-specific rollup if needed
pnpm add -D @rollup/rollup-linux-x64-gnu || true

# Create .env file if not exists
if [ ! -f .env ]; then
    print_info "Creating frontend .env file..."
    cat > .env <<EOF
VITE_API_URL=http://localhost:$BACKEND_PORT
VITE_APP_NAME=MHIA Platform
VITE_APP_VERSION=1.0.0
EOF
    print_status "Frontend .env created"
fi

# Build the frontend
print_info "Building frontend..."
pnpm run build || {
    print_warning "Build failed, trying alternative method..."
    npm run build || {
        print_error "Frontend build failed"
        exit 1
    }
}

# Create PM2 ecosystem file for frontend
cat > ecosystem.frontend.config.js <<EOF
module.exports = {
  apps: [{
    name: 'mhia-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '$APP_DIR/frontend',
    env: {
      'PORT': $FRONTEND_PORT,
      'NODE_ENV': 'production'
    },
    error_file: './logs/frontend-error.log',
    out_file: './logs/frontend-out.log',
    log_file: './logs/frontend-combined.log',
    time: true
  }]
};
EOF

print_status "Frontend installation complete"

# ====================================================================
# NGINX CONFIGURATION
# ====================================================================
echo -e "\n${BLUE}Configuring Nginx...${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/mhia > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/mhia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

print_status "Nginx configured"

# ====================================================================
# START SERVICES
# ====================================================================
echo -e "\n${BLUE}Starting Services...${NC}"

# Start backend with PM2
cd "$APP_DIR/backend"
pm2 start ecosystem.backend.config.js

# Start frontend with PM2
cd "$APP_DIR/frontend"
pm2 start ecosystem.frontend.config.js

# Save PM2 configuration
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

print_status "Services started"

# ====================================================================
# CREATE MANAGEMENT SCRIPTS
# ====================================================================
echo -e "\n${BLUE}Creating Management Scripts...${NC}"

cd "$APP_DIR"

# Create start script
cat > start-services.sh <<'EOF'
#!/bin/bash
echo "Starting MHIA services..."
pm2 start all
echo "Services started. Check status with: pm2 status"
EOF

# Create stop script
cat > stop-services.sh <<'EOF'
#!/bin/bash
echo "Stopping MHIA services..."
pm2 stop all
echo "Services stopped."
EOF

# Create restart script
cat > restart-services.sh <<'EOF'
#!/bin/bash
echo "Restarting MHIA services..."
pm2 restart all
echo "Services restarted. Check status with: pm2 status"
EOF

# Create logs script
cat > view-logs.sh <<'EOF'
#!/bin/bash
echo "Choose which logs to view:"
echo "1) Backend logs"
echo "2) Frontend logs"
echo "3) All logs"
echo "4) PM2 logs"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        pm2 logs mhia-backend
        ;;
    2)
        pm2 logs mhia-frontend
        ;;
    3)
        pm2 logs
        ;;
    4)
        pm2 logs --lines 50
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
EOF

# Create update script
cat > update-app.sh <<'EOF'
#!/bin/bash
echo "Updating MHIA application..."
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
deactivate
cd ..

# Update frontend
cd frontend
pnpm install
pnpm run build
cd ..

# Restart services
pm2 restart all

echo "Update complete!"
EOF

# Make scripts executable
chmod +x *.sh

print_status "Management scripts created"

# ====================================================================
# FINAL SETUP
# ====================================================================
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"

echo -e "\n${BLUE}Access Information:${NC}"
echo -e "  Frontend: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Backend API: ${GREEN}http://$SERVER_IP/api${NC}"
echo -e "  Backend Docs: ${GREEN}http://$SERVER_IP/api/docs${NC}"

echo -e "\n${BLUE}Service Management:${NC}"
echo -e "  View status: ${YELLOW}pm2 status${NC}"
echo -e "  View logs: ${YELLOW}./view-logs.sh${NC}"
echo -e "  Start services: ${YELLOW}./start-services.sh${NC}"
echo -e "  Stop services: ${YELLOW}./stop-services.sh${NC}"
echo -e "  Restart services: ${YELLOW}./restart-services.sh${NC}"
echo -e "  Update app: ${YELLOW}./update-app.sh${NC}"

echo -e "\n${BLUE}Database Access:${NC}"
echo -e "  PostgreSQL: ${YELLOW}psql -U mhia_user -d mhia_db${NC}"

echo -e "\n${YELLOW}Important:${NC}"
echo -e "  1. Update the .env files in frontend/ and backend/ with your settings"
echo -e "  2. Configure your firewall to allow ports 80, 443 (if using HTTPS)"
echo -e "  3. Set up SSL certificate for production use"

echo -e "\n${GREEN}Installation log saved to: install.log${NC}"