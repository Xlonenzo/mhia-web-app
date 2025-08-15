#!/bin/bash

# MHIA Web App - SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "========================================="
echo "MHIA Web App - SSL Setup Script"
echo "========================================="

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: ./ssl-setup.sh <your-domain.com> [email]"
    echo "Example: ./ssl-setup.sh app.example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

# Stop nginx temporarily
echo "Stopping Nginx container..."
docker-compose -f /opt/mhia-app/docker-compose.prod.yml stop nginx

# Get SSL certificate
echo "Obtaining SSL certificate for $DOMAIN..."
sudo certbot certonly \
    --standalone \
    --agree-tos \
    --non-interactive \
    --email $EMAIL \
    -d $DOMAIN

# Create SSL directory for Docker
echo "Setting up SSL certificates for Docker..."
sudo mkdir -p /opt/mhia-app/deployment/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    /opt/mhia-app/deployment/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    /opt/mhia-app/deployment/nginx/ssl/key.pem

# Set proper permissions
sudo chown -R $USER:$USER /opt/mhia-app/deployment/nginx/ssl
chmod 600 /opt/mhia-app/deployment/nginx/ssl/key.pem

# Update nginx configuration with domain
echo "Updating Nginx configuration..."
sed -i "s/server_name _;/server_name $DOMAIN;/g" \
    /opt/mhia-app/deployment/nginx/nginx.conf

# Start nginx
echo "Starting Nginx with SSL..."
docker-compose -f /opt/mhia-app/docker-compose.prod.yml up -d nginx

# Setup auto-renewal
echo "Setting up auto-renewal..."
cat << EOF | sudo tee /etc/cron.d/certbot-renewal
# Renew SSL certificates twice daily
0 0,12 * * * root certbot renew --quiet --post-hook "cd /opt/mhia-app && ./deployment/scripts/reload-ssl.sh"
EOF

# Create reload script
cat << 'EOF' | tee /opt/mhia-app/deployment/scripts/reload-ssl.sh
#!/bin/bash
# Copy renewed certificates and reload nginx
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/mhia-app/deployment/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/mhia-app/deployment/nginx/ssl/key.pem
docker-compose -f /opt/mhia-app/docker-compose.prod.yml exec nginx nginx -s reload
EOF

chmod +x /opt/mhia-app/deployment/scripts/reload-ssl.sh

echo ""
echo "========================================="
echo "SSL Setup Complete!"
echo "========================================="
echo ""
echo "Your application is now available at:"
echo "  https://$DOMAIN"
echo ""
echo "SSL certificate will auto-renew via cron job"
echo "Certificate details:"
sudo certbot certificates