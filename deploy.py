#!/usr/bin/env python3
"""
MHIA Web App - Universal Deployment Script
Works on Windows, Linux, and macOS
"""

import os
import sys
import subprocess
import platform
import time
import shutil
from pathlib import Path

# ANSI color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_status(message, color=Colors.GREEN):
    """Print colored status message"""
    print(f"{color}[INFO]{Colors.RESET} {message}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}[ERROR]{Colors.RESET} {message}")

def print_warning(message):
    """Print warning message"""
    print(f"{Colors.YELLOW}[WARNING]{Colors.RESET} {message}")

def print_header(title):
    """Print section header"""
    print(f"\n{Colors.BOLD}{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}{Colors.RESET}\n")

def run_command(command, shell=True, capture_output=False, cwd=None):
    """Run shell command and handle errors"""
    try:
        if capture_output:
            result = subprocess.run(command, shell=shell, capture_output=True, text=True, cwd=cwd)
            return result.stdout.strip()
        else:
            subprocess.run(command, shell=shell, check=True, cwd=cwd)
            return True
    except subprocess.CalledProcessError as e:
        return False
    except Exception as e:
        print_error(f"Command failed: {e}")
        return False

def check_command_exists(command):
    """Check if a command exists in the system"""
    return shutil.which(command) is not None

def get_platform():
    """Get the current platform"""
    system = platform.system().lower()
    if system == 'windows':
        return 'windows'
    elif system == 'linux':
        return 'linux'
    elif system == 'darwin':
        return 'macos'
    else:
        return 'unknown'

def find_process(pattern):
    """Find if a process is running"""
    system = get_platform()
    if system == 'windows':
        cmd = f'tasklist | findstr /i "{pattern}"'
    else:
        cmd = f'pgrep -f "{pattern}"'
    
    result = run_command(cmd, capture_output=True)
    return bool(result)

def kill_process(pattern):
    """Kill a process by pattern"""
    system = get_platform()
    if system == 'windows':
        run_command(f'taskkill /F /IM {pattern}', capture_output=True)
    else:
        run_command(f'pkill -f "{pattern}"', capture_output=True)

