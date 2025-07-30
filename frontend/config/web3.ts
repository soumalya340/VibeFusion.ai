import { createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

// Configure chains with Alchemy as primary provider and public as fallback
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum],
  [
    alchemyProvider({ 
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'sd3rs13BpGn0gPddmhPfW' 
    }),
    publicProvider()
  ]
);

// Configure connectors
const connectors = [
  new MetaMaskConnector({ 
    chains,
    options: {
      shimDisconnect: true,
    }
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'afd43f38-e558-4ce5-ac48-d19a40a65b8b',
      metadata: {
        name: 'VibeFusion.ai',
        description: 'Decentralized Agentic Video Trading Platform',
        url: 'https://vibefusion.ai',
        icons: ['https://vibefusion.ai/icon.png']
      }
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: 'VibeFusion.ai',
      appLogoUrl: 'https://vibefusion.ai/icon.png',
    },
  }),
];

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'afd43f38-e558-4ce5-ac48-d19a40a65b8b';
