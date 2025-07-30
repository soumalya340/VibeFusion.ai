const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock AI agents data
const mockAgents = [
  {
    id: 'trade-executor',
    name: 'Trade Executor',
    type: 'trading',
    status: 'active',
    description: 'Executes trades based on signals with risk management',
    performance: {
      winRate: 72.5,
      totalTrades: 156,
      profit: 2847.50,
      averageHoldTime: '4h 23m',
      sharpeRatio: 1.8,
    },
    settings: {
      riskPerTrade: 2.5,
      maxPositions: 5,
      stopLoss: 3.0,
      takeProfit: 6.0,
    },
    lastActive: new Date(Date.now() - 2 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'market-analyzer',
    name: 'Market Analyzer',
    type: 'analysis',
    status: 'active',
    description: 'Analyzes market trends and generates trading signals',
    performance: {
      accuracy: 84.2,
      totalSignals: 324,
      successfulSignals: 273,
      averageConfidence: 78.5,
      responseTime: '1.2s',
    },
    settings: {
      timeframes: ['1h', '4h', '1d'],
      indicators: ['RSI', 'MACD', 'EMA', 'Volume'],
      confidenceThreshold: 70,
    },
    lastActive: new Date(Date.now() - 30 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    type: 'risk',
    status: 'active',
    description: 'Monitors and manages portfolio risk in real-time',
    performance: {
      riskReductions: 45,
      portfolioProtection: 95.8,
      maxDrawdownPrevented: 12.3,
      avgResponseTime: '0.8s',
    },
    settings: {
      maxPortfolioRisk: 15,
      correlationLimit: 0.7,
      volatilityThreshold: 25,
      stopLossLevel: 5,
    },
    lastActive: new Date(Date.now() - 1 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'portfolio-optimizer',
    name: 'Portfolio Optimizer',
    type: 'optimization',
    status: 'paused',
    description: 'Optimizes portfolio allocation and rebalancing',
    performance: {
      optimizations: 28,
      performanceImprovement: 18.7,
      sharpeRatioIncrease: 0.4,
      rebalanceFrequency: '7d',
    },
    settings: {
      rebalanceThreshold: 10,
      minAllocation: 2,
      maxAllocation: 30,
      rebalanceFrequency: 'weekly',
    },
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
];

// @route   GET /api/agents
// @desc    Get all AI agents
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query;

    let agents = [...mockAgents];

    // Filter by status if provided
    if (status) {
      agents = agents.filter(agent => agent.status === status);
    }

    // Filter by type if provided
    if (type) {
      agents = agents.filter(agent => agent.type === type);
    }

    // Calculate overall statistics
    const totalAgents = agents.length;
    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const totalTrades = agents.reduce((sum, agent) => 
      sum + (agent.performance.totalTrades || 0), 0
    );
    const avgWinRate = agents.filter(agent => agent.performance.winRate)
      .reduce((sum, agent, _, arr) => sum + agent.performance.winRate / arr.length, 0);

    res.json({
      success: true,
      agents,
      statistics: {
        totalAgents,
        activeAgents,
        totalTrades,
        avgWinRate: Math.round(avgWinRate * 10) / 10,
      },
    });

  } catch (error) {
    console.error('❌ Get agents error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get AI agents',
    });
  }
});

// @route   GET /api/agents/:agentId
// @desc    Get specific agent details
// @access  Private
router.get('/:agentId', auth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = mockAgents.find(a => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Add detailed performance history (mock data)
    const agentDetails = {
      ...agent,
      performanceHistory: [
        { date: '2024-01', winRate: 68.5, profit: 234.50, trades: 45 },
        { date: '2024-02', winRate: 71.2, profit: 456.20, trades: 52 },
        { date: '2024-03', winRate: 74.8, profit: 678.90, trades: 48 },
        { date: '2024-04', winRate: 69.3, profit: 345.60, trades: 41 },
        { date: '2024-05', winRate: 75.1, profit: 567.80, trades: 55 },
        { date: '2024-06', winRate: 72.5, profit: 789.00, trades: 39 },
      ],
      recentActions: [
        {
          id: 'action-001',
          type: 'trade_executed',
          description: 'Executed buy order for BTC/USDT',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          result: 'success',
        },
        {
          id: 'action-002',
          type: 'signal_generated',
          description: 'Generated sell signal for ETH/USDT',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          result: 'success',
        },
        {
          id: 'action-003',
          type: 'risk_check',
          description: 'Performed portfolio risk assessment',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          result: 'success',
        },
      ],
    };

    res.json({
      success: true,
      agent: agentDetails,
    });

  } catch (error) {
    console.error('❌ Get agent details error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get agent details',
    });
  }
});

