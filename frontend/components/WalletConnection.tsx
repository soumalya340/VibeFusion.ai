'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useDispatch } from 'react-redux';
import { connectWallet, disconnectWallet, setLoading, setError } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import { WalletIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector, error } = useConnect();
  const { disconnect } = useDisconnect();
  const dispatch = useDispatch();
  const [selectedConnector, setSelectedConnector] = useState<string>('');

  useEffect(() => {
    if (isConnected && address) {
      dispatch(connectWallet(address));
      toast.success('Wallet connected successfully!');
    }
  }, [isConnected, address, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setError(error.message));
      toast.error(`Connection failed: ${error.message}`);
    }
  }, [error, dispatch]);

  const handleConnect = async (connector: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      setSelectedConnector(connector.id);
      await connect({ connector });
    } catch (error: any) {
      console.error('Connection error:', error);
      dispatch(setError('Failed to connect wallet'));
      toast.error('Failed to connect wallet');
    } finally {
      dispatch(setLoading(false));
      setSelectedConnector('');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    dispatch(disconnectWallet());
    toast.success('Wallet disconnected');
  };

  // Simple MetaMask connection fallback
  const connectMetaMask = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        dispatch(setLoading(true));
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts.length > 0) {
          dispatch(connectWallet(accounts[0]));
          toast.success('MetaMask connected successfully!');
        }
      } catch (error: any) {
        console.error('MetaMask connection error:', error);
        toast.error('Failed to connect MetaMask');
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      toast.error('MetaMask is not installed');
    }
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
              <p className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
        >
          Disconnect Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <WalletIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Connect your wallet to start automated trading
        </p>
      </div>

      <div className="space-y-3">
        {/* MetaMask Direct Connection */}
        <button
          onClick={connectMetaMask}
          disabled={isLoading}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 flex items-center justify-between border-gray-200 hover:border-gray-300 bg-white"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <WalletIcon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">
                MetaMask
              </h3>
              <p className="text-xs text-gray-600">
                Connect with MetaMask wallet
              </p>
            </div>
          </div>
          
          {isLoading && (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          )}
        </button>

        {/* Wagmi Connectors */}
        {connectors.map((connector) => {
          const isConnecting = isLoading && pendingConnector?.id === connector.id;
          const isSelected = selectedConnector === connector.id;
          
          return (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              disabled={!connector.ready || isConnecting}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 flex items-center justify-between ${
                connector.ready
                  ? 'border-gray-200 hover:border-gray-300 bg-white'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {connector.name}
                  </h3>
                  {!connector.ready && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Not installed
                    </p>
                  )}
                </div>
              </div>
              
              {isConnecting || isSelected ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : !connector.ready ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              First time here?
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Install MetaMask extension in your browser to connect your wallet for trading.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletConnection;
