import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { simulationService } from '../services/simulationService';
import type { 
  SimulationCreate, 
  SimulationUpdate, 
  SimulationResponse,
  SimulationListResponse,
  SimulationResult,
  SimulationSummary
} from '../types/api';

// Hook to get all simulations
export const useSimulations = (
  skip: number = 0,
  limit: number = 100,
  status?: string
) => {
  return useQuery({
    queryKey: ['simulations', { skip, limit, status }],
    queryFn: () => simulationService.getSimulations(skip, limit, status),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get single simulation
export const useSimulation = (id: string) => {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationService.getSimulation(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

// Hook to create simulation
export const useCreateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SimulationCreate) => simulationService.createSimulation(data),
    onSuccess: (newSimulation) => {
      // Add new simulation to the list
      queryClient.setQueryData(
        ['simulations'],
        (oldData: SimulationListResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            simulations: [newSimulation, ...oldData.simulations],
            total: oldData.total + 1,
          };
        }
      );
      
      // Invalidate simulations list
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook to update simulation
export const useUpdateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SimulationUpdate }) =>
      simulationService.updateSimulation(id, data),
    onSuccess: (updatedSimulation, { id }) => {
      // Update simulation in cache
      queryClient.setQueryData(['simulation', id], updatedSimulation);
      
      // Update in simulations list
      queryClient.setQueryData(
        ['simulations'],
        (oldData: SimulationListResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            simulations: oldData.simulations.map(sim =>
              sim.id === id ? updatedSimulation : sim
            ),
          };
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['simulation', id] });
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook to delete simulation
export const useDeleteSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simulationService.deleteSimulation(id),
    onSuccess: (_, deletedId) => {
      // Remove from simulations list
      queryClient.setQueryData(
        ['simulations'],
        (oldData: SimulationListResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            simulations: oldData.simulations.filter(sim => sim.id !== deletedId),
            total: oldData.total - 1,
          };
        }
      );
      
      // Remove simulation from cache
      queryClient.removeQueries({ queryKey: ['simulation', deletedId] });
      queryClient.removeQueries({ queryKey: ['simulation-results', deletedId] });
      
      // Invalidate simulations list
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook to run simulation
export const useRunSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simulationService.runSimulation(id),
    onSuccess: (_, simulationId) => {
      // Update simulation status in cache
      queryClient.setQueryData(
        ['simulation', simulationId],
        (oldData: SimulationResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            status: 'running',
            start_time: new Date().toISOString(),
          };
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['simulation', simulationId] });
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook to stop simulation
export const useStopSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simulationService.stopSimulation(id),
    onSuccess: (_, simulationId) => {
      // Update simulation status in cache
      queryClient.setQueryData(
        ['simulation', simulationId],
        (oldData: SimulationResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            status: 'paused',
          };
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['simulation', simulationId] });
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook to get simulation results
export const useSimulationResults = (
  simulationId: string,
  resultType?: string
) => {
  return useQuery({
    queryKey: ['simulation-results', simulationId, resultType],
    queryFn: () => simulationService.getSimulationResults(simulationId, resultType),
    enabled: !!simulationId,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to get simulation summary
export const useSimulationSummary = (simulationId: string) => {
  return useQuery({
    queryKey: ['simulation-summary', simulationId],
    queryFn: () => simulationService.getSimulationSummary(simulationId),
    enabled: !!simulationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => simulationService.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to monitor simulation progress
export const useSimulationProgress = (
  simulationId: string,
  onProgress?: (progress: number) => void,
  onComplete?: (simulation: SimulationResponse) => void,
  onError?: (error: any) => void
) => {
  const queryClient = useQueryClient();

  const startMonitoring = () => {
    simulationService.monitorSimulationProgress(
      simulationId,
      (progress) => {
        // Update progress in cache
        queryClient.setQueryData(
          ['simulation', simulationId],
          (oldData: SimulationResponse | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, progress };
          }
        );
        
        if (onProgress) {
          onProgress(progress);
        }
      },
      (simulation) => {
        // Update simulation in cache
        queryClient.setQueryData(['simulation', simulationId], simulation);
        queryClient.invalidateQueries({ queryKey: ['simulations'] });
        
        if (onComplete) {
          onComplete(simulation);
        }
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      }
    );
  };

  return { startMonitoring };
};

// Hook to export results
export const useExportResults = () => {
  return useMutation({
    mutationFn: ({ 
      simulationId, 
      format, 
      filename 
    }: { 
      simulationId: string; 
      format: 'csv' | 'json' | 'excel'; 
      filename?: string;
    }) => simulationService.downloadResults(simulationId, format, filename),
  });
}; 