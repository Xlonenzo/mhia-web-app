import { useQuery } from '@tanstack/react-query';
import { modelService } from '../services/modelService';
import { ModelConfiguration, ModelParameters, ModelCapabilities } from '../types/api';

// Hook to get all model configurations
export const useModelConfigurations = () => {
  return useQuery({
    queryKey: ['models', 'configurations'],
    queryFn: () => modelService.getModelConfigurations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get parameters for specific model type
export const useModelParameters = (modelType: string) => {
  return useQuery({
    queryKey: ['models', 'parameters', modelType],
    queryFn: () => modelService.getModelParameters(modelType),
    enabled: !!modelType,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to get model capabilities
export const useModelCapabilities = () => {
  return useQuery({
    queryKey: ['models', 'capabilities'],
    queryFn: () => modelService.getModelCapabilities(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook to get available model types (static data)
export const useAvailableModelTypes = () => {
  return useQuery({
    queryKey: ['models', 'types'],
    queryFn: () => modelService.getAvailableModelTypes(),
    staleTime: Infinity, // Never stale - static data
  });
};

// Hook to get model information
export const useModelInfo = (modelType: string) => {
  const { data: modelTypes } = useAvailableModelTypes();
  
  const modelInfo = modelTypes?.find(type => type.id === modelType);
  
  return {
    data: modelInfo,
    isLoading: false,
    error: null,
    // Additional model information
    description: modelInfo ? modelService.getModelDescription(modelType) : '',
    features: modelInfo ? modelService.getModelFeatures(modelType) : [],
    limitations: modelInfo ? modelService.getModelLimitations(modelType) : [],
    complexity: modelInfo ? modelService.getModelComplexity(modelType) : 'medium',
    defaultParameters: modelInfo ? modelService.getDefaultParameters(modelType) : {},
  };
};

// Hook to validate model parameters
export const useModelValidation = (modelType: string, parameters: Record<string, any>) => {
  const validation = modelService.validateModelParameters(modelType, parameters);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    hasErrors: validation.errors.length > 0,
  };
};

// Hook to get estimated computation time
export const useComputationTime = (
  modelType: string,
  timeStep: string,
  duration: number
) => {
  const estimatedTime = modelService.getEstimatedComputationTime(modelType, timeStep, duration);
  
  return {
    estimatedMinutes: estimatedTime,
    estimatedHours: Math.round(estimatedTime / 60 * 10) / 10,
    isLongRunning: estimatedTime > 60, // More than 1 hour
    timeCategory: estimatedTime < 10 ? 'fast' : estimatedTime < 60 ? 'medium' : 'slow',
  };
}; 