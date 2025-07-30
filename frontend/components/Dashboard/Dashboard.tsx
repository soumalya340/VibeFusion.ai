'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import Navbar from './Navbar';
import PortfolioOverview from './PortfolioOverview';
import TradeSignals from './TradeSignals';
import AgentStatus from './AgentStatus';
import PerformanceChart from './PerformanceChart';
import AssetAllocation from './AssetAllocation';
import RecentTrades from './RecentTrades';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { portfolio } = useSelector((state: RootState) => state.portfolio);
  const { agents } = useSelector((state: RootState) => state.agents);

  useEffect(() => {
    // Load initial data
    // This would typically fetch from your backend API
    console.log('Dashboard mounted, loading initial data...');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your automated trading dashboard
            </p>
          </motion.div>

          {/* Portfolio Overview */}
          <motion.div variants={itemVariants}>
            <PortfolioOverview />
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div variants={itemVariants}>
                <PerformanceChart />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <TradeSignals />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <RecentTrades />
              </motion.div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                <AssetAllocation />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <AgentStatus />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
