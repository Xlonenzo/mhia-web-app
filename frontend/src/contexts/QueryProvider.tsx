import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only in development and if available */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevToolsWrapper />
      )}
    </QueryClientProvider>
  );
};

// Separate component to handle DevTools import
const ReactQueryDevToolsWrapper = () => {
  const [DevTools, setDevTools] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    // Dynamic import to avoid build issues
    import('@tanstack/react-query-devtools')
      .then((module) => {
        setDevTools(() => module.ReactQueryDevtools);
      })
      .catch((error) => {
        console.warn('React Query DevTools not available:', error);
      });
  }, []);

  if (!DevTools) return null;

  return <DevTools initialIsOpen={false} />;
};

export default QueryProvider; 