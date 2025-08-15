# Complete GitHub & AWS Deployment Guide for MHIA Web App

## Phase 1: GitHub Repository Setup

### Step 1: Create Repository on GitHub

1. **Go to GitHub:**
   - Visit https://github.com/Xlonenzo (your GitHub account)
   - Click "New repository" or the "+" icon

2. **Repository Settings:**
   ```
   Repository name: mhia-web-app
   Description: MHIA Hydrological Web Application
   Visibility: Private (recommended) or Public
   Initialize: Don't initialize (we have existing code)
   ```

3. **Create the repository**

### Step 2: Prepare Local Repository

1. **Navigate to your project:**
   ```bash
   cd C:\Users\User\Development\XLON\xlon_estudo_hidrido\mhia-web-app
   ```

2. **Initialize Git (if not already done):**
   ```bash
   git init
   git branch -M main
   ```

3. **Create .gitignore file:**
   ```bash
   # Create comprehensive .gitignore
   cat > .gitignore << 'EOF'
   # Environment variables
   .env
   .env.local
   .env.production.local
   *.env

   # Dependencies
   node_modules/
   __pycache__/
   *.pyc
   *.pyo
   *.pyd
   .Python
   env/
   venv/
   ENV/
   env.bak/
   venv.bak/

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~

   # OS
   .DS_Store
   Thumbs.db

   # Build outputs
   /frontend/.next/
   /frontend/out/
   /frontend/dist/
   /backend/dist/

   # Database
   *.db
   *.sqlite

   # Docker
   .docker/

   # Logs
   *.log
   logs/

   # Runtime data
   pids/
   *.pid
   *.seed
   *.pid.lock

   # Coverage directory used by tools like istanbul
   coverage/
   *.lcov

   # AWS
   .aws/

   # Temporary files
   temp/
   tmp/
   uploads/
   results/

   # Models (if they should be in separate repo)
   # ../modelos/
   EOF
   ```

4. **Add remote origin:**
   ```bash
   git remote add origin https://github.com/Xlonenzo/mhia-web-app.git
   ```

### Step 3: Secure Environment Variables

1. **Remove sensitive data from .env files:**
   ```bash
   # Backup current .env
   cp backend/.env backend/.env.backup
   
   # Create template .env
   cat > backend/.env.example << 'EOF'
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=your-secret-key-change-in-production
   ALLOWED_HOSTS=["http://localhost:3000"]
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   EOF
   ```

2. **Update .env.production with placeholders:**
   ```bash
   # Edit .env.production to ensure no real secrets
   sed -i 's/your_secure_password_here/CHANGE_THIS_PASSWORD/g' .env.production
   sed -i 's/your_very_long_random_secret_key_here_change_this_in_production/GENERATE_STRONG_JWT_SECRET/g' .env.production
   ```

### Step 4: Initial Commit and Push

1. **Add files to Git:**
   ```bash
   git add .
   git status  # Review what will be committed
   ```

2. **Commit changes:**
   ```bash
   git commit -m "Initial commit: MHIA Web Application with AWS deployment setup

   Features:
   - FastAPI backend with PostgreSQL and Redis
   - Next.js frontend with TypeScript
   - Docker deployment configuration
   - AWS EC2 deployment scripts and CI/CD
   - Nginx reverse proxy with SSL support
   - Automated backup and monitoring
   
   🤖 Generated with Claude Code"
   ```

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

## Phase 2: Models Repository Setup

### Step 1: Create Models Repository

1. **Create separate repository for models:**
   ```
   Repository name: mhia-models
   Description: MHIA Hydrological Models
   Visibility: Private
   ```

2. **Clone and setup models repo:**
   ```bash
   cd C:\Users\User\Development\XLON\xlon_estudo_hidrido
   git clone https://github.com/Xlonenzo/mhia-models.git
   cp -r modelos/* mhia-models/
   cd mhia-models
   git add .
   git commit -m "Initial commit: MHIA hydrological models"
   git push origin main
   ```

## Phase 3: Configure GitHub Secrets

