'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationItem {
  symbol: string;
  name: string;
  percentage: number;
  value: number;
  color: string;
}

interface AllocationChartProps {
  allocations: AllocationItem[];
}

export default function AllocationChart({ allocations }: AllocationChartProps) {
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
    </div>
  );
}
