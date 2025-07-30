'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '../config/web3';
import { store } from '../store/store';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Provider store={store}>
        <div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
              },
            }}
          />
          {children}
        </div>
      </Provider>
    </WagmiConfig>
  );
}
