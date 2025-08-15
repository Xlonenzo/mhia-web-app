# MHIA Web App - AWS EC2 Deployment Script (PowerShell)
# Handles deployment to remote AWS EC2 instance

param(
    [string]$EC2_IP = "",
    [string]$KeyPath = "scripts\xlon-diego.pem",
    [string]$Action = ""
)

# Colors for output
$Host.UI.RawUI.WindowTitle = "MHIA - AWS Deployment"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Clear-Host
Write-Host @"

 ███╗   ███╗██╗  ██╗██╗ █████╗     ╔═╗╦ ╦╔═╗  ╔╦╗╔═╗╔═╗╦  ╔═╗╦ ╦
 ████╗ ████║██║  ██║██║██╔══██╗    ╠═╣║║║╚═╗   ║║║╣ ╠═╝║  ║ ║╚╦╝
 ██╔████╔██║███████║██║███████║    ╩ ╩╚╩╝╚═╝  ═╩╝╚═╝╩  ╩═╝╚═╝ ╩ 
 ██║╚██╔╝██║██╔══██║██║██╔══██║    
 ██║ ╚═╝ ██║██║  ██║██║██║  ██║    AWS EC2 Deployment Tool
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝    

================================================================
                   PowerShell AWS Deployment
================================================================

"@ -ForegroundColor Cyan

# Check if SSH key exists
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH key file not found: $KeyPath"
    Write-Host "Please ensure your SSH key is in the scripts directory"
    Read-Host "Press Enter to exit"
    exit 1
}

