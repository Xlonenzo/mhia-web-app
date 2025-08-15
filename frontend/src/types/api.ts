// API Types for MHIA Backend Integration

// Simulation Types
export interface Simulation {
  id: string;
  name: string;
  description?: string;
  model_type: string;
  time_step: string;
  start_date: string;
  end_date: string;
  configuration: Record<string, any>;
  status: string;
  progress: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  error_message?: string;
}

export interface SimulationCreate {
  name: string;
  description?: string;
  model_type: string;
  time_step: string;
  start_date: string;
  end_date: string;
  configuration: Record<string, any>;
}

export interface SimulationUpdate {
  name?: string;
  description?: string;
  configuration?: Record<string, any>;
}

export interface SimulationResponse {
  id: string;
  name: string;
  description?: string;
  model_type: string;
  time_step: string;
  start_date: string;
  end_date: string;
  configuration: Record<string, any>;
  status: string;
  progress: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  error_message?: string;
}

export interface SimulationListResponse {
  simulations: SimulationResponse[];
  total: number;
  skip: number;
  limit: number;
}

// Model Types
export interface ModelConfiguration {
  id: string;
  name: string;
  description: string;
  model_type: string;
  parameters: Record<string, any>;
  is_template: boolean;
  is_public: boolean;
  created_at: string;
}

export interface ModelParameter {
  type: string;
  min?: number;
  max?: number;
  unit?: string;
  default?: any;
  description?: string;
}

export interface ModelParameters {
  [key: string]: ModelParameter;
}

export interface ModelCapabilities {
  physical: {
    description: string;
    features: string[];
    limitations: string[];
  };
  sociohydrological: {
    description: string;
    features: string[];
    limitations: string[];
  };
  anthropocene: {
    description: string;
    features: string[];
    limitations: string[];
  };
  artificial_aquifer: {
    description: string;
    features: string[];
    limitations: string[];
  };
  integrated: {
    description: string;
    features: string[];
    limitations: string[];
  };
}

// Results Types
export interface SimulationResult {
  id: string;
  simulation_id: string;
  result_type: string;
  data: Record<string, any>;
  created_at: string;
}

export interface SimulationSummary {
  simulation_id: string;
  total_results: number;
  result_types: string[];
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface UserStats {
  total_simulations: number;
  active_simulations: number;
  completed_simulations: number;
  failed_simulations: number;
  total_processing_time: number;
  average_simulation_duration: number;
  most_used_model_type: string;
  simulations_by_status: Record<string, number>;
  simulations_by_month: Array<{
    month: string;
    count: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
} 