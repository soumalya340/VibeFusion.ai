'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AITradeCard from './AITradeCard';
import { tradeRecommendationService, TradeRecommendation } from '../services/tradeRecommendationService';
import { 
  SparklesIcon, 
  ChartBarIcon,
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export default function AITradeCenter() {
  const [recommendations, setRecommendations] = useState<TradeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAIRecommendations();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAIRecommendations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAIRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 AI Trade Center: Loading recommendations...');
      
      // Use the service's built-in method to get recommendations
      const recommendations = await tradeRecommendationService.getTradeRecommendations();
      
      if (recommendations && recommendations.length > 0) {
        setRecommendations(recommendations);
        console.log(`✅ AI Trade Center: Generated ${recommendations.length} recommendations`);
      } else {
        throw new Error('No valid recommendations generated');
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ AI Trade Center error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load AI recommendations');
      
      // The service will return mock data on errors, so we should still have some data
      try {
        const fallbackRecommendations = await tradeRecommendationService.getTradeRecommendations();
        setRecommendations(fallbackRecommendations || []);
      } catch {
        // If even that fails, we'll show empty state
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <RocketLaunchIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Trade Center</h2>
              <p className="text-gray-400">Powered by Advanced ML Models</p>
            </div>
          </div>
        </div>

        {/* Loading cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="h-96 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-24 h-6 bg-gray-700 rounded"></div>
                  <div className="w-16 h-6 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-700 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                </div>
                <div className="w-full h-32 bg-gray-700 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <RocketLaunchIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Trade Center</h2>
            <p className="text-gray-400">Powered by Advanced ML Models</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Last update indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>

          {/* Refresh button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAIRecommendations}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <SparklesIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Refresh'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Buy Signals</p>
              <p className="text-xl font-bold text-green-400">
                {recommendations.filter(r => r.action === 'BUY').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm text-gray-400">Sell Signals</p>
              <p className="text-xl font-bold text-red-400">
                {recommendations.filter(r => r.action === 'SELL').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Avg Confidence</p>
              <p className="text-xl font-bold text-blue-400">
                {recommendations.length > 0 
                  ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error} - Showing demo data for preview
        </motion.div>
      )}

      {/* Trade cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => (
          <AITradeCard 
            key={`${recommendation.symbol}-${index}`}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>

      {/* Trading disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-gray-500 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
      >
        ⚠️ AI recommendations are for informational purposes only. Always do your own research before trading.
        <br />
        Past performance does not guarantee future results. Crypto trading involves significant risk.
      </motion.div>
    </div>
  );
}
