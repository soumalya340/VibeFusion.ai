export interface TradingSignal {
  id: string;
  agent: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXECUTED';
  potentialReturn?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'MAINTENANCE';
  profit24h: number;
  totalTrades: number;
  winRate: number;
  specialty: string;
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  avatar: string;
}

export class TradingService {
  private static agents: Agent[] = [
    {
      id: 'defi-arbitrage',
      name: 'DeFi Arbitrage Master',
      description: 'Exploits price differences across DEXs',
      status: 'ACTIVE',
      profit24h: 342.50,
      totalTrades: 47,
      winRate: 78.5,
      specialty: 'Arbitrage',
      riskLevel: 'MODERATE',
      avatar: '🔄'
    },
    {
      id: 'trend-momentum',
      name: 'Trend Momentum Bot',
      description: 'Follows strong market trends and momentum',
      status: 'ACTIVE',
      profit24h: 289.75,
      totalTrades: 32,
      winRate: 71.2,
      specialty: 'Trend Following',
      riskLevel: 'MODERATE',
      avatar: '📈'
    },
    {
      id: 'mean-reversion',
      name: 'Mean Reversion Expert',
      description: 'Profits from price reversals to mean',
      status: 'ACTIVE',
      profit24h: 156.80,
      totalTrades: 23,
      winRate: 83.1,
      specialty: 'Contrarian',
      riskLevel: 'CONSERVATIVE',
      avatar: '⚖️'
    },
    {
      id: 'yield-optimizer',
      name: 'Yield Farming Optimizer',
      description: 'Maximizes returns through yield strategies',
      status: 'ACTIVE',
      profit24h: 198.45,
      totalTrades: 18,
      winRate: 89.4,
      specialty: 'DeFi Yield',
      riskLevel: 'CONSERVATIVE',
      avatar: '🌾'
    },
    {
      id: 'mev-protector',
      name: 'MEV Protection Agent',
      description: 'Protects against MEV attacks and front-running',
      status: 'PAUSED',
      profit24h: 0,
      totalTrades: 0,
      winRate: 92.1,
      specialty: 'Protection',
      riskLevel: 'CONSERVATIVE',
      avatar: '🛡️'
    }
  ];

  private static mockSignals: TradingSignal[] = [
    {
      id: 'signal-1',
      agent: 'Trend Momentum Bot',
      type: 'BUY',
      symbol: 'ETH',
      price: 2580.75,
      targetPrice: 2780.00,
      stopLoss: 2450.00,
      confidence: 87,
      reasoning: 'Strong upward momentum detected with high volume. RSI shows room for growth. Key resistance level broken.',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'PENDING',
      potentialReturn: 7.7,
      riskLevel: 'MEDIUM'
    },
    {
      id: 'signal-2',
      agent: 'DeFi Arbitrage Master',
      type: 'BUY',
      symbol: 'UNI',
      price: 6.75,
      targetPrice: 7.20,
      confidence: 92,
      reasoning: 'Arbitrage opportunity detected between Uniswap and Binance. 4.2% spread available.',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'PENDING',
      potentialReturn: 6.7,
      riskLevel: 'LOW'
    },
    {
      id: 'signal-3',
      agent: 'Mean Reversion Expert',
      type: 'SELL',
      symbol: 'MATIC',
      price: 0.85,
      targetPrice: 0.78,
      stopLoss: 0.89,
      confidence: 75,
      reasoning: 'Price has deviated significantly from 20-day moving average. Expecting reversion to mean.',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      status: 'PENDING',
      potentialReturn: 8.2,
      riskLevel: 'MEDIUM'
    }
  ];

  static getAgents(): Agent[] {
    return this.agents;
  }

  static getActiveAgents(): Agent[] {
    return this.agents.filter(agent => agent.status === 'ACTIVE');
  }

  static getSignals(): TradingSignal[] {
    return this.mockSignals.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static getPendingSignals(): TradingSignal[] {
    return this.mockSignals.filter(signal => signal.status === 'PENDING');
  }

  static acceptSignal(signalId: string): boolean {
    const signal = this.mockSignals.find(s => s.id === signalId);
    if (signal) {
      signal.status = 'ACCEPTED';
      return true;
    }
    return false;
  }

  static declineSignal(signalId: string): boolean {
    const signal = this.mockSignals.find(s => s.id === signalId);
    if (signal) {
      signal.status = 'DECLINED';
      return true;
    }
    return false;
  }

  static getAgentPerformance(agentId: string) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return null;

    // Mock historical performance data
    const performanceData = {
      totalReturn: Math.random() * 40 + 10, // 10-50%
      weeklyReturn: Math.random() * 8 + 2,  // 2-10%
      monthlyReturn: Math.random() * 15 + 5, // 5-20%
      sharpeRatio: Math.random() * 2 + 1,   // 1-3
      maxDrawdown: -(Math.random() * 10 + 3), // -3% to -13%
      volatility: Math.random() * 20 + 10,   // 10-30%
      tradingHistory: Array.from({ length: 20 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        return: (Math.random() - 0.4) * 10 // Random returns between -4% and 6%
      }))
    };

    return performanceData;
  }

  static async fetchMarketData() {
    try {
      // In a real app, this would fetch from multiple sources
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,uniswap,chainlink,aave,compound,polygon,matic-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          BTC: { price: data.bitcoin?.usd || 43250, change24h: data.bitcoin?.usd_24h_change || 2.5 },
          ETH: { price: data.ethereum?.usd || 2580, change24h: data.ethereum?.usd_24h_change || 1.8 },
          UNI: { price: data.uniswap?.usd || 6.75, change24h: data.uniswap?.usd_24h_change || 3.2 },
          LINK: { price: data.chainlink?.usd || 15.20, change24h: data.chainlink?.usd_24h_change || 0.9 },
          AAVE: { price: data.aave?.usd || 95.40, change24h: data.aave?.usd_24h_change || -1.2 },
          COMP: { price: data.compound?.usd || 58.30, change24h: data.compound?.usd_24h_change || 2.1 },
          MATIC: { price: data['matic-network']?.usd || 0.85, change24h: data['matic-network']?.usd_24h_change || -0.5 }
        }
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return {
        success: false,
        error: 'Failed to fetch market data',
        data: null
      };
    }
  }

  static generateNewSignal(): TradingSignal {
    const agents = ['Trend Momentum Bot', 'DeFi Arbitrage Master', 'Mean Reversion Expert', 'Yield Farming Optimizer'];
    const symbols = ['ETH', 'BTC', 'UNI', 'LINK', 'AAVE', 'MATIC'];
    const types: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
    const risks: ('LOW' | 'MEDIUM' | 'HIGH')[] = ['LOW', 'MEDIUM', 'HIGH'];

    const agent = agents[Math.floor(Math.random() * agents.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const price = Math.random() * 1000 + 100;
    
    return {
      id: `signal-${Date.now()}`,
      agent,
      type,
      symbol,
      price: Math.round(price * 100) / 100,
      targetPrice: type === 'BUY' ? price * 1.08 : price * 0.92,
      stopLoss: type === 'BUY' ? price * 0.95 : price * 1.05,
      confidence: Math.floor(Math.random() * 30) + 70,
      reasoning: `AI analysis indicates ${type.toLowerCase()} opportunity based on technical indicators and market sentiment.`,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      potentialReturn: Math.random() * 10 + 2,
      riskLevel: risks[Math.floor(Math.random() * risks.length)]
    };
  }
}

export default TradingService;
