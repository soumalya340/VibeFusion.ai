import { ethers } from 'ethers';

export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-mainnet.alchemyapi.io/v2/',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
};

export const POPULAR_TOKENS = {
  ethereum: [
    { symbol: 'ETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
    { symbol: 'USDC', address: '0xA0b86a33E6428C8d3D6e4C0b10C47F0d32c2A3FE', decimals: 6 },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
    { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  ],
  polygon: [
    { symbol: 'MATIC', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18 },
    { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18 },
    { symbol: 'WBTC', address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', decimals: 8 },
  ],
};

export const TRADING_CONSTANTS = {
  MAX_SLIPPAGE: 0.05, // 5%
  MIN_TRADE_SIZE_USD: 10,
  GAS_LIMIT_MULTIPLIER: 1.2,
  PRICE_IMPACT_WARNING: 0.03, // 3%
  DEADLINE_MINUTES: 20,
};

export const RISK_PARAMETERS = {
  conservative: {
    maxPositionSize: 0.1, // 10% of portfolio
    maxDailyLoss: 0.02, // 2%
    allowedAssets: ['ETH', 'WBTC', 'USDC', 'USDT'],
    maxLeverage: 1,
  },
  moderate: {
    maxPositionSize: 0.25, // 25% of portfolio
    maxDailyLoss: 0.05, // 5%
    allowedAssets: ['ETH', 'WBTC', 'USDC', 'USDT', 'UNI', 'LINK', 'MATIC'],
    maxLeverage: 2,
  },
  aggressive: {
    maxPositionSize: 0.5, // 50% of portfolio
    maxDailyLoss: 0.1, // 10%
    allowedAssets: [], // All assets allowed
    maxLeverage: 5,
  },
};

export const TECHNICAL_INDICATORS = {
  RSI: {
    oversold: 30,
    overbought: 70,
    period: 14,
  },
  MACD: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  BOLLINGER_BANDS: {
    period: 20,
    stdDev: 2,
  },
  SMA: {
    shortPeriod: 10,
    longPeriod: 50,
  },
  EMA: {
    shortPeriod: 12,
    longPeriod: 26,
  },
};

export const API_ENDPOINTS = {
  coingecko: 'https://api.coingecko.com/api/v3',
  newsapi: 'https://newsapi.org/v2',
  alphavantage: 'https://www.alphavantage.co/query',
  twitter: 'https://api.twitter.com/2',
  oneinch: 'https://api.1inch.io/v5.0',
  uniswap: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
};

export const WEBSOCKET_EVENTS = {
  PRICE_UPDATE: 'price_update',
  SIGNAL_GENERATED: 'signal_generated',
  TRADE_EXECUTED: 'trade_executed',
  PORTFOLIO_UPDATE: 'portfolio_update',
  AGENT_STATUS: 'agent_status',
  NOTIFICATION: 'notification',
  ERROR: 'error',
};

export const AGENT_TYPES = {
  DATA_SCRAPER: 'data-scraper',
  DATA_ANALYZER: 'data-analyzer',
  TRADE_EXECUTOR: 'trade-executor',
  TRADE_MONITOR: 'trade-monitor',
} as const;

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 4): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function calculatePnL(currentValue: number, initialValue: number): { pnl: number; percentage: number } {
  const pnl = currentValue - initialValue;
  const percentage = initialValue > 0 ? pnl / initialValue : 0;
  return { pnl, percentage };
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
}

export function validateEthereumAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

export function parseTokenAmount(amount: string, decimals: number): string {
  return ethers.utils.parseUnits(amount, decimals).toString();
}

export function formatTokenAmount(amount: string, decimals: number): string {
  return ethers.utils.formatUnits(amount, decimals);
}
