import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import { StoreProvider, useAppStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeWrapper() {
  const { theme } = useAppStore();
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return <Layout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ThemeWrapper />
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;