#!/bin/bash

# MHIA Web App - Production Setup Script
# Run this on your production server (Ubuntu/Debian)

set -e  # Exit on error

echo "================================================"
echo "    MHIA Web App - Production Setup"
echo "================================================"
echo ""

# Update system
echo "[1/10] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
echo "[2/10] Installing system dependencies..."
sudo apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    postgresql \
    postgresql-contrib \
    redis-server \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    build-essential \
    supervisor

# Install Node.js 18
echo "[3/10] Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup PostgreSQL
echo "[4/10] Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE mhia_db;
CREATE USER mhia_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE mhia_db TO mhia_user;
EOF

# Setup Redis
echo "[5/10] Configuring Redis..."
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Setup application directory
echo "[6/10] Setting up application..."
cd /opt
sudo mkdir -p mhia-web-app
sudo chown $USER:$USER mhia-web-app
cd mhia-web-app

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    echo "Enter your GitHub repository URL:"
    read REPO_URL
    git clone $REPO_URL .
fi

# Setup backend
echo "[7/10] Setting up backend..."
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
echo "[8/10] Creating environment configuration..."
cat > .env << EOF
# Database
DATABASE_URL=postgresql://mhia_user:CHANGE_THIS_PASSWORD@localhost/mhia_db

# Security
JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')

# Redis
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=production

# CORS
CORS_ORIGINS=["https://yourdomain.com"]
EOF

echo "Please edit /opt/mhia-web-app/backend/.env to update passwords and domain"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

deactivate
cd ..

# Setup frontend
echo "[9/10] Building frontend..."
cd frontend

# Create production .env
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_ENVIRONMENT=production
EOF

npm install
npm run build

cd ..

# Setup Nginx
echo "[10/10] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mhia > /dev/null << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
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
sudo nginx -t
sudo systemctl restart nginx

# Setup Supervisor for process management
echo "Setting up Supervisor..."
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

echo ""
echo "================================================"
echo "    Production Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Edit /opt/mhia-web-app/backend/.env to set your passwords"
echo "2. Edit /opt/mhia-web-app/frontend/.env.production to set your domain"
echo "3. Update Nginx config with your domain: /etc/nginx/sites-available/mhia"
echo "4. Setup SSL with: sudo certbot --nginx -d yourdomain.com"
echo "5. Restart services:"
echo "   sudo supervisorctl restart all"
echo "   sudo systemctl restart nginx"
echo ""
echo "Service management:"
echo "  Start: sudo supervisorctl start all"
echo "  Stop: sudo supervisorctl stop all"
echo "  Status: sudo supervisorctl status"
echo "  Logs: tail -f /var/log/mhia/*.log"
echo ""