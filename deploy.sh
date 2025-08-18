#!/bin/bash
set -e

echo "🚀 MHIA Web App - Fast Deployment Script"
echo "========================================"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "🔧 Installing dependencies..."
sudo apt install -y git curl nginx supervisor

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# Install Node.js 18
echo "📱 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11 from deadsnakes PPA
echo "🐍 Installing Python 3.11..."
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-pip python3.11-dev build-essential

# Clone repository
echo "📥 Cloning repository..."
rm -rf mhia-web-app
git clone https://github.com/Xlonenzo/mhia-web-app.git
cd mhia-web-app

# Setup PostgreSQL Database
echo "🗄️ Setting up PostgreSQL database..."
sudo docker run -d \
    --name mhia-postgres \
    --restart unless-stopped \
    -e POSTGRES_DB=mhia_db \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=password \
    -p 5432:5432 \
    -v mhia_postgres_data:/var/lib/postgresql/data \
    postgres:15

echo "⏳ Waiting for database to start..."
sleep 15

# Setup Backend
echo "⚙️ Setting up backend..."
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
alembic upgrade head
deactivate
cd ..

# Setup Frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

# Configure Nginx
echo "🌐 Configuring Nginx..."
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mhia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup Supervisor
echo "👮 Setting up process management..."
sudo mkdir -p /var/log/mhia
sudo chown ubuntu:ubuntu /var/log/mhia

sudo tee /etc/supervisor/conf.d/mhia-backend.conf > /dev/null << 'EOF'
[program:mhia-backend]
command=/home/ubuntu/mhia-web-app/backend/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
directory=/home/ubuntu/mhia-web-app/backend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/mhia/backend.err.log
stdout_logfile=/var/log/mhia/backend.out.log
EOF

sudo tee /etc/supervisor/conf.d/mhia-frontend.conf > /dev/null << 'EOF'
[program:mhia-frontend]
command=/usr/bin/npm start
directory=/home/ubuntu/mhia-web-app/frontend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/mhia/frontend.err.log
stdout_logfile=/var/log/mhia/frontend.out.log
environment=NODE_ENV=production
EOF

# Start services
echo "🚀 Starting services..."
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all

# Show status
echo "✅ Deployment completed!"
echo "========================================"
echo "🌐 Your app is available at:"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_EC2_IP")
echo "   http://$PUBLIC_IP"
echo "📚 API documentation:"
echo "   http://$PUBLIC_IP/docs"
echo ""
echo "📊 Service status:"
sudo supervisorctl status
echo ""
echo "🐳 Database status:"
sudo docker ps | grep postgres
echo ""
echo "✨ Deployment successful! 🎉"