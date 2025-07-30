const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },
  totalProfitPercentage: {
    type: Number,
    default: 0,
  },
  dailyChange: {
    value: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  assets: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    averagePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    profitPercentage: {
      type: Number,
      default: 0,
    },
    allocation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }],
  performanceHistory: [{
    date: {
      type: Date,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    dailyReturn: {
      type: Number,
      default: 0,
    },
    cumulativeReturn: {
      type: Number,
      default: 0,
    },
  }],
  riskMetrics: {
    volatility: {
      type: Number,
      default: 0,
    },
    sharpeRatio: {
      type: Number,
      default: 0,
    },
    maxDrawdown: {
      type: Number,
      default: 0,
    },
    beta: {
      type: Number,
      default: 1,
    },
    var: { // Value at Risk
      type: Number,
      default: 0,
    },
  },
  diversification: {
    assetCount: {
      type: Number,
      default: 0,
    },
    concentrationRisk: {
      type: Number,
      default: 0,
    },
    sectors: [{
      name: String,
      allocation: Number,
    }],
  },
  lastRebalance: {
    type: Date,
    default: null,
  },
  nextRebalanceDate: {
    type: Date,
    default: null,
  },
  autoRebalance: {
    enabled: {
      type: Boolean,
      default: false,
    },
    threshold: {
      type: Number,
      default: 5, // Rebalance when allocation drifts by 5%
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ walletAddress: 1 });
PortfolioSchema.index({ totalValue: -1 });
PortfolioSchema.index({ lastSyncedAt: -1 });

// Virtual for user
PortfolioSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for trades
PortfolioSchema.virtual('trades', {
  ref: 'Trade',
  localField: 'userId',
  foreignField: 'userId',
});

// Methods
PortfolioSchema.methods.addAsset = function(assetData) {
  const existingAsset = this.assets.find(asset => asset.symbol === assetData.symbol);
  
  if (existingAsset) {
    // Update existing asset
    const totalBalance = existingAsset.balance + assetData.balance;
    const totalValue = (existingAsset.balance * existingAsset.averagePrice) + 
                      (assetData.balance * assetData.averagePrice);
    
    existingAsset.balance = totalBalance;
    existingAsset.averagePrice = totalValue / totalBalance;
    existingAsset.value = totalBalance * assetData.currentPrice;
    existingAsset.currentPrice = assetData.currentPrice;
    existingAsset.lastUpdated = new Date();
  } else {
    // Add new asset
    this.assets.push({
      ...assetData,
      lastUpdated: new Date(),
    });
  }
  
  this.calculateTotals();
  return this.save();
};

PortfolioSchema.methods.removeAsset = function(symbol, amount) {
  const asset = this.assets.find(a => a.symbol === symbol);
  if (!asset) {
    throw new Error('Asset not found in portfolio');
  }
  
  if (amount >= asset.balance) {
    // Remove entire asset
    this.assets = this.assets.filter(a => a.symbol !== symbol);
  } else {
    // Reduce balance
    asset.balance -= amount;
    asset.value = asset.balance * asset.currentPrice;
    asset.lastUpdated = new Date();
  }
  
  this.calculateTotals();
  return this.save();
};

PortfolioSchema.methods.updatePrices = function(priceData) {
  this.assets.forEach(asset => {
    if (priceData[asset.symbol]) {
      asset.currentPrice = priceData[asset.symbol];
      asset.value = asset.balance * asset.currentPrice;
      asset.profit = asset.value - (asset.balance * asset.averagePrice);
      asset.profitPercentage = ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100;
      asset.lastUpdated = new Date();
    }
  });
  
  this.calculateTotals();
  this.lastSyncedAt = new Date();
  return this.save();
};

PortfolioSchema.methods.calculateTotals = function() {
  this.totalValue = this.assets.reduce((sum, asset) => sum + asset.value, 0);
  this.totalProfit = this.assets.reduce((sum, asset) => sum + asset.profit, 0);
  
  if (this.totalInvested > 0) {
    this.totalProfitPercentage = (this.totalProfit / this.totalInvested) * 100;
  }
  
  // Calculate allocations
  this.assets.forEach(asset => {
    asset.allocation = this.totalValue > 0 ? (asset.value / this.totalValue) * 100 : 0;
  });
  
  // Update diversification metrics
  this.diversification.assetCount = this.assets.length;
  this.diversification.concentrationRisk = this.assets.length > 0 ? 
    Math.max(...this.assets.map(a => a.allocation)) : 0;
};

PortfolioSchema.methods.addPerformanceRecord = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if record for today already exists
  const existingRecord = this.performanceHistory.find(record => 
    record.date.getTime() === today.getTime()
  );
  
  if (!existingRecord) {
    const previousRecord = this.performanceHistory[this.performanceHistory.length - 1];
    const dailyReturn = previousRecord ? 
      ((this.totalValue - previousRecord.totalValue) / previousRecord.totalValue) * 100 : 0;
    
    const cumulativeReturn = this.totalInvested > 0 ? 
      ((this.totalValue - this.totalInvested) / this.totalInvested) * 100 : 0;
    
    this.performanceHistory.push({
      date: today,
      totalValue: this.totalValue,
      dailyReturn,
      cumulativeReturn,
    });
    
    // Keep only last 365 days
    if (this.performanceHistory.length > 365) {
      this.performanceHistory = this.performanceHistory.slice(-365);
    }
  }
};

PortfolioSchema.methods.calculateRiskMetrics = function() {
  if (this.performanceHistory.length < 30) return;
  
  const returns = this.performanceHistory.slice(-30).map(record => record.dailyReturn);
  
  // Calculate volatility (standard deviation of returns)
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  this.riskMetrics.volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
  
  // Calculate Sharpe ratio (assuming 2% risk-free rate)
  const riskFreeRate = 2;
  const excessReturn = mean * 252 - riskFreeRate; // Annualized excess return
  this.riskMetrics.sharpeRatio = this.riskMetrics.volatility > 0 ? 
    excessReturn / this.riskMetrics.volatility : 0;
  
  // Calculate max drawdown
  let peak = this.performanceHistory[0].totalValue;
  let maxDrawdown = 0;
  
  this.performanceHistory.forEach(record => {
    if (record.totalValue > peak) {
      peak = record.totalValue;
    }
    const drawdown = (peak - record.totalValue) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  this.riskMetrics.maxDrawdown = maxDrawdown * 100;
};

// Static methods
PortfolioSchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

PortfolioSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalProfitPercentage: -1 })
    .limit(limit)
    .populate('user', 'username walletAddress');
};

// Pre-save middleware
PortfolioSchema.pre('save', function(next) {
  if (this.walletAddress) {
    this.walletAddress = this.walletAddress.toLowerCase();
  }
  
  // Calculate daily change
  if (this.performanceHistory.length >= 2) {
    const current = this.performanceHistory[this.performanceHistory.length - 1];
    const previous = this.performanceHistory[this.performanceHistory.length - 2];
    
    this.dailyChange.value = current.totalValue - previous.totalValue;
    this.dailyChange.percentage = previous.totalValue > 0 ? 
      (this.dailyChange.value / previous.totalValue) * 100 : 0;
  }
  
  next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
