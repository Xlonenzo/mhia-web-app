import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  ModelConfiguration,
  ModelParameters,
  ModelCapabilities
} from '../types/api';

class ModelService {
  // Get all model configurations
  async getModelConfigurations(): Promise<ModelConfiguration[]> {
    const response = await api.get<ModelConfiguration[]>(
      API_ENDPOINTS.models.configurations
    );
    return response.data;
  }

  // Get parameters for specific model type
  async getModelParameters(modelType: string): Promise<ModelParameters> {
    const response = await api.get<ModelParameters>(
      API_ENDPOINTS.models.parameters(modelType)
    );
    return response.data;
  }

  // Get model capabilities
  async getModelCapabilities(): Promise<ModelCapabilities> {
    const response = await api.get<ModelCapabilities>(
      API_ENDPOINTS.models.capabilities
    );
    return response.data;
  }

  // Get available model types
  getAvailableModelTypes(): Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  }> {
    return [
      {
        id: 'physical',
        name: 'Physical Hydrological Model',
        description: 'Traditional hydrological modeling based on physical processes',
        icon: '🌊',
        color: 'blue',
      },
      {
        id: 'sociohydrological',
        name: 'Socio-Hydrological Model',
        description: 'Modeling human-water interactions and social dynamics',
        icon: '👥',
        color: 'green',
      },
      {
        id: 'anthropocene',
        name: 'Anthropocene Model',
        description: 'Modeling human impacts on hydrological systems',
        icon: '🏭',
        color: 'orange',
      },
      {
        id: 'artificial_aquifer',
        name: 'Artificial Aquifer Model',
        description: 'Modeling artificial groundwater management systems',
        icon: '💧',
        color: 'cyan',
      },
      {
        id: 'integrated',
        name: 'Integrated MHIA Model',
        description: 'Complete integration of all hydrological models',
        icon: '🔗',
        color: 'purple',
      },
    ];
  }

  // Get model description
  getModelDescription(modelType: string): string {
    const descriptions: Record<string, string> = {
      physical: 'Traditional hydrological modeling that simulates water flow through natural systems based on physical laws and processes.',
      sociohydrological: 'Advanced modeling that incorporates human behavior, social dynamics, and water management decisions.',
      anthropocene: 'Specialized modeling for understanding human impacts on water systems in the Anthropocene era.',
      artificial_aquifer: 'Modeling of artificial groundwater systems and managed aquifer recharge.',
      integrated: 'Comprehensive modeling that combines all approaches for complete hydrological understanding.',
    };
    
    return descriptions[modelType] || 'Model description not available';
  }

  // Get model features
  getModelFeatures(modelType: string): string[] {
    const features: Record<string, string[]> = {
      physical: [
        'Rainfall-runoff modeling',
        'Evapotranspiration calculation',
        'Groundwater flow simulation',
        'Soil moisture dynamics',
        'Channel routing',
        'Water balance analysis',
      ],
      sociohydrological: [
        'Population dynamics',
        'Water demand modeling',
        'Economic factors',
        'Governance systems',
        'Risk perception',
        'Adaptive behavior',
      ],
      anthropocene: [
        'Land use changes',
        'Climate change impacts',
        'Urbanization effects',
        'Infrastructure development',
        'Environmental degradation',
        'Sustainability metrics',
      ],
      artificial_aquifer: [
        'Aquifer storage and recovery',
        'Managed recharge',
        'Extraction management',
        'Water quality monitoring',
        'Capacity optimization',
        'Sustainability assessment',
      ],
      integrated: [
        'Multi-scale analysis',
        'Cross-sector integration',
        'Scenario planning',
        'Policy evaluation',
        'Risk assessment',
        'Sustainability planning',
      ],
    };
    
    return features[modelType] || [];
  }

  // Get model limitations
  getModelLimitations(modelType: string): string[] {
    const limitations: Record<string, string[]> = {
      physical: [
        'Requires detailed physical data',
        'Computationally intensive',
        'Limited social factors',
        'Static parameters',
      ],
      sociohydrological: [
        'Complex calibration',
        'Uncertain social data',
        'Behavioral assumptions',
        'Limited physical detail',
      ],
      anthropocene: [
        'Future uncertainty',
        'Data availability',
        'Complex interactions',
        'Validation challenges',
      ],
      artificial_aquifer: [
        'Site-specific data needed',
        'Operational complexity',
        'Limited scale',
        'Cost considerations',
      ],
      integrated: [
        'High complexity',
        'Data requirements',
        'Computational cost',
        'Expert knowledge needed',
      ],
    };
    
    return limitations[modelType] || [];
  }

  // Get default parameters for model type
  getDefaultParameters(modelType: string): Record<string, any> {
    const defaults: Record<string, Record<string, any>> = {
      physical: {
        basin_area: 1000,
        mean_elevation: 500,
        mean_slope: 5,
        soil_depth: 2,
        porosity: 0.4,
        hydraulic_conductivity: 0.5,
        land_use: {
          forest_percent: 30,
          agricultural_percent: 40,
          urban_percent: 20,
          water_percent: 10,
        },
        climate: {
          annual_precipitation: 1200,
          mean_temperature: 18,
        },
      },
      sociohydrological: {
        population: 100000,
        population_growth_rate: 1.5,
        water_demand_per_capita: 150,
        gdp_per_capita: 10000,
        agricultural_demand: 20000,
        industrial_demand: 15000,
        governance_index: 0.6,
        water_price: 0.5,
        initial_risk_perception: 0.3,
        initial_memory: 0.2,
      },
      anthropocene: {
        urbanization_rate: 2.0,
        climate_change_scenario: 'RCP4.5',
        land_use_change_rate: 1.5,
        infrastructure_development: 0.8,
        environmental_pressure: 0.6,
        adaptation_capacity: 0.7,
      },
      artificial_aquifer: {
        include_aquifer: true,
        aquifer_capacity: 1000000,
        recharge_rate: 100,
        extraction_rate: 50,
        water_quality_threshold: 0.8,
        operational_efficiency: 0.85,
        maintenance_frequency: 12,
      },
      integrated: {
        includes: ['physical', 'sociohydrological', 'anthropocene', 'artificial_aquifer'],
        coupling_strength: 0.8,
        feedback_mechanisms: true,
        adaptation_threshold: 0.6,
        sustainability_targets: {
          water_security: 0.8,
          environmental_health: 0.7,
          economic_viability: 0.75,
          social_equity: 0.8,
        },
      },
    };
    
    return defaults[modelType] || {};
  }

  // Validate model parameters
  validateModelParameters(
    modelType: string,
    parameters: Record<string, any>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parameters) {
      errors.push('Parameters are required');
      return { isValid: false, errors };
    }

    const defaultParams = this.getDefaultParameters(modelType);
    
    // Check required parameters
    Object.keys(defaultParams).forEach(key => {
      if (parameters[key] === undefined || parameters[key] === null) {
        errors.push(`Parameter '${key}' is required`);
      }
    });

    // Model-specific validation
    switch (modelType) {
      case 'physical':
        if (parameters.basin_area && parameters.basin_area <= 0) {
          errors.push('Basin area must be greater than 0');
        }
        if (parameters.mean_elevation && parameters.mean_elevation < 0) {
          errors.push('Mean elevation must be non-negative');
        }
        if (parameters.porosity && (parameters.porosity < 0 || parameters.porosity > 1)) {
          errors.push('Porosity must be between 0 and 1');
        }
        break;
      
      case 'sociohydrological':
        if (parameters.population && parameters.population <= 0) {
          errors.push('Population must be greater than 0');
        }
        if (parameters.water_demand_per_capita && parameters.water_demand_per_capita <= 0) {
          errors.push('Water demand per capita must be greater than 0');
        }
        if (parameters.governance_index && (parameters.governance_index < 0 || parameters.governance_index > 1)) {
          errors.push('Governance index must be between 0 and 1');
        }
        break;
      
      case 'integrated':
        if (!parameters.includes || !Array.isArray(parameters.includes)) {
          errors.push('Integrated model must specify included models');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get model complexity level
  getModelComplexity(modelType: string): 'low' | 'medium' | 'high' {
    const complexity: Record<string, 'low' | 'medium' | 'high'> = {
      physical: 'medium',
      sociohydrological: 'high',
      anthropocene: 'high',
      artificial_aquifer: 'medium',
      integrated: 'high',
    };
    
    return complexity[modelType] || 'medium';
  }

  // Get estimated computation time
  getEstimatedComputationTime(
    modelType: string,
    timeStep: string,
    duration: number
  ): number {
    const baseTimes: Record<string, number> = {
      physical: 30,
      sociohydrological: 60,
      anthropocene: 45,
      artificial_aquifer: 20,
      integrated: 120,
    };
    
    const timeStepMultiplier: Record<string, number> = {
      daily: 1,
      monthly: 0.3,
      annual: 0.1,
    };
    
    const baseTime = baseTimes[modelType] || 30;
    const multiplier = timeStepMultiplier[timeStep] || 1;
    const durationMultiplier = Math.sqrt(duration / 365); // Square root scaling
    
    return Math.round(baseTime * multiplier * durationMultiplier);
  }
}

export const modelService = new ModelService();
export default modelService; 