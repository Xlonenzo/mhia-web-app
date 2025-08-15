#!/usr/bin/env python3
"""
MHIA Web App - Environment Test Script
Tests if all required tools are installed for deployment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command):
    """Run a command and return success status and output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=5)
        return result.returncode == 0, result.stdout.strip()
    except Exception:
        return False, ""

def check_tool(name, command, url, required=True):
    """Check if a tool is installed"""
    success, output = run_command(command)
    
    if success:
        # Extract version from output
        version = output.split('\n')[0] if output else "unknown version"
        print(f"  [OK] {name}: {version}")
        return True
    else:
        if required:
            print(f"  [ERROR] {name}: NOT FOUND")
            print(f"          Install from: {url}")
        else:
            print(f"  [WARNING] {name}: NOT FOUND (optional)")
            print(f"            Install from: {url}")
        return False

def main():
    print("=" * 60)
    print("MHIA Web App - Environment Test")
    print("=" * 60)
    print()
    
    print("Testing required tools for deployment...")
    print()
    
    results = {}
    
    # Check Node.js
    print("1. Node.js (Frontend development):")
    results['node'] = check_tool(
        "Node.js", 
        "node --version",
        "https://nodejs.org/"
    )
    print()
    
    # Check npm
    print("2. npm (Package manager):")
    results['npm'] = check_tool(
        "npm",
        "npm --version",
        "https://nodejs.org/"
    )
    print()
    
    # Check Python
    print("3. Python (Backend development):")
    results['python'] = check_tool(
        "Python",
        "python --version",
        "https://www.python.org/"
    )
    print()
    
    # Check Git
    print("4. Git (Version control):")
    results['git'] = check_tool(
        "Git",
        "git --version",
        "https://git-scm.com/download/win"
    )
    print()
    
    # Check Docker
    print("5. Docker (Containerization):")
    results['docker'] = check_tool(
        "Docker",
        "docker --version",
        "https://www.docker.com/products/docker-desktop"
    )
    
    # Check if Docker is running
    if results['docker']:
        docker_running, _ = run_command("docker ps")
        if not docker_running:
            print("     [WARNING] Docker is installed but not running")
            print("               Please start Docker Desktop")
    print()
    
    # Check AWS CLI (optional)
    print("6. AWS CLI (Cloud deployment):")
    results['aws'] = check_tool(
        "AWS CLI",
        "aws --version",
        "https://aws.amazon.com/cli/",
        required=False
    )
    print()
    
    # Check project structure
    print("=" * 60)
    print("Project Structure Check")
    print("=" * 60)
    print()
    
    # Get project root (2 levels up from deployment/windows)
    project_root = Path(__file__).parent.parent.parent
    
    required_files = [
        ("backend/requirements.txt", "Backend configuration"),
        ("frontend/package.json", "Frontend configuration"),
        ("docker-compose.yml", "Docker development config"),
        (".github/workflows/deploy.yml", "CI/CD pipeline"),
    ]
    
    for file_path, description in required_files:
        full_path = project_root / file_path
        if full_path.exists():
            print(f"  [OK] {description}: {file_path}")
        else:
            print(f"  [WARNING] {description} missing: {file_path}")
    
    print()
    
    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print()
    
    required_tools = ['node', 'npm', 'python', 'git', 'docker']
    missing_required = [tool for tool in required_tools if not results.get(tool, False)]
    
    if not missing_required:
        print("SUCCESS! All required tools are installed.")
        print()
        print("You can now proceed with deployment:")
        print("1. Run: START-HERE-WINDOWS.bat")
        print("2. Or run: deployment\\windows\\quick-start.bat")
        return 0
    else:
        print("ERROR: Some required tools are missing:")
        for tool in missing_required:
            print(f"  - {tool}")
        print()
        print("Please install missing tools before proceeding.")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError during test: {e}")
        sys.exit(1)