# Get EC2 IP if not provided
if (-not $EC2_IP) {
    $EC2_IP = Read-Host "Enter your EC2 instance IP address"
    if (-not $EC2_IP) {
        Write-Error "EC2 IP address is required"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

function Show-Menu {
    Write-Host @"
================================================================
Choose deployment option:
================================================================

  [1] Fresh deployment (clean install)
  [2] Update deployment (git pull + restart)
  [3] Deploy local changes (upload + restart)
  [4] Just connect to server (SSH)
  [5] View server logs
  [6] Restart services only
  [7] Docker deployment (Frontend + Backend + PostgreSQL)
  [8] Test connection
  [9] Exit

================================================================
"@ -ForegroundColor White
}

function Fresh-Deploy {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   FRESH DEPLOYMENT" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will:"
    Write-Host "1. Connect to your EC2 instance"
    Write-Host "2. Install all dependencies"
    Write-Host "3. Clone the repository"
    Write-Host "4. Run the full setup script"
    Write-Host ""
    
    $confirm = Read-Host "Continue with fresh deployment? (y/n)"
    if ($confirm -ne "y") { return }

    Write-Status "Connecting to EC2 instance..."
    Write-Status "Running fresh deployment..."

    $sshCommand = @"
set -e
echo '[INFO] Updating system...'
sudo apt update

echo '[INFO] Installing git if not present...'
sudo apt install -y git

echo '[INFO] Removing old installation if exists...'
rm -rf mhia-web-app

echo '[INFO] Cloning repository...'
git clone https://github.com/Xlonenzo/mhia-web-app.git
cd mhia-web-app

echo '[INFO] Making setup script executable...'
chmod +x scripts/setup-production-ubuntu-fixed.sh

echo '[INFO] Running production setup...'
./scripts/setup-production-ubuntu-fixed.sh

echo '[SUCCESS] Fresh deployment completed!'
echo 'Your app should be available at: http://$EC2_IP'
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand

    Write-Success "Fresh deployment completed!"
    Write-Host "Your app should be available at: http://$EC2_IP" -ForegroundColor Green
}

function Update-Deploy {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   UPDATE DEPLOYMENT" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    Write-Status "Updating deployment..."

    $sshCommand = @"
set -e
cd mhia-web-app || {
    echo '[ERROR] Application directory not found. Run fresh deployment first.'
    exit 1
}

echo '[INFO] Pulling latest changes...'
git pull origin main

echo '[INFO] Updating backend dependencies...'
cd backend
source venv/bin/activate
pip install -r requirements.txt

echo '[INFO] Running database migrations...'
alembic upgrade head || echo '[WARNING] Migration failed or not needed'
deactivate
cd ..

echo '[INFO] Updating frontend...'
cd frontend
npm install
npm run build
cd ..

echo '[INFO] Restarting services...'
sudo supervisorctl restart all
sudo systemctl restart nginx

echo '[INFO] Checking service status...'
sudo supervisorctl status

echo '[SUCCESS] Update deployment completed!'
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand
    Write-Success "Update deployment completed!"
}

function Deploy-Local {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   DEPLOY LOCAL CHANGES" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will:"
    Write-Host "1. Create a local archive of your project"
    Write-Host "2. Upload it to the EC2 instance"
    Write-Host "3. Extract and restart services"
    Write-Host ""
    Write-Warning "This will overwrite remote changes!"
    Write-Host ""
    
    $confirm = Read-Host "Continue with local deployment? (y/n)"
    if ($confirm -ne "y") { return }

    Write-Status "Creating local archive..."
    
    # Create temporary directory
    $tempDir = "temp_upload"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir

    # Copy important directories
    Write-Status "Copying files..."
    Copy-Item "backend" "$tempDir\backend" -Recurse -Force
    Copy-Item "frontend" "$tempDir\frontend" -Recurse -Force
    Copy-Item "scripts" "$tempDir\scripts" -Recurse -Force
    
    # Copy important files
    Get-ChildItem -Filter "*.md" | Copy-Item -Destination $tempDir -Force
    Get-ChildItem -Filter "*.yml" | Copy-Item -Destination $tempDir -Force
    Get-ChildItem -Filter "*.json" | Copy-Item -Destination $tempDir -Force

    # Create archive
    Write-Status "Creating archive..."
    $archivePath = "mhia-local.tar.gz"
    tar -czf $archivePath -C $tempDir .

    Write-Status "Uploading to EC2..."
    scp -i $KeyPath $archivePath ubuntu@${EC2_IP}:~/

    Write-Status "Deploying on remote server..."
    
    $sshCommand = @"
set -e
echo '[INFO] Backing up current deployment...'
cp -r mhia-web-app mhia-web-app-backup-`$(date +%Y%m%d-%H%M%S) || echo '[WARNING] No existing deployment to backup'

echo '[INFO] Extracting new files...'
rm -rf mhia-web-app-new
mkdir mhia-web-app-new
tar -xzf mhia-local.tar.gz -C mhia-web-app-new

echo '[INFO] Stopping services...'
sudo supervisorctl stop all || echo '[WARNING] Services may not be running'

echo '[INFO] Moving new files...'
rm -rf mhia-web-app
mv mhia-web-app-new mhia-web-app
cd mhia-web-app

echo '[INFO] Setting up backend...'
cd backend
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo '[INFO] Building frontend...'
cd frontend
npm install
npm run build
cd ..

echo '[INFO] Starting services...'
sudo supervisorctl start all
sudo systemctl restart nginx

echo '[INFO] Checking status...'
sudo supervisorctl status

echo '[SUCCESS] Local deployment completed!'
rm ~/mhia-local.tar.gz
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand

    # Cleanup
    Remove-Item $archivePath -Force
    Remove-Item $tempDir -Recurse -Force

    Write-Success "Local deployment completed!"
}

function Connect-SSH {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   SSH CONNECTION" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    Write-Status "Connecting to EC2 instance..."
    Write-Host "Use 'exit' to close the SSH connection" -ForegroundColor Yellow
    
    ssh -i $KeyPath ubuntu@$EC2_IP
    
    Write-Status "SSH connection closed"
}

function View-Logs {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   VIEW SERVER LOGS" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    $sshCommand = @"
echo '=== Service Status ==='
sudo supervisorctl status
echo
echo '=== Backend Logs (last 20 lines) ==='
tail -20 /var/log/mhia/backend.out.log 2>/dev/null || echo 'Backend log not found'
echo
echo '=== Frontend Logs (last 20 lines) ==='
tail -20 /var/log/mhia/frontend.out.log 2>/dev/null || echo 'Frontend log not found'
echo
echo '=== Nginx Error Logs (last 10 lines) ==='
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo 'Nginx error log not found'
echo
echo '=== System Info ==='
df -h | head -5
free -h
echo 'Public IP:' `$(curl -s ifconfig.me)
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand
}

function Restart-Services {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   RESTART SERVICES" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    Write-Status "Restarting services on remote server..."

    $sshCommand = @"
echo '[INFO] Restarting backend and frontend...'
sudo supervisorctl restart all

echo '[INFO] Restarting nginx...'
sudo systemctl restart nginx

echo '[INFO] Checking service status...'
sudo supervisorctl status
sudo systemctl status nginx --no-pager -l

echo '[SUCCESS] Services restarted!'
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand
    Write-Success "Services restarted!"
}

function Docker-Deploy {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   DOCKER DEPLOYMENT" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will deploy your application using Docker containers:"
    Write-Host "- PostgreSQL database in Docker"
    Write-Host "- Redis cache in Docker" 
    Write-Host "- Backend API in Docker"
    Write-Host "- Frontend in Docker"
    Write-Host "- Nginx reverse proxy in Docker"
    Write-Host ""
    
    $confirm = Read-Host "Continue with Docker deployment? (y/n)"
    if ($confirm -ne "y") { return }

    Write-Status "Starting Docker deployment..."

    # Upload the Docker deployment script
    Write-Status "Uploading Docker deployment script..."
    scp -i $KeyPath scripts/deploy-to-aws-docker.sh ubuntu@${EC2_IP}:~/

    # Execute the Docker deployment
    Write-Status "Executing Docker deployment on remote server..."
    
    $sshCommand = @"
chmod +x ~/deploy-to-aws-docker.sh
~/deploy-to-aws-docker.sh
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand
    Write-Success "Docker deployment completed!"
    
    Write-Host ""
    Write-Host "🐳 Your application is now running in Docker containers!" -ForegroundColor Green
    Write-Host "🌐 Access your app at: http://$EC2_IP" -ForegroundColor Cyan
    Write-Host "📚 API documentation: http://$EC2_IP:8000/docs" -ForegroundColor Cyan
}

function Test-Connection {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                   TEST CONNECTION" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    Write-Status "Testing SSH connection..."
    
    $sshCommand = @"
echo 'Connection successful!'
echo 'Server info:'
uname -a
echo 'Current user:' `$(whoami)
echo 'Current directory:' `$(pwd)
echo 'Public IP:' `$(curl -s ifconfig.me)
ls -la
"@

    ssh -i $KeyPath ubuntu@$EC2_IP $sshCommand
    Write-Success "Connection test completed!"
}

# Main menu loop
do {
    if (-not $Action) {
        Show-Menu
        $choice = Read-Host "Enter your choice (1-8)"
    } else {
        $choice = $Action
        $Action = "" # Only run once
    }

    switch ($choice) {
        "1" { Fresh-Deploy }
        "2" { Update-Deploy }
        "3" { Deploy-Local }
        "4" { Connect-SSH }
        "5" { View-Logs }
        "6" { Restart-Services }
        "7" { Docker-Deploy }
        "8" { Test-Connection }
        "9" { 
            Write-Host "Goodbye!" -ForegroundColor Green
            exit 0
        }
        default { 
            Write-Warning "Invalid choice. Please try again."
            Start-Sleep -Seconds 2
        }
    }
    
    if ($choice -ne "4" -and $choice -ne "9") {
        Read-Host "`nPress Enter to continue"
    }
} while ($choice -ne "9")