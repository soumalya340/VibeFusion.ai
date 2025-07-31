# VibeFusion.ai Backend Documentation

## 📖 Overview

The VibeFusion.ai backend is a robust Node.js application built with Express.js, providing comprehensive API services for decentralized trading, portfolio management, AI agent orchestration, and real-time market data. It features JWT authentication, MongoDB data persistence, Redis caching, and WebSocket support for real-time updates.

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js v4.18.2
- **Database**: MongoDB with Mongoose ODM v8.0.3
- **Cache**: Redis for session management and caching
- **Authentication**: JWT (JSON Web Tokens) v9.0.2
- **Real-time**: Socket.io v4.7.4
- **Security**: Helmet v7.1.0, CORS, Rate Limiting
- **Validation**: Express Validator v7.0.1
- **Blockchain**: Ethers.js v5.7.2, Web3.js v4.3.0

### Key Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "jsonwebtoken": "^9.0.2",
  "socket.io": "^4.7.4",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1",
  "ethers": "^5.7.2",
  "axios": "^1.6.2",
  "bcryptjs": "^2.4.3"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js                # Main server entry point
│   │
│   ├── models/                  # MongoDB Models
│   │   ├── User.js             # User schema with wallet integration
│   │   ├── Portfolio.js        # Portfolio management schema
│   │   ├── Trade.js            # Trading records and history
│   │   └── Agent.js            # AI agent configurations
│   │
│   ├── routes/                  # API Route Handlers
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── portfolio.js        # Portfolio management APIs
│   │   ├── trading.js          # Trading operations
│   │   ├── agents.js           # AI agent management
│   │   └── marketData.js       # Market data endpoints
│   │
│   ├── controllers/             # Business Logic Controllers
│   │   ├── authController.js   # Authentication logic
│   │   ├── portfolioController.js # Portfolio operations
│   │   ├── tradingController.js # Trading logic
│   │   └── agentController.js  # Agent management
│   │
│   ├── services/                # Core Services
│   │   ├── TradingService.js   # Core trading logic
│   │   ├── PortfolioService.js # Portfolio calculations
│   │   ├── AgentOrchestrator.js # AI agent coordination
│   │   ├── WebSocketService.js # Real-time communication
│   │   └── MarketDataService.js # Market data aggregation
│   │
│   ├── middleware/              # Express Middleware
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── validation.js       # Input validation middleware
│   │   ├── errorHandler.js     # Global error handling
│   │   └── rateLimit.js        # API rate limiting
│   │
│   └── utils/                   # Utility Functions
│       ├── logger.js           # Logging utilities
│       ├── crypto.js           # Cryptographic functions
│       └── helpers.js          # General helper functions
│
├── tests/                       # Test Suite
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test data
│
├── config/                      # Configuration Files
│   ├── database.js             # MongoDB configuration
│   ├── redis.js               # Redis configuration
│   └── constants.js           # Application constants
│
└── Configuration Files
    ├── package.json            # Dependencies and scripts
    ├── .env.example           # Environment variables template
    ├── Dockerfile             # Docker container configuration
    └── nodemon.json           # Development server configuration
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vibefusion
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# API Keys
ALCHEMY_API_KEY=your-alchemy-api-key
COINGECKO_API_KEY=your-coingecko-api-key
NEWS_API_KEY=your-news-api-key

