'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const AssetAllocation = () => {
  const { portfolio } = useSelector((state: RootState) => state.portfolio);

  // Mock asset allocation data
  const assetData = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      allocation: 35.5,
      value: 7100,
      change24h: 2.3,
      color: '#F59E0B',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      allocation: 28.2,
      value: 5640,
      change24h: -1.2,
      color: '#3B82F6',
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      allocation: 15.8,
      value: 3160,
      change24h: 4.7,
      color: '#10B981',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      allocation: 12.3,
      value: 2460,
      change24h: -2.8,
      color: '#8B5CF6',
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      allocation: 8.2,
      value: 1640,
      change24h: 1.5,
      color: '#EF4444',
    },
  ];

  const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0);

  // Generate SVG for pie chart
  const generatePieChart = () => {
    let cumulativePercentage = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return assetData.map((asset, index) => {
      const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
      const endAngle = (cumulativePercentage + asset.allocation) * 3.6;
      
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      cumulativePercentage += asset.allocation;

      return (
        <motion.path
          key={asset.symbol}
          d={pathData}
          fill={asset.color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="hover:opacity-80 cursor-pointer transition-opacity"
        />
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <ChartPieIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Asset Allocation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Portfolio distribution
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {generatePieChart()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Value
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-4">
            {assetData.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {asset.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {asset.allocation.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${asset.value.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {asset.change24h >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    asset.change24h >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(asset.change24h).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Largest Holding
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                BTC (35.5%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Diversification
              </div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                5 Assets
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Risk Level
              </div>
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                Moderate
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssetAllocation;
