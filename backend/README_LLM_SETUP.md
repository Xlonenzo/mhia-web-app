# LLM Integration Setup - Anthropic Claude

This document explains how to set up the Anthropic Claude API integration for generating expert hydrological consultant analysis in MHIA.

## Overview

The consultant analysis feature can operate in two modes:
1. **LLM-Powered** (with Anthropic API key): Real AI-generated expert analysis
2. **Template-Based** (fallback): Enhanced template analysis with calculations

## Setup Instructions

### 1. Get Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment Variables

Add the API key to your environment:

**Windows (.env file):**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Linux/Mac:**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

**Docker (docker-compose.yml):**
```yaml
environment:
  - ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 3. Install Dependencies

```bash
cd backend
pip install aiohttp==3.9.1
```

### 4. Test Integration

Run the test script to verify setup:

```bash
cd backend
python test_llm_api.py
```

Expected output:
```
LOGIN: Success
LLM STATUS: ready (or api_key_missing)
PROVIDER: Anthropic Claude
API KEY: Available (or Missing)
ANALYSIS RESPONSE: 200
SUCCESS: Analysis generated
LLM_GENERATED: true (or false for fallback)
```

## API Endpoints

### Generate Consultant Analysis
```
POST /api/v1/llm/simulations/{simulation_id}/consultant-analysis
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sections": [
    {
      "title": "Avaliação Técnica Executiva",
      "content": "Detailed technical analysis...",
      "severity": "low|medium|high|critical",
      "recommendations": ["list", "of", "recommendations"]
    }
  ],
  "executiveSummary": "Executive summary...",
  "technicalConclusion": "Final conclusion...",
  "llm_generated": true,
  "generation_timestamp": "2024-01-01T00:00:00",
  "simulation_id": "uuid",
  "simulation_name": "Simulation Name"
}
```

### Check LLM Status
```
GET /api/v1/llm/status
```

**Response:**
```json
{
  "llm_available": true,
  "provider": "Anthropic Claude",
  "model": "claude-3-sonnet-20240229",
  "fallback_available": true,
  "status": "ready"
}
```

## Frontend Integration

The frontend automatically detects LLM availability and shows visual indicators:

- 🤖 **Claude AI Generated**: Real LLM analysis
- 📊 **Template Analysis**: Fallback analysis

Users see the "Consultant Report" tab in simulation results with professional analysis regardless of LLM availability.

## Expert Profile

The LLM is instructed to analyze as a professional with:

- **Engenheira Civil** pela UFMG
- **Especialista em PCH** pela UNIFEI  
- **Mestra em Recursos Hídricos** pela UFMG
- **20+ anos de experiência** em projetos
- **Especialista em licenciamento ambiental** e outorga
- **Palestrante e autora** de publicações técnicas

## Analysis Sections Generated

1. **Avaliação Técnica Executiva**
   - Hydrological regime analysis
   - Water balance consistency
   - Basin characterization

2. **Análise Regulatória e Outorga**
   - Water use permits (Lei 9.433/97)
   - ANA/CNRH compliance
   - Governance assessment

3. **Avaliação Ambiental Integrada**
   - Environmental licensing (CONAMA)
   - Forest Code compliance
   - Impact assessment

4. **Potencial para PCH**
   - Energy potential analysis
   - ANEEL requirements
   - Economic viability

5. **Recomendações de Gestão**
   - Integrated management plan
   - Implementation timeline
   - Institutional measures

## Cost Considerations

### Anthropic Claude Pricing (approximate):
- **Model**: claude-3-sonnet-20240229
- **Cost per analysis**: ~$0.03-$0.10 USD
- **Token usage**: ~4,000 tokens per report
- **Response time**: 5-15 seconds

### Template Analysis:
- **Cost**: Free
- **Response time**: <1 second
- **Quality**: Good (rule-based)

## Troubleshooting

### Common Issues:

1. **API Key Missing**
   ```
   Status: "api_key_missing"
   Solution: Set ANTHROPIC_API_KEY environment variable
   ```

2. **Authentication Error**
   ```
   Error: Invalid API key
   Solution: Verify API key is correct and active
   ```

3. **Rate Limiting**
   ```
   Error: Rate limit exceeded
   Solution: Wait and retry, or upgrade Anthropic plan
   ```

4. **Network Timeout**
   ```
   Error: Connection timeout
   Solution: Check internet connection, firewall settings
   ```

### Fallback Behavior:

The system gracefully handles all errors by falling back to template analysis:
- ✅ No API key → Template analysis
- ✅ API error → Template analysis  
- ✅ Network error → Template analysis
- ✅ Rate limit → Template analysis

Users always get professional analysis regardless of LLM availability.

## Security Notes

- **API Key Storage**: Never commit API keys to version control
- **Environment Variables**: Use secure environment variable management
- **Rate Limiting**: Implement request throttling for production
- **Logging**: Avoid logging API keys or sensitive data
- **Access Control**: Restrict LLM endpoints to authenticated users only

## Production Deployment

For production environments:

1. **Use secure key management** (AWS Secrets Manager, Azure Key Vault, etc.)
2. **Implement caching** for frequently requested analyses
3. **Add rate limiting** per user/organization
4. **Monitor API usage** and costs
5. **Set up alerts** for API failures
6. **Consider backup LLM providers** for redundancy

## Support

For issues with LLM integration:
1. Check logs in `/backend/logs/`
2. Test API key with `test_llm_api.py`
3. Verify network connectivity
4. Check Anthropic service status
5. Review environment variables

The system is designed to be resilient - analysis will always be available even if LLM services are unavailable.