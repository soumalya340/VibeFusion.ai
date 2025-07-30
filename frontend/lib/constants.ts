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
  CONSERVATIVE: { maxPositionSize: 0.05, stopLoss: 0.02, maxOpenPositions: 3 },
  MODERATE: { maxPositionSize: 0.1, stopLoss: 0.05, maxOpenPositions: 5 },
  AGGRESSIVE: { maxPositionSize: 0.2, stopLoss: 0.1, maxOpenPositions: 10 },
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
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function calculatePriceImpact(amountIn: number, reserveIn: number, reserveOut: number): number {
  const amountInWithFee = amountIn * 997;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000 + amountInWithFee;
  const amountOut = numerator / denominator;
  
  const priceImpact = (amountIn / reserveIn);
  return priceImpact;
}

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  PORTFOLIO_UPDATE: 'portfolio_update',
  TRADE_SIGNAL: 'trade_signal',
  AGENT_STATUS: 'agent_status',
  MARKET_DATA: 'market_data',
  ERROR: 'error',
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PORTFOLIO: '/api/portfolio',
  TRADING: '/api/trading',
  AGENTS: '/api/agents',
  MARKET_DATA: '/api/market-data',
};
