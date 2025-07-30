'use client';

import { useEffect, useRef } from 'react';
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
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

interface PortfolioChartProps {
  data: Array<{ date: string; value: number }>;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export default function PortfolioChart({ data, dateRange, onDateRangeChange }: PortfolioChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Calculate if the trend is positive or negative
  const isPositiveTrend = data.length > 1 ? data[data.length - 1].value > data[0].value : true;

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.map(d => d.value),
        borderColor: isPositiveTrend ? '#22C55E' : '#EF4444',
        backgroundColor: isPositiveTrend 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: isPositiveTrend ? '#22C55E' : '#EF4444',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
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
        displayColors: false,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context: TooltipItem<'line'>[]) {
            return dateRange === '1D' 
              ? `Time: ${context[0].label}` 
              : `Date: ${context[0].label}`;
          },
          label: function(context: TooltipItem<'line'>) {
            const value = context.parsed.y;
            return `Portfolio Value: $${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        beginAtZero: false,
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const dateRanges = [
    { key: '1D', label: '1D' },
    { key: '7D', label: '7D' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '1Y', label: '1Y' }
  ];

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="h-32 mb-4 bg-white rounded-lg p-2">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      {/* Date Range Buttons */}
      <div className="flex gap-2 justify-center">
        {dateRanges.map((range) => (
          <button
            key={range.key}
            onClick={() => onDateRangeChange(range.key)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
              dateRange === range.key
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                : 'bg-white text-[#1A1A1A] border-[#E0E0E0] hover:bg-[#F6F6F6] hover:border-[#D4D4D4]'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
