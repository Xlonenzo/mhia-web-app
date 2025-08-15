#!/bin/bash

# MHIA Web App - Application Deployment Script
# This script deploys the application on EC2

set -e

APP_DIR="/opt/mhia-app"
REPO_URL="https://github.com/your-org/mhia-web-app.git"
BRANCH="main"

echo "========================================="
echo "MHIA Web App - Deployment Script"
echo "========================================="

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --repo)
            REPO_URL="$2"
            shift 2
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --fresh)
            FRESH_DEPLOY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to check if service is healthy
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    echo "Checking health of $service..."
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*healthy"; then
            echo "$service is healthy"
            return 0
        fi
        echo "Waiting for $service to be healthy... (attempt $((attempt+1))/$max_attempts)"
        sleep 10
        attempt=$((attempt+1))
    done
    
    echo "ERROR: $service failed to become healthy"
    return 1
}

# Navigate to app directory
cd $APP_DIR

# Pull latest code
echo "Pulling latest code from $BRANCH branch..."
if [ -d ".git" ]; then
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

# Check for models directory
if [ ! -d "../modelos" ]; then
    echo "WARNING: Models directory not found at ../modelos"
    echo "Please ensure the models are properly deployed"
fi

# Backup existing .env if it exists
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Check for production environment file
if [ ! -f ".env.production" ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please create .env.production with proper configuration"
    exit 1
fi

# Use production environment
cp .env.production .env

# Stop existing containers if fresh deploy requested
if [ "$FRESH_DEPLOY" = true ]; then
    echo "Performing fresh deployment..."
    docker-compose -f docker-compose.prod.yml down -v
    docker system prune -f
fi

# Build and start services
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
check_health "postgres"
check_health "redis"

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# Check backend health
check_health "backend"

# Check frontend health
check_health "frontend"

# Restart Nginx to ensure proper proxying
echo "Restarting Nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

# Show service status
echo ""
echo "========================================="
echo "Deployment Status:"
echo "========================================="
docker-compose -f docker-compose.prod.yml ps

# Show logs tail
echo ""
echo "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

# Health check endpoints
echo ""
echo "========================================="
echo "Testing endpoints..."
echo "========================================="

# Test backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✓ Backend is responding"
else
    echo "✗ Backend health check failed"
fi

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is responding"
else
    echo "✗ Frontend health check failed"
fi

# Test nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✓ Nginx is responding"
else
    echo "✗ Nginx health check failed"
fi

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Application URLs:"
echo "- Frontend: http://your-ec2-ip/"
echo "- Backend API: http://your-ec2-ip/api"
echo "- API Docs: http://your-ec2-ip/api/docs"
echo ""
echo "Monitor logs with:"
echo "  docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo ""
echo "Stop application with:"
echo "  docker-compose -f docker-compose.prod.yml down"