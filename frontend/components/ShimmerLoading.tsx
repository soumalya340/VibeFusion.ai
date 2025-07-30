'use client';

import { motion } from 'framer-motion';

interface ShimmerCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function ShimmerCard({ className = '', children }: ShimmerCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          translateX: ["0%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {children}
    </div>
  );
}

interface PortfolioShimmerProps {
  showTokens?: boolean;
}

export function PortfolioShimmer({ showTokens = true }: PortfolioShimmerProps) {
  return (
    <div className="space-y-6">
      {/* Portfolio Overview Shimmer */}
      <ShimmerCard className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-white/20 rounded w-32"></div>
          <div className="h-8 bg-white/20 rounded w-48"></div>
          <div className="h-4 bg-white/20 rounded w-24"></div>
        </div>
      </ShimmerCard>

      {/* Chart Shimmer */}
      <ShimmerCard className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-white/20 rounded w-40"></div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </ShimmerCard>

      {/* Token List Shimmer */}
      {showTokens && (
        <ShimmerCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-white/20 rounded w-32 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/20 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-16"></div>
                    <div className="h-3 bg-white/20 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-white/20 rounded w-20"></div>
                  <div className="h-3 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </ShimmerCard>
      )}
    </div>
  );
}

export function TokenShimmer() {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-white/20 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded w-16"></div>
          <div className="h-3 bg-white/20 rounded w-24"></div>
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-4 bg-white/20 rounded w-20"></div>
        <div className="h-3 bg-white/20 rounded w-16"></div>
      </div>
    </div>
  );
}

export function ChartShimmer() {
  return (
    <ShimmerCard className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-white/20 rounded w-40"></div>
          <div className="flex space-x-2">
            {['1D', '7D', '1M', '1Y'].map((period) => (
              <div key={period} className="h-8 w-10 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
        <div className="h-64 bg-white/20 rounded relative">
          <svg className="w-full h-full opacity-30">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,200 50,180 100,160 150,140 200,120 250,100 300,80"
            />
          </svg>
        </div>
      </div>
    </ShimmerCard>
  );
}

export default ShimmerCard;
