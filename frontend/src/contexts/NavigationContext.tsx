import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

type PageType = 'landing' | 'login' | 'dashboard' | 'features' | 'solutions' | 'documentation' | 'about';

interface NavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  navigateTo: (page: PageType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    console.warn('useNavigation must be used within a NavigationProvider');
    return {
      currentPage: 'landing' as PageType,
      setCurrentPage: () => {},
      navigateTo: () => {}
    };
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  const navigateTo = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, []);

  const value = useMemo(() => ({
    currentPage,
    setCurrentPage,
    navigateTo
  }), [currentPage, navigateTo]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}; 