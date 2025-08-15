#!/bin/bash

# MHIA Web App - Production Setup Script for Ubuntu (Fixed)
# Supports Ubuntu 18.04, 20.04, 22.04, and 24.04

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "================================================"
echo "    MHIA Web App - Ubuntu Production Setup"
echo "================================================"
echo ""

# Check Ubuntu version
UBUNTU_VERSION=$(lsb_release -r -s)
print_status "Detected Ubuntu version: $UBUNTU_VERSION"

# Update system
print_status "[1/12] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install basic dependencies
print_status "[2/12] Installing basic system dependencies..."
sudo apt-get install -y \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    curl \
    wget \
    git \
    build-essential \
    supervisor \
    unzip

# Install Python (version depends on Ubuntu version)
print_status "[3/12] Installing Python..."

# Determine the best Python version for this Ubuntu
if [[ "$UBUNTU_VERSION" == "24.04" ]]; then
    PYTHON_VERSION="python3.12"
    PYTHON_CMD="python3.12"
elif [[ "$UBUNTU_VERSION" == "22.04" ]]; then
    PYTHON_VERSION="python3.10"
    PYTHON_CMD="python3.10"
elif [[ "$UBUNTU_VERSION" == "20.04" ]]; then
    # Add deadsnakes PPA for newer Python versions
    print_status "Adding deadsnakes PPA for Python 3.11..."
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt-get update
    PYTHON_VERSION="python3.11"
    PYTHON_CMD="python3.11"
else
    # Fallback to system python3
    PYTHON_VERSION="python3"
    PYTHON_CMD="python3"
fi

print_status "Installing Python packages: $PYTHON_VERSION"

if [[ "$PYTHON_VERSION" == "python3" ]]; then
    sudo apt-get install -y \
        python3 \
        python3-venv \
        python3-dev \
        python3-pip
else
    sudo apt-get install -y \
        $PYTHON_VERSION \
        $PYTHON_VERSION-venv \
        $PYTHON_VERSION-dev \
        python3-pip
fi

# Install PostgreSQL
print_status "[4/12] Installing PostgreSQL..."
sudo apt-get install -y \
    postgresql \
    postgresql-contrib \
    libpq-dev

# Install Redis
print_status "[5/12] Installing Redis..."
sudo apt-get install -y redis-server

# Install Nginx
print_status "[6/12] Installing Nginx..."
sudo apt-get install -y nginx

# Install Certbot
print_status "[7/12] Installing Certbot..."
sudo apt-get install -y \
    certbot \
    python3-certbot-nginx

# Install Node.js 18
print_status "[8/12] Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
print_status "Verifying installations..."
$PYTHON_CMD --version
node --version
npm --version

# Setup PostgreSQL
print_status "[9/12] Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Generate secure database password
DB_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Create database and user
print_status "Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE mhia_db;
CREATE USER mhia_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE mhia_db TO mhia_user;
ALTER DATABASE mhia_db OWNER TO mhia_user;
EOF

print_success "Database created with user 'mhia_user'"
echo "Database password: $DB_PASSWORD"

# Setup Redis
print_status "[10/12] Configuring Redis..."
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Setup application directory
print_status "[11/12] Setting up application..."
sudo mkdir -p /opt/mhia-web-app
sudo chown $USER:$USER /opt/mhia-web-app
cd /opt/mhia-web-app

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git pull origin main
else
    print_status "Cloning repository..."
    if [ -z "$REPO_URL" ]; then
        echo "Enter your GitHub repository URL (or press Enter for default):"
        read REPO_URL
        if [ -z "$REPO_URL" ]; then
            REPO_URL="https://github.com/Xlonenzo/mhia-web-app.git"
        fi
    fi
    git clone $REPO_URL .
fi

# Setup backend
print_status "Setting up backend..."
cd backend

# Create virtual environment with detected Python version
$PYTHON_CMD -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Generate JWT secret
JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')

# Create .env file with generated passwords
print_status "Creating environment configuration..."
cat > .env << EOF
# Database
DATABASE_URL=postgresql://mhia_user:$DB_PASSWORD@localhost/mhia_db

# Security
JWT_SECRET_KEY=$JWT_SECRET

# Redis
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=production

# CORS (update with your domain)
CORS_ORIGINS=["https://yourdomain.com"]

# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=MHIA Web App
EOF

print_success "Backend environment configuration created"

# Run database migrations
print_status "Running database migrations..."
if [ -f "alembic.ini" ]; then
    alembic upgrade head
    print_success "Database migrations completed"
else
    print_warning "No alembic.ini found, skipping migrations"
fi

deactivate
cd ..

# Setup frontend
print_status "[12/12] Setting up frontend..."
cd frontend

# Create production .env
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_ENVIRONMENT=production
EOF

print_status "Installing frontend dependencies..."
npm install

print_status "Building frontend for production..."
npm run build

print_success "Frontend build completed"
cd ..

# Configure UFW firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Setup Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mhia > /dev/null << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mhia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup Supervisor for process management
print_status "Setting up Supervisor..."
sudo tee /etc/supervisor/conf.d/mhia-backend.conf > /dev/null << EOF
[program:mhia-backend]
command=/opt/mhia-web-app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
directory=/opt/mhia-web-app/backend
user=$USER
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/mhia/backend.err.log
stdout_logfile=/var/log/mhia/backend.out.log
environment=PATH="/opt/mhia-web-app/backend/venv/bin"
EOF

sudo tee /etc/supervisor/conf.d/mhia-frontend.conf > /dev/null << EOF
[program:mhia-frontend]
command=npm start
directory=/opt/mhia-web-app/frontend
user=$USER
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
environment=NODE_ENV="production",PORT="3000"
stderr_logfile=/var/log/mhia/frontend.err.log
stdout_logfile=/var/log/mhia/frontend.out.log
EOF

# Create log directory
sudo mkdir -p /var/log/mhia
sudo chown $USER:$USER /var/log/mhia

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all

# Save important information
echo "
================================================
IMPORTANT: Save this information securely!
================================================
Python Version: $PYTHON_CMD
Database Password: $DB_PASSWORD
JWT Secret: $JWT_SECRET
Server IP: $(curl -s ifconfig.me || echo 'Unknown')
================================================
" | sudo tee /opt/mhia-web-app/SETUP_INFO.txt

echo ""
print_success "================================================"
print_success "    Ubuntu Production Setup Complete!"
print_success "================================================"
echo ""
print_status "Your MHIA Web App has been installed successfully!"
echo ""
echo "📋 SETUP SUMMARY:"
echo "   - Python Version: $PYTHON_CMD"
echo "   - Application Directory: /opt/mhia-web-app"
echo "   - Database: PostgreSQL (mhia_db)"
echo "   - Cache: Redis"
echo "   - Web Server: Nginx"
echo "   - Process Manager: Supervisor"
echo ""
echo "🔐 CREDENTIALS (also saved in /opt/mhia-web-app/SETUP_INFO.txt):"
echo "   - Database User: mhia_user"
echo "   - Database Password: $DB_PASSWORD"
echo ""
echo "🌐 NEXT STEPS:"
echo "   1. Update your domain in these files:"
echo "      - /opt/mhia-web-app/backend/.env (CORS_ORIGINS)"
echo "      - /opt/mhia-web-app/frontend/.env.production (NEXT_PUBLIC_API_URL)"
echo "      - /etc/nginx/sites-available/mhia (server_name)"
echo ""
echo "   2. Setup SSL certificate:"
echo "      sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "   3. Restart services:"
echo "      sudo supervisorctl restart all"
echo "      sudo systemctl restart nginx"
echo ""
echo "🔧 SERVICE MANAGEMENT:"
echo "   Start all:   sudo supervisorctl start all"
echo "   Stop all:    sudo supervisorctl stop all"
echo "   Status:      sudo supervisorctl status"
echo "   Logs:        tail -f /var/log/mhia/*.log"
echo "   Nginx:       sudo systemctl status nginx"
echo ""
echo "🌍 ACCESS YOUR APP:"
if command -v curl &> /dev/null; then
    PUBLIC_IP=$(curl -s ifconfig.me)
    echo "   HTTP:  http://$PUBLIC_IP"
    echo "   HTTPS: https://yourdomain.com (after SSL setup)"
else
    echo "   HTTP:  http://YOUR_SERVER_IP"
    echo "   HTTPS: https://yourdomain.com (after SSL setup)"
fi
echo ""
print_success "Setup completed successfully! 🎉"
echo ""