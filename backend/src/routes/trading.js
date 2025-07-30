const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock trading data
const mockTradingSignals = [
  {
    id: 'signal-001',
    symbol: 'BTC/USDT',
    type: 'buy',
    price: 42350.25,
    confidence: 0.85,
    timeframe: '4h',
    reason: 'Strong bullish momentum with RSI oversold bounce',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'signal-002',
    symbol: 'ETH/USDT',
    type: 'sell',
    price: 2580.75,
    confidence: 0.72,
    timeframe: '1h',
    reason: 'Resistance level reached, bearish divergence detected',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'signal-003',
    symbol: 'ADA/USDT',
    type: 'buy',
    price: 0.425,
    confidence: 0.78,
    timeframe: '2h',
    reason: 'Breaking above key support level with volume',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

const mockRecentTrades = [
  {
    id: 'trade-001',
    symbol: 'BTC/USDT',
    type: 'buy',
    amount: 0.5,
    price: 42350.25,
    status: 'completed',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    profit: 125.50,
    agentId: 'trade-executor',
  },
  {
    id: 'trade-002',
    symbol: 'ETH/USDT',
    type: 'sell',
    amount: 2.8,
    price: 2580.75,
    status: 'completed',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    profit: -45.20,
    agentId: 'trade-executor',
  },
];

// @route   GET /api/trading/signals
// @desc    Get trading signals
// @access  Private
router.get('/signals', auth, async (req, res) => {
  try {
    const { limit = 10, symbol, type } = req.query;

    let signals = [...mockTradingSignals];

    // Filter by symbol if provided
    if (symbol) {
      signals = signals.filter(signal => 
        signal.symbol.toLowerCase().includes(symbol.toLowerCase())
      );
    }

    // Filter by type if provided
    if (type && ['buy', 'sell'].includes(type)) {
      signals = signals.filter(signal => signal.type === type);
    }

    // Sort by creation date (newest first)
    signals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results
    signals = signals.slice(0, parseInt(limit));

    res.json({
      success: true,
      signals,
      count: signals.length,
    });

  } catch (error) {
    console.error('❌ Get trading signals error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get trading signals',
    });
  }
});

// @route   GET /api/trading/trades
// @desc    Get trading history
// @access  Private
router.get('/trades', auth, async (req, res) => {
  try {
    const { limit = 50, status, symbol } = req.query;

    let trades = [...mockRecentTrades];

    // Filter by status if provided
    if (status) {
      trades = trades.filter(trade => trade.status === status);
    }

    // Filter by symbol if provided
    if (symbol) {
      trades = trades.filter(trade => 
        trade.symbol.toLowerCase().includes(symbol.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    trades = trades.slice(0, parseInt(limit));

    // Calculate summary statistics
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    const totalProfit = completedTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const winningTrades = completedTrades.filter(trade => trade.profit > 0);
    const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0;

    res.json({
      success: true,
      trades,
      summary: {
        totalTrades: trades.length,
        completedTrades: completedTrades.length,
        totalProfit: totalProfit,
        winRate: winRate,
        avgProfit: completedTrades.length > 0 ? totalProfit / completedTrades.length : 0,
      },
    });

  } catch (error) {
    console.error('❌ Get trading history error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get trading history',
    });
  }
});

// @route   POST /api/trading/execute
// @desc    Execute a trade
// @access  Private
router.post('/execute', auth, [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('type').isIn(['buy', 'sell']).withMessage('Type must be buy or sell'),
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('price').optional().isNumeric().withMessage('Price must be numeric'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symbol, type, amount, price } = req.body;

    // In a real implementation, you would:
    // 1. Validate user has sufficient balance
    // 2. Check risk management rules
    // 3. Execute trade via exchange API
    // 4. Update portfolio
    // 5. Record trade in database

    // For now, simulate trade execution
    const trade = {
      id: `trade-${Date.now()}`,
      userId: req.user.userId,
      symbol: symbol.toUpperCase(),
      type,
      amount: parseFloat(amount),
      price: price ? parseFloat(price) : null,
      status: 'pending',
      timestamp: new Date(),
      agentId: 'manual',
    };

    // Simulate processing delay
    setTimeout(() => {
      trade.status = 'completed';
      trade.profit = Math.random() * 100 - 50; // Random profit/loss for demo
    }, 2000);

    res.json({
      success: true,
      message: 'Trade submitted successfully',
      trade,
    });

  } catch (error) {
    console.error('❌ Execute trade error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to execute trade',
    });
  }
});

// @route   POST /api/trading/signals/:signalId/follow
// @desc    Follow a trading signal
// @access  Private
router.post('/signals/:signalId/follow', auth, [
  body('amount').isNumeric().withMessage('Amount must be numeric'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { signalId } = req.params;
    const { amount } = req.body;

    // Find the signal
    const signal = mockTradingSignals.find(s => s.id === signalId);
    
    if (!signal) {
      return res.status(404).json({
        error: 'Signal not found',
        message: 'Trading signal not found',
      });
    }

    // Create trade based on signal
    const trade = {
      id: `trade-${Date.now()}`,
      userId: req.user.userId,
      signalId: signalId,
      symbol: signal.symbol,
      type: signal.type,
      amount: parseFloat(amount),
      price: signal.price,
      status: 'pending',
      timestamp: new Date(),
      agentId: 'trade-executor',
    };

    res.json({
      success: true,
      message: 'Signal followed successfully',
      trade,
    });

  } catch (error) {
    console.error('❌ Follow signal error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to follow signal',
    });
  }
});

