#!/bin/bash
set -e

echo "🚀 MHIA Web App - Start Script"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. ATUALIZAR CÓDIGO DO REPOSITÓRIO
print_status "Atualizando código do repositório..."
cd ~/mhia-web-app

# Fazer backup das configurações locais
if [ -f backend/.env ]; then
    cp backend/.env backend/.env.backup
    print_status "Backup do .env criado"
fi

# Puxar últimas mudanças
git fetch origin
git pull origin main

# Restaurar configurações locais
if [ -f backend/.env.backup ]; then
    mv backend/.env.backup backend/.env
    print_status "Configurações locais restauradas"
fi

# 2. PARAR SERVIÇOS ANTIGOS
print_status "Parando serviços antigos..."
pkill -f uvicorn || print_warning "Backend não estava rodando"
pkill -f "npm start" || print_warning "Frontend não estava rodando"
sleep 2

# 3. VERIFICAR/INICIAR DATABASE
print_status "Verificando PostgreSQL..."
if ! sudo docker ps | grep -q mhia-postgres; then
    print_status "Iniciando PostgreSQL..."
    sudo docker run -d \
        --name mhia-postgres \
        --restart unless-stopped \
        -e POSTGRES_DB=mhia_db \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        -v mhia_postgres_data:/var/lib/postgresql/data \
        postgres:15
    
    print_status "Aguardando database iniciar..."
    sleep 10
else
    print_status "PostgreSQL já está rodando"
fi

# 4. ATUALIZAR BACKEND
print_status "Atualizando Backend..."
cd ~/mhia-web-app/backend

# Ativar ambiente virtual
if [ ! -d venv ]; then
    print_status "Criando ambiente virtual..."
    python3.11 -m venv venv || python3 -m venv venv
fi

source venv/bin/activate

# Atualizar dependências
print_status "Instalando dependências do backend..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Criar .env se não existir
if [ ! -f .env ]; then
    print_status "Criando arquivo .env..."
    cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia_db
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
ENVIRONMENT=production
EOF
fi

# Rodar migrações
print_status "Executando migrações do banco..."
alembic upgrade head || print_warning "Migrações falharam ou não são necessárias"

# Iniciar backend
print_status "Iniciando Backend..."
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > ~/mhia-backend.log 2>&1 &
BACKEND_PID=$!
deactivate
cd ..

# 5. ATUALIZAR FRONTEND
print_status "Atualizando Frontend..."
cd ~/mhia-web-app/frontend

# Instalar/atualizar dependências
print_status "Instalando dependências do frontend..."
npm install

# Build do frontend
print_status "Fazendo build do frontend..."
npm run build

# Iniciar frontend
print_status "Iniciando Frontend..."
nohup npm start > ~/mhia-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 6. AGUARDAR SERVIÇOS INICIAREM
print_status "Aguardando serviços iniciarem..."
sleep 5

# 7. VERIFICAR STATUS DOS SERVIÇOS
echo ""
echo "========================================"
echo "📊 STATUS DOS SERVIÇOS"
echo "========================================"

# Verificar Backend
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend rodando (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend falhou ao iniciar${NC}"
    echo "Verifique o log: tail -f ~/mhia-backend.log"
fi

# Verificar Frontend
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend rodando (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend falhou ao iniciar${NC}"
    echo "Verifique o log: tail -f ~/mhia-frontend.log"
fi

# Verificar Database
if sudo docker ps | grep -q mhia-postgres; then
    echo -e "${GREEN}✅ PostgreSQL rodando${NC}"
else
    echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
fi

# 8. INFORMAÇÕES DE ACESSO
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_EC2_IP")
echo ""
echo "========================================"
echo "🌐 ACESSO À APLICAÇÃO"
echo "========================================"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:8000"
echo "API Docs: http://$PUBLIC_IP:8000/docs"
echo ""
echo "========================================"
echo "📝 COMANDOS ÚTEIS"
echo "========================================"
echo "Ver logs do backend:  tail -f ~/mhia-backend.log"
echo "Ver logs do frontend: tail -f ~/mhia-frontend.log"
echo "Parar backend:        pkill -f uvicorn"
echo "Parar frontend:       pkill -f 'npm start'"
echo "Status dos processos: ps aux | grep -E 'uvicorn|npm'"
echo ""
echo "✨ Aplicação iniciada com sucesso! 🎉"