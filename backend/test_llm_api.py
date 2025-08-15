"""Test LLM API endpoints"""
import requests

def test_llm_integration():
    try:
        # Login
        login_data = {'username': 'testuser', 'password': 'testpass123'}
        login_response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()['access_token']
            print('LOGIN: Success')
            
            # Test LLM status
            status_response = requests.get('http://localhost:8000/api/v1/llm/status')
            if status_response.status_code == 200:
                status = status_response.json()
                print(f'LLM STATUS: {status["status"]}')
                print(f'PROVIDER: {status["provider"]}')
                print(f'API KEY: {"Available" if status["llm_available"] else "Missing"}')
            
            # Test consultant analysis for a completed simulation
            simulation_id = '32f78a3e-23f1-4168-b336-1fcb5594b9dd'
            print(f'\nTesting analysis for simulation: {simulation_id}')
            
            analysis_response = requests.post(
                f'http://localhost:8000/api/v1/llm/simulations/{simulation_id}/consultant-analysis',
                headers={'Authorization': f'Bearer {token}'}
            )
            
            print(f'ANALYSIS RESPONSE: {analysis_response.status_code}')
            
            if analysis_response.status_code == 200:
                analysis = analysis_response.json()
                print(f'SUCCESS: Analysis generated')
                print(f'LLM_GENERATED: {analysis.get("llm_generated", False)}')
                print(f'SECTIONS: {len(analysis.get("sections", []))}')
                print(f'SUMMARY_LENGTH: {len(analysis.get("executiveSummary", ""))} chars')
                
                # Print first section title
                sections = analysis.get("sections", [])
                if sections:
                    print(f'FIRST_SECTION: {sections[0].get("title", "No title")}')
                    
            else:
                error_text = analysis_response.text[:200]
                print(f'ERROR: {error_text}')
        else:
            print(f'LOGIN FAILED: {login_response.status_code}')
            
    except Exception as e:
        print(f'EXCEPTION: {str(e)}')

if __name__ == "__main__":
    test_llm_integration()