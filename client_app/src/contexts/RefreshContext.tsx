import { createContext, useContext, useCallback } from 'react';

interface RefreshContextType {
  refreshData: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({
  children,
  onRefresh
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}) {
  const refreshData = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  return (
    <RefreshContext.Provider value={{ refreshData }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