# External Services
WEBSOCKET_PORT=5001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-key
POLYGON_RPC_URL=https://polygon-mainnet.alchemyapi.io/v2/your-key
```

### Environment Setup Guide

1. **MongoDB Setup**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # Local installation:
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

2. **Redis Setup**
   ```bash
   # Install Redis locally or use Redis Cloud
   # Local installation:
   brew install redis
   brew services start redis
   ```

## 🚀 Getting Started

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Available Scripts

```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run build        # Build application (if needed)
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
```

### Development Server

The development server runs with nodemon for automatic restarts:

```bash
npm run dev
# Server running on http://localhost:5000
# Health check: http://localhost:5000/health
```

## 🗃️ Database Models

### User Model

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  username: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  riskProfile: {
    tolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    maxRiskPerTrade: {
      type: Number,
      min: 1,
      max: 25,
      default: 5
    }
  },
  tradingPreferences: {
    autoTradingEnabled: { type: Boolean, default: false },
    maxDailyTrades: { type: Number, default: 10 },
    tradingBudget: { type: Number, default: 1000 }
  },
  activity: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

### Portfolio Model

```javascript
// models/Portfolio.js
const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  assets: [{
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    balance: { type: Number, required: true },
    averagePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    value: { type: Number, required: true },
    profit: { type: Number, default: 0 },
    profitPercentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  totalValue: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalProfitPercentage: { type: Number, default: 0 },
  dailyChange: { type: Number, default: 0 },
  performanceHistory: [{
    date: { type: Date, required: true },
    totalValue: { type: Number, required: true },
    dailyReturn: { type: Number, default: 0 },
    cumulativeReturn: { type: Number, default: 0 }
  }],
  riskMetrics: {
    volatility: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 },
    maxDrawdown: { type: Number, default: 0 },
    beta: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});
```

### Trade Model

```javascript
// models/Trade.js
const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: { type: String, required: true },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  value: { type: Number, required: true },
  fees: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'executed', 'failed', 'cancelled'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['manual', 'ai_agent', 'strategy'],
    default: 'manual'
  },
  agentId: {
    type: String,
    required: function() { return this.source === 'ai_agent'; }
  },
  executedAt: Date,
  profit: { type: Number, default: 0 },
  profitPercentage: { type: Number, default: 0 }
}, {
  timestamps: true
});
```

## 🔗 API Routes

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/connect-wallet`
Connect wallet and authenticate user.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message to authenticate"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "walletAddress": "0x...",
    "username": "user123"
  }
}
```

#### GET `/api/auth/verify`
Verify JWT token and get user information.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### POST `/api/auth/risk-assessment`
Complete user risk assessment.

**Request Body:**
```json
{
  "riskTolerance": "moderate",
  "investmentExperience": "intermediate",
  "investmentGoals": ["growth", "income"],
  "maxRiskPerTrade": 5.0
}
```

### Portfolio Routes (`/api/portfolio`)

#### GET `/api/portfolio`
Get user's portfolio information.

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "totalValue": 10000.50,
    "assets": [...],
    "dailyChange": 150.25,
    "performanceHistory": [...]
  }
}
```

#### GET `/api/portfolio/wallet/:address`
Get real portfolio data for wallet address using Alchemy API.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 5432.10,
    "assets": [
      {
        "symbol": "ETH",
        "balance": 2.5,
        "price": 2580.75,
        "value": 6451.88
      }
    ]
  }
}
```

#### POST `/api/portfolio/sync`
Sync portfolio with blockchain data.

#### GET `/api/portfolio/performance`
Get portfolio performance history.

**Query Parameters:**
- `period`: 7d, 30d, 90d, 1y

### Trading Routes (`/api/trading`)

#### GET `/api/trading/signals`
Get AI-generated trading signals.

**Response:**
```json
{
  "success": true,
  "signals": [
    {
      "symbol": "ETH",
      "type": "buy",
      "confidence": 85,
      "reason": "Strong technical indicators",
      "targetPrice": 2650.00
    }
  ]
}
```

#### POST `/api/trading/execute`
Execute a trade order.

**Request Body:**
```json
{
  "symbol": "ETH",
  "type": "buy",
  "amount": 1.0,
  "orderType": "market"
}
```

### AI Agents Routes (`/api/agents`)

#### GET `/api/agents`
Get all AI agents with their status and performance.

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "trade-executor",
      "name": "Trade Executor",
      "type": "trading",
      "status": "active",
      "performance": {
        "winRate": 72.5,
        "totalTrades": 156,
        "profit": 2847.50
      }
    }
  ]
}
```

#### GET `/api/agents/:agentId`
Get specific agent details.

