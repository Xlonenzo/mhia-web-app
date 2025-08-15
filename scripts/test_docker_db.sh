#!/bin/bash

# Test database connection in Docker environment

echo "========================================="
echo "DOCKER DATABASE CONNECTION TEST"
echo "========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running or not accessible"
    echo "Please start Docker Desktop or Docker service"
    exit 1
fi

echo "1. Checking Docker Compose services..."
cd ..
if [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
elif [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    echo "[ERROR] No docker-compose file found"
    exit 1
fi

echo "   Using: $COMPOSE_FILE"
echo ""

# Check if PostgreSQL container is running
echo "2. Checking PostgreSQL container..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "postgres.*Up"; then
    echo "   [OK] PostgreSQL container is running"
else
    echo "   [WARNING] PostgreSQL container is not running"
    echo "   Starting PostgreSQL..."
    docker-compose -f $COMPOSE_FILE up -d postgres
    sleep 5
fi

# Test connection from host to container
echo ""
echo "3. Testing connection from host to container..."
docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U postgres
if [ $? -eq 0 ]; then
    echo "   [OK] PostgreSQL is ready"
else
    echo "   [ERROR] PostgreSQL is not responding"
    exit 1
fi

# Get container network details
echo ""
echo "4. Container network details:"
POSTGRES_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q postgres)
docker inspect $POSTGRES_CONTAINER | grep -A 5 "NetworkMode\|IPAddress" | grep -v "^\s*$"

# Test database access
echo ""
echo "5. Testing database access..."
docker-compose -f $COMPOSE_FILE exec -T postgres psql -U postgres -c "SELECT current_database(), version();" mhia_db
if [ $? -eq 0 ]; then
    echo "   [OK] Database 'mhia_db' is accessible"
else
    echo "   [WARNING] Database 'mhia_db' not found, creating..."
    docker-compose -f $COMPOSE_FILE exec -T postgres createdb -U postgres mhia_db
fi

# List existing tables
echo ""
echo "6. Checking database schema..."
TABLES=$(docker-compose -f $COMPOSE_FILE exec -T postgres psql -U postgres -d mhia_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "   Tables in database: $TABLES"

# Test from backend container
echo ""
echo "7. Testing connection from backend container..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "backend.*Up"; then
    echo "   Running Python connection test in backend container..."
    docker-compose -f $COMPOSE_FILE exec -T backend python test_db_connection.py
else
    echo "   [WARNING] Backend container is not running"
    echo "   You can start it with: docker-compose -f $COMPOSE_FILE up -d backend"
fi

# Show connection strings
echo ""
echo "========================================="
echo "CONNECTION STRINGS"
echo "========================================="
echo ""
echo "From host machine:"
echo "  postgresql://postgres:password@localhost:5432/mhia_db"
echo ""
echo "From Docker containers:"
echo "  postgresql://postgres:password@postgres:5432/mhia_db"
echo ""
echo "Environment variable:"
echo "  DATABASE_URL=postgresql://postgres:password@postgres:5432/mhia_db"
echo ""
echo "========================================="
echo "TEST COMPLETE"
echo "========================================="