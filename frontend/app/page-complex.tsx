'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import WalletConnection from '../components/WalletConnection';
import RiskAssessment from '../components/RiskAssessment';
import Dashboard from '../components/Dashboard/Dashboard';
import { motion } from 'framer-motion';

export default function Home() {
  const dispatch = useDispatch();
  const { isConnected, user } = useSelector((state: RootState) => state.auth);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  useEffect(() => {
    if (isConnected && !user?.riskProfile) {
      setShowRiskAssessment(true);
    }
  }, [isConnected, user]);

  const handleRiskAssessmentComplete = () => {
    setShowRiskAssessment(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              VibeFusion.ai
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Feel the vibe. Trade everywhere. Launch fairly.
            </p>
          </div>
          <WalletConnection />
        </motion.div>
      </div>
    );
  }

  if (showRiskAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mx-auto p-6"
        >
          <RiskAssessment onComplete={handleRiskAssessmentComplete} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Dashboard />
    </div>
  );
}
