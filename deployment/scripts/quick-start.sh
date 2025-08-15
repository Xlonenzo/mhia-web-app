#!/bin/bash

# MHIA Web App - Quick Start Deployment Script
# This script guides you through the complete deployment process

set -e

echo "========================================================"
echo "🚀 MHIA Web App - Complete Deployment Quick Start"
echo "========================================================"
echo ""

# Function to ask for user input
ask_user() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"${input:-$default}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

echo "Let's set up your MHIA application deployment!"
echo "This will help you:"
echo "1. 📝 Prepare your GitHub repository"
echo "2. 🔐 Generate secure secrets"
echo "3. ☁️  Set up AWS infrastructure"
echo "4. 🚀 Deploy your application"
echo ""

# Get user preferences
ask_user "What's your GitHub username" GITHUB_USER "Xlonenzo"
ask_user "Repository name" REPO_NAME "mhia-web-app"
ask_user "Your domain (or leave empty for IP-only deployment)" DOMAIN ""
ask_user "Your email for SSL certificates" EMAIL ""
ask_user "AWS region" AWS_REGION "us-east-1"

echo ""
echo "========================================================"
echo "📋 Deployment Summary"
echo "========================================================"
echo "GitHub: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "Domain: ${DOMAIN:-'Will use EC2 public IP'}"
echo "AWS Region: $AWS_REGION"
echo "Email: $EMAIL"
echo ""

read -p "Continue with these settings? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "========================================================"
echo "🔐 Step 1: Generating Secure Secrets"
echo "========================================================"

# Generate secrets
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))" 2>/dev/null || openssl rand -base64 64)
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)

echo "Generated secrets:"
echo "✓ JWT Secret Key: ${JWT_SECRET:0:20}..."
echo "✓ Database Password: ${DB_PASSWORD:0:15}..."
echo ""

# Save secrets
SECRETS_FILE="deployment-secrets-$(date +%Y%m%d_%H%M%S).txt"
cat > "$SECRETS_FILE" << EOF
# MHIA Web App Deployment Secrets - $(date)
# KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT

# Application Configuration
GITHUB_USER=$GITHUB_USER
REPO_NAME=$REPO_NAME
DOMAIN=$DOMAIN
EMAIL=$EMAIL
AWS_REGION=$AWS_REGION

# Generated Secrets
JWT_SECRET_KEY=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD

# AWS Secrets (fill these in manually)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# EC2 Information (fill after instance creation)
EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
EC2_PUBLIC_IP=x.x.x.x

# Application URLs
API_URL=https://$DOMAIN
EOF

echo "✓ Secrets saved to: $SECRETS_FILE"
echo ""

echo "========================================================"
echo "📝 Step 2: Prepare Repository"
echo "========================================================"

echo "Setting up Git repository..."

# Update repository URLs in deployment files
if [ -f "../.github/workflows/deploy.yml" ]; then
    sed -i "s/your-org/$GITHUB_USER/g" ../.github/workflows/deploy.yml
fi

# Update environment files
if [ -f "../../.env.production" ]; then
    sed -i "s/your_secure_password_here/$DB_PASSWORD/g" ../../.env.production
    sed -i "s/your_very_long_random_secret_key_here_change_this_in_production/$JWT_SECRET/g" ../../.env.production
    if [ -n "$DOMAIN" ]; then
        sed -i "s/https:\/\/your-domain.com/https:\/\/$DOMAIN/g" ../../.env.production
        sed -i "s/your-domain.com/$DOMAIN/g" ../../.env.production
    fi
fi

# Update deployment scripts
find . -name "*.sh" -exec sed -i "s/your-org/$GITHUB_USER/g" {} \;
find . -name "*.sh" -exec sed -i "s/mhia-web-app/$REPO_NAME/g" {} \;

echo "✓ Repository files updated"
echo ""

echo "========================================================"
echo "☁️  Step 3: AWS Setup Commands"
echo "========================================================"

