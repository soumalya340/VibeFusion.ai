# VibeFusion.ai Frontend Documentation

## 📖 Overview

The VibeFusion.ai frontend is a modern, responsive web application built with Next.js 14, TypeScript, and Tailwind CSS. It provides a comprehensive interface for decentralized trading with AI-powered analytics, portfolio management, and real-time market data visualization.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14.0.0 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS v3 with custom components
- **State Management**: Redux Toolkit with RTK Query
- **Web3 Integration**: Wagmi v1.4.13 + Ethers.js v5.7.2
- **Animations**: Framer Motion v10.16.4
- **Charts**: Chart.js + React Chart.js 2
- **Real-time**: Socket.io Client v4.7.2
- **Form Management**: React Hook Form v7.47.0
- **Notifications**: React Hot Toast v2.4.1

### Key Dependencies
```json
{
  "next": "14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "tailwindcss": "^3.3.5",
  "@reduxjs/toolkit": "^1.9.7",
  "wagmi": "^1.4.13",
  "ethers": "^5.7.2",
  "framer-motion": "^10.16.4",
  "chart.js": "^4.5.0",
  "alchemy-sdk": "^3.6.2"
}
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main dashboard page
│   ├── page-complex.tsx         # Alternative complex dashboard
│   └── providers.tsx            # Redux, Web3, and context providers
│
├── components/                   # React Components
│   ├── WalletConnection.tsx     # Web3 wallet connection UI
│   ├── RiskAssessment.tsx       # User risk profiling form
│   ├── Portfolio.tsx            # Portfolio overview with NFTs/tokens
│   ├── PortfolioChart.tsx       # Portfolio performance chart
│   ├── TradingSignals.tsx       # AI trading signals display
│   ├── TradeCards.tsx           # Trading recommendation cards
│   ├── AITradeCard.tsx          # Individual AI trade card with animations
│   ├── AITradeCenterSimple.tsx  # AI trade center container
│   ├── ShimmerLoading.tsx       # Loading skeleton components
│   └── Dashboard/               # Dashboard-specific components
│       ├── Dashboard.tsx        # Main dashboard layout
│       ├── Navbar.tsx          # Navigation bar
│       ├── PortfolioOverview.tsx # Portfolio summary cards
│       ├── TradeSignals.tsx    # Trading signals panel
│       ├── AgentStatus.tsx     # AI agent monitoring
│       ├── PerformanceChart.tsx # Performance visualization
│       ├── AssetAllocation.tsx # Asset distribution chart
│       ├── RecentTrades.tsx    # Trading history table
│       └── TokenChart.tsx      # Individual token price chart
│
├── services/                    # Business Logic Services
│   ├── alchemyService.ts       # Blockchain data via Alchemy API
│   ├── portfolioService.ts     # Multi-chain portfolio management
│   ├── tradingService.ts       # Trading operations and signals
│   ├── newsService.ts          # Crypto news aggregation
│   ├── aiAnalysisService.ts    # AI-powered market analysis
│   └── tradeRecommendationService.ts # Trade recommendations
│
├── store/                       # Redux State Management
│   ├── store.ts                # Redux store configuration
│   └── slices/                 # Redux slices
│       ├── authSlice.ts        # Authentication state
│       ├── portfolioSlice.ts   # Portfolio management
│       ├── tradingSlice.ts     # Trading operations
│       └── agentsSlice.ts      # AI agents state
│
├── config/                      # Configuration Files
│   └── web3.ts                 # Web3 provider configuration
│
├── lib/                        # Utility Libraries
│   └── constants.ts            # Application constants
│
├── contexts/                    # React Contexts
│   └── SocketContext.tsx       # WebSocket connection management
│
├── types/                       # TypeScript Definitions
│   └── index.ts                # Type exports
│
└── Configuration Files
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── postcss.config.js       # PostCSS configuration
    ├── tsconfig.json           # TypeScript configuration
    └── package.json            # Dependencies and scripts
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id
NEXT_PUBLIC_APP_NAME=VibeFusion.ai
NEXT_PUBLIC_CHAIN_ID=1

# Blockchain Data APIs
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key

# News & Market Data APIs
NEXT_PUBLIC_NEWS_API_KEY=your-news-api-key
NEXT_PUBLIC_CRYPTO_COMPARE_API_KEY=your-crypto-compare-api-key
NEXT_PUBLIC_COINGECKO_API_KEY=your-coingecko-api-key

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Environment Setup Guide

1. **Alchemy API Key**
   - Visit [Alchemy](https://www.alchemy.com/)
   - Create account and get free API key
   - Supports Ethereum, Polygon, Base networks

2. **News API Keys**
   - [NewsAPI](https://newsapi.org/) for general crypto news
   - [CryptoCompare](https://min-api.cryptocompare.com/) for market data

3. **AI Services**
   - [Google Gemini](https://ai.google.dev/) for AI analysis

## 🚀 Getting Started

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## 🎨 UI Components

### Core Components

#### WalletConnection.tsx
Handles Web3 wallet connection using Wagmi and WalletConnect.

```typescript
interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}
```

**Features:**
- Multiple wallet support (MetaMask, WalletConnect, etc.)
- Connection state management
- Network switching
- Error handling

#### PortfolioChart.tsx
Displays portfolio performance over time using Chart.js.

```typescript
interface PortfolioChartProps {
  data: ChartData;
  period: '7D' | '30D' | '90D' | '1Y';
  onPeriodChange: (period: string) => void;
}
```

**Features:**
- Interactive time period selection
- Responsive design
- Real-time data updates
- Smooth animations

#### AITradeCard.tsx
Individual trade recommendation card with advanced animations.

```typescript
interface AITradeCardProps {
  recommendation: TradeRecommendation;
  onExecute?: (trade: TradeRecommendation) => void;
}
```

**Features:**
- Framer Motion animations
- Confidence meter visualization
- Trade signal indicators
- Floating particle effects

### Dashboard Components

#### PortfolioOverview.tsx
Portfolio summary with key metrics and performance indicators.

**Features:**
- Total portfolio value
- Daily P&L tracking
- Asset allocation breakdown
- Performance metrics

#### RecentTrades.tsx
Trading history table with filtering and sorting.

**Features:**
- Paginated trade history
- Status indicators
- Profit/loss calculations
- Export functionality

## 🔗 Services Layer

### PortfolioService
Multi-chain portfolio management service.

```typescript
class PortfolioService {
  async getWalletPortfolio(walletAddress: string): Promise<PortfolioData>
  async getChainPortfolio(walletAddress: string, network: string): Promise<ChainData>
  async getCurrentPrices(symbols: string[]): Promise<PriceData>
  async getHistoricalData(symbol: string, days: number): Promise<HistoricalData>
}
```

**Supported Networks:**
- Ethereum Mainnet
- Polygon
- Base
- Arbitrum (future)

### TradingService
Trading operations and signal management.

```typescript
class TradingService {
  async getAgents(): Promise<Agent[]>
  async executeTrade(trade: TradeParams): Promise<TradeResult>
  async getTradingSignals(): Promise<TradingSignal[]>
}
```

### NewsService
Crypto news aggregation from multiple sources.

```typescript
class NewsService {
  async getTokenNews(symbol: string): Promise<NewsArticle[]>
  async getMarketNews(): Promise<NewsArticle[]>
  async getTrendingNews(): Promise<NewsArticle[]>
}
```

### AIAnalysisService
AI-powered market analysis using Google Gemini.

```typescript
class AIAnalysisService {
  async analyzeToken(symbol: string, news: NewsArticle[]): Promise<AIAnalysis>
  async generateTradingSignal(analysis: MarketData): Promise<TradingSignal>
}
```

## 📊 State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  portfolio: PortfolioState;
  trading: TradingState;
  agents: AgentsState;
}
```

