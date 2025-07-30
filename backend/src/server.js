const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const tradingRoutes = require('./routes/trading');
const agentsRoutes = require('./routes/agents');
const marketDataRoutes = require('./routes/marketData');

// Import services
const TradingService = require('./services/TradingService');
const AgentOrchestrator = require('./services/AgentOrchestrator');
const WebSocketService = require('./services/WebSocketService');
const MarketDataService = require('./services/MarketDataService');

class VibeFusionServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    this.port = process.env.PORT || 5000;
    
    this.initializeMiddleware();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeServices();
    this.initializeWebSockets();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    }));

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }

  async initializeDatabase() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibefusion';
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  initializeRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/portfolio', portfolioRoutes);
    this.app.use('/api/trading', tradingRoutes);
    this.app.use('/api/agents', agentsRoutes);
    this.app.use('/api/market-data', marketDataRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    });
  }

  initializeServices() {
    // Initialize core services with in-memory storage
    this.tradingService = new TradingService();
    this.agentOrchestrator = new AgentOrchestrator();
    this.webSocketService = new WebSocketService(this.server);
    this.marketDataService = new MarketDataService();

    console.log('✅ Core services initialized');
  }

  initializeWebSockets() {
    this.io.on('connection', (socket) => {
      console.log(`📡 Client connected: ${socket.id}`);

      socket.on('join-portfolio', (portfolioId) => {
        socket.join(`portfolio:${portfolioId}`);
        console.log(`Client ${socket.id} joined portfolio: ${portfolioId}`);
      });

      socket.on('join-trading', (userId) => {
        socket.join(`trading:${userId}`);
        console.log(`Client ${socket.id} joined trading room: ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log(`📡 Client disconnected: ${socket.id}`);
      });
    });

    console.log('✅ WebSocket server initialized');
  }

  initializeErrorHandling() {
    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('❌ Global error:', err);

      // Mongoose validation error
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
          error: 'Validation Error',
          details: errors,
        });
      }

      // JWT error
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Please provide a valid authentication token',
        });
      }

      // Default error
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  async gracefulShutdown(signal) {
    console.log(`📡 Received ${signal}. Starting graceful shutdown...`);

    this.server.close(() => {
      console.log('📡 HTTP server closed');
    });

    try {
      await mongoose.connection.close();
      console.log('📡 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB:', error);
    }

    // Redis removed for simplicity

    process.exit(0);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`
🚀 VibeFusion.ai Backend Server Started
📡 Port: ${this.port}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🕐 Time: ${new Date().toISOString()}
      `);
    });
  }
}

// Start the server
const serverInstance = new VibeFusionServer();
serverInstance.start();

module.exports = serverInstance;
