# MHIA Web App - Generate Secure Secrets (PowerShell)
# This script generates secure secrets for deployment

param(
    [string]$OutputFile = "deployment-secrets.txt",
    [switch]$ShowSecrets = $false
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔐 MHIA Secure Secrets Generator" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host

# Function to generate secure password
function New-SecurePassword {
    param([int]$Length = 32)
    
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?"
    $password = ""
    $random = New-Object System.Random
    
    for ($i = 0; $i -lt $Length; $i++) {
        $password += $chars[$random.Next(0, $chars.Length)]
    }
    
    return $password
}

# Function to generate URL-safe token
function New-SecureToken {
    param([int]$Length = 64)
    
    $bytes = New-Object byte[] ($Length * 3/4)
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes) -replace '\+', '-' -replace '/', '_' -replace '=', ''
}

Write-Host "Generating secure secrets..." -ForegroundColor Yellow

# Generate secrets
$JWTSecret = New-SecureToken -Length 64
$DBPassword = New-SecurePassword -Length 32
$APIKey = New-SecureToken -Length 48

# Get timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Display summary
Write-Host "✓ JWT Secret Key generated (64 chars)" -ForegroundColor Green
Write-Host "✓ Database Password generated (32 chars)" -ForegroundColor Green  
Write-Host "✓ API Key generated (48 chars)" -ForegroundColor Green
Write-Host

if ($ShowSecrets) {
    Write-Host "Generated Secrets:" -ForegroundColor Yellow
    Write-Host "JWT_SECRET_KEY: $JWTSecret" -ForegroundColor White
    Write-Host "DB_PASSWORD: $DBPassword" -ForegroundColor White
    Write-Host "API_KEY: $APIKey" -ForegroundColor White
    Write-Host
} else {
    Write-Host "Secrets generated (use -ShowSecrets to display)" -ForegroundColor Yellow
    Write-Host "JWT Secret: $($JWTSecret.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "DB Password: $($DBPassword.Substring(0,15))..." -ForegroundColor Gray
    Write-Host
}

# Create secrets file content
$secretsContent = @"
# MHIA Web App Deployment Secrets
# Generated on: $timestamp
# KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT

# ========================================
# GitHub Repository Secrets
# Add these to: https://github.com/USERNAME/REPO/settings/secrets/actions
# ========================================

# Database Configuration
DB_PASSWORD=$DBPassword

# JWT Configuration (64+ characters required)
JWT_SECRET_KEY=$JWTSecret

# API Configuration
API_KEY=$APIKey

# AWS Configuration (fill in manually after creating IAM user)
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# EC2 Configuration (fill in after creating instance)
EC2_INSTANCE_ID=i-xxxxxxxxxxxxx
EC2_PUBLIC_IP=x.x.x.x

# Application URLs (update with your domain or EC2 IP)
API_URL=https://your-domain.com
# OR for IP-based deployment:
# API_URL=http://your-ec2-ip:8000

# Optional Integrations
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# ========================================
# Environment Variables (.env files)
# ========================================

# For .env.production:
DATABASE_URL=postgresql://postgres:$DBPassword@postgres:5432/mhia_db
REDIS_URL=redis://redis:6379
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# ========================================
# Security Notes
# ========================================
# 1. These secrets are randomly generated and cryptographically secure
# 2. Never commit this file to version control
# 3. Store securely and delete after use if needed
# 4. Rotate secrets periodically in production
# 5. Use different secrets for different environments (dev/staging/prod)

"@

# Save to file
$secretsContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "💾 Secrets saved to: $OutputFile" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. 🔐 Add secrets to GitHub repository:" -ForegroundColor White
Write-Host "   - Go to your GitHub repository settings" -ForegroundColor Gray
Write-Host "   - Navigate to Secrets and variables > Actions" -ForegroundColor Gray
Write-Host "   - Add each secret with the name and value from the file" -ForegroundColor Gray
Write-Host

Write-Host "2. ⚙️  Update .env.production:" -ForegroundColor White
Write-Host "   - Copy values from the generated file" -ForegroundColor Gray
Write-Host "   - Update your .env.production file with the new secrets" -ForegroundColor Gray
Write-Host

Write-Host "3. ☁️  Create AWS resources:" -ForegroundColor White
Write-Host "   - Create IAM user and get access keys" -ForegroundColor Gray
Write-Host "   - Create EC2 instance and note ID and IP" -ForegroundColor Gray
Write-Host "   - Update the secrets file with actual AWS values" -ForegroundColor Gray
Write-Host

Write-Host "4. 🔒 Secure this file:" -ForegroundColor White
Write-Host "   - Store in a secure location" -ForegroundColor Gray
Write-Host "   - Do not commit to Git" -ForegroundColor Gray
Write-Host "   - Consider deleting after deployment" -ForegroundColor Gray
Write-Host

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Security reminder: These secrets provide access to your application!" -ForegroundColor Red
Write-Host "Treat them with the same care as passwords and API keys." -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Cyan