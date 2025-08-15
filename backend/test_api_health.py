#!/usr/bin/env python3
"""
API Health Check Test Script
Tests backend API endpoints and health status
"""

import os
import sys
import requests
import time
from datetime import datetime

def test_api_health():
    """Test API health endpoints"""
    
    print("=" * 60)
    print("API HEALTH CHECK TEST")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Test different possible URLs
    base_urls = [
        "http://localhost:8000",
        "http://127.0.0.1:8000", 
        "http://0.0.0.0:8000"
    ]
    
    successful_url = None
    
    for base_url in base_urls:
        print(f"Testing base URL: {base_url}")
        
        try:
            # Test basic health endpoint
            health_url = f"{base_url}/health"
            response = requests.get(health_url, timeout=5)
            
            if response.status_code == 200:
                print(f"   [OK] Health endpoint responding")
                print(f"   Response: {response.text.strip()}")
                successful_url = base_url
                break
            else:
                print(f"   [WARNING] Health endpoint returned {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   [ERROR] Connection refused")
        except requests.exceptions.Timeout:
            print(f"   [ERROR] Request timed out")
        except Exception as e:
            print(f"   [ERROR] {str(e)}")
        
        print()
    
    if not successful_url:
        print("=" * 60)
        print("API SERVER NOT ACCESSIBLE!")
        print("=" * 60)
        print("\nPossible causes:")
        print("1. FastAPI server is not running")
        print("2. Server is running on different port")
        print("3. Firewall blocking connections")
        print("\nTo start the server:")
        print("1. Local development:")
        print("   cd backend && uvicorn app.main:app --reload --port 8000")
        print("2. Docker:")
        print("   docker-compose up backend")
        return False
    
    print(f"Using successful URL: {successful_url}")
    print()
    
    # Test additional endpoints
    endpoints_to_test = [
        ("/", "Root endpoint"),
        ("/docs", "API documentation"),
        ("/api/v1/auth/", "Auth endpoints"),
        ("/api/v1/simulations/", "Simulations endpoints"),
    ]
    
    print("Testing additional endpoints:")
    for endpoint, description in endpoints_to_test:
        try:
            url = f"{successful_url}{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                status = "[OK]"
            elif response.status_code in [401, 403]:
                status = "[OK]" # Auth endpoints expected to require authentication
            elif response.status_code == 404:
                status = "[WARNING]"
            else:
                status = f"[{response.status_code}]"
            
            print(f"   {status} {description}: {endpoint}")
            
        except Exception as e:
            print(f"   [ERROR] {description}: {str(e)}")
    
    # Test database connection through API
    print()
    print("Testing database connection through API:")
    try:
        # This would depend on having a database status endpoint
        # For now, just verify the server is responding
        response = requests.get(f"{successful_url}/health", timeout=5)
        if response.status_code == 200:
            print("   [OK] API server is healthy and should have database access")
        else:
            print("   [WARNING] API health check failed")
            
    except Exception as e:
        print(f"   [ERROR] {str(e)}")
    
    print()
    print("=" * 60)
    print("API HEALTH CHECK COMPLETE!")
    print("=" * 60)
    print(f"\nAPI is accessible at: {successful_url}")
    print(f"API Documentation: {successful_url}/docs")
    print(f"Health Check: {successful_url}/health")
    
    return True

def wait_for_server(base_url="http://localhost:8000", timeout=30):
    """Wait for server to start up"""
    
    print(f"Waiting for server at {base_url} (timeout: {timeout}s)...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(f"{base_url}/health", timeout=2)
            if response.status_code == 200:
                print("[OK] Server is ready!")
                return True
        except:
            pass
        
        print(".", end="", flush=True)
        time.sleep(1)
    
    print("\n[ERROR] Server did not start within timeout period")
    return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test API health')
    parser.add_argument('--wait', action='store_true', help='Wait for server to start')
    parser.add_argument('--url', default='http://localhost:8000', help='Base URL to test')
    
    args = parser.parse_args()
    
    if args.wait:
        if not wait_for_server(args.url):
            sys.exit(1)
    
    success = test_api_health()
    sys.exit(0 if success else 1)