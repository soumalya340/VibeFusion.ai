'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const RecentTrades = () => {
  const { trades } = useSelector((state: RootState) => state.trading);

  // Mock recent trades data
  const mockTrades = [
    {
      id: 'trade-001',
      symbol: 'BTC/USDT',
      type: 'buy' as const,
      amount: 0.5,
      price: 42350.25,
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      profit: 125.50,
      agentId: 'trade-executor',
    },
    {
      id: 'trade-002',
      symbol: 'ETH/USDT',
      type: 'sell' as const,
      amount: 2.8,
      price: 2580.75,
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      profit: -45.20,
      agentId: 'trade-executor',
    },
    {
      id: 'trade-003',
      symbol: 'ADA/USDT',
      type: 'buy' as const,
      amount: 1000,
      price: 0.425,
      status: 'pending' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      profit: 0,
      agentId: 'trade-executor',
    },
    {
      id: 'trade-004',
      symbol: 'SOL/USDT',
      type: 'sell' as const,
      amount: 15,
      price: 105.80,
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      profit: 89.45,
      agentId: 'trade-executor',
    },
    {
      id: 'trade-005',
      symbol: 'MATIC/USDT',
      type: 'buy' as const,
      amount: 500,
      price: 0.85,
      status: 'failed' as const,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      profit: 0,
      agentId: 'trade-executor',
    },
    {
      id: 'trade-006',
      symbol: 'BTC/USDT',
      type: 'sell' as const,
      amount: 0.25,
      price: 42180.50,
      status: 'completed' as const,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      profit: 67.80,
      agentId: 'trade-executor',
    },
  ];

  const displayTrades = trades.length > 0 ? trades : mockTrades;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'failed':
        return XCircleIcon;
      default:
        return ArrowPathIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const totalProfit = displayTrades
    .filter(trade => trade.status === 'completed')
    .reduce((sum, trade) => {
      // For mock trades, use the profit field if it exists, otherwise calculate based on value
      const profit = 'profit' in trade ? trade.profit : (trade.value * 0.02); // 2% profit assumption
      return sum + profit;
    }, 0);

  const totalTrades = displayTrades.length;
  const completedTrades = displayTrades.filter(trade => trade.status === 'completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Trades
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest trading activity
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Today's P&L</div>
            <div className={`text-lg font-semibold ${
              totalProfit >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Trades</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{totalTrades}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{completedTrades}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Success Rate</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {totalTrades > 0 ? ((completedTrades / totalTrades) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="space-y-3">
          {displayTrades.slice(0, 6).map((trade, index) => {
            const StatusIcon = getStatusIcon(trade.status);
            
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(trade.status)}`}>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(trade.status)}`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trade.symbol}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                        trade.type === 'buy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {trade.amount} @ ${trade.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {formatDistanceToNow(trade.timestamp)} ago
                  </div>
                  {trade.status === 'completed' && trade.profit !== 0 && (
                    <div className={`flex items-center space-x-1 justify-end ${
                      trade.profit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.profit >= 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {trade.status !== 'completed' && (
                    <span className={`text-sm font-medium capitalize ${getStatusColor(trade.status)}`}>
                      {trade.status}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {displayTrades.length > 6 && (
          <div className="mt-4 text-center">
            <button className="btn btn-secondary text-sm">
              View All Trades
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentTrades;
