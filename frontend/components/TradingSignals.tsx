'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import TradingService, { TradingSignal } from '../services/tradingService';

interface TradingSignalsProps {
  onSignalAction?: (signalId: string, action: 'accept' | 'decline') => void;
}

export default function TradingSignals({ onSignalAction }: TradingSignalsProps) {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedSignals, setAcceptedSignals] = useState<string[]>([]);

  useEffect(() => {
    loadSignals();
    
    // Simulate new signals coming in - VibeFusion agents sending trade calls
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 20 seconds for more activity
        const newSignal = TradingService.generateNewSignal();
        setSignals(prev => [newSignal, ...prev.slice(0, 4)]); // Keep only 5 signals
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const loadSignals = async () => {
    try {
      const signalsData = TradingService.getPendingSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Error loading signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignalAction = (signalId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      TradingService.acceptSignal(signalId);
      setAcceptedSignals(prev => [...prev, signalId]);
    } else {
      TradingService.declineSignal(signalId);
    }
    
    // Show action feedback before removing
    setTimeout(() => {
      setSignals(prev => prev.filter(s => s.id !== signalId));
    }, 1000);
    
    onSignalAction?.(signalId, action);
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return <ShieldCheckIcon className="w-4 h-4 text-green-600" />;
      case 'MEDIUM': return <ChartBarIcon className="w-4 h-4 text-yellow-600" />;
      case 'HIGH': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default: return <ChartBarIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const signalTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - signalTime.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-[#00D9FF]" />
            VibeFusion Trade Calls
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
            Live Signals
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-[#00D9FF]" />
          VibeFusion Trade Calls
        </h3>
        <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
          {signals.length} Active
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {signals.map((signal, index) => {
            const isAccepted = acceptedSignals.includes(signal.id);
            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border p-4 transition-all duration-300 ${
                  signal.type === 'BUY' 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                } ${isAccepted ? 'ring-2 ring-green-300' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.type === 'BUY' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                    }`}>
                      {signal.type === 'BUY' ? (
                        <ArrowUpRightIcon className="w-4 h-4 text-white" />
                      ) : (
                        <ArrowDownRightIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${
                          signal.type === 'BUY' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                        }`}>
                          {signal.type} {signal.symbol}
                        </span>
                        <span className="text-xs text-[#7A7A7A] bg-white px-2 py-1 rounded">
                          {signal.confidence}% confidence
                        </span>
                      </div>
                      <div className="text-xs text-[#7A7A7A] mt-1">
                        by {signal.agent}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getRiskIcon(signal.riskLevel)}
                    <span className="text-xs text-[#7A7A7A]">
                      {getTimeAgo(signal.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-[#7A7A7A]">Entry Price:</span>
                    <div className="font-semibold text-[#1A1A1A]">${signal.price.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A]">Target:</span>
                    <div className="font-semibold text-[#1A1A1A]">${signal.targetPrice?.toFixed(4)}</div>
                  </div>
                </div>

                <div className="text-xs text-[#7A7A7A] mb-3 bg-white/50 p-2 rounded">
                  <span className="font-medium">Strategy:</span> {signal.reasoning}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded font-medium ${
                      signal.type === 'BUY' ? 'bg-[#22C55E] text-white' : 'bg-[#EF4444] text-white'
                    }`}>
                      {signal.potentialReturn?.toFixed(1)}% potential return
                    </span>
                  </div>
                  
                  {!isAccepted && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSignalAction(signal.id, 'decline')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSignalAction(signal.id, 'accept')}
                        className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#1EA54A] text-white font-medium transition-colors flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Execute Trade
                      </motion.button>
                    </div>
                  )}
                  
                  {isAccepted && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Trade Executed</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {signals.length === 0 && !loading && (
          <div className="text-center py-8 text-[#7A7A7A]">
            <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No active trade calls</div>
            <div className="text-xs">VibeFusion agents are analyzing the market...</div>
          </div>
        )}
      </div>
    </div>
  );
}