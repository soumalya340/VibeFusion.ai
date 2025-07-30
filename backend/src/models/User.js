const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  profileImage: {
    type: String,
    default: null,
  },
  riskProfile: {
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    investmentExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    investmentGoals: [{
      type: String,
      enum: ['short-term-gains', 'long-term-growth', 'passive-income', 'portfolio-diversification'],
    }],
    maxRiskPerTrade: {
      type: Number,
      default: 5, // percentage
      min: 1,
      max: 25,
    },
    preferredAssets: [{
      type: String,
      enum: ['bitcoin', 'ethereum', 'altcoins', 'defi-tokens', 'nfts', 'stablecoins'],
    }],
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    assessmentDate: {
      type: Date,
      default: null,
    },
  },
  tradingPreferences: {
    autoTradingEnabled: {
      type: Boolean,
      default: false,
    },
    maxDailyTrades: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },
    tradingBudget: {
      type: Number,
      default: 1000,
      min: 100,
    },
    stopLossPercentage: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
    takeProfitPercentage: {
      type: Number,
      default: 10,
      min: 5,
      max: 50,
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  activity: {
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      trading: {
        type: Boolean,
        default: true,
      },
      market: {
        type: Boolean,
        default: false,
      },
    },
    privacy: {
      shareData: {
        type: Boolean,
        default: false,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ lastActivity: -1 });
UserSchema.index({ 'subscription.plan': 1 });

// Virtual for portfolio
UserSchema.virtual('portfolio', {
  ref: 'Portfolio',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Methods
UserSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  this.activity.lastLogin = new Date();
  return this.save();
};

UserSchema.methods.incrementTrade = function(profit) {
  this.activity.totalTrades += 1;
  this.activity.totalProfit += profit;
  
  // Calculate win rate
  if (profit > 0) {
    const wins = this.activity.totalTrades * (this.activity.winRate / 100) + 1;
    this.activity.winRate = (wins / this.activity.totalTrades) * 100;
  } else {
    const wins = this.activity.totalTrades * (this.activity.winRate / 100);
    this.activity.winRate = (wins / this.activity.totalTrades) * 100;
  }
  
  return this.save();
};

UserSchema.methods.completeRiskAssessment = function(riskData) {
  this.riskProfile = {
    ...this.riskProfile,
    ...riskData,
    assessmentCompleted: true,
    assessmentDate: new Date(),
  };
  return this.save();
};

// Static methods
UserSchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

UserSchema.statics.getActiveUsers = function() {
  return this.find({ 
    isActive: true,
    lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
  });
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  if (this.walletAddress) {
    this.walletAddress = this.walletAddress.toLowerCase();
  }
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
