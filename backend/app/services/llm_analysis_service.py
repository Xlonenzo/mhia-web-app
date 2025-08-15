"""
LLM Analysis Service using Anthropic Claude
Generates expert hydrological consultant reports
"""
import os
import logging
from typing import Dict, Any, List
import json
import asyncio
from datetime import datetime

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False
    logging.warning("aiohttp not available - LLM API calls will be disabled")

logger = logging.getLogger(__name__)

class LLMAnalysisService:
    """Service for generating consultant analysis using Anthropic Claude"""
    
    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.base_url = "https://api.anthropic.com/v1/messages"
        
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not found in environment variables")
    
    async def generate_consultant_analysis(
        self, 
        simulation_data: Dict[str, Any], 
        results_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive hydrological consultant analysis using Claude
        """
        try:
            # Prepare data for analysis
            analysis_context = self._prepare_analysis_context(simulation_data, results_data)
            
            # Generate analysis using Claude
            if self.api_key and AIOHTTP_AVAILABLE:
                analysis = await self._call_claude_api(analysis_context)
            else:
                # Fallback to enhanced template-based analysis
                if not self.api_key:
                    logger.info("Using enhanced template analysis (no API key)")
                else:
                    logger.warning("Using enhanced template analysis (aiohttp not available)")
                analysis = self._generate_enhanced_template_analysis(analysis_context)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error generating consultant analysis: {str(e)}")
            # Return fallback analysis
            return self._generate_fallback_analysis(simulation_data, results_data)
    
    def _prepare_analysis_context(self, simulation_data: Dict, results_data: List[Dict]) -> Dict:
        """Prepare structured data for LLM analysis"""
        
        # Extract key metrics
        daily_results = next((r for r in results_data if r.get('result_type') == 'daily_results'), {}).get('data', {})
        annual_results = next((r for r in results_data if r.get('result_type') == 'annual_results'), {}).get('data', {})
        
        # Physical configuration
        physical_config = simulation_data.get('physical_config', {}) if isinstance(simulation_data.get('physical_config'), dict) else json.loads(simulation_data.get('physical_config', '{}'))
        socio_config = simulation_data.get('socio_config', {}) if isinstance(simulation_data.get('socio_config'), dict) else json.loads(simulation_data.get('socio_config', '{}'))
        
        context = {
            "simulation_info": {
                "name": simulation_data.get('name', 'Unnamed Simulation'),
                "description": simulation_data.get('description', ''),
                "start_date": simulation_data.get('start_date'),
                "end_date": simulation_data.get('end_date'),
                "model_type": simulation_data.get('model_type'),
                "status": simulation_data.get('status')
            },
            "basin_characteristics": {
                "area_km2": physical_config.get('basin_area', 0),
                "mean_elevation_m": physical_config.get('mean_elevation', 0),
                "mean_slope_percent": physical_config.get('mean_slope', 0),
                "soil_depth_m": physical_config.get('soil_depth', 0),
                "porosity": physical_config.get('porosity', 0),
                "hydraulic_conductivity": physical_config.get('hydraulic_conductivity', 0),
                "forest_percent": physical_config.get('forest_percent', 0),
                "agricultural_percent": physical_config.get('agricultural_percent', 0),
                "urban_percent": physical_config.get('urban_percent', 0),
                "water_percent": physical_config.get('water_percent', 0)
            },
            "socioeconomic_data": {
                "population": socio_config.get('population', 0),
                "population_growth_rate": socio_config.get('population_growth_rate', 0),
                "water_demand_per_capita": socio_config.get('water_demand_per_capita', 0),
                "gdp_per_capita": socio_config.get('gdp_per_capita', 0),
                "governance_index": socio_config.get('governance_index', 0),
                "water_price": socio_config.get('water_price', 0)
            },
            "hydrological_results": {
                "total_precipitation_mm": annual_results.get('total_precipitation', 0),
                "total_evapotranspiration_mm": annual_results.get('total_evapotranspiration', 0),
                "total_runoff_mm": annual_results.get('total_runoff', 0),
                "total_infiltration_mm": annual_results.get('total_infiltration', 0),
                "mean_temperature_c": annual_results.get('mean_temperature', 0),
                "runoff_coefficient": annual_results.get('runoff_coefficient', 0),
                "water_balance_error_percent": annual_results.get('water_balance_error', 0)
            },
            "time_series_sample": {
                "precipitation_first_30_days": daily_results.get('precipitation', [])[:30],
                "runoff_first_30_days": daily_results.get('runoff', [])[:30],
                "temperature_first_30_days": daily_results.get('temperature', [])[:30]
            }
        }
        
        return context
    
    async def _call_claude_api(self, context: Dict) -> Dict[str, Any]:
        """Call Anthropic Claude API to generate analysis"""
        
        if not AIOHTTP_AVAILABLE:
            raise ImportError("aiohttp not available")
            
        prompt = self._create_expert_prompt(context)
        
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01"
            }
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4000,
                "temperature": 0.3,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.base_url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        analysis_text = result['content'][0]['text']
                        return self._parse_claude_response(analysis_text)
                    else:
                        error_text = await response.text()
                        logger.error(f"Claude API error {response.status}: {error_text}")
                        raise Exception(f"Claude API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            raise
    
    def _create_expert_prompt(self, context: Dict) -> str:
        """Create expert-level prompt for Claude based on consultant profile"""
        
        prompt = f"""
Você é uma Engenheira Civil especializada em Recursos Hídricos com o seguinte perfil profissional:

- Engenheira Civil pela Universidade Federal de Minas Gerais (UFMG)
- Especialista em Pequenas Centrais Hidrelétricas pela Universidade Federal de Itajubá (UNIFEI)
- Mestra em Saneamento, Meio Ambiente e Recursos Hídricos pela UFMG
- Mais de 20 anos de experiência em gestão de projetos de Recursos Hídricos
- Especialista em Licenciamento Ambiental, Avaliação Ambiental Integrada e Outorga de Uso de Recursos Hídricos
- Palestrante reconhecida e autora de publicações técnicas do setor

Analise os seguintes dados de uma simulação hidrológica integrada e forneça um parecer técnico detalhado:

**DADOS DA SIMULAÇÃO:**
- Nome: {context['simulation_info']['name']}
- Descrição: {context['simulation_info']['description']}
- Período: {context['simulation_info']['start_date']} a {context['simulation_info']['end_date']}
- Tipo de Modelo: {context['simulation_info']['model_type']}

**CARACTERÍSTICAS DA BACIA:**
- Área de drenagem: {context['basin_characteristics']['area_km2']:.1f} km²
- Altitude média: {context['basin_characteristics']['mean_elevation_m']:.0f} m
- Declividade média: {context['basin_characteristics']['mean_slope_percent']:.1f}%
- Profundidade do solo: {context['basin_characteristics']['soil_depth_m']:.2f} m
- Porosidade: {context['basin_characteristics']['porosity']:.2f}
- Condutividade hidráulica: {context['basin_characteristics']['hydraulic_conductivity']:.1f} m/dia
- Cobertura florestal: {context['basin_characteristics']['forest_percent']:.1f}%
- Área agrícola: {context['basin_characteristics']['agricultural_percent']:.1f}%
- Área urbana: {context['basin_characteristics']['urban_percent']:.1f}%

**DADOS SOCIOECONÔMICOS:**
- População: {context['socioeconomic_data']['population']:,} habitantes
- Taxa crescimento populacional: {context['socioeconomic_data']['population_growth_rate']:.1f}%/ano
- Demanda per capita: {context['socioeconomic_data']['water_demand_per_capita']:.0f} L/hab/dia
- PIB per capita: US$ {context['socioeconomic_data']['gdp_per_capita']:,.0f}
- Índice de governança: {context['socioeconomic_data']['governance_index']:.2f}

**RESULTADOS HIDROLÓGICOS:**
- Precipitação anual: {context['hydrological_results']['total_precipitation_mm']:.1f} mm
- Evapotranspiração anual: {context['hydrological_results']['total_evapotranspiration_mm']:.1f} mm
- Escoamento superficial anual: {context['hydrological_results']['total_runoff_mm']:.1f} mm
- Infiltração anual: {context['hydrological_results']['total_infiltration_mm']:.1f} mm
- Temperatura média: {context['hydrological_results']['mean_temperature_c']:.1f}°C
- Coeficiente de escoamento: {context['hydrological_results']['runoff_coefficient']:.3f}
- Erro do balanço hídrico: {context['hydrological_results']['water_balance_error_percent']:.2f}%

Forneça um parecer técnico estruturado em formato JSON com as seguintes seções:

{{
  "executive_summary": "Parecer executivo conciso (2-3 parágrafos)",
  "technical_assessment": {{
    "title": "Avaliação Técnica Executiva",
    "content": "Análise detalhada dos aspectos hidrológicos",
    "severity": "low|medium|high|critical",
    "recommendations": ["lista", "de", "recomendações"]
  }},
  "regulatory_analysis": {{
    "title": "Análise Regulatória e Outorga",
    "content": "Aspectos de outorga conforme Lei 9.433/97 e normas ANA/CNRH",
    "severity": "low|medium|high|critical", 
    "recommendations": ["lista", "de", "recomendações"]
  }},
  "environmental_assessment": {{
    "title": "Avaliação Ambiental Integrada",
    "content": "Análise ambiental conforme CONAMA e Código Florestal",
    "severity": "low|medium|high|critical",
    "recommendations": ["lista", "de", "recomendações"]
  }},
  "pch_potential": {{
    "title": "Potencial para Pequenas Centrais Hidrelétricas", 
    "content": "Análise de viabilidade para PCH baseada na especialização UNIFEI",
    "severity": "low|medium|high|critical",
    "recommendations": ["lista", "de", "recomendações"]
  }},
  "management_recommendations": {{
    "title": "Recomendações para Gestão Integrada",
    "content": "Plano de gestão integrada dos recursos hídricos",
    "severity": "medium",
    "recommendations": ["lista", "de", "recomendações"]
  }},
  "technical_conclusion": "Conclusão técnica final com assinatura profissional"
}}

IMPORTANTE: 
- Use terminologia técnica adequada
- Referencie normas brasileiras (ANA, CNRH, CONAMA)
- Baseie-se na experiência prática de 20+ anos
- Seja específico quanto aos aspectos regulatórios
- Avalie criticamente os resultados
- Forneça recomendações práticas e implementáveis
- Mantenha rigor científico e técnico
"""
        
        return prompt
    
    def _parse_claude_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's JSON response into structured analysis"""
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                analysis_data = json.loads(json_match.group())
                return {
                    "sections": [
                        analysis_data.get("technical_assessment", {}),
                        analysis_data.get("regulatory_analysis", {}),
                        analysis_data.get("environmental_assessment", {}),
                        analysis_data.get("pch_potential", {}),
                        analysis_data.get("management_recommendations", {})
                    ],
                    "executiveSummary": analysis_data.get("executive_summary", ""),
                    "technicalConclusion": analysis_data.get("technical_conclusion", ""),
                    "llm_generated": True,
                    "generation_timestamp": datetime.now().isoformat()
                }
            else:
                raise Exception("No JSON found in response")
                
        except Exception as e:
            logger.error(f"Error parsing Claude response: {str(e)}")
            # Return raw text with basic structure
            return {
                "sections": [{
                    "title": "Análise Gerada por IA",
                    "content": response_text,
                    "severity": "medium",
                    "recommendations": ["Revisar análise detalhada acima"]
                }],
                "executiveSummary": "Análise gerada automaticamente - revisar conteúdo completo na seção principal",
                "technicalConclusion": "Análise preliminar - validação técnica recomendada",
                "llm_generated": True,
                "generation_timestamp": datetime.now().isoformat()
            }
    
    def _generate_enhanced_template_analysis(self, context: Dict) -> Dict[str, Any]:
        """Enhanced template-based analysis when LLM is not available"""
        
        # Calculate key metrics
        basin_area = context['basin_characteristics']['area_km2']
        precipitation = context['hydrological_results']['total_precipitation_mm']
        runoff_coeff = context['hydrological_results']['runoff_coefficient']
        water_balance_error = context['hydrological_results']['water_balance_error_percent']
        population = context['socioeconomic_data']['population']
        urban_percent = context['basin_characteristics']['urban_percent']
        forest_percent = context['basin_characteristics']['forest_percent']
        
        # Calculate availability metrics
        total_runoff = context['hydrological_results']['total_runoff_mm']
        water_demand_per_capita = context['socioeconomic_data']['water_demand_per_capita']
        annual_demand = (population * water_demand_per_capita * 365) / 1000000  # m³/year
        availability_ratio = annual_demand / (total_runoff * basin_area / 1000) if total_runoff > 0 else 0
        
        sections = [
            {
                "title": "Avaliação Técnica Executiva",
                "severity": "high" if water_balance_error > 5 else "medium" if water_balance_error > 2 else "low",
                "content": f"""
**Análise Hidrológica Integrada - Bacia de {basin_area:.0f} km²**

Com base na experiência de mais de duas décadas em projetos de recursos hídricos, apresento a seguinte avaliação:

**Caracterização da Bacia:**
• Área de drenagem: {basin_area:.2f} km²
• Precipitação anual: {precipitation:.1f} mm ({'adequada' if precipitation > 800 else 'baixa'})
• Coeficiente de escoamento: {runoff_coeff:.3f} ({'alto' if runoff_coeff > 0.4 else 'médio' if runoff_coeff > 0.2 else 'baixo'})

**Consistência do Modelo:**
• Erro do balanço hídrico: {water_balance_error:.2f}% ({'excelente' if water_balance_error < 2 else 'aceitável' if water_balance_error < 5 else 'elevado'})
• Conformidade com padrões ANA: {'✓ Aprovado' if water_balance_error < 5 else '⚠ Requer revisão'}
                """,
                "recommendations": [
                    "Validar resultados com dados observados de estações da ANA" if water_balance_error < 5 else "Revisar parâmetros do modelo para reduzir erro do balanço",
                    "Implementar rede de monitoramento hidrometeorológico",
                    "Calibrar modelo com séries históricas regionais"
                ]
            },
            {
                "title": "Análise Regulatória e Outorga",
                "severity": "critical" if availability_ratio > 0.8 else "high" if availability_ratio > 0.5 else "medium" if availability_ratio > 0.3 else "low",
                "content": f"""
**Aspectos de Outorga (Lei 9.433/97 e normas ANA):**

**Disponibilidade vs. Demanda:**
• Taxa de utilização dos recursos: {availability_ratio * 100:.1f}%
• Classificação: {
    'CRÍTICA - Stress hídrico severo' if availability_ratio > 0.8 else
    'ALTA - Gestão ativa necessária' if availability_ratio > 0.5 else
    'MÉDIA - Monitoramento preventivo' if availability_ratio > 0.3 else
    'BAIXA - Situação confortável'
}
• Necessidade de outorga: {'OBRIGATÓRIA' if availability_ratio > 0.3 else 'Análise caso a caso'}

**Instrumentos de Gestão:**
• Cobrança pelo uso: {'Recomendada' if availability_ratio > 0.5 else 'Avaliação futura'}
• Comitê de bacia: {'Prioritário' if availability_ratio > 0.6 else 'Desejável'}
                """,
                "recommendations": [
                    "Elaborar Plano de Recursos Hídricos da bacia" if availability_ratio > 0.3 else "Manter monitoramento preventivo",
                    "Implementar cadastro de usuários (CNARH)" if availability_ratio > 0.4 else "Estruturar base de dados de usuários",
                    "Estabelecer sistema de alocação negociada" if availability_ratio > 0.7 else "Monitorar evolução da demanda"
                ]
            }
        ]
        
        return {
            "sections": sections,
            "executiveSummary": f"""
**PARECER TÉCNICO EXECUTIVO**

Bacia hidrográfica de {basin_area:.0f} km² com situação hídrica {'CRÍTICA' if availability_ratio > 0.8 else 'ESTÁVEL' if availability_ratio < 0.5 else 'PREOCUPANTE'}.

**Prioridades:** {f'Implementação urgente de instrumentos de gestão' if availability_ratio > 0.6 else 'Estruturação do sistema de monitoramento'}

**Eng.ª [Nome], CREA [Número]** - *Especialista em Recursos Hídricos*
            """,
            "technicalConclusion": "Análise baseada em templates avançados - LLM indisponível",
            "llm_generated": False,
            "generation_timestamp": datetime.now().isoformat()
        }
    
    def _generate_fallback_analysis(self, simulation_data: Dict, results_data: List[Dict]) -> Dict[str, Any]:
        """Basic fallback analysis in case of errors"""
        return {
            "sections": [{
                "title": "Análise Técnica Básica",
                "content": f"Simulação: {simulation_data.get('name', 'Sem nome')}\nStatus: Análise em processamento",
                "severity": "medium",
                "recommendations": ["Aguardar processamento completo da análise"]
            }],
            "executiveSummary": "Análise técnica em processamento - tente novamente em alguns momentos",
            "technicalConclusion": "Sistema temporariamente indisponível",
            "llm_generated": False,
            "generation_timestamp": datetime.now().isoformat()
        }