class MHIADeployment:
    def __init__(self):
        self.platform = get_platform()
        self.project_root = Path.cwd()
        self.backend_dir = self.project_root / 'backend'
        self.frontend_dir = self.project_root / 'frontend'
        
    def install_dependencies(self):
        """Install system dependencies based on platform"""
        print_header("Installing Dependencies")
        
        if self.platform == 'linux':
            print_status("Updating system packages...")
            run_command("sudo apt update")
            
            print_status("Installing system dependencies...")
            run_command("sudo apt install -y git curl build-essential")
            
            # Install Docker
            if not check_command_exists('docker'):
                print_status("Installing Docker...")
                run_command("curl -fsSL https://get.docker.com | sudo sh")
                run_command("sudo usermod -aG docker $USER")
                run_command("sudo systemctl enable docker")
                run_command("sudo systemctl start docker")
            
            # Install Node.js
            if not check_command_exists('node'):
                print_status("Installing Node.js 18...")
                run_command("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
                run_command("sudo apt-get install -y nodejs")
            
            # Install Python 3.11
            if not check_command_exists('python3.11'):
                print_status("Installing Python 3.11...")
                run_command("sudo add-apt-repository -y ppa:deadsnakes/ppa")
                run_command("sudo apt update")
                run_command("sudo apt install -y python3.11 python3.11-venv python3.11-dev")
                
        elif self.platform == 'windows':
            print_status("Checking Docker Desktop...")
            if not check_command_exists('docker'):
                print_error("Please install Docker Desktop from https://www.docker.com/products/docker-desktop")
                return False
            
            print_status("Checking Node.js...")
            if not check_command_exists('node'):
                print_error("Please install Node.js from https://nodejs.org/")
                return False
            
            print_status("Checking Python...")
            if not check_command_exists('python'):
                print_error("Please install Python from https://www.python.org/")
                return False
        
        return True

    def setup_database(self):
        """Setup PostgreSQL database in Docker"""
        print_status("Setting up PostgreSQL database...")
        
        # Check if container exists
        check_cmd = "docker ps -a | grep mhia-postgres" if self.platform != 'windows' else 'docker ps -a | findstr mhia-postgres'
        if run_command(check_cmd, capture_output=True):
            print_status("PostgreSQL container exists, starting it...")
            run_command("docker start mhia-postgres")
        else:
            print_status("Creating PostgreSQL container...")
            docker_cmd = """docker run -d \
                --name mhia-postgres \
                --restart unless-stopped \
                -e POSTGRES_DB=mhia_db \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=password \
                -p 5432:5432 \
                -v mhia_postgres_data:/var/lib/postgresql/data \
                postgres:15"""
            
            if self.platform == 'windows':
                docker_cmd = docker_cmd.replace('\\', '^')
            
            run_command(docker_cmd)
        
        print_status("Waiting for database to start...")
        time.sleep(10)
        return True

    def setup_backend(self):
        """Setup backend application"""
        print_status("Setting up backend...")
        os.chdir(self.backend_dir)
        
        # Create virtual environment
        venv_path = self.backend_dir / 'venv'
        if not venv_path.exists():
            print_status("Creating virtual environment...")
            python_cmd = 'python3.11' if check_command_exists('python3.11') else 'python3' if check_command_exists('python3') else 'python'
            run_command(f"{python_cmd} -m venv venv")
        
        # Activate venv and install dependencies
        if self.platform == 'windows':
            activate_cmd = 'venv\\Scripts\\activate.bat && '
            pip_cmd = 'venv\\Scripts\\pip'
            python_cmd = 'venv\\Scripts\\python'
        else:
            activate_cmd = '. venv/bin/activate && '
            pip_cmd = 'venv/bin/pip'
            python_cmd = 'venv/bin/python'
        
        print_status("Installing backend dependencies...")
        run_command(f"{pip_cmd} install --upgrade pip setuptools wheel")
        run_command(f"{pip_cmd} install pydantic pydantic-settings")
        
        # Install requirements, but handle missing dependencies
        print_status("Installing requirements.txt dependencies...")
        if not run_command(f"{pip_cmd} install -r requirements.txt"):
            print_warning("Some packages from requirements.txt failed, installing core packages...")
            run_command(f"{pip_cmd} install fastapi uvicorn sqlalchemy alembic psycopg2-binary python-jose passlib python-multipart")
        
        # Create .env file if it doesn't exist
        env_file = self.backend_dir / '.env'
        if not env_file.exists():
            print_status("Creating .env file...")
            env_content = """DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development"""
            env_file.write_text(env_content)
        
        # Run migrations
        print_status("Running database migrations...")
        run_command(f"{python_cmd} -m alembic upgrade head")
        
        os.chdir(self.project_root)
        return True

    def setup_frontend(self):
        """Setup frontend application"""
        print_status("Setting up frontend...")
        os.chdir(self.frontend_dir)
        
        # Clean npm cache and remove platform-specific files on Linux
        if self.platform == 'linux':
            print_status("Cleaning npm for cross-platform compatibility...")
            run_command("rm -f package-lock.json", capture_output=True)
            run_command("rm -rf node_modules", capture_output=True)
            run_command("npm cache clean --force", capture_output=True)
        elif self.platform == 'windows':
            print_status("Cleaning npm cache...")
            run_command("if exist package-lock.json del package-lock.json", capture_output=True)
            run_command("if exist node_modules rmdir /s /q node_modules", capture_output=True)
        
        print_status("Installing frontend dependencies...")
        if not run_command("npm install"):
            print_warning("npm install failed, trying alternative approach...")
            run_command("npm install --legacy-peer-deps")
        
        print_status("Building frontend...")
        run_command("npm run build")
        
        os.chdir(self.project_root)
        return True

    def start_services(self):
        """Start all services"""
        print_header("Starting Services")
        
        # Update from git
        if Path('.git').exists():
            print_status("Pulling latest changes from git...")
            run_command("git pull origin main")
        
        # Start database
        print_status("Starting PostgreSQL...")
        run_command("docker start mhia-postgres")
        time.sleep(5)
        
        # Start backend
        print_status("Starting backend...")
        os.chdir(self.backend_dir)
        if self.platform == 'windows':
            cmd = 'start "MHIA Backend" cmd /k "venv\\Scripts\\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"'
            run_command(cmd)
        else:
            cmd = 'nohup venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > ~/backend.log 2>&1 &'
            run_command(cmd)
        os.chdir(self.project_root)
        
        # Start frontend
        print_status("Starting frontend...")
        os.chdir(self.frontend_dir)
        if self.platform == 'windows':
            cmd = 'start "MHIA Frontend" cmd /k "npm start"'
            run_command(cmd)
        else:
            cmd = 'nohup npm start > ~/frontend.log 2>&1 &'
            run_command(cmd)
        os.chdir(self.project_root)
        
        time.sleep(5)
        print_status("Services started successfully!")
        
        # Get IP address
        if self.platform == 'linux':
            ip = run_command("curl -s ifconfig.me", capture_output=True) or "localhost"
        else:
            ip = "localhost"
        
        print(f"\n{Colors.BOLD}Access URLs:{Colors.RESET}")
        print(f"  Frontend: http://{ip}:3000")
        print(f"  Backend:  http://{ip}:8000")
        print(f"  API Docs: http://{ip}:8000/docs")
        
        return True

    def stop_services(self):
        """Stop all services"""
        print_header("Stopping Services")
        
        print_status("Stopping backend...")
        if self.platform == 'windows':
            kill_process("python.exe")
        else:
            kill_process("uvicorn")
        
        print_status("Stopping frontend...")
        if self.platform == 'windows':
            kill_process("node.exe")
        else:
            kill_process("npm start")
        
        print_status("Services stopped!")
        return True

    def check_status(self):
        """Check status of all services"""
        print_header("Service Status")
        
        # Check backend
        if find_process("uvicorn"):
            print(f"{Colors.GREEN}✓{Colors.RESET} Backend is running")
        else:
            print(f"{Colors.RED}✗{Colors.RESET} Backend is not running")
        
        # Check frontend
        if find_process("npm"):
            print(f"{Colors.GREEN}✓{Colors.RESET} Frontend is running")
        else:
            print(f"{Colors.RED}✗{Colors.RESET} Frontend is not running")
        
        # Check database
        docker_check = "docker ps | grep mhia-postgres" if self.platform != 'windows' else 'docker ps | findstr mhia-postgres'
        if run_command(docker_check, capture_output=True):
            print(f"{Colors.GREEN}✓{Colors.RESET} PostgreSQL is running")
        else:
            print(f"{Colors.RED}✗{Colors.RESET} PostgreSQL is not running")
        
        return True

    def show_logs(self):
        """Show application logs"""
        print_header("Application Logs")
        
        if self.platform == 'windows':
            print_warning("Logs are shown in separate console windows on Windows")
        else:
            print_status("Backend logs (last 20 lines):")
            run_command("tail -20 ~/backend.log 2>/dev/null || echo 'No backend logs'")
            print("\n" + "="*50 + "\n")
            print_status("Frontend logs (last 20 lines):")
            run_command("tail -20 ~/frontend.log 2>/dev/null || echo 'No frontend logs'")
        
        return True

def main():
    """Main function"""
    print_header("MHIA Web App Deployment")
    
    # Parse command line arguments
    if len(sys.argv) < 2:
        command = 'help'
    else:
        command = sys.argv[1].lower()
    
    deployment = MHIADeployment()
    
    commands = {
        'install': lambda: (
            deployment.install_dependencies() and
            deployment.setup_database() and
            deployment.setup_backend() and
            deployment.setup_frontend()
        ),
        'start': deployment.start_services,
        'stop': deployment.stop_services,
        'restart': lambda: deployment.stop_services() and time.sleep(2) or deployment.start_services(),
        'status': deployment.check_status,
        'logs': deployment.show_logs,
    }
    
    if command in commands:
        success = commands[command]()
        if success:
            print(f"\n{Colors.GREEN}✓ Command '{command}' completed successfully!{Colors.RESET}")
        else:
            print(f"\n{Colors.RED}✗ Command '{command}' failed!{Colors.RESET}")
            sys.exit(1)
    else:
        print(f"Usage: python {sys.argv[0]} {{install|start|stop|restart|status|logs}}")
        print("\nCommands:")
        print("  install  - Install dependencies and setup application")
        print("  start    - Start all services (with git pull)")
        print("  stop     - Stop all services")
        print("  restart  - Restart all services")
        print("  status   - Check service status")
        print("  logs     - View application logs")
        sys.exit(1)

if __name__ == "__main__":
    main()