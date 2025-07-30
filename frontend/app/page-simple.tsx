'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 VibeFusion.ai
          </h1>
          <p className="text-xl text-purple-200">
            Decentralized Agentic Video Trading Platform
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">💳 Wallet Connection</h3>
            <p className="text-purple-200">Connect your crypto wallet to start trading</p>
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              Connect Wallet
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">📊 Portfolio Dashboard</h3>
            <p className="text-purple-200">Monitor your trading performance in real-time</p>
            <div className="mt-4 text-green-400 font-semibold">
              Total Value: $12,450.00
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">🤖 AI Trading Agents</h3>
            <p className="text-purple-200">4 AI agents actively monitoring markets</p>
            <div className="mt-4 text-blue-400 font-semibold">
              Status: Active
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📈 Recent Trading Signals</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-500/20 rounded-lg">
              <span className="text-white">BUY ETH</span>
              <span className="text-green-400">+2.5%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded-lg">
              <span className="text-white">HOLD BTC</span>
              <span className="text-blue-400">Stable</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg">
              <span className="text-white">WATCH MATIC</span>
              <span className="text-yellow-400">Monitoring</span>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-purple-200">
          <p>✅ Backend Server: Running on port 5000</p>
          <p>✅ Frontend App: Running on port 3001</p>
          <p>🔗 WebSocket: Connected for real-time updates</p>
        </footer>
      </div>
    </div>
  );
}
