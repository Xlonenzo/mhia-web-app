"""Test Claude API directly"""
import os
import asyncio
import aiohttp
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_claude_api():
    api_key = os.getenv('ANTHROPIC_API_KEY')
    
    if not api_key:
        print("ERROR: No API key found")
        return
        
    print(f"API Key: {api_key[:20]}...{api_key[-4:]}")
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 200,
        "temperature": 0.3,
        "messages": [
            {
                "role": "user",
                "content": "Hello! Test if you're working. Respond in Portuguese as a Brazilian water resources engineer."
            }
        ]
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            ) as response:
                print(f"Status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    content = result['content'][0]['text']
                    print(f"SUCCESS: Claude responded!")
                    print(f"Response: {content[:200]}...")
                else:
                    error_text = await response.text()
                    print(f"ERROR: {response.status}")
                    print(f"Details: {error_text[:300]}")
                    
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_claude_api())