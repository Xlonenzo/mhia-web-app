#!/bin/bash

# MHIA Web App - Simple AWS Deployment (PostgreSQL in Docker, App Native)
# Fast deployment strategy with minimal Docker usage

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "================================================"
echo "    MHIA Web App - Fast AWS Deployment"
echo "================================================"
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || echo 'localhost')
print_status "Server IP: $SERVER_IP"

# Update system
print_status "[1/10] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential tools
print_status "[2/10] Installing essential dependencies..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    supervisor \
    postgresql-client

# Install Python 3.11
print_status "[3/10] Installing Python..."
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Install Node.js 18
print_status "[4/10] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker (for PostgreSQL only)
print_status "[5/10] Installing Docker for PostgreSQL..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock || true
sudo systemctl start docker
sudo systemctl enable docker

# Setup PostgreSQL in Docker
print_status "[6/10] Starting PostgreSQL in Docker..."
DB_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Stop and remove existing postgres container if exists
sudo docker stop postgres 2>/dev/null || true
sudo docker rm postgres 2>/dev/null || true

# Run PostgreSQL in Docker
sudo docker run -d \
    --name postgres \
    --restart unless-stopped \
    -e POSTGRES_DB=mhia_db \
    -e POSTGRES_USER=mhia_user \
    -e POSTGRES_PASSWORD=$DB_PASSWORD \
    -p 5432:5432 \
    -v postgres_data:/var/lib/postgresql/data \
    postgres:15

print_success "PostgreSQL running in Docker"
sleep 10  # Wait for PostgreSQL to be ready

# Clone or update repository
print_status "[7/10] Setting up application code..."
cd ~
if [ -d "mhia-web-app" ]; then
    cd mhia-web-app
    git pull origin main
else
    git clone https://github.com/Xlonenzo/mhia-web-app.git
    cd mhia-web-app
fi

# Setup Backend
print_status "[8/10] Setting up backend..."
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Generate JWT secret
JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://mhia_user:$DB_PASSWORD@localhost:5432/mhia_db

# Security
JWT_SECRET_KEY=$JWT_SECRET

# Environment
ENVIRONMENT=production

# CORS
CORS_ORIGINS=["http://$SERVER_IP","http://$SERVER_IP:3000","http://localhost:3000"]

# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=MHIA Web App
EOF

# Run database migrations
print_status "Running database migrations..."
alembic upgrade head || print_warning "Migrations failed or not needed"

deactivate
cd ..

# Setup Frontend
print_status "[9/10] Setting up frontend..."
cd frontend

# Remove Windows-specific packages
sed -i '/@rollup\/rollup-win32-x64-msvc/d' package.json

# Install dependencies
npm install --legacy-peer-deps

# Create production environment file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP/api
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# Build frontend
print_status "Building frontend (this may take a few minutes)..."
npm run build || npx vite build

cd ..

# Setup systemd services
print_status "[10/10] Setting up system services..."

# Backend service
sudo tee /etc/systemd/system/mhia-backend.service > /dev/null << EOF
[Unit]
Description=MHIA Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/mhia-web-app/backend
Environment="PATH=$HOME/mhia-web-app/backend/venv/bin"
ExecStart=$HOME/mhia-web-app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/mhia-frontend.service > /dev/null << EOF
[Unit]
Description=MHIA Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/mhia-web-app/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Setup Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mhia > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (default)
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
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location /redoc {
        proxy_pass http://localhost:8000/redoc;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/mhia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start services
print_status "Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable mhia-backend mhia-frontend
sudo systemctl start mhia-backend
sleep 5
sudo systemctl start mhia-frontend

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Save credentials
cat > ~/mhia-credentials.txt << EOF
================================================
MHIA Web App - Deployment Credentials
================================================
Database Password: $DB_PASSWORD
JWT Secret: $JWT_SECRET
Server IP: $SERVER_IP
================================================
Services:
- Frontend: http://$SERVER_IP
- Backend API: http://$SERVER_IP/api
- API Docs: http://$SERVER_IP/docs
================================================
EOF

# Final output
echo ""
print_success "================================================"
print_success "    Fast Deployment Complete!"
print_success "================================================"
echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "   - PostgreSQL: Running in Docker (port 5432)"
echo "   - Backend: Running with systemd (port 8000)"
echo "   - Frontend: Running with systemd (port 3000)"
echo "   - Nginx: Proxying all services (port 80)"
echo ""
echo "🌐 ACCESS YOUR APP:"
echo "   - Main App: http://$SERVER_IP"
echo "   - API Docs: http://$SERVER_IP/docs"
echo ""
echo "🔧 SERVICE MANAGEMENT:"
echo "   Backend:  sudo systemctl [start|stop|restart|status] mhia-backend"
echo "   Frontend: sudo systemctl [start|stop|restart|status] mhia-frontend"
echo "   Database: sudo docker [start|stop|restart] postgres"
echo "   Nginx:    sudo systemctl [start|stop|restart|status] nginx"
echo ""
echo "📊 VIEW LOGS:"
echo "   Backend:  sudo journalctl -u mhia-backend -f"
echo "   Frontend: sudo journalctl -u mhia-frontend -f"
echo "   Database: sudo docker logs postgres -f"
echo "   Nginx:    sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🔐 CREDENTIALS:"
echo "   Saved in: ~/mhia-credentials.txt"
echo "   Database Password: $DB_PASSWORD"
echo ""
print_success "Your app is now running at: http://$SERVER_IP"
echo ""