#!/bin/bash

# Script to help generate and update GitHub secrets

echo "========================================="
echo "GitHub Secrets Generator for MHIA App"
echo "========================================="
echo ""

# Function to generate secure passwords
generate_password() {
    local length=${1:-32}
    python3 -c "import secrets; print(secrets.token_urlsafe($length))"
}

echo "Generating secure secrets for your deployment:"
echo ""

echo "1. JWT_SECRET_KEY (64 characters):"
JWT_SECRET=$(generate_password 64)
echo "   $JWT_SECRET"
echo ""

echo "2. DB_PASSWORD (32 characters):"
DB_PASSWORD=$(generate_password 32)
echo "   $DB_PASSWORD"
echo ""

echo "3. Additional secrets to configure manually:"
echo "   - AWS_ACCESS_KEY_ID=your_aws_access_key_id"
echo "   - AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key"
echo "   - EC2_INSTANCE_ID=i-xxxxxxxxxxxxx (after EC2 creation)"
echo "   - EC2_PUBLIC_IP=x.x.x.x (after EC2 creation)"
echo "   - API_URL=https://your-domain.com or http://x.x.x.x:8000"
echo ""

echo "========================================="
echo "GitHub Repository Secrets Setup"
echo "========================================="
echo ""
echo "To add these secrets to your GitHub repository:"
echo ""
echo "1. Go to: https://github.com/Xlonenzo/mhia-web-app/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret with the name and value shown above"
echo ""
echo "Required secrets for deployment:"
echo "├── AWS_ACCESS_KEY_ID"
echo "├── AWS_SECRET_ACCESS_KEY" 
echo "├── DB_PASSWORD"
echo "├── JWT_SECRET_KEY"
echo "├── EC2_INSTANCE_ID (add after EC2 creation)"
echo "├── EC2_PUBLIC_IP (add after EC2 creation)"
echo "├── API_URL (add after deployment)"
echo "└── SLACK_WEBHOOK (optional)"
echo ""

# Save to file for reference
SECRETS_FILE="github-secrets-$(date +%Y%m%d_%H%M%S).txt"
cat > "$SECRETS_FILE" << EOF
# GitHub Secrets for MHIA Web App Deployment
# Generated on $(date)

# Database Configuration
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration  
JWT_SECRET_KEY=$JWT_SECRET

# AWS Configuration (fill in manually)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# EC2 Configuration (add after instance creation)
EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
EC2_PUBLIC_IP=x.x.x.x

# Application Configuration
API_URL=https://your-domain.com

# Optional
SLACK_WEBHOOK=https://hooks.slack.com/services/...

EOF

echo "Secrets saved to: $SECRETS_FILE"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   - Never commit this file to Git"
echo "   - Store it securely or delete after use"
echo "   - These secrets are for production use only"
echo ""
echo "Next steps:"
echo "1. Add secrets to GitHub repository"
echo "2. Create AWS resources (EC2, IAM user, etc.)"
echo "3. Update EC2_INSTANCE_ID and EC2_PUBLIC_IP secrets"
echo "4. Test the deployment pipeline"