// @route   GET /api/trading/performance
// @desc    Get trading performance metrics
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // In a real implementation, you would query the database
    // For now, return mock performance data
    const performance = {
      totalTrades: 247,
      winningTrades: 169,
      losingTrades: 78,
      winRate: 68.4,
      totalProfit: 2847.50,
      totalLoss: -1234.80,
      netProfit: 1612.70,
      averageWin: 125.30,
      averageLoss: -45.20,
      profitFactor: 2.31,
      sharpeRatio: 1.8,
      maxDrawdown: 8.5,
      recoveryFactor: 4.2,
      expectedValue: 6.53,
      bestTrade: 450.25,
      worstTrade: -89.50,
      averageHoldTime: '4h 23m',
      profitsByMonth: [
        { month: '2024-01', profit: 234.50 },
        { month: '2024-02', profit: 456.20 },
        { month: '2024-03', profit: 678.90 },
        { month: '2024-04', profit: 345.60 },
        { month: '2024-05', profit: 567.80 },
        { month: '2024-06', profit: 789.00 },
      ],
    };

    res.json({
      success: true,
      performance,
      period,
    });

  } catch (error) {
    console.error('❌ Get trading performance error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get trading performance',
    });
  }
});

// @route   GET /api/trading/risk-analysis
// @desc    Get risk analysis for current positions
// @access  Private
router.get('/risk-analysis', auth, async (req, res) => {
  try {
    // In a real implementation, you would analyze current positions
    const riskAnalysis = {
      totalExposure: 15420.50,
      riskPerTrade: 3.5, // percentage
      portfolioRisk: 12.8, // percentage
      correlationRisk: 'Medium',
      liquidityRisk: 'Low',
      concentrationRisk: 'High',
      recommendations: [
        'Consider reducing BTC position size to improve diversification',
        'Current risk per trade is within acceptable limits',
        'Portfolio correlation with market is moderate',
        'Consider adding defensive assets during high volatility',
      ],
      metrics: {
        var95: -245.80, // Value at Risk 95%
        var99: -567.30, // Value at Risk 99%
        expectedShortfall: -678.90,
        beta: 1.2,
        volatility: 15.4,
        maxDrawdown: 8.5,
      },
    };

    res.json({
      success: true,
      riskAnalysis,
    });

  } catch (error) {
    console.error('❌ Get risk analysis error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get risk analysis',
    });
  }
});

module.exports = router;
