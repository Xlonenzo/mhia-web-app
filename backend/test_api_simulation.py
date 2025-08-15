"""Test simulation creation via API endpoint"""
import requests
import json

# Test the API endpoint for creating simulation
login_data = {'username': 'testuser', 'password': 'testpass123'}

try:
    # Login first
    login_response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
    if login_response.status_code != 200:
        print(f'Login failed: {login_response.status_code}')
        exit(1)
        
    token = login_response.json()['access_token']
    print(f'Login successful')
    
    # Create simulation via API
    simulation_data = {
        'name': 'API Test Simulation',
        'description': 'Testing via API',
        'model_type': 'integrated',
        'time_step': 'daily',
        'start_date': '2023-01-01T00:00:00',
        'end_date': '2023-12-31T00:00:00',
        'physical_config': {
            'basin_area': 1500.0,
            'mean_elevation': 800.0,
            'mean_slope': 15.0,
            'soil_depth': 1.2,
            'porosity': 0.4,
            'hydraulic_conductivity': 2.5,
            'forest_percent': 45.0,
            'agricultural_percent': 35.0,
            'urban_percent': 15.0,
            'water_percent': 5.0,
            'annual_precipitation': 1200.0,
            'mean_temperature': 22.0
        },
        'socio_config': {
            'population': 50000,
            'population_growth_rate': 1.2,
            'water_demand_per_capita': 150.0,
            'gdp_per_capita': 12000.0,
            'agricultural_demand': 2500.0,
            'industrial_demand': 800.0,
            'governance_index': 0.7,
            'water_price': 0.8,
            'initial_risk_perception': 0.3,
            'initial_memory': 0.2
        }
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print('Creating simulation via API...')
    create_response = requests.post(
        'http://localhost:8000/api/v1/simulations/',
        json=simulation_data,
        headers=headers
    )
    
    print(f'Create response status: {create_response.status_code}')
    if create_response.status_code == 201:
        sim_data = create_response.json()
        print(f'Created simulation: {sim_data["name"]} (ID: {sim_data["id"]})')
        print(f'Status: {sim_data["status"]}')
        
        # List simulations to verify it appears
        list_response = requests.get(
            'http://localhost:8000/api/v1/simulations/',
            headers=headers
        )
        
        if list_response.status_code == 200:
            sims = list_response.json()
            print(f'User has {sims["total"]} simulations')
            for sim in sims['simulations'][:5]:
                print(f'  - {sim["name"]}: {sim["status"]}')
        else:
            print(f'List failed: {list_response.status_code}')
    else:
        print(f'Create failed: {create_response.text}')
        
except requests.exceptions.ConnectionError:
    print('Connection failed - backend server not running')
except Exception as e:
    print(f'Error: {e}')