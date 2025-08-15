"""Test full LLM analysis with real Claude API"""
import requests
import json

def test_full_llm_analysis():
    try:
        print("=== Testing Full LLM Analysis ===")
        
        # Login
        login_data = {'username': 'testuser', 'password': 'testpass123'}
        login_response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
        
        if login_response.status_code != 200:
            print(f"LOGIN FAILED: {login_response.status_code}")
            return
            
        token = login_response.json()['access_token']
        print("LOGIN: Success")
        
        # Check LLM status
        status_response = requests.get(
            'http://localhost:8000/api/v1/llm/status',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if status_response.status_code == 200:
            status = status_response.json()
            print(f"LLM STATUS: {status['status']}")
            print(f"API AVAILABLE: {status['llm_available']}")
            
            if not status['llm_available']:
                print("API KEY NOT AVAILABLE - using template analysis")
        
        # Test with a completed simulation
        simulation_id = '32f78a3e-23f1-4168-b336-1fcb5594b9dd'  # Test Background Processing
        print(f"\nGenerating analysis for: {simulation_id}")
        print("This will take 10-30 seconds for real Claude analysis...")
        
        analysis_response = requests.post(
            f'http://localhost:8000/api/v1/llm/simulations/{simulation_id}/consultant-analysis',
            headers={'Authorization': f'Bearer {token}'},
            timeout=60  # Extended timeout for LLM
        )
        
        print(f"ANALYSIS RESPONSE: {analysis_response.status_code}")
        
        if analysis_response.status_code == 200:
            analysis = analysis_response.json()
            
            print(f"SUCCESS: Analysis generated!")
            print(f"LLM_GENERATED: {analysis.get('llm_generated', False)}")
            print(f"SECTIONS: {len(analysis.get('sections', []))}")
            print(f"EXECUTIVE_SUMMARY: {len(analysis.get('executiveSummary', ''))} chars")
            
            # Print analysis method
            if analysis.get('llm_generated'):
                print("*** REAL CLAUDE AI ANALYSIS GENERATED! ***")
                print("*** Professional hydrologist consultant report ***")
            else:
                print("*** Template analysis used (fallback) ***")
                
            # Print first few lines of executive summary
            summary = analysis.get('executiveSummary', '')
            if summary:
                print(f"\nEXECUTIVE SUMMARY (first 200 chars):")
                print(f"{summary[:200]}...")
                
            # Print section titles
            sections = analysis.get('sections', [])
            if sections:
                print(f"\nSECTIONS GENERATED:")
                for i, section in enumerate(sections, 1):
                    title = section.get('title', 'No title')
                    severity = section.get('severity', 'unknown')
                    recs = len(section.get('recommendations', []))
                    print(f"  {i}. {title} ({severity} severity, {recs} recommendations)")
                    
        else:
            print(f"ERROR: {analysis_response.status_code}")
            print(f"DETAILS: {analysis_response.text[:300]}")
            
    except requests.exceptions.Timeout:
        print("TIMEOUT: Claude API took too long (>60s)")
    except Exception as e:
        print(f"EXCEPTION: {str(e)}")

if __name__ == "__main__":
    test_full_llm_analysis()