### Step 1: Create AWS IAM User

1. **Go to AWS IAM Console:**
   - Create new user: `mhia-deployment`
   - Attach policies:
     - `AmazonEC2FullAccess`
     - `AmazonECRFullAccess`
     - `AmazonS3FullAccess`
     - `AmazonSSMFullAccess`

2. **Create access keys:**
   - Save `AWS_ACCESS_KEY_ID`
   - Save `AWS_SECRET_ACCESS_KEY`

### Step 2: Set GitHub Repository Secrets

1. **Go to your GitHub repository:**
   - Navigate to Settings → Secrets and variables → Actions

2. **Add the following secrets:**

   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   DB_PASSWORD=your_strong_database_password
   JWT_SECRET_KEY=your_64_character_random_string
   EC2_INSTANCE_ID=i-xxxxxxxxxxxxx (will add after EC2 creation)
   EC2_PUBLIC_IP=x.x.x.x (will add after EC2 creation)
   API_URL=https://your-domain.com or http://your-ec2-ip:8000
   SLACK_WEBHOOK=https://hooks.slack.com/services/... (optional)
   ```

   **Generate strong secrets:**
   ```bash
   # Generate JWT secret (64+ characters)
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   
   # Generate database password
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

## Phase 4: AWS Infrastructure Setup

### Step 1: Create EC2 Instance

1. **Launch EC2 instance via AWS Console or CLI:**
   ```bash
   # Using AWS CLI (optional)
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1f0 \
     --instance-type t3.medium \
     --key-name your-key-pair \
     --security-group-ids sg-xxxxxxxxx \
     --subnet-id subnet-xxxxxxxxx \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mhia-app-server}]'
   ```

2. **Manual AWS Console approach:**
   - Go to EC2 Dashboard
   - Launch Instance
   - Choose Ubuntu 22.04 LTS
   - Instance type: t3.medium or larger
   - Create/select key pair
   - Configure security group (ports 22, 80, 443, 3000, 8000)
   - Launch instance

### Step 2: Configure Security Group

**Inbound Rules:**
```
Type        Protocol    Port Range    Source
SSH         TCP         22            Your IP
HTTP        TCP         80            0.0.0.0/0
HTTPS       TCP         443           0.0.0.0/0
Custom TCP  TCP         3000          0.0.0.0/0 (for testing)
Custom TCP  TCP         8000          0.0.0.0/0 (for testing)
```

### Step 3: Create S3 Bucket (Optional)

```bash
# Create backup bucket
aws s3 mb s3://mhia-backups-unique-name-here

# Set lifecycle policy for cost optimization
aws s3api put-bucket-lifecycle-configuration \
  --bucket mhia-backups-unique-name-here \
  --lifecycle-configuration file://backup-lifecycle.json
```

### Step 4: Create ECR Repositories (for CI/CD)

```bash
# Create repositories for Docker images
aws ecr create-repository --repository-name mhia-backend
aws ecr create-repository --repository-name mhia-frontend
```

## Phase 5: Deploy to AWS EC2

### Step 1: Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 2: Run Initial Setup

