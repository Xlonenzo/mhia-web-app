// API Configuration for MHIA Backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
  },
  
  // Simulations
  simulations: {
    list: '/api/v1/simulations/',
    create: '/api/v1/simulations/',
    get: (id: string) => `/api/v1/simulations/${id}`,
    update: (id: string) => `/api/v1/simulations/${id}`,
    delete: (id: string) => `/api/v1/simulations/${id}`,
    run: (id: string) => `/api/v1/simulations/${id}/run`,
    stop: (id: string) => `/api/v1/simulations/${id}/stop`,
  },
  
  // Models
  models: {
    configurations: '/api/v1/models/configurations',
    parameters: (type: string) => `/api/v1/models/parameters/${type}`,
    capabilities: '/api/v1/models/capabilities',
  },
  
  // Results
  results: {
    get: (simulationId: string) => `/api/v1/results/${simulationId}`,
    export: (simulationId: string, format: string) => `/api/v1/results/${simulationId}/export/${format}`,
    summary: (simulationId: string) => `/api/v1/results/${simulationId}/summary`,
  },
  
  // Statistics
  stats: {
    user: '/api/v1/simulations/stats',
  },
  
  // Data Import
  dataImport: {
    fileTypes: '/api/v1/data-import/file-types',
    upload: '/api/v1/data-import/upload',
    validate: '/api/v1/data-import/validate',
    userDatasets: '/api/v1/data-import/user-datasets',
    dataset: (id: string) => `/api/v1/data-import/dataset/${id}`,
    deleteDataset: (id: string) => `/api/v1/data-import/dataset/${id}`,
    linkToSimulation: (datasetId: string) => `/api/v1/data-import/dataset/${datasetId}/use-in-simulation`,
    statistics: '/api/v1/data-import/statistics',
  },
  
  // Health Check
  health: '/health',
};

// Model Types
export const MODEL_TYPES = {
  PHYSICAL: 'physical',
  SOCIOHYDROLOGICAL: 'sociohydrological',
  ANTHROPOCENE: 'anthropocene',
  ARTIFICIAL_AQUIFER: 'artificial_aquifer',
  INTEGRATED: 'integrated',
} as const;

// Simulation Status
export const SIMULATION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
} as const;

// Time Steps
export const TIME_STEPS = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
} as const; 