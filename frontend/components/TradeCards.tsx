'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  NewspaperIcon,
  FireIcon,
  EyeIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface TradeCardProps {
  symbol: string;
  analysis: any;
  news: any[];
  price: number;
  change24h: number;
  balance: number;
}

const TradeCard = ({ symbol, analysis, news, price, change24h, balance }: TradeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'from-green-400 to-emerald-500';
      case 'SELL': return 'from-red-400 to-rose-500';
      default: return 'from-yellow-400 to-orange-500';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BUY': return TrendingUpIcon;
      case 'SELL': return TrendingDownIcon;
      default: return ClockIcon;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return ShieldCheckIcon;
      case 'HIGH': return ExclamationTriangleIcon;
      default: return EyeIcon;
    }
  };

  const RecommendationIcon = getRecommendationIcon(analysis?.recommendation || 'HOLD');
  const RiskIcon = getRiskIcon(analysis?.riskLevel || 'MEDIUM');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
    >
      {/* Main Card */}
      <div className={`
        relative p-6 rounded-2xl border border-gray-200/50 backdrop-blur-sm
        bg-gradient-to-br ${getRecommendationColor(analysis?.recommendation || 'HOLD')}
        hover:shadow-2xl transition-all duration-500 cursor-pointer
        min-h-[320px]
      `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">{symbol}</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">{symbol}</h3>
              <p className="text-white/80 text-sm">${price.toFixed(4)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
            >
              <RecommendationIcon className="w-5 h-5 text-white" />
            </motion.div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <RiskIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Price Change */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm">24h Change:</span>
            <div className="flex items-center space-x-1">
              {change24h >= 0 ? (
                <ArrowUpRightIcon className="w-4 h-4 text-white" />
              ) : (
                <ArrowDownRightIcon className="w-4 h-4 text-white" />
              )}
              <span className="text-white font-semibold">
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-white/80 text-sm mt-1">
            Balance: {balance.toFixed(4)} {symbol}
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="relative z-10 mb-4">
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BoltIcon className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">AI Analysis</span>
              </div>
              <div className="flex items-center space-x-1">
                <SparklesIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{analysis?.confidence || 50}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-bold">
                {analysis?.recommendation || 'ANALYZING...'}
              </span>
              <span className="text-white/80 text-sm">
                {analysis?.riskLevel || 'MEDIUM'} Risk
              </span>
            </div>

            {analysis?.priceTarget && (
              <div className="mt-2 text-white/80 text-sm">
                Target: ${analysis.priceTarget.target.toFixed(4)} ({analysis.priceTarget.timeframe})
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <ChartBarIcon className="w-5 h-5 text-white mx-auto mb-1" />
            <div className="text-white text-xs">{analysis?.technicalAnalysis?.trend || 'NEUTRAL'}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <NewspaperIcon className="w-5 h-5 text-white mx-auto mb-1" />
            <div className="text-white text-xs">{news?.length || 0} News</div>
          </div>
        </div>

        {/* Expand Indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="absolute bottom-4 right-4 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowUpRightIcon className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {/* Detailed Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
                AI Analysis Details
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Key Factors</h5>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.keyFactors || []).map((factor: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Reasoning</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {analysis?.reasoning || 'Analysis in progress...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Technical</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Trend: {analysis?.technicalAnalysis?.trend || 'N/A'}</div>
                      <div>Momentum: {analysis?.technicalAnalysis?.momentum || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Fundamental</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>News Impact: {analysis?.fundamentalAnalysis?.newsImpact || 'N/A'}</div>
                      <div>Sentiment: {analysis?.fundamentalAnalysis?.marketSentiment || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <NewspaperIcon className="w-5 h-5 text-blue-500 mr-2" />
                Recent News ({news?.length || 0})
              </h4>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {(news || []).slice(0, 3).map((article: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {article.title}
                        </h6>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {article.sentiment}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface TradeCardsProps {
  analyses: {[symbol: string]: any};
  news: {[symbol: string]: any[]};
  portfolioAssets: any[];
  loading: boolean;
}

const TradeCards = ({ analyses, news, portfolioAssets, loading }: TradeCardsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-bold text-gray-900">AI Trade Analysis</h3>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5"
          >
            <SparklesIcon className="w-5 h-5 text-purple-500" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tokensWithAnalysis = Object.keys(analyses).slice(0, 3);

  if (tokensWithAnalysis.length === 0) {
    return (
      <div className="text-center py-12">
        <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Analysis Coming Soon</h3>
        <p className="text-gray-500">Connect your wallet to get AI-powered trade recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <FireIcon className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-gray-900">AI Trade Analysis</h3>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5"
        >
          <SparklesIcon className="w-5 h-5 text-purple-500" />
        </motion.div>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Live Analysis
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokensWithAnalysis.map((symbol, index) => {
          const analysis = analyses[symbol];
          const tokenNews = news[symbol] || [];
          const asset = portfolioAssets.find(a => a.symbol === symbol);
          
          return (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <TradeCard
                symbol={symbol}
                analysis={analysis}
                news={tokenNews}
                price={asset?.price || 0}
                change24h={asset?.change24h || 0}
                balance={asset?.balance || 0}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeCards;
