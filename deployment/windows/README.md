# MHIA Web App - Windows Deployment Guide

Complete deployment guide for Windows users to deploy MHIA Web Application to GitHub and AWS EC2.

## 🚀 Quick Start (Recommended)

**For complete guided setup:**
```cmd
cd deployment\windows
quick-start.bat
```

This interactive script will:
- Generate secure secrets
- Update configuration files  
- Create GitHub repository setup commands
- Generate AWS setup commands
- Provide step-by-step checklist

## 📋 Step-by-Step Process

### Step 1: Test Your Environment
```cmd
cd deployment\windows
test-local-setup.bat
```

This will check if you have all required tools:
- ✅ Node.js & npm
- ✅ Python 3.11+
- ✅ Git
- ✅ Docker Desktop
- ⚠️ AWS CLI (optional)

### Step 2: Generate Secure Secrets
```powershell
# Generate secrets (PowerShell)
cd deployment\windows
.\generate-secrets.ps1

# Or with batch file (uses simpler method)
generate-secrets.bat
```

### Step 3: Setup GitHub Repository
```cmd
cd deployment\windows
setup-github.bat
```

This will:
- Initialize Git repository
- Add remote origin
- Create initial commit
- Push to GitHub

### Step 4: Update Environment Files
```powershell
# Update .env files with generated secrets
.\update-env-files.ps1 -Domain "your-domain.com"

# Dry run first (recommended)
.\update-env-files.ps1 -WhatIf
```

## 🛠️ Available Scripts

### Batch Files (.bat) - Basic Operations
| Script | Purpose | Usage |
|--------|---------|-------|
| `quick-start.bat` | Complete interactive setup | Double-click or run in cmd |
| `setup-github.bat` | GitHub repository setup | Run in cmd |
| `test-local-setup.bat` | Test development environment | Run in cmd |

### PowerShell Scripts (.ps1) - Advanced Operations
| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-secrets.ps1` | Generate cryptographically secure secrets | `.\generate-secrets.ps1` |
| `update-env-files.ps1` | Update .env files with secrets | `.\update-env-files.ps1` |

## 📁 File Structure

```
deployment/windows/
├── quick-start.bat           # 🚀 Main deployment script
├── setup-github.bat          # 📝 GitHub repository setup
├── test-local-setup.bat      # 🧪 Environment testing
├── generate-secrets.ps1      # 🔐 Secure secret generation
├── update-env-files.ps1      # ⚙️  Environment file updates
└── README.md                 # 📚 This guide
```

## 🔧 Prerequisites

### Required Software
1. **Node.js 18+**: https://nodejs.org/
2. **Python 3.11+**: https://www.python.org/
3. **Git**: https://git-scm.com/download/win
4. **Docker Desktop**: https://www.docker.com/products/docker-desktop

### Optional Software
5. **AWS CLI**: https://aws.amazon.com/cli/ (for deployment)
6. **PowerShell 5.1+**: Usually included with Windows

### GitHub Account
- Account at: https://github.com
- Repository: `https://github.com/Xlonenzo/mhia-web-app`

### AWS Account
- AWS account with EC2 access
- IAM user with deployment permissions

## 🎯 Deployment Workflow

### 1. Local Setup ✅
```cmd
# Test environment
test-local-setup.bat

# If tests pass, proceed to next step
# If tests fail, install missing software
```

### 2. Generate Secrets 🔐
```cmd
# Quick method (batch)
quick-start.bat

# Or detailed method (PowerShell)
powershell .\generate-secrets.ps1
```

### 3. GitHub Setup 📝
```cmd
# Setup repository
setup-github.bat

# This will:
# - Initialize Git
# - Create repository
# - Push code to GitHub
```

### 4. Add GitHub Secrets 🔑
1. Go to: `https://github.com/Xlonenzo/mhia-web-app/settings/secrets/actions`
2. Add secrets from generated file:
   - `DB_PASSWORD`
   - `JWT_SECRET_KEY`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `EC2_INSTANCE_ID`
   - `EC2_PUBLIC_IP`
   - `API_URL`

### 5. AWS Infrastructure ☁️
```cmd
# Run generated AWS commands
aws-setup-commands.bat
```

### 6. EC2 Deployment 🚀
```bash
# SSH to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Download and run setup
curl -O https://raw.githubusercontent.com/Xlonenzo/mhia-web-app/main/deployment/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh

# Deploy application
cd /opt/mhia-app
git clone https://github.com/Xlonenzo/mhia-web-app.git .
cp .env.production .env
./deployment/scripts/deploy-app.sh --fresh
```

## 🔍 Troubleshooting

### PowerShell Execution Policy
If PowerShell scripts don't run:
```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Git Authentication
For GitHub authentication issues:
```cmd
# Use GitHub CLI (recommended)
winget install GitHub.cli
gh auth login

# Or configure Git with token
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Docker Issues
If Docker commands fail:
1. Start Docker Desktop
2. Check Docker is running: `docker --version`
3. Ensure virtualization is enabled in BIOS

### Path Issues
If commands not found:
1. Add to Windows PATH:
   - Node.js: Usually `C:\Program Files\nodejs`
   - Python: Usually `C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311`
   - Git: Usually `C:\Program Files\Git\bin`

## 🌐 URLs After Deployment

Once deployed, your application will be available at:

- **Frontend**: `https://your-domain.com` or `http://your-ec2-ip`
- **API**: `https://your-domain.com/api` or `http://your-ec2-ip:8000`
- **API Docs**: `https://your-domain.com/api/docs`
- **Health Check**: `https://your-domain.com/health`

## 📞 Support

### For Windows-specific issues:
1. Run `test-local-setup.bat` to diagnose environment
2. Check this README for common solutions
3. Ensure all prerequisites are installed

### For deployment issues:
1. Check GitHub Actions logs
2. Review AWS EC2 instance logs
3. Verify all secrets are correctly configured

### Getting Help:
- Create issue in GitHub repository
- Include output from `test-local-setup.bat`
- Specify Windows version and environment details

## 🔒 Security Notes

- ✅ Never commit `.env` files with real secrets
- ✅ Use strong, unique passwords generated by scripts
- ✅ Store secrets files securely
- ✅ Delete temporary secret files after deployment
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/staging/production

---

**Generated with [Claude Code](https://claude.ai/code)**

Need help? Start with `quick-start.bat` for guided setup! 🚀