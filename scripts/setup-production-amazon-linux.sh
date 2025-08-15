#!/bin/bash

# MHIA Web App - Production Setup Script for Amazon Linux 2
# Run this on your AWS EC2 instance with Amazon Linux 2

set -e  # Exit on error

echo "================================================"
echo "    MHIA Web App - Amazon Linux 2 Setup"
echo "================================================"
echo ""

# Update system
echo "[1/10] Updating system packages..."
sudo yum update -y

# Install system dependencies
echo "[2/10] Installing system dependencies..."
sudo yum groupinstall -y "Development Tools"
sudo yum install -y \
    python3 \
    python3-pip \
    python3-devel \
    postgresql \
    postgresql-server \
    postgresql-contrib \
    redis \
    nginx \
    git \
    curl \
    openssl-devel \
    libffi-devel \
    supervisor

# Install Node.js 18
echo "[3/10] Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Setup PostgreSQL
echo "[4/10] Setting up PostgreSQL..."
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL authentication
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/data/postgresql.conf
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /var/lib/pgsql/data/pg_hba.conf
sudo sed -i "s/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/" /var/lib/pgsql/data/pg_hba.conf

sudo systemctl restart postgresql

# Set postgres password and create database
echo "[5/10] Creating database and user..."
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres_admin_password';
CREATE DATABASE mhia_db;
CREATE USER mhia_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE mhia_db TO mhia_user;
EOF

# Setup Redis
echo "[6/10] Configuring Redis..."
sudo systemctl start redis
sudo systemctl enable redis

# Setup application directory
echo "[7/10] Setting up application..."
sudo mkdir -p /opt/mhia-web-app
sudo chown ec2-user:ec2-user /opt/mhia-web-app
cd /opt/mhia-web-app

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    echo "Enter your GitHub repository URL (or press Enter for default):"
    read REPO_URL
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/Xlonenzo/mhia-web-app.git"
    fi
    git clone $REPO_URL .
fi

# Setup backend
echo "[8/10] Setting up backend..."
cd backend

# Install Python 3.11 if needed (Amazon Linux 2 comes with older Python)
if ! python3.11 --version &> /dev/null; then
    echo "Installing Python 3.11..."
    sudo amazon-linux-extras install python3.8 -y
    sudo yum install -y python38-devel
    # Use python3 (which should be 3.8+ on Amazon Linux 2)
    python3 -m venv venv
else
    python3.11 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
echo "Creating environment configuration..."
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
sudo tee /etc/nginx/conf.d/mhia.conf > /dev/null << EOF
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

sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup systemd services (Amazon Linux 2 uses systemd)
echo "Setting up systemd services..."

# Backend service
sudo tee /etc/systemd/system/mhia-backend.service > /dev/null << EOF
[Unit]
Description=MHIA Backend API
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=ec2-user
WorkingDirectory=/opt/mhia-web-app/backend
Environment=PATH=/opt/mhia-web-app/backend/venv/bin
ExecStart=/opt/mhia-web-app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/mhia-frontend.service > /dev/null << EOF
[Unit]
Description=MHIA Frontend
After=network.target

[Service]
Type=exec
User=ec2-user
WorkingDirectory=/opt/mhia-web-app/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
sudo mkdir -p /var/log/mhia
sudo chown ec2-user:ec2-user /var/log/mhia

# Reload systemd and start services
sudo systemctl daemon-reload
sudo systemctl enable mhia-backend mhia-frontend
sudo systemctl start mhia-backend mhia-frontend

# Configure firewall (if firewalld is running)
if systemctl is-active --quiet firewalld; then
    echo "Configuring firewall..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

echo ""
echo "================================================"
echo "    Amazon Linux 2 Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Edit /opt/mhia-web-app/backend/.env to set your passwords"
echo "2. Edit /opt/mhia-web-app/frontend/.env.production to set your domain"
echo "3. Update Nginx config with your domain: /etc/nginx/conf.d/mhia.conf"
echo "4. Setup SSL with Let's Encrypt:"
echo "   sudo yum install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com"
echo "5. Restart services:"
echo "   sudo systemctl restart mhia-backend mhia-frontend nginx"
echo ""
echo "Service management:"
echo "  Start: sudo systemctl start mhia-backend mhia-frontend"
echo "  Stop: sudo systemctl stop mhia-backend mhia-frontend"
echo "  Status: sudo systemctl status mhia-backend mhia-frontend"
echo "  Logs: sudo journalctl -u mhia-backend -f"
echo "        sudo journalctl -u mhia-frontend -f"
echo ""
echo "Your application should be accessible at:"
echo "  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""