// @route   POST /api/agents/:agentId/start
// @desc    Start an AI agent
// @access  Private
router.post('/:agentId/start', auth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const agentIndex = mockAgents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Update agent status
    mockAgents[agentIndex].status = 'active';
    mockAgents[agentIndex].lastActive = new Date();

    res.json({
      success: true,
      message: 'Agent started successfully',
      agent: mockAgents[agentIndex],
    });

  } catch (error) {
    console.error('❌ Start agent error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to start agent',
    });
  }
});

// @route   POST /api/agents/:agentId/stop
// @desc    Stop an AI agent
// @access  Private
router.post('/:agentId/stop', auth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const agentIndex = mockAgents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Update agent status
    mockAgents[agentIndex].status = 'paused';

    res.json({
      success: true,
      message: 'Agent stopped successfully',
      agent: mockAgents[agentIndex],
    });

  } catch (error) {
    console.error('❌ Stop agent error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to stop agent',
    });
  }
});

// @route   PUT /api/agents/:agentId/settings
// @desc    Update agent settings
// @access  Private
router.put('/:agentId/settings', auth, [
  body('settings').isObject().withMessage('Settings must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agentId } = req.params;
    const { settings } = req.body;

    const agentIndex = mockAgents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Update agent settings
    mockAgents[agentIndex].settings = {
      ...mockAgents[agentIndex].settings,
      ...settings,
    };

    res.json({
      success: true,
      message: 'Agent settings updated successfully',
      agent: mockAgents[agentIndex],
    });

  } catch (error) {
    console.error('❌ Update agent settings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update agent settings',
    });
  }
});

// @route   GET /api/agents/:agentId/performance
// @desc    Get agent performance metrics
// @access  Private
router.get('/:agentId/performance', auth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period = '30d' } = req.query;

    const agent = mockAgents.find(a => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Generate detailed performance data based on agent type
    let performanceData = {};

    switch (agent.type) {
      case 'trading':
        performanceData = {
          trades: {
            total: 156,
            winning: 113,
            losing: 43,
            winRate: 72.5,
          },
          profit: {
            total: 2847.50,
            average: 18.25,
            best: 450.25,
            worst: -89.50,
          },
          risk: {
            sharpeRatio: 1.8,
            maxDrawdown: 8.5,
            volatility: 15.4,
            beta: 1.2,
          },
          timing: {
            averageHoldTime: '4h 23m',
            successfulEntries: 89.2,
            successfulExits: 84.7,
          },
        };
        break;

      case 'analysis':
        performanceData = {
          signals: {
            total: 324,
            successful: 273,
            accuracy: 84.2,
            averageConfidence: 78.5,
          },
          timing: {
            averageResponseTime: '1.2s',
            uptimePercentage: 99.8,
            processedEvents: 15420,
          },
          quality: {
            falsePositives: 8.3,
            falseNegatives: 7.5,
            precision: 91.7,
            recall: 92.5,
          },
        };
        break;

      case 'risk':
        performanceData = {
          protection: {
            portfolioProtection: 95.8,
            riskReductions: 45,
            preventedDrawdown: 12.3,
          },
          monitoring: {
            alertsGenerated: 128,
            criticalAlerts: 12,
            averageResponseTime: '0.8s',
          },
          metrics: {
            accurateRiskAssessment: 94.2,
            falseAlarms: 5.8,
            missedRisks: 2.1,
          },
        };
        break;

      default:
        performanceData = agent.performance;
    }

    res.json({
      success: true,
      performance: performanceData,
      period,
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
      },
    });

  } catch (error) {
    console.error('❌ Get agent performance error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get agent performance',
    });
  }
});

// @route   GET /api/agents/:agentId/logs
// @desc    Get agent activity logs
// @access  Private
router.get('/:agentId/logs', auth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, level } = req.query;

    const agent = mockAgents.find(a => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: 'AI agent not found',
      });
    }

    // Generate mock logs
    const logs = [
      {
        id: 'log-001',
        level: 'info',
        message: 'Agent started successfully',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        metadata: { action: 'startup', duration: '1.2s' },
      },
      {
        id: 'log-002',
        level: 'success',
        message: 'Trade executed: BTC/USDT buy order',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        metadata: { symbol: 'BTC/USDT', type: 'buy', amount: 0.5 },
      },
      {
        id: 'log-003',
        level: 'warning',
        message: 'High volatility detected in ETH/USDT',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        metadata: { symbol: 'ETH/USDT', volatility: 28.5 },
      },
      {
        id: 'log-004',
        level: 'info',
        message: 'Risk assessment completed',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        metadata: { riskLevel: 'medium', recommendations: 3 },
      },
    ];

    let filteredLogs = [...logs];

    // Filter by level if provided
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Limit results
    filteredLogs = filteredLogs.slice(0, parseInt(limit));

    res.json({
      success: true,
      logs: filteredLogs,
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
      },
    });

  } catch (error) {
    console.error('❌ Get agent logs error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get agent logs',
    });
  }
});

module.exports = router;