1. **Download and run setup script:**
   ```bash
   # Download setup script
   curl -O https://raw.githubusercontent.com/Xlonenzo/mhia-web-app/main/deployment/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

2. **Logout and login** (to apply Docker permissions)

### Step 3: Deploy Application

1. **Clone repositories:**
   ```bash
   cd /opt
   sudo mkdir -p mhia-app
   sudo chown -R $USER:$USER mhia-app
   
   # Clone main app
   cd mhia-app
   git clone https://github.com/Xlonenzo/mhia-web-app.git .
   
   # Clone models (if separate repo)
   cd /opt
   git clone https://github.com/Xlonenzo/mhia-models.git modelos
   ```

2. **Configure environment:**
   ```bash
   cd /opt/mhia-app
   cp .env.production .env
   nano .env  # Edit with your actual values
   ```

   **Update these values:**
   ```env
   DB_PASSWORD=your_strong_database_password
   JWT_SECRET_KEY=your_64_character_random_string
   NEXT_PUBLIC_API_URL=https://your-domain.com
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   S3_BUCKET_NAME=mhia-backups-unique-name
   ```

3. **Deploy application:**
   ```bash
   chmod +x deployment/scripts/deploy-app.sh
   ./deployment/scripts/deploy-app.sh --fresh
   ```

### Step 4: Update GitHub Secrets

**Add the EC2 information to GitHub secrets:**
```
EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
EC2_PUBLIC_IP=x.x.x.x
API_URL=http://x.x.x.x:8000
```

## Phase 6: Domain and SSL Setup

### Step 1: Configure Domain (Optional)

1. **Point your domain to EC2:**
   - Create A record: `your-domain.com` → `your-ec2-ip`
   - Create A record: `api.your-domain.com` → `your-ec2-ip`

### Step 2: Setup SSL Certificate

```bash
# On EC2 instance
cd /opt/mhia-app
./deployment/scripts/ssl-setup.sh your-domain.com your-email@example.com
```

### Step 3: Update Configuration

```bash
# Update .env with HTTPS URL
sed -i 's/http:/https:/g' /opt/mhia-app/.env
docker-compose -f docker-compose.prod.yml restart
```

## Phase 7: Enable CI/CD Pipeline

### Step 1: Test GitHub Actions

1. **Make a small change to trigger deployment:**
   ```bash
   # On your local machine
   cd C:\Users\User\Development\XLON\xlon_estudo_hibrido\mhia-web-app
   
   # Make a small change
   echo "# Updated $(date)" >> README.md
   
   # Commit and push
   git add .
   git commit -m "Test CI/CD deployment pipeline"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to GitHub repository → Actions
   - Watch the deployment workflow
   - Check EC2 instance for updates

### Step 2: Setup Automated Backups

```bash
# On EC2 instance
crontab -e
# Add this line for daily backups at 2 AM
0 2 * * * /opt/mhia-app/deployment/scripts/backup.sh
```

## Phase 8: Testing and Monitoring

### Step 1: Application Testing

```bash
# Test all endpoints
curl http://your-ec2-ip/health
curl http://your-ec2-ip/api/v1/auth/
curl https://your-domain.com  # If SSL configured
```

### Step 2: Monitor Logs

```bash
# View application logs
cd /opt/mhia-app
docker-compose -f docker-compose.prod.yml logs -f

# Check specific services
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs postgres
```

### Step 3: Performance Monitoring

```bash
# System resources
htop
df -h
docker stats

# Application health
./backend/test_db_connection.py
./backend/test_api_health.py
```

## Phase 9: Maintenance Commands

### Regular Updates

```bash
# Update application (manual)
cd /opt/mhia-app
git pull origin main
./deployment/scripts/deploy-app.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service-name]

# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Backup and Restore

```bash
# Manual backup
./deployment/scripts/backup.sh

# Restore database
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d mhia_db < backup.sql
```

## Quick Commands Summary

### Initial Setup:
```bash
# 1. Local - Create and push to GitHub
git init && git add . && git commit -m "Initial commit" && git push -u origin main

# 2. AWS - Setup EC2
./setup-ec2.sh

# 3. AWS - Deploy app
./deploy-app.sh --fresh

# 4. AWS - Setup SSL (optional)
./ssl-setup.sh your-domain.com
```

### Daily Operations:
```bash
# View status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health
curl http://localhost/health
```

### Troubleshooting:
```bash
# Check system
df -h && free -h && docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Clean up
docker system prune -f
```

## Security Checklist

- [ ] Strong passwords for all services
- [ ] GitHub secrets properly configured
- [ ] AWS IAM permissions minimal
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Monitoring setup
- [ ] Log rotation configured

## Support

For issues:
1. Check GitHub Actions logs
2. Review application logs: `docker-compose logs`
3. Verify AWS resources in console
4. Check this guide for common solutions

Your MHIA application should now be fully deployed with CI/CD! 🚀