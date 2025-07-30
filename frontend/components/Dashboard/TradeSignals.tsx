'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const TradeSignals = () => {
  const { signals } = useSelector((state: RootState) => state.trading);

  // Mock data if no signals are loaded
  const mockSignals = [
    {
      id: '1',
      symbol: 'ETH',
      type: 'buy' as const,
      confidence: 85,
      entryPrice: 2250.50,
      targetPrice: 2400.00,
      stopLoss: 2150.00,
      reasoning: 'Strong bullish momentum with RSI oversold recovery',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'active' as const,
    },
    {
      id: '2',
      symbol: 'BTC',
      type: 'sell' as const,
      confidence: 72,
      entryPrice: 43250.00,
      targetPrice: 41000.00,
      stopLoss: 44500.00,
      reasoning: 'Bearish divergence on 4H chart with high volume',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'active' as const,
    },
    {
      id: '3',
      symbol: 'UNI',
      type: 'buy' as const,
      confidence: 68,
      entryPrice: 8.45,
      targetPrice: 9.20,
      stopLoss: 7.95,
      reasoning: 'Breaking above resistance with increasing volume',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: 'active' as const,
    },
  ];

  const displaySignals = signals.length > 0 ? signals.slice(0, 5) : mockSignals;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 dark:bg-green-900';
    if (confidence >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trading Signals
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-generated trading opportunities
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {displaySignals.length === 0 ? (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Signals
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Our AI agents are analyzing the market. New signals will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displaySignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      signal.type === 'buy' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {signal.type === 'buy' ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {signal.type.toUpperCase()} {signal.symbol}
                        </h4>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBg(signal.confidence)}`}>
                          <span className={getConfidenceColor(signal.confidence)}>
                            {signal.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{formatDistanceToNow(signal.timestamp)} ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Entry</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${signal.entryPrice.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Target</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${signal.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Stop Loss</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      ${signal.stopLoss.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {signal.reasoning}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      signal.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {signal.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                      Execute
                    </button>
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TradeSignals;
