const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @route   POST /api/auth/connect-wallet
 * @desc    Connect wallet and authenticate user
 * @access  Public
 */
router.post('/connect-wallet', [
  body('walletAddress')
    .isLength({ min: 40, max: 42 })
    .withMessage('Invalid wallet address format'),
  body('signature')
    .notEmpty()
    .withMessage('Signature is required'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { walletAddress, signature, message } = req.body;

    // TODO: Verify signature with ethers.js
    // For now, we'll skip signature verification in development
    const isSignatureValid = true; // await verifySignature(message, signature, walletAddress);

    if (!isSignatureValid) {
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Wallet signature verification failed',
      });
    }

    // Find or create user
    let user = await User.findByWallet(walletAddress);
    
    if (!user) {
      // Create new user
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
      });
      await user.save();

      // Create portfolio for new user
      const portfolio = new Portfolio({
        userId: user._id,
        walletAddress: walletAddress.toLowerCase(),
      });
      await portfolio.save();

      console.log(`✅ New user created: ${walletAddress}`);
    } else {
      // Update last activity
      await user.updateActivity();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        walletAddress: user.walletAddress 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Wallet connected successfully',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        riskProfile: user.riskProfile,
        tradingPreferences: user.tradingPreferences,
        subscription: user.subscription,
        isNewUser: !user.riskProfile.assessmentCompleted,
      },
    });

  } catch (error) {
    console.error('❌ Connect wallet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to connect wallet',
    });
  }
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token and return user data
 * @access  Private
 */
router.post('/verify-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-__v')
      .populate('portfolio');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Associated user account not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        riskProfile: user.riskProfile,
        tradingPreferences: user.tradingPreferences,
        subscription: user.subscription,
        activity: user.activity,
        settings: user.settings,
      },
      portfolio: user.portfolio,
    });

  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify token',
    });
  }
});

/**
 * @route   POST /api/auth/risk-assessment
 * @desc    Complete user risk assessment
 * @access  Private
 */
router.post('/risk-assessment', [
  authMiddleware,
  body('riskTolerance')
    .isIn(['conservative', 'moderate', 'aggressive'])
    .withMessage('Invalid risk tolerance level'),
  body('investmentExperience')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid investment experience level'),
  body('investmentGoals')
    .isArray({ min: 1 })
    .withMessage('At least one investment goal is required'),
  body('maxRiskPerTrade')
    .isFloat({ min: 1, max: 25 })
    .withMessage('Max risk per trade must be between 1% and 25%'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const {
      riskTolerance,
      investmentExperience,
      investmentGoals,
      maxRiskPerTrade,
      preferredAssets,
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Update risk profile
    await user.completeRiskAssessment({
      riskTolerance,
      investmentExperience,
      investmentGoals,
      maxRiskPerTrade,
      preferredAssets: preferredAssets || [],
    });

    res.status(200).json({
      success: true,
      message: 'Risk assessment completed successfully',
      riskProfile: user.riskProfile,
    });

  } catch (error) {
    console.error('❌ Risk assessment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save risk assessment',
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  authMiddleware,
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Update allowed fields
    const allowedUpdates = ['username', 'email', 'profileImage'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile',
    });
  }
});

/**
 * @route   PUT /api/auth/trading-preferences
 * @desc    Update trading preferences
 * @access  Private
 */
router.put('/trading-preferences', [
  authMiddleware,
  body('autoTradingEnabled')
    .optional()
    .isBoolean()
    .withMessage('Auto trading must be a boolean'),
  body('maxDailyTrades')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max daily trades must be between 1 and 100'),
  body('tradingBudget')
    .optional()
    .isFloat({ min: 100 })
    .withMessage('Trading budget must be at least $100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Update trading preferences
    const allowedUpdates = [
      'autoTradingEnabled',
      'maxDailyTrades', 
      'tradingBudget',
      'stopLossPercentage',
      'takeProfitPercentage'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user.tradingPreferences[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Trading preferences updated successfully',
      tradingPreferences: user.tradingPreferences,
    });

  } catch (error) {
    console.error('❌ Trading preferences error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update trading preferences',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we'll just return success and let the client remove the token

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to logout',
    });
  }
});

module.exports = router;
