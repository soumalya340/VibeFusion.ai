export interface User {
  id: string;
  walletAddress: string;
  riskProfile: RiskProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: 'preservation' | 'growth' | 'maximum_returns';
  maxPositionSize: number;
  maxDailyLoss: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalPnL: number;
  dailyPnL: number;
  assets: Asset[];
  performance: PerformanceMetric[];
  lastUpdated: Date;
}

export interface Asset {
  symbol: string;
  name: string;
  address: string;
  amount: number;
  value: number;
  price: number;
  allocation: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Trade {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  fromToken: string;
  toToken: string;
  amount: number;
  price: number;
  value: number;
  gasUsed: number;
  slippage: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  agentId: string;
  signalId: string;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  indicators: TechnicalIndicator[];
  sentiment: SentimentData;
  timestamp: Date;
  agentId: string;
  status: 'active' | 'executed' | 'expired';
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

export interface SentimentData {
  overall: number;
  twitter: number;
  news: number;
  reddit?: number;
  sources: SentimentSource[];
}

export interface SentimentSource {
  platform: string;
  score: number;
  volume: number;
  timestamp: Date;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: 'data-scraper' | 'data-analyzer' | 'trade-executor' | 'trade-monitor';
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  uptime: number;
  requestsProcessed: number;
  errors: number;
  successRate: number;
  averageResponseTime: number;
}

export interface PerformanceMetric {
  date: Date;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  trades: number;
  winRate: number;
  sharpeRatio?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'trade' | 'signal' | 'alert' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
