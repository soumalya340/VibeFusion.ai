const express = require('express');
const router = express.Router();

// GET /api/market-data/prices
router.get('/prices', async (req, res) => {
  try {
    // Mock market data for development
    const mockPrices = {
      BTC: 42350.25,
      ETH: 2580.75,
      ADA: 0.425,
      SOL: 105.80,
      MATIC: 0.85,
      DOT: 8.45,
      LINK: 15.20,
      UNI: 6.75,
    };

    res.json({
      success: true,
      data: mockPrices,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Market data error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch market data',
    });
  }
});

// GET /api/market-data/signals
router.get('/signals', async (req, res) => {
  try {
    // Mock trading signals for development
    const mockSignals = [
      {
        id: 'signal-001',
        symbol: 'BTC/USDT',
        type: 'buy',
        confidence: 85,
        price: 42350.25,
        target: 45000,
        stopLoss: 40000,
        reason: 'Strong bullish momentum with RSI oversold recovery',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        agentId: 'data-analyzer',
      },
      {
        id: 'signal-002',
        symbol: 'ETH/USDT',
        type: 'sell',
        confidence: 72,
        price: 2580.75,
        target: 2400,
        stopLoss: 2650,
        reason: 'Resistance at current level, potential correction',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        agentId: 'data-analyzer',
      },
    ];

    res.json({
      success: true,
      data: mockSignals,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Trading signals error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch trading signals',
    });
  }
});

module.exports = router;
