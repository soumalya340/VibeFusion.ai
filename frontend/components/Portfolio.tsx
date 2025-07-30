'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import AlchemyService from '../services/alchemyService';
import { PhotoIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface NFT {
  contract: {
    address: string;
    name: string;
  };
  tokenId: string;
  title: string;
  description: string;
  media: Array<{
    gateway: string;
    thumbnail: string;
  }>;
  metadata: {
    image?: string;
    name?: string;
    description?: string;
  };
}

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: string;
}

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nfts' | 'tokens'>('nfts');

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData();
    }
  }, [isConnected, address]);

  const fetchPortfolioData = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Fetch NFTs
      const nftResult = await AlchemyService.getNFTsForOwner(address);
      if (nftResult.success && nftResult.data) {
        setNfts(nftResult.data.ownedNfts || []);
      }

      // Fetch Token Balances
      const tokenResult = await AlchemyService.getTokenBalances(address);
      if (tokenResult.success && tokenResult.data) {
        setTokenBalances(tokenResult.data.tokenBalances || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to view your NFT portfolio and token balances
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Portfolio
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('nfts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'nfts'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <PhotoIcon className="w-4 h-4 inline mr-2" />
          NFTs ({nfts.length})
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tokens'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
          Tokens ({tokenBalances.length})
        </button>
      </div>

      {/* NFTs Tab */}
      {activeTab === 'nfts' && (
        <div>
          {nfts.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No NFTs Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This wallet doesn't own any NFTs yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft, index) => (
                <motion.div
                  key={`${nft.contract.address}-${nft.tokenId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative">
                    {nft.media?.[0]?.gateway || nft.metadata?.image ? (
                      <img
                        src={nft.media?.[0]?.gateway || nft.metadata?.image}
                        alt={nft.title || nft.metadata?.name || 'NFT'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {nft.title || nft.metadata?.name || `Token #${nft.tokenId}`}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {nft.contract.name || 'Unknown Collection'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Token ID: {nft.tokenId}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tokens Tab */}
      {activeTab === 'tokens' && (
        <div>
          {tokenBalances.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Tokens Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This wallet doesn't hold any ERC-20 tokens
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokenBalances.map((token, index) => (
                <motion.div
                  key={token.contractAddress}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Token Contract
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {token.contractAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {token.tokenBalance}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Balance
                      </p>
                    </div>
                  </div>
                  {token.error && (
                    <p className="text-sm text-red-500 mt-2">
                      Error: {token.error}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
