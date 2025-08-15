# 🚀 MHIA Web App - Complete Deployment Guide

Deploy your MHIA Hydrological Web Application to GitHub and AWS EC2 with automated CI/CD.

## 🎯 Quick Start for Windows Users

**Double-click to start:** `START-HERE-WINDOWS.bat`

This launcher will help you:
1. 🧪 Test your environment
2. 🚀 Complete guided setup  
3. 📝 Setup GitHub repository
4. 🔐 Generate secure secrets
5. 📚 Access documentation

## 📋 What You'll Get

### 🏗️ Complete Infrastructure
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: FastAPI with PostgreSQL & Redis
- **Deployment**: Docker containers on AWS EC2
- **CI/CD**: GitHub Actions automated deployment
- **Security**: SSL certificates with Nginx reverse proxy
- **Monitoring**: Health checks and automated backups

### 🌐 Production URLs
After deployment, your app will be available at:
- **Main App**: `https://your-domain.com`
- **API**: `https://your-domain.com/api`
- **API Docs**: `https://your-domain.com/api/docs`
- **Health**: `https://your-domain.com/health`

## 📁 Repository Structure

```
mhia-web-app/
├── 🚀 START-HERE-WINDOWS.bat     # Windows deployment launcher
├── 📚 DEPLOYMENT-README.md        # This guide
├── backend/                       # FastAPI backend
├── frontend/                      # Next.js frontend
├── deployment/
│   ├── 🐧 scripts/               # Linux/Mac scripts (.sh)
│   ├── 🪟 windows/               # Windows scripts (.bat, .ps1)
│   ├── 📋 GITHUB_AWS_DEPLOYMENT_GUIDE.md
│   ├── 📋 AWS_DEPLOYMENT_GUIDE.md
│   └── 📋 README.md
├── docker-compose.yml            # Development
├── docker-compose.prod.yml       # Production
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

## 🛠️ Platform-Specific Guides

### Windows Users 🪟
**Start here:** `START-HERE-WINDOWS.bat`
- Complete Windows-native scripts
- Batch files (.bat) for basic operations
- PowerShell scripts (.ps1) for advanced operations
- GUI-friendly with interactive prompts

### Linux/Mac Users 🐧🍎
**Start here:** `deployment/scripts/quick-start.sh`
- Bash scripts for all operations
- Unix-style command-line tools
- Compatible with WSL on Windows

## 🎬 Deployment Process

### Phase 1: Local Setup ✅
1. Test your environment
2. Generate secure secrets
3. Update configuration files

### Phase 2: GitHub Setup 📝
1. Create repository: `github.com/Xlonenzo/mhia-web-app`
2. Push code to GitHub
3. Add repository secrets

### Phase 3: AWS Infrastructure ☁️
1. Create IAM user
2. Launch EC2 instance
3. Setup security groups
4. Create S3 bucket (optional)

### Phase 4: Deployment 🚀
1. SSH to EC2 instance
2. Run setup scripts
3. Deploy application
4. Configure SSL (optional)

### Phase 5: CI/CD Pipeline 🔄
1. Automatic deployments on code push
2. Health checks and monitoring
3. Automated backups

## 🔧 Prerequisites

### Required Software
- ✅ **Node.js 18+**: Frontend development
- ✅ **Python 3.11+**: Backend development  
- ✅ **Git**: Version control
- ✅ **Docker Desktop**: Containerization

### Required Accounts
- ✅ **GitHub**: Code repository and CI/CD
- ✅ **AWS**: Cloud infrastructure and EC2

### Optional but Recommended
- ⚠️ **Domain name**: For production SSL
- ⚠️ **AWS CLI**: For infrastructure management

## 🔐 Security Features

- 🔑 Cryptographically secure secret generation
- 🛡️ Environment-specific configurations
- 🔒 SSL/TLS encryption with auto-renewal
- 🚫 No secrets committed to Git
- 🔄 Automated security updates

## 📊 Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Developer     │────│    GitHub    │────│   AWS EC2       │
│   (Windows)     │    │   Actions    │    │   (Ubuntu)      │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              │                        │                        │
                         ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
                         │Frontend │              │Backend  │              │Database │
                         │Next.js  │◄─────────────►│FastAPI  │◄─────────────►│Postgres│
                         │:3000    │              │:8000    │              │:5432    │
                         └─────────┘              └─────────┘              └─────────┘
                              │                        │                        │
                         ┌────▼────────────────────────▼────────────────────────▼────┐
                         │                 Nginx Reverse Proxy                       │
                         │                   :80 / :443                             │
                         └───────────────────────────────────────────────────────────┘
```

## 🎯 Success Metrics

After successful deployment, you should have:

- ✅ **GitHub repository** with your code
- ✅ **CI/CD pipeline** that deploys automatically
- ✅ **Production application** running on AWS
- ✅ **SSL certificate** for secure access
- ✅ **Automated backups** to S3
- ✅ **Health monitoring** and logging
- ✅ **Domain name** pointing to your app

## 🆘 Need Help?

### Quick Troubleshooting
1. **Environment issues**: Run test scripts first
2. **GitHub issues**: Check repository settings and secrets
3. **AWS issues**: Verify IAM permissions and EC2 status
4. **SSL issues**: Check domain DNS settings

### Documentation
- 📖 **Windows Guide**: `deployment/windows/README.md`
- 📖 **Complete Guide**: `deployment/GITHUB_AWS_DEPLOYMENT_GUIDE.md`
- 📖 **AWS Specific**: `deployment/AWS_DEPLOYMENT_GUIDE.md`

### Getting Support
1. Check the relevant documentation
2. Review logs and error messages
3. Create an issue in the GitHub repository
4. Include environment details and error output

## 🎉 Ready to Deploy?

### For Windows Users:
```cmd
# Double-click or run:
START-HERE-WINDOWS.bat
```

### For Linux/Mac Users:
```bash
cd deployment/scripts
./quick-start.sh
```

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

Your MHIA application will be production-ready with enterprise-grade deployment! 🌟