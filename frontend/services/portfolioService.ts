class PortfolioService {
  private baseUrl: string;
  private alchemyApiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    this.alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'alcht_GJ9vDvr8klYAd3wWGx2pMAg3grZ1O2';
  }

  async getWalletPortfolio(walletAddress: string) {
    try {
      console.log(`🔍 VibeFusion Frontend: Fetching portfolio for ${walletAddress}`);
      
      // Use the actual connected wallet address - no test mode
      console.log(`🔑 Using Alchemy API Key: ${this.alchemyApiKey.slice(0, 8)}...`);
      
      // Get Ethereum mainnet portfolio (primary)
      const ethMainnetBalances = await this.getChainPortfolio(walletAddress, 'eth-mainnet');
      
      // Try Base and Polygon but don't fail if they don't work
      let baseBalances: any = { tokens: [], ethValue: 0, network: 'base-mainnet', error: 'API_KEY_LIMITED' };
      let polygonBalances: any = { tokens: [], ethValue: 0, network: 'polygon-mainnet', error: 'API_KEY_LIMITED' };
      
      try {
        const baseResult = await this.getChainPortfolio(walletAddress, 'base-mainnet');
        if (!baseResult.error) {
          baseBalances = baseResult;
        }
      } catch (error) {
        console.warn(`⚠️ Base network not available with current API key`);
      }
      
      try {
        const polygonResult = await this.getChainPortfolio(walletAddress, 'polygon-mainnet');
        if (!polygonResult.error) {
          polygonBalances = polygonResult;
        }
      } catch (error) {
        console.warn(`⚠️ Polygon network not available with current API key`);
      }

      // Log network status
      console.log(`🌐 Network Status:`);
      console.log(`  - Ethereum: ${ethMainnetBalances.error ? '❌ ' + ethMainnetBalances.error : '✅ Connected'}`);
      console.log(`  - Base: ${baseBalances.error ? '⚠️ Limited API Access' : '✅ Connected'}`);
      console.log(`  - Polygon: ${polygonBalances.error ? '⚠️ Limited API Access' : '✅ Connected'}`);

      // Combine all balances (prioritizing Ethereum mainnet)
      const allTokens = [
        ...ethMainnetBalances.tokens,
        ...baseBalances.tokens,
        ...polygonBalances.tokens
      ];

      const totalEthValue = ethMainnetBalances.ethValue + baseBalances.ethValue + polygonBalances.ethValue;

      console.log(`📊 Total tokens found: ${allTokens.length}`);
      console.log(`💰 Total ETH across chains: ${totalEthValue.toFixed(6)}`);
      console.log(`📋 Token breakdown:`);
      allTokens.forEach(token => {
        console.log(`  - ${token.symbol}: ${token.balance.toFixed(6)} (${token.network})`);
      });

      // If no tokens found, provide helpful debugging info (but don't show dummy data)
      if (allTokens.length === 0 && totalEthValue === 0) {
        console.warn(`⚠️ No assets found for wallet ${walletAddress}`);
        console.warn(`   This could mean:`);
        console.warn(`   1. Wallet is empty on supported chains (Ethereum mainnet)`);
        console.warn(`   2. Assets are on unsupported chains (Base/Polygon require paid API key)`);
        console.warn(`   3. Wallet address is incorrect`);
        console.warn(`   4. API key has limited access`);
        
        // Return empty portfolio - no dummy data
        return {
          success: true,
          data: {
            totalValue: 0,
            dailyChange: 0,
            dailyPercentage: 0,
            assets: [],
            assetCount: 0,
            lastUpdated: new Date().toISOString(),
            networkStatus: {
              ethereum: !ethMainnetBalances.error,
              base: !baseBalances.error,
              polygon: !polygonBalances.error,
              errors: {
                ethereum: ethMainnetBalances.error || null,
                base: baseBalances.error || null,
                polygon: polygonBalances.error || null
              }
            },
            message: 'No assets found in your wallet on supported networks.'
          }
        };
      }
      const symbols = Array.from(new Set([
        ...allTokens.map(t => t.symbol),
        'ETH'
      ]));
      
      console.log(`💱 Fetching prices for: ${symbols.join(', ')}`);
      
      // Get current prices for all tokens
      const prices = await this.getCurrentPrices(symbols);
      
      // Calculate combined portfolio
      const portfolio = await this.calculateMultiChainPortfolio(allTokens, totalEthValue, prices);
      
      console.log(`✅ VibeFusion Frontend: Portfolio calculated successfully`);
      console.log(`📊 Total assets found: ${portfolio.assets.length}`);
      console.log(`💰 Total portfolio value: $${portfolio.totalValue.toFixed(2)}`);
      
      // Add network status to response
      const portfolioWithStatus = {
        ...portfolio,
        networkStatus: {
          ethereum: !ethMainnetBalances.error,
          base: !baseBalances.error,
          polygon: !polygonBalances.error,
          errors: {
            ethereum: ethMainnetBalances.error || null,
            base: baseBalances.error || null,
            polygon: polygonBalances.error || null
          }
        }
      };
      
      return {
        success: true,
        data: portfolioWithStatus
      };
    } catch (error) {
      console.error('❌ VibeFusion Frontend: Portfolio service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getChainPortfolio(walletAddress: string, network: string) {
    try {
      console.log(`🔍 Fetching ${network} portfolio for ${walletAddress}`);
      
      // Get token balances for the specific network
      const tokenResponse = await fetch(`https://${network}.g.alchemy.com/v2/${this.alchemyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [walletAddress]
        })
      });

      if (!tokenResponse.ok) {
        console.warn(`❌ ${network} API returned ${tokenResponse.status}: ${tokenResponse.statusText}`);
        if (tokenResponse.status === 403) {
          console.warn(`🔑 API key may not support ${network} - skipping this network`);
          return {
            tokens: [],
            ethValue: 0,
            network,
            error: 'API_KEY_NOT_SUPPORTED'
          };
        }
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.warn(`❌ ${network} API error:`, tokenData.error);
        return {
          tokens: [],
          ethValue: 0,
          network,
          error: tokenData.error.message
        };
      }

      const balances = tokenData.result?.tokenBalances || [];
      console.log(`📊 ${network}: Found ${balances.length} token balances`);
      
      // Get ETH balance for this network
      const ethResponse = await fetch(`https://${network}.g.alchemy.com/v2/${this.alchemyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [walletAddress, 'latest']
        })
      });

      let ethBalance = 0;
      if (ethResponse.ok) {
        const ethData = await ethResponse.json();
        if (!ethData.error) {
          const balanceWei = ethData.result || '0x0';
          ethBalance = parseInt(balanceWei, 16) / Math.pow(10, 18);
          console.log(`💰 ${network} ETH balance: ${ethBalance.toFixed(6)}`);
        }
      }

      const validTokens = [];

      // Process token balances
      for (const balance of balances) {
        if (balance.tokenBalance !== '0x0' && balance.tokenBalance !== '0x') {
          try {
            console.log(`🔍 ${network}: Processing token ${balance.contractAddress}, balance: ${balance.tokenBalance}`);
            const metadata = await this.getTokenMetadata(balance.contractAddress, network);
            if (metadata.success && metadata.data) {
              const balanceValue = parseInt(balance.tokenBalance, 16);
              console.log(`📊 ${network}: ${metadata.data.symbol} raw balance: ${balanceValue}`);
              
              if (balanceValue > 0) {
                const actualBalance = balanceValue / Math.pow(10, metadata.data.decimals || 18);
                console.log(`💰 ${network}: ${metadata.data.symbol} actual balance: ${actualBalance}`);
                
                // Much lower threshold - include ANY positive balance
                if (actualBalance > 0) {
                  validTokens.push({
                    contractAddress: balance.contractAddress,
                    balance: actualBalance,
                    symbol: metadata.data.symbol,
                    name: metadata.data.name,
                    decimals: metadata.data.decimals || 18,
                    network: network,
                    logo: metadata.data.logo
                  });
                  console.log(`✅ ${network}: Added ${metadata.data.symbol} = ${actualBalance.toFixed(6)}`);
                } else {
                  console.log(`❌ ${network}: ${metadata.data.symbol} balance too low: ${actualBalance}`);
                }
              } else {
                console.log(`❌ ${network}: ${metadata.data.symbol} zero balance`);
              }
            } else {
              console.log(`❌ ${network}: Failed to get metadata for ${balance.contractAddress}`);
            }
          } catch (error) {
            console.warn(`❌ ${network}: Failed to process token ${balance.contractAddress}:`, error);
          }
        }
      }

      console.log(`✅ ${network}: Processed ${validTokens.length} valid tokens`);

      return {
        tokens: validTokens,
        ethValue: ethBalance,
        network
      };
    } catch (error) {
      console.error(`❌ Error fetching ${network} portfolio:`, error);
      return {
        tokens: [],
        ethValue: 0,
        network,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTokenMetadata(contractAddress: string, network: string) {
    try {
      const response = await fetch(`https://${network}.g.alchemy.com/v2/${this.alchemyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenMetadata',
          params: [contractAddress]
        })
      });

      const data = await response.json();
      const metadata = data.result;
      
      if (metadata && metadata.symbol) {
        return {
          success: true,
          data: {
            symbol: metadata.symbol,
            name: metadata.name || metadata.symbol,
            decimals: metadata.decimals || 18,
            logo: metadata.logo
          }
        };
      }
      
      return { success: false, error: 'No metadata found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async calculateMultiChainPortfolio(allTokens: any[], totalEthValue: number, prices: any) {
    const assets = [];
    let totalValue = 0;

    console.log(`🔄 Processing ${allTokens.length} tokens with ETH value: ${totalEthValue}`);

    // Add ETH if balance > 0
    if (totalEthValue > 0) {
      const ethPrice = prices['ETH']?.price || 0;
      const ethValue = totalEthValue * ethPrice;
      
      assets.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: totalEthValue.toFixed(6),
        price: ethPrice,
        value: ethValue,
        change24h: prices['ETH']?.change24h || 0,
        percentage: 0,
        contractAddress: null,
        network: 'multi'
      });
      
      totalValue += ethValue;
      console.log(`💰 ETH: ${totalEthValue.toFixed(6)} = $${ethValue.toFixed(2)}`);
    }

    // Group tokens by symbol to combine same tokens from different networks
    const tokenGroups: { [symbol: string]: any } = {};
    
    for (const token of allTokens) {
      if (tokenGroups[token.symbol]) {
        tokenGroups[token.symbol].balance += token.balance;
        tokenGroups[token.symbol].networks.push(token.network);
      } else {
        tokenGroups[token.symbol] = {
          ...token,
          networks: [token.network]
        };
      }
    }

    // Process grouped tokens with much lower value threshold
    for (const [symbol, token] of Object.entries(tokenGroups)) {
      try {
        const balance = token.balance;
        
        if (balance > 0) {
          const priceInfo = prices[symbol] || { price: 0, change24h: 0 };
          const value = balance * priceInfo.price;
          
          // Include ALL tokens with positive balance, regardless of USD value
          assets.push({
            symbol: token.symbol,
            name: token.name,
            balance: balance.toFixed(Math.min(token.decimals, 6)),
            price: priceInfo.price,
            value: value,
            change24h: priceInfo.change24h,
            percentage: 0,
            contractAddress: token.contractAddress,
            network: token.networks.length > 1 ? 'multi' : token.networks[0],
            logo: token.logo
          });
          
          totalValue += value;
          console.log(`🪙 ${symbol}: ${balance.toFixed(6)} × $${priceInfo.price} = $${value.toFixed(6)}`);
        }
      } catch (error) {
        console.error(`Error processing token ${symbol}:`, error);
      }
    }

    // Calculate percentages
    assets.forEach(asset => {
      asset.percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });

    // Sort by value (highest first)
    assets.sort((a, b) => b.value - a.value);

    // Calculate daily change
    const dailyChange = assets.reduce((sum, asset) => {
      const previousValue = asset.value / (1 + (asset.change24h / 100));
      return sum + (asset.value - previousValue);
    }, 0);

    const dailyPercentage = totalValue > 0 ? (dailyChange / (totalValue - dailyChange)) * 100 : 0;

    console.log(`✅ Portfolio: ${assets.length} assets, total value: $${totalValue.toFixed(2)}`);

    return {
      totalValue,
      dailyChange,
      dailyPercentage,
      assets,
      assetCount: assets.length,
      lastUpdated: new Date().toISOString()
    };
  }

  async getCurrentPrices(symbols: string[]) {
    try {
      // Enhanced symbol to CoinGecko ID mapping
      const symbolToId: { [key: string]: string } = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'BTCB': 'bitcoin',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'MATIC': 'matic-network',
        'COMP': 'compound-governance-token',
        'DAI': 'dai',
        'WBTC': 'wrapped-bitcoin',
        'CRV': 'curve-dao-token',
        'SNX': 'havven',
        'MKR': 'maker',
        'YFI': 'yearn-finance',
        'USUI': 'sui',
        'SKYA': 'sekuya-multiverse',
        'BRIAN': 'brian-token',
        'USOL': 'solana'
      };

      const ids = symbols
        .map(symbol => symbolToId[symbol] || symbol.toLowerCase())
        .filter(id => id)
        .join(',');
      
      if (!ids) {
        return this.getFallbackPrices();
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      );

      if (!response.ok) {
        return this.getFallbackPrices();
      }

      const data = await response.json();
      const prices: { [key: string]: any } = {};
      
      Object.keys(data).forEach(id => {
        const symbol = Object.keys(symbolToId).find(key => symbolToId[key] === id) || id.toUpperCase();
        prices[symbol] = {
          price: data[id].usd || 0,
          change24h: data[id].usd_24h_change || 0,
          marketCap: data[id].usd_market_cap || 0
        };
      });

      // Add prices for symbols that map to the same coin
      if (prices['BTC']) {
        prices['BTCB'] = prices['BTC'];
        prices['WBTC'] = prices['BTC'];
      }
      
      if (prices['SOL']) {
        prices['USOL'] = prices['SOL'];
      }

      console.log(`📈 Fetched prices for ${Object.keys(prices).length} tokens`);
      return prices;
    } catch (error) {
      console.error('Price fetch error:', error);
      return this.getFallbackPrices();
    }
  }

  getFallbackPrices() {
    return {
      'ETH': { price: 2600, change24h: 1.5, marketCap: 312000000000 },
      'BTC': { price: 43000, change24h: 2.1, marketCap: 845000000000 },
      'BTCB': { price: 43000, change24h: 2.1, marketCap: 845000000000 },
      'USDC': { price: 1, change24h: 0, marketCap: 32000000000 },
      'USDT': { price: 1, change24h: 0, marketCap: 83000000000 },
      'UNI': { price: 6.75, change24h: 0.9, marketCap: 5000000000 },
      'LINK': { price: 15.20, change24h: 3.2, marketCap: 8500000000 },
      'AAVE': { price: 95.40, change24h: -1.2, marketCap: 1400000000 },
      'MATIC': { price: 0.85, change24h: -0.5, marketCap: 8000000000 }
    };
  }

  async getHistoricalData(symbol: string, days: number = 7) {
    try {
      console.log(`📈 VibeFusion Frontend: Fetching historical data for ${symbol}`);
      
      const symbolToId: { [key: string]: string } = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'BTCB': 'bitcoin',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'MATIC': 'matic-network',
        'COMP': 'compound-governance-token',
        'DAI': 'dai',
        'WBTC': 'wrapped-bitcoin',
        'CRV': 'curve-dao-token',
        'SNX': 'havven',
        'MKR': 'maker',
        'YFI': 'yearn-finance',
        'USUI': 'sui',
        'SKYA': 'sekuya-multiverse',
        'BRIAN': 'brian-token',
        'USOL': 'solana'
      };

      const coinId = symbolToId[symbol] || symbol.toLowerCase();
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      
      const chartData = data.prices?.map((price: [number, number]) => ({
        timestamp: price[0],
        price: price[1],
        date: new Date(price[0]).toISOString()
      })) || [];

      return {
        success: true,
        data: {
          symbol,
          prices: chartData,
          days
        }
      };
    } catch (error) {
      console.error('❌ VibeFusion Frontend: Historical data service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new PortfolioService();
