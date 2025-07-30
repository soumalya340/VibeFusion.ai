'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = () => {
  const { portfolio } = useSelector((state: RootState) => state.portfolio);

  // Mock performance data
  const performanceData = {
    totalReturn: 24.5,
    monthlyReturn: 12.3,
    weeklyReturn: 5.8,
    dailyReturn: 2.1,
    volatility: 15.2,
    sharpeRatio: 1.8,
    maxDrawdown: -8.5,
    winRate: 68.5,
  };

  // Chart data
  const chartData = {
    labels: [
      '1 Jan', '8 Jan', '15 Jan', '22 Jan', '29 Jan',
      '5 Feb', '12 Feb', '19 Feb', '26 Feb',
      '5 Mar', '12 Mar', '19 Mar', '26 Mar',
    ],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [10000, 10250, 10180, 10420, 10380, 10650, 10590, 10780, 10720, 10950, 11120, 11280, 12450],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Benchmark (S&P 500)',
        data: [10000, 10120, 10080, 10200, 10180, 10350, 10320, 10450, 10420, 10580, 10650, 10720, 10850],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const metricCards = [
    {
      label: 'Total Return',
      value: `${performanceData.totalReturn}%`,
      change: performanceData.totalReturn,
      icon: ArrowUpIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      label: 'Monthly Return',
      value: `${performanceData.monthlyReturn}%`,
      change: performanceData.monthlyReturn,
      icon: ArrowUpIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      label: 'Volatility',
      value: `${performanceData.volatility}%`,
      change: -performanceData.volatility,
      icon: ArrowDownIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Sharpe Ratio',
      value: performanceData.sharpeRatio.toFixed(2),
      change: performanceData.sharpeRatio,
      icon: ArrowUpIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

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
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Chart
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Portfolio vs Benchmark
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select className="input-primary text-sm py-1 px-2">
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricCards.map((metric, index) => {
            const IconComponent = metric.icon;
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${metric.bgColor}`}>
                    <IconComponent className={`w-3 h-3 ${metric.color}`} />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Additional Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Drawdown</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {performanceData.maxDrawdown}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Win Rate</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {performanceData.winRate}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Trades</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                247
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Trade</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                $125.50
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
