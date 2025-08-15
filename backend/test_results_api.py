"""Test the results API endpoint"""
import sys
import os
import requests
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_results_api():
    """Test the results API with actual simulation ID"""
    
    # Login first to get a token
    login_data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    
    try:
        login_response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            return
            
        token = login_response.json()['access_token']
        print(f"Login successful, token: {token[:20]}...")
        
        # Test results endpoint with the completed simulation ID
        simulation_id = "aa3607e7-b905-41c0-9904-5f391fcf5799"
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        results_url = f'http://localhost:8000/api/v1/results/{simulation_id}'
        print(f"\nTesting results endpoint: {results_url}")
        
        results_response = requests.get(results_url, headers=headers)
        print(f"Status Code: {results_response.status_code}")
        
        if results_response.status_code == 200:
            results_data = results_response.json()
            print(f"Results retrieved successfully!")
            print(f"Number of result sets: {len(results_data)}")
            for result in results_data:
                print(f"  - {result['result_type']}: {len(result.get('data', {}))} data points")
        else:
            print(f"Results request failed: {results_response.status_code}")
            print(results_response.text)
            
        # Test summary endpoint
        summary_url = f'http://localhost:8000/api/v1/results/{simulation_id}/summary'
        print(f"\nTesting summary endpoint: {summary_url}")
        
        summary_response = requests.get(summary_url, headers=headers)
        print(f"Status Code: {summary_response.status_code}")
        
        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            print(f"Summary retrieved successfully!")
            print(f"Simulation: {summary_data.get('simulation_name')}")
            print(f"Status: {summary_data.get('status')}")
            print(f"Results available: {summary_data.get('results_available')}")
        else:
            print(f"Summary request failed: {summary_response.status_code}")
            print(summary_response.text)
        
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_results_api()