#### POST `/api/agents/:agentId/start`
Start an AI agent.

#### POST `/api/agents/:agentId/stop`
Stop an AI agent.

#### PUT `/api/agents/:agentId/settings`
Update agent settings.

### Market Data Routes (`/api/market-data`)

#### GET `/api/market-data/prices`
Get current market prices.

#### GET `/api/market-data/signals`
Get market trading signals.

## 🛠️ Services Layer

### PortfolioService

```javascript
// services/PortfolioService.js
class PortfolioService {
  constructor() {
    this.alchemyApiKey = process.env.ALCHEMY_API_KEY;
    this.coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  }

  async getWalletPortfolio(walletAddress) {
    try {
      // Get token balances from Alchemy
      const tokenBalances = await this.getTokenBalances(walletAddress);
      
      // Get ETH balance
      const ethBalance = await this.getETHBalance(walletAddress);
      
      // Get current prices
      const symbols = tokenBalances.map(token => token.symbol);
      const prices = await this.getCurrentPrices(symbols);
      
      // Calculate portfolio
      return await this.calculatePortfolio(tokenBalances, ethBalance, prices);
    } catch (error) {
      console.error('Portfolio service error:', error);
      throw error;
    }
  }

  async getCurrentPrices(symbols) {
    // Fetch prices from CoinGecko API
    const response = await axios.get(`${this.coingeckoBaseUrl}/simple/price`, {
      params: {
        ids: symbols.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true
      }
    });
    return response.data;
  }
}
```

### TradingService

```javascript
// services/TradingService.js
class TradingService {
  async executeTrade(userId, tradeParams) {
    try {
      // Validate trade parameters
      await this.validateTrade(tradeParams);
      
      // Check user risk limits
      await this.checkRiskLimits(userId, tradeParams);
      
      // Execute trade (mock implementation)
      const trade = await this.processTrade(tradeParams);
      
      // Update portfolio
      await this.updatePortfolio(userId, trade);
      
      // Emit WebSocket event
      this.emitTradeUpdate(userId, trade);
      
      return trade;
    } catch (error) {
      console.error('Trading service error:', error);
      throw error;
    }
  }
}
```

### AgentOrchestrator

```javascript
// services/AgentOrchestrator.js
class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.eventEmitter = new EventEmitter();
  }

  async startAgent(agentId, config) {
    const agent = await this.createAgent(agentId, config);
    this.agents.set(agentId, agent);
    
    agent.on('signal', (signal) => {
      this.handleAgentSignal(agentId, signal);
    });
    
    await agent.start();
    return agent;
  }

  async handleAgentSignal(agentId, signal) {
    // Process AI agent trading signal
    const validatedSignal = await this.validateSignal(signal);
    
    if (validatedSignal.confidence > 70) {
      // Execute trade based on signal
      await this.tradingService.executeTrade(validatedSignal);
    }
  }
}
```

## 🔐 Security Implementation

### JWT Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Invalid token' 
      });
    }

    req.user = { userId: user._id, walletAddress: user.walletAddress };
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Access denied',
      message: 'Invalid token' 
    });
  }
};
```

### Rate Limiting

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  generalLimiter: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'),
  authLimiter: createRateLimiter(15 * 60 * 1000, 10, 'Too many auth attempts'),
  tradingLimiter: createRateLimiter(60 * 1000, 20, 'Too many trading requests')
};
```

