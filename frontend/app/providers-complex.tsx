'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store/store';
import { wagmiConfig } from '../config/web3';
import { SocketProvider } from '../contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </SocketProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </Provider>
  );
}
