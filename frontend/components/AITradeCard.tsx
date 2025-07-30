'use client';

import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { TradeRecommendation } from '../services/tradeRecommendationService';

interface TradeCardProps {
  recommendation: TradeRecommendation;
  index?: number;
}

export default function AITradeCard({ recommendation, index = 0 }: TradeCardProps) {
  const isPositive = recommendation.action === 'BUY';
  const isNeutral = recommendation.action === 'HOLD';
  
  // Dynamic colors based on action
  const getActionColors = () => {
    switch (recommendation.action) {
      case 'BUY':
        return {
          bg: 'from-emerald-500/20 via-green-400/10 to-teal-500/20',
          border: 'border-emerald-400/50',
          text: 'text-emerald-400',
          icon: 'text-emerald-500',
          glow: 'shadow-emerald-500/25',
          accent: 'bg-emerald-500'
        };
      case 'SELL':
        return {
          bg: 'from-red-500/20 via-rose-400/10 to-pink-500/20',
          border: 'border-red-400/50',
          text: 'text-red-400',
          icon: 'text-red-500',
          glow: 'shadow-red-500/25',
          accent: 'bg-red-500'
        };
      default:
        return {
          bg: 'from-blue-500/20 via-indigo-400/10 to-purple-500/20',
          border: 'border-blue-400/50',
          text: 'text-blue-400',
          icon: 'text-blue-500',
          glow: 'shadow-blue-500/25',
          accent: 'bg-blue-500'
        };
    }
  };

  const colors = getActionColors();
  const ActionIcon = isPositive ? ArrowTrendingUpIcon : isNeutral ? ChartBarIcon : ArrowTrendingDownIcon;
  
  // Calculate confidence level
  const confidenceLevel = recommendation.confidence >= 80 ? 'HIGH' : 
                         recommendation.confidence >= 60 ? 'MEDIUM' : 'LOW';

  const getConfidenceIcon = () => {
    if (recommendation.confidence >= 80) return ShieldCheckIcon;
    if (recommendation.confidence >= 60) return StarIcon;
    return ExclamationTriangleIcon;
  };

  const ConfidenceIcon = getConfidenceIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-xl border ${colors.border} ${colors.glow} shadow-2xl`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 ${colors.accent} rounded-full opacity-60`}
            animate={{
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative p-6 space-y-4">
        {/* Header with symbol and action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${colors.accent}/20 border ${colors.border}`}>
              <ActionIcon className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{recommendation.symbol}</h3>
              <p className="text-sm text-gray-400">AI Analysis</p>
            </div>
          </div>
          
          {/* Action badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`px-3 py-1 rounded-full ${colors.accent} text-white text-sm font-bold flex items-center space-x-1`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{recommendation.action}</span>
          </motion.div>
        </div>

        {/* Price info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Current Price</p>
            <p className="text-lg font-bold text-white">
              ${recommendation.currentPrice.toFixed(4)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Target Price</p>
            <p className={`text-lg font-bold ${colors.text}`}>
              ${recommendation.targetPrice.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ConfidenceIcon className={`w-4 h-4 ${colors.icon}`} />
              <span className="text-sm text-gray-300">Confidence</span>
            </div>
            <span className={`text-sm font-bold ${colors.text}`}>
              {recommendation.confidence.toFixed(0)}% {confidenceLevel}
            </span>
          </div>
          
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${recommendation.confidence}%` }}
              transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
              className={`h-full ${colors.accent} rounded-full relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        {/* AI Analysis scores */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">Technical</p>
            <div className={`text-lg font-bold ${colors.text}`}>
              {recommendation.aiAnalysis.technicalScore}/100
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">Sentiment</p>
            <div className={`text-lg font-bold ${colors.text}`}>
              {recommendation.aiAnalysis.newsScore}/100
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">Risk</p>
            <div className={`text-lg font-bold ${colors.text}`}>
              {recommendation.aiAnalysis.riskLevel.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Key factors */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className={`w-4 h-4 ${colors.icon}`} />
            <span className="text-sm text-gray-300 font-medium">Key Insights</span>
          </div>
          <div className="space-y-1">
            {recommendation.aiAnalysis.keyFactors.slice(0, 2).map((factor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 + i * 0.1 }}
                className="text-xs text-gray-400 flex items-start space-x-2"
              >
                <span className={`w-1.5 h-1.5 ${colors.accent} rounded-full mt-1.5 flex-shrink-0`}></span>
                <span className="line-clamp-2">{factor}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 rounded-xl ${colors.accent} text-white font-bold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200`}
        >
          <RocketLaunchIcon className="w-5 h-5" />
          <span>Execute Trade</span>
        </motion.button>

        {/* Recommendation summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 + index * 0.1 }}
          className="text-xs text-gray-400 text-center italic"
        >
          "{recommendation.aiAnalysis.recommendation}"
        </motion.div>
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${colors.accent}/10 rounded-bl-2xl`}>
        <div className={`absolute top-2 right-2 w-2 h-2 ${colors.accent} rounded-full animate-pulse`}></div>
      </div>
    </motion.div>
  );
}
