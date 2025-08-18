#!/bin/bash

echo "🛑 MHIA Web App - Stop Script"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parar Backend
echo -e "${YELLOW}[INFO]${NC} Parando Backend..."
if pkill -f uvicorn; then
    echo -e "${GREEN}✅ Backend parado${NC}"
else
    echo -e "${YELLOW}⚠️  Backend não estava rodando${NC}"
fi

# Parar Frontend
echo -e "${YELLOW}[INFO]${NC} Parando Frontend..."
if pkill -f "npm start"; then
    echo -e "${GREEN}✅ Frontend parado${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend não estava rodando${NC}"
fi

# Perguntar sobre o Database
echo ""
read -p "Deseja parar o PostgreSQL também? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}[INFO]${NC} Parando PostgreSQL..."
    if sudo docker stop mhia-postgres; then
        echo -e "${GREEN}✅ PostgreSQL parado${NC}"
    else
        echo -e "${RED}❌ Erro ao parar PostgreSQL${NC}"
    fi
else
    echo -e "${YELLOW}[INFO]${NC} PostgreSQL mantido rodando"
fi

echo ""
echo "========================================"
echo "✅ Serviços parados!"
echo "========================================"
echo ""
echo "Para reiniciar, execute: ./start-app.sh"