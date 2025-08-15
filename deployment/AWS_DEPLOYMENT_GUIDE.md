# AWS EC2 Deployment Guide for MHIA Web App

## Prerequisites

### AWS Resources Required
- EC2 instance (minimum t3.medium recommended)
- Security Group with ports 22, 80, 443, 3000, 8000 open
- Elastic IP (optional but recommended)
- S3 bucket for backups (optional)
- ECR repositories for Docker images (optional for CI/CD)
- RDS PostgreSQL instance (optional, for production)

### Local Requirements
- AWS CLI configured with appropriate credentials
- SSH key pair for EC2 access
- Git repository access

## Step 1: Launch EC2 Instance

1. **Launch an Ubuntu 22.04 LTS instance:**
   ```bash
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1f0 \
     --instance-type t3.medium \
     --key-name your-key-pair \
     --security-group-ids sg-xxxxxx \
     --subnet-id subnet-xxxxxx \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mhia-app-server}]'
   ```

2. **Attach Elastic IP (optional):**
   ```bash
   aws ec2 allocate-address --domain vpc
   aws ec2 associate-address --instance-id i-xxxxx --allocation-id eipalloc-xxxxx
   ```

## Step 2: Initial EC2 Setup

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. **Run the setup script:**
   ```bash
   # Download and run setup script
   curl -O https://raw.githubusercontent.com/your-org/mhia-web-app/main/deployment/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

## Step 3: Deploy Application

1. **Clone the repository:**
   ```bash
   cd /opt/mhia-app
   git clone https://github.com/your-org/mhia-web-app.git .
   ```

2. **Clone the models repository (required):**
   ```bash
   cd /opt
   git clone https://github.com/your-org/mhia-models.git modelos
   ```

3. **Configure environment variables:**
   ```bash
   cd /opt/mhia-app
   cp .env.production .env
   nano .env  # Edit with your specific values
   ```

   Key variables to update:
   - `DB_PASSWORD`: Strong database password
   - `JWT_SECRET_KEY`: Random 64+ character string
   - `NEXT_PUBLIC_API_URL`: Your domain or EC2 public IP
   - AWS credentials (if using S3)

4. **Run deployment script:**
   ```bash
   cd /opt/mhia-app/deployment/scripts
   chmod +x deploy-app.sh
   ./deploy-app.sh --fresh
   ```

## Step 4: Configure SSL (Optional but Recommended)

1. **Point your domain to EC2:**
   - Add an A record pointing to your EC2 Elastic IP

2. **Run SSL setup script:**
   ```bash
   cd /opt/mhia-app/deployment/scripts
   chmod +x ssl-setup.sh
   ./ssl-setup.sh your-domain.com your-email@example.com
   ```

## Step 5: Set Up Automated Backups

1. **Configure AWS credentials for S3:**
   ```bash
   aws configure
   ```

2. **Create S3 bucket for backups:**
   ```bash
   aws s3 mb s3://mhia-backups-your-unique-name
   ```

3. **Set up cron job for daily backups:**
   ```bash
   crontab -e
   # Add this line for daily backups at 2 AM
   0 2 * * * /opt/mhia-app/deployment/scripts/backup.sh
   ```

## Step 6: Configure CI/CD (Optional)

1. **Create ECR repositories:**
   ```bash
   aws ecr create-repository --repository-name mhia-backend
   aws ecr create-repository --repository-name mhia-frontend
   ```

2. **Set up GitHub secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `EC2_INSTANCE_ID`
   - `EC2_PUBLIC_IP`
   - `API_URL`
   - `SLACK_WEBHOOK` (optional)

3. **Enable GitHub Actions:**
   - Push to main branch will trigger automatic deployment

## Management Commands

### View logs:
```bash
cd /opt/mhia-app
docker-compose -f docker-compose.prod.yml logs -f [service-name]
```

### Restart services:
```bash
docker-compose -f docker-compose.prod.yml restart [service-name]
```

### Update application:
```bash
cd /opt/mhia-app
git pull origin main
./deployment/scripts/deploy-app.sh
```

### Database operations:
```bash
# Access PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d mhia_db

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres mhia_db > backup.sql
```

### Monitor resources:
```bash
# Check disk usage
df -h

# Check memory
free -h

# Check Docker resources
docker stats

# Check application health
curl http://localhost/health
```

## Troubleshooting

### Service won't start:
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Restart service
docker-compose -f docker-compose.prod.yml restart [service-name]

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build [service-name]
docker-compose -f docker-compose.prod.yml up -d [service-name]
```

### Database connection issues:
```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec backend python -c "from app.database import engine; print(engine.url)"
```

### High memory usage:
```bash
# Clear Docker cache
docker system prune -af

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### SSL certificate issues:
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Security Recommendations

1. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure fail2ban:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Set up monitoring:**
   - CloudWatch for AWS resources
   - Application monitoring with Prometheus/Grafana
   - Log aggregation with CloudWatch Logs

4. **Regular backups:**
   - Enable automated daily backups
   - Test restore procedures regularly
   - Keep backups in different regions

5. **Security scanning:**
   ```bash
   # Scan Docker images
   docker scan mhia-backend:latest
   docker scan mhia-frontend:latest
   ```

## Production Checklist

- [ ] Strong passwords for all services
- [ ] SSL certificates configured
- [ ] Firewall rules configured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Log rotation set up
- [ ] Resource limits configured
- [ ] Health checks verified
- [ ] CI/CD pipeline tested
- [ ] Security scanning enabled
- [ ] Documentation updated
- [ ] Team access configured

## Support

For issues or questions:
1. Check application logs
2. Review this documentation
3. Contact the development team
4. Create an issue in the GitHub repository