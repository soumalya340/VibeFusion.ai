class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    
    this.setupEventHandlers();
    this.startBroadcasting();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📡 Client connected: ${socket.id}`);

      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          // In production, verify the JWT token here
          
          this.connectedUsers.set(socket.id, { userId, socket });
          socket.join(`user:${userId}`);
          
          console.log(`✅ User ${userId} authenticated on socket ${socket.id}`);
          
          // Send initial data
          this.sendInitialData(socket, userId);
        } catch (error) {
          console.error('❌ Socket authentication error:', error);
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      socket.on('join-portfolio', (portfolioId) => {
        socket.join(`portfolio:${portfolioId}`);
        console.log(`📊 Socket ${socket.id} joined portfolio: ${portfolioId}`);
      });

      socket.on('join-trading', (userId) => {
        socket.join(`trading:${userId}`);
        console.log(`💰 Socket ${socket.id} joined trading room: ${userId}`);
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log(`📡 Client disconnected: ${socket.id}`);
      });
    });
  }

  async sendInitialData(socket, userId) {
    try {
      // Send mock portfolio data
      const portfolioData = {
        totalValue: 20000 + Math.random() * 5000,
        totalProfit: 1500 + Math.random() * 1000,
        totalProfitPercentage: 8.5 + Math.random() * 5,
        dailyChange: {
          value: Math.random() * 400 - 200,
          percentage: Math.random() * 4 - 2,
        },
      };

      socket.emit('portfolio-update', portfolioData);

      // Send mock trading signals
      const tradingSignals = [
        {
          id: 'signal-001',
          symbol: 'BTC/USDT',
          type: 'buy',
          confidence: 85,
          price: 42350.25,
          timestamp: new Date(),
        },
        {
          id: 'signal-002',
          symbol: 'ETH/USDT',
          type: 'sell',
          confidence: 72,
          price: 2580.75,
          timestamp: new Date(),
        },
      ];

      socket.emit('trading-signals', tradingSignals);

    } catch (error) {
      console.error('❌ Error sending initial data:', error);
    }
  }

  startBroadcasting() {
    // Broadcast portfolio updates every 30 seconds
    setInterval(() => {
      this.broadcastPortfolioUpdates();
    }, 30000);

    // Broadcast market data every 10 seconds
    setInterval(() => {
      this.broadcastMarketData();
    }, 10000);

    // Broadcast agent status every 60 seconds
    setInterval(() => {
      this.broadcastAgentStatus();
    }, 60000);
  }

  broadcastPortfolioUpdates() {
    const portfolioUpdate = {
      totalValue: 20000 + Math.random() * 5000,
      totalProfit: 1500 + Math.random() * 1000,
      totalProfitPercentage: 8.5 + Math.random() * 5,
      dailyChange: {
        value: Math.random() * 400 - 200,
        percentage: Math.random() * 4 - 2,
      },
      timestamp: new Date(),
    };

    this.io.emit('portfolio-update', portfolioUpdate);
    console.log('📊 Broadcasted portfolio update');
  }

  broadcastMarketData() {
    const marketData = {
      BTC: 42350.25 + Math.random() * 1000 - 500,
      ETH: 2580.75 + Math.random() * 200 - 100,
      ADA: 0.425 + Math.random() * 0.1 - 0.05,
      SOL: 105.80 + Math.random() * 20 - 10,
      MATIC: 0.85 + Math.random() * 0.2 - 0.1,
      timestamp: new Date(),
    };

    this.io.emit('market-data-update', marketData);
    console.log('📈 Broadcasted market data update');
  }

  broadcastAgentStatus() {
    const agentStatus = {
      'data-scraper': { status: 'active', uptime: 99.5 },
      'data-analyzer': { status: 'active', uptime: 98.9 },
      'trade-executor': { status: 'active', uptime: 99.9 },
      'trade-monitor': { status: 'active', uptime: 99.7 },
      timestamp: new Date(),
    };

    this.io.emit('agent-status-update', agentStatus);
    console.log('🤖 Broadcasted agent status update');
  }

  // Methods to send targeted updates
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  sendToPortfolio(portfolioId, event, data) {
    this.io.to(`portfolio:${portfolioId}`).emit(event, data);
  }

  sendTradeUpdate(userId, tradeData) {
    this.io.to(`trading:${userId}`).emit('trade-update', tradeData);
  }

  sendTradingSignal(signal) {
    this.io.emit('new-trading-signal', signal);
  }
}

module.exports = WebSocketService;
