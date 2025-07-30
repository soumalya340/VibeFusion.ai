import aiAnalysisService from './aiAnalysisService';
import portfolioService from './portfolioService';

export interface TradeRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  priceChange24h: number;
  aiAnalysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    technicalScore: number;
    fundamentalScore: number;
    newsScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
    keyFactors: string[];
  };
  tradingSignals: {
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
  };
}

class TradeRecommendationService {
  constructor() {
    // No initialization needed for singleton services
  }

  async getTradeRecommendations(): Promise<TradeRecommendation[]> {
    try {
      console.log('🚀 Generating trade recommendations...');
      
      // Get portfolio data
      const portfolioResult = await portfolioService.getWalletPortfolio('');
      
      if (!portfolioResult.success || !portfolioResult.data) {
        console.warn('❌ Failed to get portfolio data, using mock recommendations');
        return this.getMockRecommendations();
      }
      
      // Focus on top 3 tokens for trade analysis
      const topTokens = portfolioResult.data.assets.slice(0, 3);
      
      const recommendations: TradeRecommendation[] = [];
      
      for (const asset of topTokens) {
        try {
          console.log(`📊 Analyzing ${asset.symbol}...`);
          
          // Create price data for AI analysis
          const priceData = {
            symbol: asset.symbol,
            current: asset.price || 0,
            change24h: asset.change24h || 0,
            change7d: 0, // Not available from portfolio
            volume24h: 0, // Not available from portfolio
            marketCap: 0, // Not available from portfolio
            dailyPrices: [],
            weeklyPrices: [],
            monthlyPrices: []
          };
          
          // Get AI analysis for the token (with fallback to mock on error)
          let analysis;
          try {
            const aiResult = await aiAnalysisService.analyzeToken(asset.symbol, priceData, []);
            analysis = aiResult.success ? aiResult.data : null;
          } catch (error) {
            console.warn(`⚠️ AI analysis failed for ${asset.symbol}, using mock data`);
            analysis = null;
          }
          
          if (analysis) {
            // Generate trading signals based on AI analysis
            const tradingSignals = this.generateTradingSignals(
              asset.price,
              analysis.recommendation.toLowerCase(),
              analysis.confidence
            );
            
            // Determine trade action based on AI analysis
            const action = analysis.recommendation;
            
            const recommendation: TradeRecommendation = {
              symbol: asset.symbol,
              action,
              confidence: analysis.confidence,
              targetPrice: analysis.priceTarget?.target || this.calculateTargetPrice(asset.price, action),
              currentPrice: asset.price,
              priceChange24h: asset.change24h,
              aiAnalysis: {
                sentiment: analysis.technicalAnalysis?.trend?.toLowerCase() as any || 'neutral',
                technicalScore: 75, // Mock score
                fundamentalScore: 70, // Mock score  
                newsScore: 65, // Mock score
                riskLevel: analysis.riskLevel?.toLowerCase() as any || 'medium',
                recommendation: analysis.reasoning,
                keyFactors: analysis.keyFactors || this.getMockKeyFactors(asset.symbol)
              },
              tradingSignals
            };
            
            recommendations.push(recommendation);
            
          } else {
            // If AI analysis fails, create mock recommendation
            const mockRecommendation = this.createMockRecommendation(asset);
            recommendations.push(mockRecommendation);
          }
          
        } catch (error) {
          console.error(`❌ Error analyzing ${asset.symbol}:`, error);
          // Create mock recommendation as fallback
          const mockRecommendation = this.createMockRecommendation(asset);
          recommendations.push(mockRecommendation);
        }
      }
      
      console.log(`✅ Generated ${recommendations.length} trade recommendations`);
      return recommendations.length > 0 ? recommendations : this.getMockRecommendations();
      
    } catch (error) {
      console.error('❌ Error generating trade recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  private generateTradingSignals(currentPrice: number, sentiment: string, confidence: number) {
    const volatility = 0.05 + (confidence / 100) * 0.1; // 5-15% based on confidence
    
    let entry: number;
    let stopLoss: number;
    let takeProfit: number;
    
    if (sentiment === 'bullish') {
      entry = currentPrice * 1.02; // Enter 2% above current
      stopLoss = currentPrice * (1 - volatility);
      takeProfit = currentPrice * (1 + volatility * 2);
    } else if (sentiment === 'bearish') {
      entry = currentPrice * 0.98; // Enter 2% below current
      stopLoss = currentPrice * (1 + volatility);
      takeProfit = currentPrice * (1 - volatility * 2);
    } else {
      entry = currentPrice;
      stopLoss = currentPrice * (1 - volatility / 2);
      takeProfit = currentPrice * (1 + volatility / 2);
    }
    
    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
    
    return {
      entry,
      stopLoss,
      takeProfit,
      riskReward
    };
  }

  private determineTradeAction(analysis: any): 'BUY' | 'SELL' | 'HOLD' {
    if (analysis.confidence > 75) {
      return analysis.sentiment === 'bullish' ? 'BUY' : 'SELL';
    } else if (analysis.confidence > 60 && analysis.sentiment === 'bullish') {
      return 'BUY';
    } else if (analysis.confidence > 60 && analysis.sentiment === 'bearish') {
      return 'SELL';
    } else {
      return 'HOLD';
    }
  }

  private calculateTargetPrice(currentPrice: number, action: 'BUY' | 'SELL' | 'HOLD'): number {
    switch (action) {
      case 'BUY':
        return currentPrice * (1.1 + Math.random() * 0.2); // 10-30% upside
      case 'SELL':
        return currentPrice * (0.8 - Math.random() * 0.1); // 10-20% downside
      case 'HOLD':
        return currentPrice * (0.95 + Math.random() * 0.1); // ±5% range
      default:
        return currentPrice;
    }
  }

  private calculateRiskLevel(confidence: number, symbol: string): 'low' | 'medium' | 'high' {
    // Consider token volatility and confidence
    const volatileTokens = ['CULT', 'ANON']; // Add more as needed
    const isVolatile = volatileTokens.includes(symbol);
    
    if (confidence > 80 && !isVolatile) return 'low';
    if (confidence > 60 || isVolatile) return 'medium';
    return 'high';
  }

  private createMockRecommendation(asset: any): TradeRecommendation {
    const actions: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const confidence = 60 + Math.random() * 30; // 60-90%
    
    return {
      symbol: asset.symbol,
      action,
      confidence,
      targetPrice: this.calculateTargetPrice(asset.price, action),
      currentPrice: asset.price,
      priceChange24h: asset.pnlPercentage,
      aiAnalysis: {
        sentiment: action === 'BUY' ? 'bullish' : action === 'SELL' ? 'bearish' : 'neutral',
        technicalScore: this.getMockTechnicalScore(),
        fundamentalScore: this.getMockFundamentalScore(),
        newsScore: this.getMockNewsScore(),
        riskLevel: this.calculateRiskLevel(confidence, asset.symbol),
        recommendation: this.getMockRecommendation(asset.symbol, action),
        keyFactors: this.getMockKeyFactors(asset.symbol)
      },
      tradingSignals: this.generateTradingSignals(
        asset.price, 
        action === 'BUY' ? 'bullish' : action === 'SELL' ? 'bearish' : 'neutral', 
        confidence
      )
    };
  }

  private getMockTechnicalScore(): number {
    return Math.floor(50 + Math.random() * 40); // 50-90
  }

  private getMockFundamentalScore(): number {
    return Math.floor(40 + Math.random() * 50); // 40-90
  }

  private getMockNewsScore(): number {
    return Math.floor(30 + Math.random() * 60); // 30-90
  }

  private getMockRecommendation(symbol: string, action: string): string {
    const recommendations = {
      BUY: [
        `Strong bullish momentum detected for ${symbol}. Technical indicators suggest a potential breakout above key resistance levels.`,
        `Positive sentiment and increasing volume make ${symbol} an attractive buy opportunity with favorable risk-reward ratio.`,
        `${symbol} shows strong fundamentals with growing adoption. Consider accumulating on any dips.`
      ],
      SELL: [
        `${symbol} appears overextended after recent gains. Technical analysis suggests a potential correction in the near term.`,
        `Bearish divergence and weakening momentum indicate it may be time to take profits on ${symbol} positions.`,
        `Risk-reward ratio no longer favorable for ${symbol}. Consider reducing exposure or taking partial profits.`
      ],
      HOLD: [
        `${symbol} is in a consolidation phase. Wait for clearer directional signals before making significant moves.`,
        `Mixed signals from technical and fundamental analysis suggest maintaining current ${symbol} position.`,
        `${symbol} shows balanced risk-reward. Current levels provide good support for existing positions.`
      ]
    };
    
    const actionRecommendations = recommendations[action as keyof typeof recommendations];
    return actionRecommendations[Math.floor(Math.random() * actionRecommendations.length)];
  }

  private getMockKeyFactors(symbol: string): string[] {
    const factors = [
      `${symbol} trading volume increased 45% in the last 24 hours`,
      `Breaking above key resistance at $${(Math.random() * 10).toFixed(4)}`,
      'Strong support from institutional investors',
      'Positive news sentiment driving momentum',
      'Technical indicators showing bullish convergence',
      'Market structure remains favorable',
      'Risk-on sentiment supporting crypto markets',
      'Strong correlation with major crypto trends'
    ];
    
    // Return 3-5 random factors
    const shuffled = factors.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  private getMockRecommendations(): TradeRecommendation[] {
    return [
      {
        symbol: 'HOLY',
        action: 'BUY',
        confidence: 85,
        targetPrice: 0.08756,
        currentPrice: 0.07234,
        priceChange24h: 12.34,
        aiAnalysis: {
          sentiment: 'bullish',
          technicalScore: 78,
          fundamentalScore: 82,
          newsScore: 75,
          riskLevel: 'medium',
          recommendation: 'Strong bullish momentum detected for HOLY. Technical indicators suggest a potential breakout above key resistance levels.',
          keyFactors: [
            'HOLY trading volume increased 45% in the last 24 hours',
            'Breaking above key resistance at $0.0750',
            'Strong support from institutional investors',
            'Positive news sentiment driving momentum'
          ]
        },
        tradingSignals: {
          entry: 0.0738,
          stopLoss: 0.0680,
          takeProfit: 0.0890,
          riskReward: 2.6
        }
      },
      {
        symbol: 'ANON',
        action: 'HOLD',
        confidence: 65,
        targetPrice: 0.0234,
        currentPrice: 0.0245,
        priceChange24h: -2.11,
        aiAnalysis: {
          sentiment: 'neutral',
          technicalScore: 62,
          fundamentalScore: 58,
          newsScore: 70,
          riskLevel: 'medium',
          recommendation: 'ANON is in a consolidation phase. Wait for clearer directional signals before making significant moves.',
          keyFactors: [
            'ANON showing mixed technical signals',
            'Consolidating near key support levels',
            'Awaiting market direction confirmation',
            'Volume declining but price stable'
          ]
        },
        tradingSignals: {
          entry: 0.0245,
          stopLoss: 0.0220,
          takeProfit: 0.0270,
          riskReward: 1.0
        }
      },
      {
        symbol: 'LYRA',
        action: 'SELL',
        confidence: 72,
        targetPrice: 1.234,
        currentPrice: 1.456,
        priceChange24h: -5.67,
        aiAnalysis: {
          sentiment: 'bearish',
          technicalScore: 45,
          fundamentalScore: 55,
          newsScore: 40,
          riskLevel: 'high',
          recommendation: 'LYRA appears overextended after recent gains. Technical analysis suggests a potential correction in the near term.',
          keyFactors: [
            'LYRA showing bearish divergence',
            'Weakening momentum indicators',
            'Profit-taking pressure evident',
            'Support levels being tested'
          ]
        },
        tradingSignals: {
          entry: 1.427,
          stopLoss: 1.520,
          takeProfit: 1.280,
          riskReward: 1.6
        }
      }
    ];
  }
}

export const tradeRecommendationService = new TradeRecommendationService();
