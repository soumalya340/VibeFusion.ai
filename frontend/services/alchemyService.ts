import { Network, Alchemy, Utils, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "sd3rs13BpGn0gPddmhPfW",
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(settings);

// Token contract addresses for major cryptocurrencies
const TOKEN_CONTRACTS = {
  USDC: '0xA0b86a33E6417c66d0a4BD4b18eB60D3E93A7f2b',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  MATIC: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
};

export class AlchemyService {
  /**
   * Get all NFTs owned by an address
   */
  static async getNFTsForOwner(owner: string) {
    try {
      const nfts = await alchemy.nft.getNftsForOwner(owner);
      return {
        success: true,
        data: nfts,
        count: nfts.totalCount
      };
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get NFT metadata
   */
  static async getNFTMetadata(contractAddress: string, tokenId: string) {
    try {
      const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
      return {
        success: true,
        data: metadata
      };
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get floor price for a collection
   */
  static async getFloorPrice(contractAddress: string) {
    try {
      const floorPrice = await alchemy.nft.getFloorPrice(contractAddress);
      return {
        success: true,
        data: floorPrice
      };
    } catch (error) {
      console.error('Error fetching floor price:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get owners for a specific NFT collection
   */
  static async getOwnersForContract(contractAddress: string) {
    try {
      const owners = await alchemy.nft.getOwnersForContract(contractAddress);
      return {
        success: true,
        data: owners
      };
    } catch (error) {
      console.error('Error fetching contract owners:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get contract metadata
   */
  static async getContractMetadata(contractAddress: string) {
    try {
      const metadata = await alchemy.nft.getContractMetadata(contractAddress);
      return {
        success: true,
        data: metadata
      };
    } catch (error) {
      console.error('Error fetching contract metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Search for contract addresses by name
   */
  static async searchContractMetadata(query: string) {
    try {
      const results = await alchemy.nft.searchContractMetadata(query);
      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error('Error searching contracts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get token balances for an address
   */
  static async getTokenBalances(address: string) {
    try {
      const balances = await alchemy.core.getTokenBalances(address);
      return {
        success: true,
        data: balances
      };
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get ETH balance for an address
   */
  static async getEthBalance(address: string) {
    try {
      const balance = await alchemy.core.getBalance(address);
      return {
        success: true,
        data: Utils.formatEther(balance)
      };
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get detailed token balances with metadata
   */
  static async getDetailedTokenBalances(address: string) {
    try {
      const balances = await alchemy.core.getTokenBalances(address);
      const detailedBalances = [];

      // Get ETH balance first
      const ethBalance = await this.getEthBalance(address);
      if (ethBalance.success) {
        detailedBalances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance.data,
          contractAddress: null,
          decimals: 18
        });
      }

      // Get token balances
      for (const token of balances.tokenBalances) {
        if (parseInt(token.tokenBalance || '0') > 0) {
          try {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            const balance = Utils.formatUnits(token.tokenBalance || '0', metadata.decimals || 18);
            
            detailedBalances.push({
              symbol: metadata.symbol,
              name: metadata.name,
              balance: balance,
              contractAddress: token.contractAddress,
              decimals: metadata.decimals,
              logo: metadata.logo
            });
          } catch (metadataError) {
            console.error('Error fetching token metadata:', metadataError);
          }
        }
      }

      return {
        success: true,
        data: detailedBalances
      };
    } catch (error) {
      console.error('Error fetching detailed token balances:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get transaction history for an address
   */
  static async getTransactionHistory(address: string, limit: number = 50) {
    try {
      const transactions = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
        maxCount: limit,
        order: SortingOrder.DESCENDING
      });

      const receivedTransactions = await alchemy.core.getAssetTransfers({
        toAddress: address,
        category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
        maxCount: limit,
        order: SortingOrder.DESCENDING
      });

      const allTransactions = [...transactions.transfers, ...receivedTransactions.transfers]
        .sort((a, b) => {
          const blockA = parseInt(a.blockNum, 16);
          const blockB = parseInt(b.blockNum, 16);
          return blockB - blockA;
        })
        .slice(0, limit);

      return {
        success: true,
        data: allTransactions
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get portfolio value using external price API
   */
  static async getPortfolioValue(address: string) {
    try {
      const balances = await this.getDetailedTokenBalances(address);
      if (!balances.success || !balances.data) {
        return { success: false, error: 'Failed to fetch balances' };
      }

      // Get current prices from CoinGecko API
      const tokenSymbols = balances.data.map(token => token.symbol).join(',');
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,uniswap,chainlink,aave,compound,polygon&vs_currencies=usd&include_24hr_change=true`
      );
      
      const prices = await priceResponse.json();
      
      const priceMap: { [key: string]: { usd: number, usd_24h_change: number } } = {
        'ETH': prices.ethereum,
        'UNI': prices.uniswap,
        'LINK': prices.chainlink,
        'AAVE': prices.aave,
        'COMP': prices.compound,
        'MATIC': prices.polygon
      };

      let totalValue = 0;
      const portfolioBreakdown = balances.data.map(token => {
        const price = priceMap[token.symbol] || { usd: 0, usd_24h_change: 0 };
        const value = parseFloat(token.balance) * price.usd;
        totalValue += value;

        return {
          ...token,
          price: price.usd,
          value: value,
          change24h: price.usd_24h_change
        };
      }).filter(token => token.value > 0.01); // Filter out dust

      return {
        success: true,
        data: {
          totalValue,
          breakdown: portfolioBreakdown,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}

export default AlchemyService;
