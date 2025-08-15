#!/bin/bash

# MHIA Web App - EC2 Setup Script
# This script sets up a fresh EC2 instance for the MHIA application

set -e

echo "========================================="
echo "MHIA Web App - EC2 Setup Script"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose already installed"
fi

# Install Node.js (for local development/management)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11
echo "Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx

# Install Certbot for SSL
echo "Installing Certbot..."
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/mhia-app
sudo chown -R $USER:$USER /opt/mhia-app

# Create data directories
echo "Creating data directories..."
sudo mkdir -p /var/lib/mhia/postgres
sudo mkdir -p /var/lib/mhia/redis
sudo mkdir -p /var/lib/mhia/uploads
sudo mkdir -p /var/lib/mhia/results
sudo mkdir -p /var/log/mhia

# Set permissions
sudo chown -R $USER:$USER /var/lib/mhia
sudo chown -R $USER:$USER /var/log/mhia

# Create swap file (for low memory instances)
echo "Creating swap file..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install monitoring tools
echo "Installing monitoring tools..."
sudo apt-get install -y prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter

# Create deployment user (optional)
echo "Creating deployment user..."
if ! id -u mhia &>/dev/null; then
    sudo useradd -m -s /bin/bash mhia
    sudo usermod -aG docker mhia
    sudo mkdir -p /home/mhia/.ssh
    sudo chown -R mhia:mhia /home/mhia/.ssh
fi

# Install AWS CLI
echo "Installing AWS CLI..."
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# System tuning for performance
echo "Applying system tuning..."
cat << EOF | sudo tee /etc/sysctl.d/99-mhia.conf
# Network tuning
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_tw_reuse = 1

# File descriptor limits
fs.file-max = 100000
EOF

sudo sysctl -p /etc/sysctl.d/99-mhia.conf

# Set ulimits
cat << EOF | sudo tee /etc/security/limits.d/mhia.conf
* soft nofile 65535
* hard nofile 65535
* soft nproc 32768
* hard nproc 32768
EOF

echo "========================================="
echo "EC2 Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/mhia-app"
echo "2. Copy and configure .env.production file"
echo "3. Run the deployment script (deploy-app.sh)"
echo "4. Configure your domain and SSL certificates"
echo ""
echo "Note: You may need to log out and back in for docker permissions to take effect"