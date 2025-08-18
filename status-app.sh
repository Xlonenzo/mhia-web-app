#!/bin/bash

echo "📊 MHIA Web App - Status"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend Status
echo -e "\n${YELLOW}Backend Status:${NC}"
if pgrep -f uvicorn > /dev/null; then
    PID=$(pgrep -f uvicorn)
    echo -e "${GREEN}✅ Backend rodando (PID: $PID)${NC}"
    echo "   Port: 8000"
    echo "   Logs: tail -f ~/mhia-backend.log"
else
    echo -e "${RED}❌ Backend não está rodando${NC}"
fi

# Frontend Status
echo -e "\n${YELLOW}Frontend Status:${NC}"
if pgrep -f "npm start" > /dev/null; then
    PID=$(pgrep -f "npm start" | head -1)
    echo -e "${GREEN}✅ Frontend rodando (PID: $PID)${NC}"
    echo "   Port: 3000"
    echo "   Logs: tail -f ~/mhia-frontend.log"
else
    echo -e "${RED}❌ Frontend não está rodando${NC}"
fi

# Database Status
echo -e "\n${YELLOW}Database Status:${NC}"
if sudo docker ps | grep -q mhia-postgres; then
    echo -e "${GREEN}✅ PostgreSQL rodando${NC}"
    echo "   Port: 5432"
    echo "   Container: mhia-postgres"
else
    echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
fi

# Network Status
echo -e "\n${YELLOW}Network Status:${NC}"
echo "Portas em uso:"
sudo netstat -tlnp | grep -E "3000|8000|5432" | while read line; do
    echo "   $line"
done

# System Resources
echo -e "\n${YELLOW}System Resources:${NC}"
echo "CPU e Memória:"
echo -n "   "
top -b -n 1 | grep "Cpu(s)" | head -1
echo -n "   "
free -h | grep "Mem:" 

# URLs
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_EC2_IP")
echo -e "\n${YELLOW}URLs de Acesso:${NC}"
echo "   Frontend: http://$PUBLIC_IP:3000"
echo "   Backend:  http://$PUBLIC_IP:8000"
echo "   API Docs: http://$PUBLIC_IP:8000/docs"

echo ""
echo "========================================"