### Input Validation

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateTradeRequest = [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('type').isIn(['buy', 'sell']).withMessage('Invalid trade type'),
  body('amount').isFloat({ min: 0.001 }).withMessage('Invalid amount'),
  body('orderType').isIn(['market', 'limit']).withMessage('Invalid order type'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];
```

## ⚡ Real-time Features

### WebSocket Implementation

```javascript
// services/WebSocketService.js
const { Server } = require('socket.io');

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      socket.on('join_portfolio', (userId) => {
        socket.join(`portfolio_${userId}`);
      });
      
      socket.on('join_trading', (userId) => {
        socket.join(`trading_${userId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitPortfolioUpdate(userId, portfolioData) {
    this.io.to(`portfolio_${userId}`).emit('portfolio_update', portfolioData);
  }

  emitTradeSignal(signal) {
    this.io.emit('trade_signal', signal);
  }

  emitMarketData(marketData) {
    this.io.emit('market_data', marketData);
  }
}
```

### Supported Events
- `portfolio_update`: Real-time portfolio changes
- `trade_signal`: New AI trading signals
- `market_data`: Live market data updates
- `agent_status`: AI agent status changes
- `trade_executed`: Trade execution notifications

## 🗄️ Database Configuration

### MongoDB Connection

```javascript
// config/database.js
const mongoose = require('mongoose');

class DatabaseService {
  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }
}
```

### Redis Configuration

```javascript
// config/redis.js
const redis = require('redis');

class RedisService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async connect() {
    await this.client.connect();
    console.log('✅ Redis connected successfully');
  }

  async set(key, value, expiration = 3600) {
    await this.client.setEx(key, expiration, JSON.stringify(value));
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
}
```

## 🧪 Testing

### Test Structure
```
backend/
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── portfolio.test.js
│   │   └── trading.test.js
│   └── fixtures/
│       ├── users.js
│       └── portfolios.js
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Sample Test

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/connect-wallet', () => {
    it('should authenticate user with valid wallet signature', async () => {
      const walletData = {
        walletAddress: '0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68',
        signature: 'valid_signature_here',
        message: 'Sign this message to authenticate'
      };

      const response = await request(app)
        .post('/api/auth/connect-wallet')
        .send(walletData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

## 🚀 Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

USER backend

EXPOSE 5000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml (backend services)
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/vibefusion
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

### Environment-Specific Deployment

#### Development
```bash
npm run dev
```

#### Production
```bash
# Build and start
npm start

# With PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vibefusion-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

## 🔧 Performance Optimization

### Database Optimization

```javascript
// Indexing strategy
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ walletAddress: 1 });
portfolioSchema.index({ 'assets.symbol': 1 });

tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, status: 1 });

userSchema.index({ walletAddress: 1 }, { unique: true });
```

### Caching Strategy

```javascript
// services/CacheService.js
class CacheService {
  async getCachedPortfolio(walletAddress) {
    const key = `portfolio:${walletAddress}`;
    return await this.redis.get(key);
  }

  async setCachedPortfolio(walletAddress, data) {
    const key = `portfolio:${walletAddress}`;
    await this.redis.set(key, data, 300); // 5 minutes
  }

  async getCachedPrices(symbols) {
    const key = `prices:${symbols.sort().join(',')}`;
    return await this.redis.get(key);
  }
}
```

### API Response Optimization

```javascript
// Pagination middleware
const paginate = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const results = {};

    if (skip > 0) {
      results.previous = { page: page - 1, limit };
    }

    try {
      results.results = await model.find().limit(limit).skip(skip);
      
      if (skip + limit < await model.countDocuments()) {
        results.next = { page: page + 1, limit };
      }

      req.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};
```

## 🐛 Error Handling

### Global Error Handler

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

### Logging

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vibefusion-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🔄 API Monitoring

### Health Check Endpoint

```javascript
// Health check route
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();
    health.services.mongodb = 'connected';
  } catch (error) {
    health.services.mongodb = 'disconnected';
    health.status = 'ERROR';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 📚 Additional Resources

### Documentation Links
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Documentation](https://jwt.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Best Practices
- Use environment variables for configuration
- Implement proper error handling
- Add comprehensive logging
- Use middleware for common functionality
- Validate all input data
- Implement rate limiting
- Use HTTPS in production
- Regular security audits

### Contributing
1. Follow coding standards
2. Write comprehensive tests
3. Update documentation
4. Use meaningful commit messages
5. Submit pull requests for review

---

**Last Updated**: January 31, 2025  
**Version**: 1.0.0  
**Maintainer**: VibeFusion.ai Team
