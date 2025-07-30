const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PortfolioService = require('../services/PortfolioService');

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

// @route   GET /api/portfolio/:walletAddress
// @desc    Get portfolio for wallet address
// @access  Public (for demo, should be private in production)
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        message: 'Please provide a valid Ethereum wallet address'
      });
    }

    const portfolio = await PortfolioService.getWalletPortfolio(walletAddress);
    
    if (!portfolio.success) {
      return res.status(500).json({
        error: 'Failed to fetch portfolio',
        message: portfolio.error
      });
    }

    res.json({
      success: true,
      data: portfolio.data
    });

  } catch (error) {
    console.error('Portfolio route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch portfolio data'
    });
  }
});

// @route   GET /api/portfolio/:walletAddress/history/:symbol
// @desc    Get historical price data for a token
// @access  Public
router.get('/:walletAddress/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;

    const historicalData = await PortfolioService.getHistoricalData(symbol, parseInt(days));
    
    if (!historicalData.success) {
      return res.status(500).json({
        error: 'Failed to fetch historical data',
        message: historicalData.error
      });
    }

    res.json({
      success: true,
      data: historicalData.data
    });

  } catch (error) {
    console.error('Historical data route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch historical data'
    });
  }
});

// @route   GET /api/portfolio/prices/current
// @desc    Get current prices for multiple tokens
// @access  Public
router.get('/prices/current', async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({
        error: 'Missing symbols parameter',
        message: 'Please provide comma-separated token symbols'
      });
    }

    const symbolsArray = symbols.split(',');
    const prices = await PortfolioService.getCurrentPrices(symbolsArray);

    res.json({
      success: true,
      data: prices
    });

  } catch (error) {
    console.error('Current prices route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch current prices'
    });
  }
});

// @route   GET /api/portfolio/wallet/:address
// @desc    Get real portfolio data for wallet address
// @access  Public
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate wallet address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    console.log(`📊 VibeFusion: Getting real portfolio for wallet ${address}`);
    
    const portfolio = await PortfolioService.getWalletPortfolio(address);
    
    if (portfolio.success) {
      res.json(portfolio);
    } else {
      res.status(500).json(portfolio);
    }
  } catch (error) {
    console.error('❌ Wallet portfolio route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet portfolio data'
    });
  }
});

// @route   GET /api/portfolio/historical/:symbol
// @desc    Get historical price data for a token
// @access  Public
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;
    
    console.log(`📈 VibeFusion: Getting historical data for ${symbol} (${days} days)`);
    
    const historicalData = await PortfolioService.getHistoricalData(symbol, parseInt(days));
    
    if (historicalData.success) {
      res.json(historicalData);
    } else {
      res.status(500).json(historicalData);
    }
  } catch (error) {
    console.error('❌ Historical data route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data'
    });
  }
});

module.exports = router;