echo "Run these AWS CLI commands to set up your infrastructure:"
echo ""

echo "# 1. Create IAM user for deployment"
cat << 'EOF'
aws iam create-user --user-name mhia-deployment
aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonECRFullAccess
aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-user-policy --user-name mhia-deployment --policy-arn arn:aws:iam::aws:policy/AmazonSSMFullAccess
aws iam create-access-key --user-name mhia-deployment
EOF
echo ""

echo "# 2. Create S3 bucket for backups"
echo "aws s3 mb s3://mhia-backups-$GITHUB_USER-$(date +%Y%m%d)"
echo ""

echo "# 3. Create ECR repositories"
cat << 'EOF'
aws ecr create-repository --repository-name mhia-backend
aws ecr create-repository --repository-name mhia-frontend
EOF
echo ""

echo "# 4. Create EC2 security group"
cat << 'EOF'
aws ec2 create-security-group --group-name mhia-web-app --description "MHIA Web Application Security Group"
aws ec2 authorize-security-group-ingress --group-name mhia-web-app --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name mhia-web-app --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name mhia-web-app --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name mhia-web-app --protocol tcp --port 3000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name mhia-web-app --protocol tcp --port 8000 --cidr 0.0.0.0/0
EOF
echo ""

echo "========================================================"
echo "📋 Next Steps Checklist"
echo "========================================================"

cat << EOF
Manual steps to complete:

□ 1. Create GitHub repository:
   - Go to https://github.com/$GITHUB_USER
   - Create new repository: $REPO_NAME
   - Don't initialize (we have existing code)

□ 2. Push code to GitHub:
   cd $(pwd)/../..
   git init
   git add .
   git commit -m "Initial commit: MHIA Web Application"
   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
   git branch -M main
   git push -u origin main

□ 3. Add GitHub secrets:
   - Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions
   - Add all secrets from: $SECRETS_FILE

□ 4. Run AWS commands above to create infrastructure

□ 5. Create EC2 instance:
   - Launch Ubuntu 22.04 LTS t3.medium
   - Use security group: mhia-web-app
   - Create/select key pair
   - Note the instance ID and public IP

□ 6. Update GitHub secrets with EC2 info:
   - EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
   - EC2_PUBLIC_IP=x.x.x.x

□ 7. SSH to EC2 and deploy:
   ssh -i your-key.pem ubuntu@your-ec2-ip
   curl -O https://raw.githubusercontent.com/$GITHUB_USER/$REPO_NAME/main/deployment/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh && ./setup-ec2.sh

□ 8. Deploy application:
   cd /opt/mhia-app
   git clone https://github.com/$GITHUB_USER/$REPO_NAME.git .
   git clone https://github.com/$GITHUB_USER/mhia-models.git ../modelos
   cp .env.production .env
   ./deployment/scripts/deploy-app.sh --fresh

EOF

if [ -n "$DOMAIN" ]; then
cat << EOF
□ 9. Configure domain and SSL:
   - Point $DOMAIN to your EC2 public IP
   - Run: ./deployment/scripts/ssl-setup.sh $DOMAIN $EMAIL

EOF
fi

cat << EOF
□ 10. Test deployment:
   - API: http://your-ec2-ip:8000/health
   - Frontend: http://your-ec2-ip:3000
EOF

if [ -n "$DOMAIN" ]; then
    echo "   - Production: https://$DOMAIN"
fi

echo ""
echo "========================================================"
echo "🎉 Setup Complete!"
echo "========================================================"
echo ""
echo "Your deployment configuration is ready!"
echo "Follow the checklist above to complete the deployment."
echo ""
echo "Important files created:"
echo "- 🔐 $SECRETS_FILE (keep secure, don't commit)"
echo "- 📝 Complete deployment guide in deployment/"
echo "- 🚀 All deployment scripts ready"
echo ""
echo "Need help? Check deployment/GITHUB_AWS_DEPLOYMENT_GUIDE.md"
echo ""