'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';

const PortfolioOverview = () => {
  const { portfolio } = useSelector((state: RootState) => state.portfolio);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Mock data if no portfolio is loaded
  const totalValue = portfolio?.totalValue || 10000;
  const totalPnL = portfolio?.totalPnL || 250.75;
  const dailyPnL = portfolio?.dailyPnL || 45.20;
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
  const dailyPnLPercentage = totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0;

  const stats = [
    {
      name: 'Portfolio Value',
      value: formatCurrency(totalValue),
      change: null,
      changeType: 'neutral' as const,
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total P&L',
      value: formatCurrency(totalPnL),
      change: formatPercentage(totalPnLPercentage),
      changeType: totalPnL >= 0 ? 'positive' : 'negative' as const,
      icon: totalPnL >= 0 ? TrendingUpIcon : TrendingDownIcon,
    },
    {
      name: 'Daily P&L',
      value: formatCurrency(dailyPnL),
      change: formatPercentage(dailyPnLPercentage),
      changeType: dailyPnL >= 0 ? 'positive' : 'negative' as const,
      icon: dailyPnL >= 0 ? ArrowUpIcon : ArrowDownIcon,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : stat.changeType === 'negative'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <IconComponent className={`w-5 h-5 ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : stat.changeType === 'negative'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <ArrowUpIcon className="w-3 h-3 mr-0.5 flex-shrink-0" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3 mr-0.5 flex-shrink-0" />
                      )}
                      {stat.change}
                    </div>
                  )}
                </dd>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PortfolioOverview;