#### AuthSlice
```typescript
interface AuthState {
  isConnected: boolean;
  address: string | null;
  user: User | null;
  loading: boolean;
}
```

#### PortfolioSlice
```typescript
interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}
```

#### TradingSlice
```typescript
interface TradingState {
  trades: Trade[];
  signals: TradingSignal[];
  loading: boolean;
  error: string | null;
}
```

## 🌐 Web3 Integration

### Wagmi Configuration

```typescript
// config/web3.ts
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, base } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, base],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    publicProvider()
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    // Wallet connectors configuration
  ],
  publicClient
});
```

### Supported Features
- Multi-chain wallet connection
- Token balance retrieval
- Transaction history
- Real-time price updates
- NFT portfolio display

## 🎨 Styling System

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Custom CSS Classes

```css
/* app/globals.css */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-shadow {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## 🔄 Real-time Features

### WebSocket Integration

```typescript
// contexts/SocketContext.tsx
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(newSocket);

    newSocket.on('portfolio_update', handlePortfolioUpdate);
    newSocket.on('trade_signal', handleTradeSignal);
    newSocket.on('market_data', handleMarketData);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
```

### Supported Events
- `portfolio_update`: Real-time portfolio changes
- `trade_signal`: New trading signals
- `market_data`: Live market data updates
- `agent_status`: AI agent status changes

## 📱 Responsive Design

### Breakpoint System
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
All components are designed mobile-first with progressive enhancement for larger screens.

```typescript
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content adapts to screen size */}
</div>
```

## 🧪 Testing

### Test Structure
```
frontend/
├── __tests__/
│   ├── components/
│   ├── services/
│   └── utils/
├── jest.config.js
└── setupTests.ts
```

### Running Tests
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🚀 Deployment

### Build Process
```bash
npm run build        # Creates .next/ directory
npm run start        # Starts production server
```

### Environment-Specific Builds
- **Development**: `npm run dev`
- **Staging**: `NODE_ENV=staging npm run build`
- **Production**: `NODE_ENV=production npm run build`

### Deployment Targets
- **Vercel** (Recommended)
- **Netlify**
- **AWS Amplify**
- **Docker** (see docker-compose.yml)

## 🔧 Performance Optimization

### Code Splitting
- Automatic route-based splitting via Next.js
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/api/placeholder/400/300"
  alt="Portfolio Chart"
  width={400}
  height={300}
  priority // For above-the-fold images
/>
```

### Bundle Analysis
```bash
npx @next/bundle-analyzer
```

## 🐛 Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State debugging
- **Next.js DevTools**: Performance monitoring

### Error Handling
```typescript
// Global error boundary
export class ErrorBoundary extends React.Component {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Framer Motion](https://www.framer.com/motion/)

### Code Style Guide
- Use TypeScript for all new components
- Follow ESLint rules
- Use Prettier for formatting
- Component names in PascalCase
- File names in camelCase

### Contributing
1. Create feature branch
2. Write tests for new features
3. Ensure all tests pass
4. Submit pull request with description

---

**Last Updated**: January 31, 2025
**Version**: 0.1.0
**Maintainer**: VibeFusion.ai Team
