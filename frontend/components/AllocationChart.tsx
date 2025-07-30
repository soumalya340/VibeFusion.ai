'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationItem {
  symbol: string;
  name: string;
  percentage: number;
  value: number;
  color: string;
  warning?: boolean;
  amount?: string;
  change24h?: number;
  icon?: React.ReactNode;
}

interface AllocationChartProps {
  allocations: AllocationItem[];
}

export default function AllocationChart({ allocations }: AllocationChartProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const chartData = {
    labels: allocations.map(allocation => allocation.symbol),
    datasets: [
      {
        data: allocations.map(allocation => allocation.percentage),
        backgroundColor: allocations.map(allocation => allocation.color),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
        cutout: '70%',
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1A1A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context: TooltipItem<'doughnut'>[]) {
            const index = context[0].dataIndex;
            return allocations[index].name;
          },
          label: function(context: TooltipItem<'doughnut'>) {
            const index = context.dataIndex;
            const allocation = allocations[index];
            return [
              `${allocation.symbol}: ${allocation.percentage.toFixed(1)}%`,
              `Value: $${allocation.value.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            ];
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    interaction: {
      intersect: false,
    },
  };

  const totalValue = allocations.reduce((sum, allocation) => sum + allocation.value, 0);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Container */}
      <div className="flex-1 relative min-h-[200px]">
        <Doughnut data={chartData} options={options} />
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-xs text-[#8B8B8B] font-medium">Total Value</div>
          <div className="text-lg font-bold text-[#1A1A1A]">
            ${totalValue.toLocaleString(undefined, { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {allocations.map((allocation, index) => (
          <div key={allocation.symbol} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: allocation.color }}
              />
              <span className="font-medium text-[#1A1A1A] truncate">
                {allocation.symbol}
              </span>
              <span className="text-[#8B8B8B] text-xs truncate">
                {allocation.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[#1A1A1A] font-medium">
                {allocation.percentage.toFixed(1)}%
              </span>
              <span className="text-[#8B8B8B] text-xs">
                ${allocation.value.toLocaleString(undefined, { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Cards */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {allocations.filter(a => a.symbol !== 'BTC' && a.symbol !== 'ETH').map((token, index) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + 2) * 0.1 }}
            className="w-[170px] h-[140px] rounded-xl p-3 text-white relative cursor-pointer hover:scale-105 transition-transform group"
            style={{ backgroundColor: token.color }}
            onClick={() => setSelectedToken(token.symbol)}
          >
            {token.warning && (
              <div className="absolute top-2 right-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-[#EF4444]" />
              </div>
            )}
            
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{token.icon}</span>
              <div>
                <div className="font-semibold text-sm">{token.symbol}</div>
                <div className="text-xs opacity-90">{token.name}</div>
              </div>
            </div>
            
            <div className="mt-auto absolute bottom-3">
              <div className="text-sm font-bold">{token.amount}</div>
              <div className="text-xs opacity-90">${token.value.toLocaleString()}</div>
              <div className="text-xs font-medium mt-1">{token.percentage}%</div>
              <div className={`text-xs font-medium ${
                token.change24h!>= 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                {token.change24h!>= 0 ? '+' : ''}{token.change24h!.toFixed(2)}%
              </div>
            </div>
            
            {/* Show "View Chart" on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <span className="text-white text-xs font-medium">View Chart</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
