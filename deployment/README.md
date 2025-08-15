# MHIA Web App Deployment

Quick deployment of the MHIA Hydrological Web Application to AWS EC2 with GitHub CI/CD.

## 🚀 Quick Start

Run the interactive deployment setup:

```bash
cd deployment/scripts
./quick-start.sh
```

This will guide you through:
- 📝 Repository setup
- 🔐 Secret generation
- ☁️ AWS infrastructure
- 🚀 Application deployment

## 📚 Documentation

- **[Complete Deployment Guide](GITHUB_AWS_DEPLOYMENT_GUIDE.md)** - Detailed step-by-step instructions
- **[AWS EC2 Guide](AWS_DEPLOYMENT_GUIDE.md)** - AWS-specific deployment documentation

## 🛠️ Deployment Scripts

| Script | Purpose |
|--------|---------|
| `quick-start.sh` | Interactive deployment setup |
| `setup-ec2.sh` | Initial EC2 instance configuration |
| `deploy-app.sh` | Application deployment |
| `ssl-setup.sh` | SSL certificate configuration |
| `backup.sh` | Database and file backup |
| `update-github-secrets.sh` | Generate GitHub secrets |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production Docker configuration |
| `nginx/nginx.conf` | Nginx reverse proxy configuration |
| `.env.production` | Production environment template |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD pipeline |

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   GitHub Repo   │────│ GitHub Actions │────│   AWS EC2       │
│                 │    │     CI/CD      │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              │                        │                        │
                         ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
                         │ Frontend│              │ Backend │              │Database │
                         │(Next.js)│              │(FastAPI)│              │(Postgres│
                         └─────────┘              └─────────┘              └─────────┘
```

## 📋 Prerequisites

- AWS account with EC2 access
- GitHub repository (Xlonenzo/mhia-web-app)
- Domain name (optional)
- SSH key pair for EC2

## 🌐 URLs After Deployment

- **Frontend**: `https://your-domain.com` or `http://your-ec2-ip`
- **API**: `https://your-domain.com/api` or `http://your-ec2-ip:8000`
- **API Docs**: `https://your-domain.com/api/docs` or `http://your-ec2-ip:8000/docs`
- **Health Check**: `https://your-domain.com/health` or `http://your-ec2-ip:8000/health`

## 🔍 Monitoring

```bash
# Check application status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health
curl http://your-ec2-ip/health
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Deployment fails | Check GitHub Actions logs |
| Database connection error | Verify PostgreSQL container is running |
| SSL issues | Check domain DNS and certificate status |
| High memory usage | Run `docker system prune -f` |

## 📞 Support

For issues:
1. Check the deployment logs
2. Review the troubleshooting section in the guides
3. Create an issue in the GitHub repository

---

**Generated with [Claude Code](https://claude.ai/code)**