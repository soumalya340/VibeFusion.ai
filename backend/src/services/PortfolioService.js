const axios = require('axios');

class PortfolioService {
  constructor() {
    this.coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';
    this.alchemyApiKey = process.env.ALCHEMY_API_KEY || 'alcht_GJ9vDvr8klYAd3wWGx2pMAg3grZ1O2';
    this.alchemyBaseUrl = `https://eth-mainnet.g.alchemy.com/v2/${this.alchemyApiKey}`;
  }

  async getWalletPortfolio(walletAddress) {
    try {
      // Get token balances from Alchemy
      const tokenBalances = await this.getTokenBalances(walletAddress);
      
      // Get ETH balance
      const ethBalance = await this.getETHBalance(walletAddress);
      
      // Get current prices for all tokens
      const prices = await this.getCurrentPrices([...tokenBalances.map(t => t.symbol), 'ETH']);
      
      // Calculate portfolio
      const portfolio = await this.calculatePortfolio(tokenBalances, ethBalance, prices);
      
      return {
        success: true,
        data: portfolio
      };
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTokenBalances(walletAddress) {
    try {
      const response = await axios.post(this.alchemyBaseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [walletAddress]
      });

      const balances = response.data.result.tokenBalances;
      const validBalances = [];

      for (const balance of balances) {
        if (balance.tokenBalance !== '0x0') {
          // Get token metadata
          const metadata = await this.getTokenMetadata(balance.contractAddress);
          if (metadata.success) {
            validBalances.push({
              contractAddress: balance.contractAddress,
              balance: balance.tokenBalance,
              symbol: metadata.data.symbol,
              name: metadata.data.name,
              decimals: metadata.data.decimals
            });
          }
        }
      }

      return validBalances;
    } catch (error) {
      console.error('Token balances error:', error);
      return [];
    }
  }

  async getETHBalance(walletAddress) {
    try {
      const response = await axios.post(this.alchemyBaseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [walletAddress, 'latest']
      });

      const balanceWei = response.data.result;
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      
      return {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: balanceEth,
        decimals: 18
      };
    } catch (error) {
      console.error('ETH balance error:', error);
      return { symbol: 'ETH', name: 'Ethereum', balance: 0, decimals: 18 };
    }
  }

  async getTokenMetadata(contractAddress) {
    try {
      const response = await axios.post(this.alchemyBaseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress]
      });

      const metadata = response.data.result;
      return {
        success: true,
        data: {
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: metadata.decimals,
          logo: metadata.logo
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentPrices(symbols) {
    try {
      // Map symbols to CoinGecko IDs
      const symbolToId = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'MATIC': 'matic-network',
        'COMP': 'compound-governance-token'
      };

      const ids = symbols.map(symbol => symbolToId[symbol] || symbol.toLowerCase()).join(',');
      
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      const prices = {};
      Object.keys(response.data).forEach(id => {
        const symbol = Object.keys(symbolToId).find(key => symbolToId[key] === id) || id.toUpperCase();
        prices[symbol] = {
          price: response.data[id].usd,
          change24h: response.data[id].usd_24h_change || 0
        };
      });

      return prices;
    } catch (error) {
      console.error('Price fetch error:', error);
      return {};
    }
  }

  async calculatePortfolio(tokenBalances, ethBalance, prices) {
    const assets = [];
    let totalValue = 0;

    // Add ETH
    if (ethBalance.balance > 0) {
      const ethPrice = prices['ETH']?.price || 0;
      const ethValue = ethBalance.balance * ethPrice;
      
      assets.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance.balance.toFixed(6),
        price: ethPrice,
        value: ethValue,
        change24h: prices['ETH']?.change24h || 0,
        percentage: 0 // Will calculate after totalValue
      });
      
      totalValue += ethValue;
    }

    // Add other tokens
    for (const token of tokenBalances) {
      const balance = parseInt(token.balance, 16) / Math.pow(10, token.decimals);
      if (balance > 0) {
        const price = prices[token.symbol]?.price || 0;
        const value = balance * price;
        
        if (value > 1) { // Only include tokens worth more than $1
          assets.push({
            symbol: token.symbol,
            name: token.name,
            balance: balance.toFixed(token.decimals >= 6 ? 6 : token.decimals),
            price: price,
            value: value,
            change24h: prices[token.symbol]?.change24h || 0,
            percentage: 0 // Will calculate after totalValue
          });
          
          totalValue += value;
        }
      }
    }

    // Calculate percentages
    assets.forEach(asset => {
      asset.percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });

    // Sort by value (highest first)
    assets.sort((a, b) => b.value - a.value);

    const dailyChange = assets.reduce((sum, asset) => {
      return sum + (asset.value * (asset.change24h / 100));
    }, 0);

    const dailyPercentage = totalValue > 0 ? (dailyChange / (totalValue - dailyChange)) * 100 : 0;

    return {
      totalValue,
      dailyChange,
      dailyPercentage,
      assets,
      lastUpdated: new Date().toISOString()
    };
  }

  async getHistoricalData(symbol, days = 7) {
    try {
      const symbolToId = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'MATIC': 'matic-network',
        'COMP': 'compound-governance-token'
      };

      const coinId = symbolToId[symbol] || symbol.toLowerCase();
      
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      return {
        success: true,
        data: response.data.prices.map(([timestamp, price]) => ({
          timestamp,
          price,
          date: new Date(timestamp).toISOString()
        }))
      };
    } catch (error) {
      console.error('Historical data error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PortfolioService();