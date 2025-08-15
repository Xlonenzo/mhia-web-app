#!/bin/bash

# MHIA Web App - Docker-based AWS Deployment Script
# Deploys frontend, backend, and PostgreSQL using Docker Compose

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
echo "    MHIA Web App - Docker AWS Deployment"
echo "================================================"
echo ""

# Update system and install Docker
print_status "[1/8] Updating system and installing Docker..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    
    # Install Docker dependencies
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
else
    print_status "Docker already installed"
    # Ensure user is in docker group
    sudo usermod -aG docker $USER
fi

# Fix Docker permissions
print_status "Fixing Docker permissions..."
sudo chmod 666 /var/run/docker.sock || true
sudo systemctl restart docker
sleep 5

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
fi

# Verify Docker installation
print_status "Verifying Docker installation..."
docker --version
docker-compose --version

# Setup application directory
print_status "[2/8] Setting up application directory..."
sudo mkdir -p /opt/mhia-web-app
sudo chown $USER:$USER /opt/mhia-web-app
cd /opt/mhia-web-app

# Clone or update repository
print_status "[3/8] Getting application code..."
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git pull origin main
else
    print_status "Cloning repository..."
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/Xlonenzo/mhia-web-app.git"
    fi
    git clone $REPO_URL .
fi

# Generate environment variables
print_status "[4/8] Creating environment configuration..."
DB_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')

# Create backend .env file
cat > backend/.env << EOF
# Database (PostgreSQL in Docker)
DATABASE_URL=postgresql://mhia_user:$DB_PASSWORD@postgres:5432/mhia_db

# Security
JWT_SECRET_KEY=$JWT_SECRET

# Redis (if needed)
REDIS_URL=redis://redis:6379

# Environment
ENVIRONMENT=production

# CORS (update with your domain)
CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]

# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=MHIA Web App
EOF

# Create frontend .env.production file
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# Create production docker-compose.yml
print_status "[5/8] Creating Docker Compose configuration..."
cat > docker-compose.production.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: mhia-postgres
    environment:
      POSTGRES_DB: mhia_db
      POSTGRES_USER: mhia_user
      POSTGRES_PASSWORD: $DB_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mhia_user -d mhia_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: mhia-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mhia-backend
    environment:
      - DATABASE_URL=postgresql://mhia_user:$DB_PASSWORD@postgres:5432/mhia_db
      - JWT_SECRET_KEY=$JWT_SECRET
      - REDIS_URL=redis://redis:6379
      - ENVIRONMENT=production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./backend:/app
      - /app/venv
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: mhia-frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
      - NEXT_PUBLIC_ENVIRONMENT=production
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: mhia-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  nginx_logs:

networks:
  default:
    name: mhia-network
EOF

# Create Nginx configuration
print_status "[6/8] Creating Nginx configuration..."
mkdir -p nginx/conf.d

cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/conf.d/*.conf;
}
EOF

cat > nginx/conf.d/default.conf << EOF
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
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
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://backend/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Ensure backend Dockerfile exists
print_status "Checking backend Dockerfile..."
if [ ! -f "backend/Dockerfile" ]; then
    print_status "Creating backend Dockerfile..."
    cat > backend/Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    libpq-dev \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
fi

# Ensure frontend Dockerfile exists
print_status "Checking frontend Dockerfile..."
if [ ! -f "frontend/Dockerfile" ]; then
    print_status "Creating frontend Dockerfile..."
    cat > frontend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]
EOF
fi

# Configure UFW firewall
print_status "[7/8] Configuring firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 8000

# Build and start services
print_status "[8/8] Building and starting Docker services..."

# Stop any existing containers
sudo docker-compose -f docker-compose.production.yml down --remove-orphans || true

# Build and start services  
print_status "Building and starting all containers (this may take a few minutes)..."
sudo docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
sudo docker-compose -f docker-compose.production.yml ps

# Run database migrations
print_status "Running database migrations..."
sudo docker-compose -f docker-compose.production.yml exec -T backend alembic upgrade head || print_warning "Migration failed or not needed"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me || echo 'Unknown')

# Save deployment information
echo "
================================================
MHIA Docker Deployment Completed!
================================================
Database Password: $DB_PASSWORD
JWT Secret: $JWT_SECRET
Server IP: $PUBLIC_IP
Deployment Type: Docker Compose
================================================
Services:
- Frontend: http://$PUBLIC_IP:3000
- Backend: http://$PUBLIC_IP:8000
- API Docs: http://$PUBLIC_IP:8000/docs
- Database: PostgreSQL (Docker)
- Cache: Redis (Docker)
- Web Server: Nginx (Docker)
================================================
" | tee /opt/mhia-web-app/DOCKER_DEPLOYMENT_INFO.txt

echo ""
print_success "================================================"
print_success "    Docker Deployment Complete!"
print_success "================================================"
echo ""
print_status "Your MHIA Web App is now running in Docker containers!"
echo ""
echo "🐳 DOCKER SERVICES:"
echo "   - PostgreSQL: Running in container (persistent data)"
echo "   - Redis: Running in container"
echo "   - Backend: Running in container (port 8000)"
echo "   - Frontend: Running in container (port 3000)"
echo "   - Nginx: Running in container (port 80)"
echo ""
echo "🌐 ACCESS YOUR APP:"
echo "   - Main App: http://$PUBLIC_IP"
echo "   - Frontend: http://$PUBLIC_IP:3000"
echo "   - Backend API: http://$PUBLIC_IP:8000"
echo "   - API Docs: http://$PUBLIC_IP:8000/docs"
echo ""
echo "🔧 DOCKER MANAGEMENT:"
echo "   View logs:     sudo docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop all:      sudo docker-compose -f docker-compose.production.yml down"
echo "   Start all:     sudo docker-compose -f docker-compose.production.yml up -d"
echo "   Restart:       sudo docker-compose -f docker-compose.production.yml restart"
echo "   Status:        sudo docker-compose -f docker-compose.production.yml ps"
echo ""
echo "📊 MONITORING:"
echo "   Container stats: sudo docker stats"
echo "   Service health:  sudo docker-compose -f docker-compose.production.yml ps"
echo "   Backend logs:    sudo docker logs mhia-backend -f"
echo "   Frontend logs:   sudo docker logs mhia-frontend -f"
echo "   Database logs:   sudo docker logs mhia-postgres -f"
echo ""
print_success "Deployment completed successfully! 🎉"
echo ""