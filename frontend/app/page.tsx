'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import WalletConnection from '../components/WalletConnection';
import PortfolioChart from '../components/PortfolioChart';
import TradingSignals from '../components/TradingSignals';
import { PortfolioShimmer, ChartShimmer } from '../components/ShimmerLoading';
import AlchemyService from '../services/alchemyService';
import TradingService, { Agent } from '../services/tradingService';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
  GlobeAltIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState('7D');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    setMounted(true);
    if (isConnected && address) {
      loadRealData();
    } else {
      loadBasicMockData();
    }
  }, [isConnected, address]);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // Import the new portfolio service
      const PortfolioService = (await import('../services/portfolioService')).default;
      
      // Load real portfolio data
      const portfolioResult = await PortfolioService.getWalletPortfolio(address!);
      
      if (portfolioResult.success && portfolioResult.data) {
        const portfolioData = portfolioResult.data;
        
        setPortfolioData({
          totalValue: portfolioData.totalValue,
          assets: portfolioData.assets,
          dailyChange: portfolioData.dailyChange,
          dailyPercentage: portfolioData.dailyPercentage,
          lastUpdated: portfolioData.lastUpdated
        });

        // Set market data from the portfolio assets
        const marketData: any = {};
        portfolioData.assets.forEach((asset: any) => {
          marketData[asset.symbol] = {
            price: asset.price,
            change24h: asset.change24h
          };
        });
        setMarketData(marketData);
      } else {
        // If real data fails, show empty state - no fallback mock data
        console.warn('Failed to load real portfolio data');
        setPortfolioData(null);
        setMarketData(null);
      }

      // Load agents
      const agentsData = TradingService.getAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading real data:', error);
      setPortfolioData(null);
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };


  const loadBasicMockData = () => {
    // No dummy data - show loading state until wallet is connected
    setPortfolioData(null);
    setMarketData(null);
    setAgents([]);
    setLoading(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  // Calculate metrics from portfolio data - no fallback dummy values
  const totalValue = portfolioData?.totalValue || 0;
  const dailyChange = portfolioData?.dailyChange || 0;
  const dailyPercentage = portfolioData?.dailyPercentage || 0;
  const weeklyPercentage = dailyPercentage * 3.2; // Estimated weekly from daily

  // Generate realistic chart data based on actual portfolio value
  const generateChartData = () => {
    const days = dateRange === '1D' ? 24 : dateRange === '7D' ? 7 : dateRange === '1M' ? 30 : 90;
    const points = dateRange === '1D' ? 24 : days;
    
    return Array.from({ length: points }, (_, i) => {
      const baseValue = totalValue - dailyChange; // Start from yesterday's value
      const timeUnit = dateRange === '1D' ? 'hour' : 'day';
      
      // Create more realistic price movement
      const trend = dailyChange / points; // Linear trend component
      const volatility = totalValue * 0.02; // 2% volatility
      const noise = (Math.random() - 0.5) * volatility;
      
      let date;
      if (dateRange === '1D') {
        date = new Date();
        date.setHours(date.getHours() - (24 - 1 - i));
        date = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        date = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      }
      
      const value = Math.round(baseValue + (trend * i) + noise);
      
      return { date, value };
    });
  };

  const chartData = generateChartData();

  // Add these helper functions before line 215 where they're first used

  const getTokenName = (symbol: string) => {
    const names: { [key: string]: string } = {
      'ETH': 'Ethereum',
      'BTC': 'Bitcoin', 
      'UNI': 'Uniswap',
      'LINK': 'Chainlink',
      'AAVE': 'Aave',
      'MATIC': 'Polygon',
      'COMP': 'Compound',
      'USDC': 'USD Coin',
      'USDT': 'Tether'
    };
    return names[symbol] || symbol;
  };

  const getTokenColor = (symbol: string, index: number) => {
    const tokenColors: { [key: string]: string } = {
      'BTC': '#FF6B35',
      'ETH': '#2FE0FF',
      'UNI': '#FF007A',
      'LINK': '#375BD2',
      'AAVE': '#B6509E',
      'MATIC': '#8247E5',
      'COMP': '#00D395',
      'USDC': '#2775CA',
      'USDT': '#26A17B'
    };
    const defaultColors = ['#FF6B35', '#2FE0FF', '#8247E5', '#375BD2', '#FF007A', '#B6509E', '#00D395'];
    return tokenColors[symbol] || defaultColors[index % defaultColors.length];
  };

  // Process allocations from portfolio data with enhanced visuals
  const allocations = portfolioData?.assets?.map((asset: any, index: number) => {
    const colors = ['#FF6B35', '#2FE0FF', '#8247E5', '#375BD2', '#FF007A', '#B6509E', '#00D395', '#FFA500'];
    const icons = ['₿', 'Ξ', '⬟', '🔗', '🏛️', '💜', '🔷', '🟠'];
    
    // Map symbols to proper icons
    const iconMap: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ', 
      'UNI': '🦄',
      'LINK': '🔗',
      'AAVE': '👻',
      'MATIC': '💜',
      'COMP': '🏛️',
      'USDC': '💵',
      'USDT': '💰'
    };
    
    return {
      symbol: asset.symbol,
      name: getTokenName(asset.symbol),
      amount: asset.balance || 0,
      value: asset.value || 0,
      percentage: asset.percentage ? asset.percentage.toFixed(1) : '0.0',
      color: getTokenColor(asset.symbol, index),
      icon: iconMap[asset.symbol] || icons[index % icons.length],
      warning: (asset.change24h || 0) < -5, // Show warning if price dropped more than 5%
      change24h: asset.change24h || 0,
      price: asset.price || 0
    };
  }) || [];

  const breakdown = portfolioData?.assets?.map((asset: any) => ({
    token: asset.symbol,
    amount: asset.balance || 0,
    value: `$${(asset.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    percentage: `${(asset.change24h || 0) >= 0 ? '+' : ''}${(asset.change24h || 0).toFixed(1)}%`,
    positive: (asset.change24h || 0) >= 0
  })) || [];

  const metrics = [
    { label: 'Total Return', value: '+24.8%', badge: 'YTD', positive: true },
    { label: 'Sharpe Ratio', value: '1.42', badge: 'Risk', positive: true },
    { label: 'Max Drawdown', value: '-8.3%', badge: 'Risk', positive: false },
    { label: 'Win Rate', value: '73.2%', badge: 'Success', positive: true }
  ];

  // Show modern onboarding if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white font-['Inter',sans-serif]">
        {/* Navigation */}
        <header className="bg-white border-b border-[#E0E0E0] px-6 py-4">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">VibeFusion.ai</h1>
            <button className="bg-[#EDEDED] hover:bg-[#D4D4D4] text-[#1A1A1A] px-6 py-2 rounded-lg font-medium transition-colors">
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-[#1A1A1A] mb-6"
            >
              Professional Crypto Portfolio Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#7A7A7A] mb-12 max-w-3xl mx-auto"
            >
              Advanced AI-powered trading agents, real-time analytics, and comprehensive portfolio management in one professional platform
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md mx-auto"
            >
              <WalletConnection />
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="bg-[#F6F6F6] rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-[#00D9FF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Portfolio Analytics</h3>
              <p className="text-[#7A7A7A]">Real-time tracking with professional-grade metrics and performance analysis</p>
            </div>
            
            <div className="bg-[#F6F6F6] rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-[#2FE0FF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">AI Trading Agents</h3>
              <p className="text-[#7A7A7A]">Automated trading strategies powered by advanced machine learning</p>
            </div>
            
            <div className="bg-[#F6F6F6] rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Enterprise Security</h3>
              <p className="text-[#7A7A7A]">Bank-level security with full decentralization and self-custody</p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-[#F6F6F6] rounded-xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#1A1A1A] mb-2">$2.4B+</div>
                <div className="text-[#7A7A7A]">Assets Under Management</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1A1A1A] mb-2">25,000+</div>
                <div className="text-[#7A7A7A]">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1A1A1A] mb-2">99.9%</div>
                <div className="text-[#7A7A7A]">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1A1A1A] mb-2">24/7</div>
                <div className="text-[#7A7A7A]">AI Monitoring</div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#E0E0E0] px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">VibeFusion.ai</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors font-medium">Portfolio</a>
              <a href="#" className="text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors font-medium">Agents</a>
              <a href="#" className="text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors font-medium">Analytics</a>
              <a href="#" className="text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors font-medium">Settings</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Generate Button */}
            <button className="bg-[#EDEDED] hover:bg-[#D4D4D4] text-[#1A1A1A] px-6 py-2 rounded-lg font-medium transition-colors">
              Generate
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#7A7A7A] hover:text-[#1A1A1A] relative transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
              </button>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#F6F6F6] transition-colors"
              >
                <div className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-[#7A7A7A]" />
                </div>
                <ChevronDownIcon className="w-4 h-4 text-[#7A7A7A]" />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E0E0E0] py-2 z-50"
                  >
                    <a href="#" className="block px-4 py-2 text-[#1A1A1A] hover:bg-[#F6F6F6] transition-colors">
                      Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-[#1A1A1A] hover:bg-[#F6F6F6] transition-colors">
                      Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-[#1A1A1A] hover:bg-[#F6F6F6] transition-colors">
                      Logout
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Wallet Connection */}
            <div className="text-sm">
              <span className="text-[#7A7A7A]">Connected: </span>
              <span className="font-mono text-[#1A1A1A] font-medium">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-10 gap-6">
          {/* Left Column - 70% */}
          <div className="col-span-7 space-y-6">
            {/* Show appropriate content based on state */}
            {!isConnected ? (
              /* No wallet connected - show connect prompt */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F6F6F6] rounded-xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#00D9FF] to-[#2FE0FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-3">Connect Your Wallet</h3>
                <p className="text-[#7A7A7A] mb-6 max-w-md mx-auto">
                  Connect your wallet to view your real portfolio, access AI trading agents, and start managing your crypto assets.
                </p>
                <WalletConnection />
              </motion.div>
            ) : loading ? (
              /* Loading state - show shimmer */
              <PortfolioShimmer />
            ) : !portfolioData || (portfolioData.assets && portfolioData.assets.length === 0) ? (
              /* No assets found */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F6F6F6] rounded-xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EyeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-3">No Assets Found</h3>
                <p className="text-[#7A7A7A] mb-6 max-w-md mx-auto">
                  No crypto assets were found in your wallet on supported networks (Ethereum mainnet). 
                  Make sure you have tokens in your wallet or try a different wallet address.
                </p>
                <div className="text-sm text-[#7A7A7A]">
                  <p>Supported networks: Ethereum Mainnet</p>
                  <p className="mt-1">Additional networks require upgraded API access</p>
                </div>
              </motion.div>
            ) : (
              /* Real portfolio data */
              <>
                {/* Evaluation Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F6F6F6] rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-semibold text-[#1A1A1A]">Portfolio Evaluation</h2>
                    <div className="flex items-center space-x-2">
                      {['1D', '7D', '1M', '1Y'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={`px-3 py-1 rounded border border-[#E0E0E0] text-sm transition-colors font-medium ${
                            dateRange === range 
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                              : 'bg-white text-[#7A7A7A] hover:bg-[#F6F6F6]'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Value */}
                  <div className="mb-6">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold text-[#1A1A1A]">
                          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={`font-medium ${dailyChange >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {dailyChange >= 0 ? '+' : ''}${Math.abs(dailyChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({dailyPercentage >= 0 ? '+' : ''}{dailyPercentage.toFixed(2)}%)
                          </span>
                          <span className="text-[#7A7A7A]">today</span>
                        </div>
                        {portfolioData?.lastUpdated && (
                          <div className="text-xs text-[#7A7A7A] mt-1">
                            Last updated: {new Date(portfolioData.lastUpdated).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="bg-white rounded-lg p-4">
                      <PortfolioChart 
                        data={chartData} 
                        dateRange={dateRange} 
                        onDateRangeChange={setDateRange}
                      />
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {metrics.map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center bg-white rounded-lg p-4 w-[180px]"
                      >
                        <div className="text-base font-semibold text-[#1A1A1A] mb-1">{metric.value}</div>
                        <div className="text-sm text-[#7A7A7A] mb-2">{metric.label}</div>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white bg-[#22C55E]">
                          {metric.badge}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

            {/* AI Agents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#F6F6F6] rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">AI Trading Agents</h3>
                <button className="text-[#00D9FF] hover:text-[#2FE0FF] text-sm font-medium transition-colors">
                  Manage All
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 border border-[#E0E0E0] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{agent.avatar}</span>
                        <h4 className="font-medium text-[#1A1A1A] text-sm">{agent.name}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          agent.status === 'ACTIVE' ? 'bg-[#22C55E]' : 'bg-[#7A7A7A]'
                        }`}></span>
                        <span className="text-xs text-[#7A7A7A] capitalize font-medium">{agent.status.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7A7A7A]">24h Profit:</span>
                        <span className={agent.profit24h > 0 ? 'text-[#22C55E] font-medium' : 'text-[#7A7A7A]'}>
                          ${agent.profit24h.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7A7A7A]">Win Rate:</span>
                        <span className="text-[#1A1A1A] font-medium">{agent.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
              </>
            )}

            {/* Trading Signals Section - show for all states if connected */}
            {isConnected && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#F6F6F6] rounded-xl p-6"
              >
                <TradingSignals />
              </motion.div>
            )}
          </div>

          {/* Right Column - 30% */}
          <div className="col-span-3 space-y-6">
            {!isConnected ? (
              /* No wallet connected - show features */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-[#F6F6F6] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="w-5 h-5 text-[#00D9FF]" />
                      <span className="text-[#7A7A7A]">Real-time Portfolio Tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-5 h-5 text-[#2FE0FF]" />
                      <span className="text-[#7A7A7A]">AI Trading Agents</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-5 h-5 text-[#22C55E]" />
                      <span className="text-[#7A7A7A]">Multi-chain Support</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : loading ? (
              /* Loading state for right column */
              <div className="space-y-6">
                <div className="bg-[#F6F6F6] rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-300 rounded"></div>
                    <div className="h-32 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ) : !portfolioData || (portfolioData.assets && portfolioData.assets.length === 0) ? (
              /* No assets state for right column */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#F6F6F6] rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Portfolio Allocation</h3>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
                  <p className="text-[#7A7A7A] text-sm">No assets to display</p>
                </div>
              </motion.div>
            ) : (
              /* Real portfolio allocation */
              <>
                {/* Allocation Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#F6F6F6] rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Portfolio Allocation</h3>
                  
                  {/* Masonry-style Grid */}
                  <div className="space-y-3">
                    {/* BTC Card - Large */}
                    {allocations.find(a => a.symbol === 'BTC') && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-[220px] h-[180px] rounded-xl p-4 text-white relative cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: allocations.find(a => a.symbol === 'BTC')?.color }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-3xl">{allocations.find(a => a.symbol === 'BTC')?.icon}</span>
                          <div>
                            <div className="font-semibold text-lg">BTC</div>
                            <div className="text-sm opacity-90">Bitcoin</div>
                          </div>
                        </div>
                        
                        <div className="mt-auto absolute bottom-4">
                          <div className="text-xl font-bold">{allocations.find(a => a.symbol === 'BTC')?.amount}</div>
                          <div className="text-sm opacity-90">${allocations.find(a => a.symbol === 'BTC')?.value.toLocaleString()}</div>
                          <div className="text-sm font-medium mt-1">{allocations.find(a => a.symbol === 'BTC')?.percentage}%</div>
                        </div>
                      </motion.div>
                    )}

                    {/* ETH Card - Large */}
                    {allocations.find(a => a.symbol === 'ETH') && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-[220px] h-[180px] rounded-xl p-4 text-white relative cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: allocations.find(a => a.symbol === 'ETH')?.color }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-3xl">{allocations.find(a => a.symbol === 'ETH')?.icon}</span>
                          <div>
                            <div className="font-semibold text-lg">ETH</div>
                            <div className="text-sm opacity-90">Ethereum</div>
                          </div>
                        </div>
                        
                        <div className="mt-auto absolute bottom-4">
                          <div className="text-xl font-bold">{allocations.find(a => a.symbol === 'ETH')?.amount}</div>
                          <div className="text-sm opacity-90">${allocations.find(a => a.symbol === 'ETH')?.value.toLocaleString()}</div>
                          <div className="text-sm font-medium mt-1">{allocations.find(a => a.symbol === 'ETH')?.percentage}%</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Other tokens - Smaller cards in grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {allocations.filter(a => a.symbol !== 'BTC' && a.symbol !== 'ETH').map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (index + 2) * 0.1 }}
                          className="w-[170px] h-[140px] rounded-xl p-3 text-white relative cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: token.color }}
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
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Breakdown Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#F6F6F6] rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Asset Breakdown</h3>
                  
                  <div className="space-y-1">
                    {breakdown.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-3 px-3 hover:bg-white rounded-lg transition-colors border-b border-[#E0E0E0] last:border-b-0"
                        style={{ height: '48px' }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-[#E0E0E0] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#1A1A1A]">{item.token.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-[#1A1A1A] text-sm">{item.token}</div>
                            <div className="text-xs text-[#7A7A7A]">{item.amount}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-[#1A1A1A] text-sm">{item.value}</div>
                          <div className={`text-xs font-medium ${
                            item.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                          }`}>
                            {item.percentage}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}