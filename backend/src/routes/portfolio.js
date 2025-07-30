const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.userId })
      .populate('user', 'username walletAddress');

    if (!portfolio) {
      // Create new portfolio for user
      const user = await User.findById(req.user.userId);
      portfolio = new Portfolio({
        userId: req.user.userId,
        walletAddress: user.walletAddress,
      });
      await portfolio.save();
    }

    res.json({
      success: true,
      portfolio,
    });

  } catch (error) {
    console.error('❌ Get portfolio error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get portfolio',
    });
  }
});

// @route   POST /api/portfolio/sync
// @desc    Sync portfolio with blockchain data
// @access  Private
router.post('/sync', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found',
        message: 'Portfolio not found for user',
      });
    }

    // In a real implementation, you would:
    // 1. Query blockchain for wallet balance
    // 2. Get current prices from market data API
    // 3. Update portfolio with real data
    
    // For now, simulate with mock data
    const mockPriceData = {
      'BTC': 42350.25,
      'ETH': 2580.75,
      'ADA': 0.425,
      'SOL': 105.80,
      'MATIC': 0.85,
    };

    await portfolio.updatePrices(mockPriceData);
    portfolio.addPerformanceRecord();
    portfolio.calculateRiskMetrics();

    res.json({
      success: true,
      message: 'Portfolio synced successfully',
      portfolio,
    });

  } catch (error) {
    console.error('❌ Sync portfolio error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to sync portfolio',
    });
  }
});

// @route   POST /api/portfolio/add-asset
// @desc    Add asset to portfolio
// @access  Private
router.post('/add-asset', auth, [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('name').notEmpty().withMessage('Asset name is required'),
  body('balance').isNumeric().withMessage('Balance must be numeric'),
  body('averagePrice').isNumeric().withMessage('Average price must be numeric'),
  body('currentPrice').isNumeric().withMessage('Current price must be numeric'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found',
        message: 'Portfolio not found for user',
      });
    }

    const { symbol, name, balance, averagePrice, currentPrice } = req.body;

    const assetData = {
      symbol: symbol.toUpperCase(),
      name,
      balance: parseFloat(balance),
      averagePrice: parseFloat(averagePrice),
      currentPrice: parseFloat(currentPrice),
      value: parseFloat(balance) * parseFloat(currentPrice),
      profit: (parseFloat(currentPrice) - parseFloat(averagePrice)) * parseFloat(balance),
      profitPercentage: ((parseFloat(currentPrice) - parseFloat(averagePrice)) / parseFloat(averagePrice)) * 100,
    };

    await portfolio.addAsset(assetData);

    res.json({
      success: true,
      message: 'Asset added to portfolio',
      portfolio,
    });

  } catch (error) {
    console.error('❌ Add asset error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to add asset',
    });
  }
});

// @route   DELETE /api/portfolio/remove-asset/:symbol
// @desc    Remove asset from portfolio
// @access  Private
router.delete('/remove-asset/:symbol', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found',
        message: 'Portfolio not found for user',
      });
    }

    const { symbol } = req.params;
    const { amount } = req.body;

    await portfolio.removeAsset(symbol.toUpperCase(), amount ? parseFloat(amount) : null);

    res.json({
      success: true,
      message: 'Asset removed from portfolio',
      portfolio,
    });

  } catch (error) {
    console.error('❌ Remove asset error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to remove asset',
    });
  }
});

// @route   GET /api/portfolio/performance
// @desc    Get portfolio performance history
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found',
        message: 'Portfolio not found for user',
      });
    }

    const { period = '30d' } = req.query;
    let days = 30;

    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      case '1y':
        days = 365;
        break;
      default:
        days = 30;
    }

    const performanceData = portfolio.performanceHistory
      .slice(-days)
      .map(record => ({
        date: record.date,
        totalValue: record.totalValue,
        dailyReturn: record.dailyReturn,
        cumulativeReturn: record.cumulativeReturn,
      }));

    res.json({
      success: true,
      performance: performanceData,
      riskMetrics: portfolio.riskMetrics,
      summary: {
        totalValue: portfolio.totalValue,
        totalProfit: portfolio.totalProfit,
        totalProfitPercentage: portfolio.totalProfitPercentage,
        dailyChange: portfolio.dailyChange,
      },
    });

  } catch (error) {
    console.error('❌ Get performance error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get performance data',
    });
  }
});

// @route   GET /api/portfolio/analytics
// @desc    Get portfolio analytics and insights
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found',
        message: 'Portfolio not found for user',
      });
    }

    // Calculate analytics
    const analytics = {
      assetAllocation: portfolio.assets.map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        allocation: asset.allocation,
        value: asset.value,
        change24h: asset.profitPercentage,
      })),
      diversification: portfolio.diversification,
      riskMetrics: portfolio.riskMetrics,
      topPerformers: portfolio.assets
        .filter(asset => asset.profitPercentage > 0)
        .sort((a, b) => b.profitPercentage - a.profitPercentage)
        .slice(0, 5),
      underPerformers: portfolio.assets
        .filter(asset => asset.profitPercentage < 0)
        .sort((a, b) => a.profitPercentage - b.profitPercentage)
        .slice(0, 5),
    };

    res.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get analytics',
    });
  }
});

module.exports = router;
