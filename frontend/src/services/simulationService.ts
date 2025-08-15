import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  SimulationCreate,
  SimulationUpdate,
  SimulationResponse,
  SimulationListResponse,
  SimulationResult,
  SimulationSummary
} from '../types/api';

class SimulationService {
  // Get all simulations for current user
  async getSimulations(
    skip: number = 0,
    limit: number = 100,
    status?: string
  ): Promise<SimulationListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status_filter', status);
    }

    const response = await api.get<SimulationListResponse>(
      `${API_ENDPOINTS.simulations.list}?${params.toString()}`
    );
    return response.data;
  }

  // Get single simulation by ID
  async getSimulation(id: string): Promise<SimulationResponse> {
    const response = await api.get<SimulationResponse>(
      API_ENDPOINTS.simulations.get(id)
    );
    return response.data;
  }

  // Create new simulation
  async createSimulation(simulationData: SimulationCreate): Promise<SimulationResponse> {
    const response = await api.post<SimulationResponse>(
      API_ENDPOINTS.simulations.create,
      simulationData
    );
    return response.data;
  }

  // Update simulation
  async updateSimulation(
    id: string,
    simulationData: SimulationUpdate
  ): Promise<SimulationResponse> {
    const response = await api.put<SimulationResponse>(
      API_ENDPOINTS.simulations.update(id),
      simulationData
    );
    return response.data;
  }

  // Delete simulation
  async deleteSimulation(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.simulations.delete(id));
  }

  // Run simulation
  async runSimulation(id: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.simulations.run(id)
    );
    return response.data;
  }

  // Stop simulation
  async stopSimulation(id: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.simulations.stop(id)
    );
    return response.data;
  }

  // Get simulation results
  async getSimulationResults(
    simulationId: string,
    resultType?: string
  ): Promise<SimulationResult[]> {
    const params = resultType ? `?result_type=${resultType}` : '';
    const response = await api.get<SimulationResult[]>(
      `${API_ENDPOINTS.results.get(simulationId)}${params}`
    );
    return response.data;
  }

  // Get simulation summary
  async getSimulationSummary(simulationId: string): Promise<SimulationSummary> {
    const response = await api.get<SimulationSummary>(
      API_ENDPOINTS.results.summary(simulationId)
    );
    return response.data;
  }

  // Export simulation results
  async exportResults(
    simulationId: string,
    format: 'csv' | 'json' | 'excel'
  ): Promise<Blob> {
    const response = await api.get(
      API_ENDPOINTS.results.export(simulationId, format),
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Download results as file
  async downloadResults(
    simulationId: string,
    format: 'csv' | 'json' | 'excel',
    filename?: string
  ): Promise<void> {
    const blob = await this.exportResults(simulationId, format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `simulation_${simulationId}_results.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Get user statistics
  async getUserStats(): Promise<any> {
    const response = await api.get(API_ENDPOINTS.stats.user);
    return response.data;
  }

  // Monitor simulation progress (polling)
  async monitorSimulationProgress(
    simulationId: string,
    onProgress?: (progress: number) => void,
    onComplete?: (simulation: SimulationResponse) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = 300; // 10 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const simulation = await this.getSimulation(simulationId);
        
        if (onProgress) {
          onProgress(simulation.progress);
        }

        if (simulation.status === 'completed') {
          if (onComplete) {
            onComplete(simulation);
          }
          return;
        }

        if (simulation.status === 'failed') {
          if (onError) {
            onError(new Error(simulation.error_message || 'Simulation failed'));
          }
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          if (onError) {
            onError(new Error('Simulation monitoring timeout'));
          }
          return;
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    };

    poll();
  }

  // Create simulation with default configurations
  async createDefaultSimulation(
    name: string,
    modelType: string,
    startDate: string,
    endDate: string
  ): Promise<SimulationResponse> {
    const defaultConfig = this.getDefaultConfiguration(modelType);
    
    const simulationData: SimulationCreate = {
      name,
      description: `Simulation using ${modelType} model`,
      model_type: modelType,
      time_step: 'daily',
      start_date: startDate,
      end_date: endDate,
      configuration: defaultConfig,
    };

    return this.createSimulation(simulationData);
  }

  // Get default configuration for model type
  getDefaultConfiguration(modelType: string): Record<string, any> {
    const configs = {
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
      artificial_aquifer: {
        include_aquifer: true,
        aquifer_capacity: 1000000,
        recharge_rate: 100,
        extraction_rate: 50,
      },
      integrated: {
        includes: ['physical', 'sociohydrological', 'anthropocene', 'artificial_aquifer'],
        physical: this.getDefaultConfiguration('physical'),
        sociohydrological: this.getDefaultConfiguration('sociohydrological'),
        anthropocene: {},
        artificial_aquifer: this.getDefaultConfiguration('artificial_aquifer'),
      },
    };

    return configs[modelType as keyof typeof configs] || {};
  }

  // Validate simulation configuration
  validateConfiguration(
    modelType: string,
    configuration: Record<string, any>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (!configuration) {
      errors.push('Configuration is required');
      return { isValid: false, errors };
    }

    // Model-specific validation
    switch (modelType) {
      case 'physical':
        if (!configuration.basin_area || configuration.basin_area <= 0) {
          errors.push('Basin area must be greater than 0');
        }
        if (!configuration.mean_elevation || configuration.mean_elevation < 0) {
          errors.push('Mean elevation must be non-negative');
        }
        break;
      
      case 'sociohydrological':
        if (!configuration.population || configuration.population <= 0) {
          errors.push('Population must be greater than 0');
        }
        if (!configuration.water_demand_per_capita || configuration.water_demand_per_capita <= 0) {
          errors.push('Water demand per capita must be greater than 0');
        }
        break;
      
      case 'integrated':
        if (!configuration.includes || !Array.isArray(configuration.includes)) {
          errors.push('Integrated model must include component models');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const simulationService = new SimulationService();
export default simulationService; 