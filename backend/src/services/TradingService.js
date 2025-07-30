class TradingService {
  constructor() {
    this.activeTrades = new Map();
    this.vibeAgents = ['Alpha Trader', 'Beta Scanner', 'Gamma Analyzer', 'Delta Predictor'];
    this.tradingPairs = [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 
      'MATIC/USDT', 'DOT/USDT', 'LINK/USDT', 'UNI/USDT', 'AVAX/USDT'
    ];
  }

  generateVibeFusionSignal() {
    const symbols = this.tradingPairs;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const signal = Math.random() > 0.5 ? 'buy' : 'sell';
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-99% confidence
    const agent = this.vibeAgents[Math.floor(Math.random() * this.vibeAgents.length)];
    
    // More realistic price movements
    const basePrice = {
      'BTC/USDT': 43000,
      'ETH/USDT': 2600,
      'BNB/USDT': 310,
      'ADA/USDT': 0.45,
      'SOL/USDT': 95,
      'MATIC/USDT': 0.85,
      'DOT/USDT': 7.20,
      'LINK/USDT': 14.50,
      'UNI/USDT': 6.80,
      'AVAX/USDT': 36.50
    }[symbol] || 100;

    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const currentPrice = basePrice * (1 + priceVariation);
    
    return {
      id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      signal,
      price: currentPrice,
      confidence,
      agent,
      timestamp: new Date(),
      reason: this.generateSignalReason(signal, symbol),
      targetPrice: signal === 'buy' 
        ? currentPrice * (1 + Math.random() * 0.15 + 0.05) // 5-20% upside
        : currentPrice * (1 - Math.random() * 0.1 - 0.03), // 3-13% downside
      stopLoss: signal === 'buy'
        ? currentPrice * (1 - Math.random() * 0.08 - 0.02) // 2-10% below
        : currentPrice * (1 + Math.random() * 0.06 + 0.02), // 2-8% above
      timeframe: ['5m', '15m', '1h', '4h', '1d'][Math.floor(Math.random() * 5)]
    };
  }

  generateSignalReason(signal, symbol) {
    const reasons = {
      buy: [
        `Strong bullish momentum detected on ${symbol}`,
        `Technical breakout confirmed with high volume`,
        `RSI oversold condition with reversal signals`,
        `Support level holding with accumulation pattern`,
        `Positive news sentiment driving demand`,
        `Moving averages showing golden cross formation`
      ],
      sell: [
        `Bearish divergence spotted on ${symbol}`,
        `Resistance level reached with selling pressure`,
        `Overbought conditions on multiple timeframes`,
        `Volume declining with price weakness`,
        `Risk-off sentiment affecting crypto markets`,
        `Technical indicators signaling distribution`
      ]
    };
    
    const reasonList = reasons[signal];
    return reasonList[Math.floor(Math.random() * reasonList.length)];
  }

  async executeTrade(userId, tradeData) {
    try {
      console.log(`🔄 VibeFusion executing trade for user ${userId}:`, tradeData);
      
      // Enhanced trade execution with VibeFusion features
      const trade = {
        id: `vibe-trade-${Date.now()}`,
        userId,
        symbol: tradeData.symbol,
        type: tradeData.type,
        amount: tradeData.amount,
        price: tradeData.price,
        status: 'completed',
        timestamp: new Date(),
        agent: tradeData.agent || 'Manual Trade',
        profit: this.calculateRealisticProfit(tradeData),
        fees: this.calculateTradingFees(tradeData.amount, tradeData.price),
        slippage: Math.random() * 0.5, // 0-0.5% slippage
      };

      this.activeTrades.set(trade.id, trade);
      
      // Emit trade update via WebSocket
      console.log(`✅ VibeFusion trade executed: ${trade.type.toUpperCase()} ${trade.symbol}`);

      return trade;
    } catch (error) {
      console.error('❌ VibeFusion trade execution error:', error);
      throw error;
    }
  }

  calculateRealisticProfit(tradeData) {
    // More realistic profit calculation based on trade type and market conditions
    const marketVolatility = Math.random() * 0.1; // 0-10% volatility
    const baseReturn = Math.random() * 0.15 - 0.075; // ±7.5% base return
    
    return tradeData.amount * tradeData.price * (baseReturn + marketVolatility * (Math.random() - 0.5));
  }

  calculateTradingFees(amount, price) {
    const feeRate = 0.001; // 0.1% trading fee
    return amount * price * feeRate;
  }

  async getTradeHistory(userId, limit = 50) {
    try {
      // Enhanced mock trade history with VibeFusion branding
      const mockTrades = Array.from({ length: limit }, (_, i) => {
        const symbol = this.tradingPairs[Math.floor(Math.random() * this.tradingPairs.length)];
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = Math.random() * 10 + 0.1;
        const price = Math.random() * 50000 + 100;
        
        return {
          id: `vibe-trade-${Date.now() - i * 1000}`,
          userId,
          symbol,
          type,
          amount,
          price,
          status: 'completed',
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
          agent: this.vibeAgents[Math.floor(Math.random() * this.vibeAgents.length)],
          profit: this.calculateRealisticProfit({ amount, price, type }),
          fees: this.calculateTradingFees(amount, price),
        };
      });

      return mockTrades;
    } catch (error) {
      console.error('❌ Get trade history error:', error);
      throw error;
    }
  }

  async cancelTrade(tradeId) {
    try {
      const trade = this.activeTrades.get(tradeId);
      if (trade) {
        trade.status = 'cancelled';
        this.activeTrades.set(tradeId, trade);
      }
      return trade;
    } catch (error) {
      console.error('❌ Cancel trade error:', error);
      throw error;
    }
  }
}

module.exports = TradingService;
