import NewsService from './newsService';

interface PriceData {
  symbol: string;
  current: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  dailyPrices: { date: string; price: number }[];
  weeklyPrices: { date: string; price: number }[];
  monthlyPrices: { date: string; price: number }[];
}

interface NewsData {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
}

interface AnalysisResult {
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  priceTarget: {
    timeframe: '1W' | '1M' | '3M';
    target: number;
    probability: number;
  };
  reasoning: string;
  keyFactors: string[];
  technicalAnalysis: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    support: number;
    resistance: number;
    momentum: string;
  };
  fundamentalAnalysis: {
    newsImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    marketSentiment: string;
    volumeAnalysis: string;
  };
  timestamp: string;
}

class AIAnalysisService {
  private geminiApiKey: string;
  private geminiUrl: string;

  constructor() {
    this.geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Generate comprehensive AI analysis for a token
   */
  async analyzeToken(
    symbol: string, 
    priceData: PriceData, 
    newsData: NewsData[]
  ): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
      console.log(`🤖 Starting AI analysis for ${symbol}`);

      if (!this.geminiApiKey) {
        console.warn('❌ Gemini API key not configured');
        return {
          success: false,
          error: 'Gemini API key not configured'
        };
      }

      // Prepare the analysis prompt
      const prompt = this.createAnalysisPrompt(symbol, priceData, newsData);
      
      // Call Gemini API
      const response = await fetch(`${this.geminiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent analysis
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        console.error(`❌ Gemini API error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          error: `Gemini API error: ${response.status}`
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('❌ Invalid Gemini API response structure');
        return {
          success: false,
          error: 'Invalid AI response structure'
        };
      }

      const analysisText = data.candidates[0].content.parts[0].text;
      
      // Parse the AI response into structured data
      const parsedAnalysis = this.parseAIResponse(symbol, analysisText);
      
      console.log(`✅ AI analysis completed for ${symbol}`);
      console.log(`📊 Recommendation: ${parsedAnalysis.recommendation} (${parsedAnalysis.confidence}% confidence)`);
      
      return {
        success: true,
        data: parsedAnalysis
      };

    } catch (error) {
      console.error(`❌ Error in AI analysis for ${symbol}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze multiple tokens in batch
   */
  async analyzePortfolio(
    tokens: Array<{ symbol: string; priceData: PriceData }>
  ): Promise<{ success: boolean; data?: { [symbol: string]: AnalysisResult }; error?: string }> {
    try {
      console.log(`🤖 Starting batch AI analysis for ${tokens.length} tokens`);

      const analyses: { [symbol: string]: AnalysisResult } = {};
      
      // Process tokens in parallel but limit concurrency to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ symbol, priceData }) => {
          // Get news for each token
          const newsResult = await NewsService.getTokenNews(symbol, 5);
          const newsData = newsResult.success ? newsResult.data : [];
          
          // Analyze the token
          const analysisResult = await this.analyzeToken(symbol, priceData, newsData);
          
          return { symbol, result: analysisResult };
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ symbol, result }) => {
          if (result.success && result.data) {
            analyses[symbol] = result.data;
          }
        });
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < tokens.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Batch AI analysis completed for ${Object.keys(analyses).length} tokens`);
      
      return {
        success: true,
        data: analyses
      };

    } catch (error) {
      console.error('❌ Error in batch AI analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a comprehensive analysis prompt for Gemini
   */
  private createAnalysisPrompt(symbol: string, priceData: PriceData, newsData: NewsData[]): string {
    const recentNews = newsData.slice(0, 5).map(news => 
      `Title: ${news.title}\nDescription: ${news.description}\nSentiment: ${news.sentiment}\nSource: ${news.source}\nDate: ${news.publishedAt}`
    ).join('\n\n');

    const prompt = `
You are a professional cryptocurrency trading analyst. Analyze the following data for ${symbol} and provide a comprehensive trading recommendation.

PRICE DATA:
- Current Price: $${priceData.current}
- 24h Change: ${priceData.change24h}%
- 7d Change: ${priceData.change7d}%
- 24h Volume: $${priceData.volume24h.toLocaleString()}
- Market Cap: $${priceData.marketCap.toLocaleString()}

RECENT NEWS (Last 5 articles):
${recentNews || 'No recent news available'}

TECHNICAL INDICATORS:
- Daily price trend: ${this.calculateTrend(priceData.dailyPrices)}
- Weekly price trend: ${this.calculateTrend(priceData.weeklyPrices)}
- Volume analysis: ${this.analyzeVolume(priceData)}

Please provide your analysis in the following JSON format:

{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 85,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "priceTarget": {
    "timeframe": "1W|1M|3M",
    "target": 0.00,
    "probability": 75
  },
  "reasoning": "Detailed reasoning for the recommendation based on technical and fundamental analysis",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "technicalAnalysis": {
    "trend": "BULLISH|BEARISH|NEUTRAL",
    "support": 0.00,
    "resistance": 0.00,
    "momentum": "Strong upward momentum based on recent price action"
  },
  "fundamentalAnalysis": {
    "newsImpact": "POSITIVE|NEGATIVE|NEUTRAL",
    "marketSentiment": "Overall market sentiment assessment",
    "volumeAnalysis": "Volume pattern analysis"
  }
}

Consider:
1. Technical analysis (price trends, support/resistance, momentum)
2. Fundamental analysis (news sentiment, market developments)
3. Risk assessment (volatility, market conditions)
4. Volume patterns and market liquidity
5. Overall cryptocurrency market conditions

Provide realistic price targets and honest risk assessments. Be conservative in your confidence levels and always consider downside risks.
`;

    return prompt;
  }

  /**
   * Parse AI response into structured analysis result
   */
  private parseAIResponse(symbol: string, responseText: string): AnalysisResult {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        symbol,
        recommendation: parsed.recommendation || 'HOLD',
        confidence: Math.min(Math.max(parsed.confidence || 50, 0), 100),
        riskLevel: parsed.riskLevel || 'MEDIUM',
        priceTarget: {
          timeframe: parsed.priceTarget?.timeframe || '1M',
          target: parsed.priceTarget?.target || 0,
          probability: Math.min(Math.max(parsed.priceTarget?.probability || 50, 0), 100)
        },
        reasoning: parsed.reasoning || 'Analysis based on current market conditions',
        keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : ['Technical analysis', 'Market sentiment'],
        technicalAnalysis: {
          trend: parsed.technicalAnalysis?.trend || 'NEUTRAL',
          support: parsed.technicalAnalysis?.support || 0,
          resistance: parsed.technicalAnalysis?.resistance || 0,
          momentum: parsed.technicalAnalysis?.momentum || 'Neutral momentum'
        },
        fundamentalAnalysis: {
          newsImpact: parsed.fundamentalAnalysis?.newsImpact || 'NEUTRAL',
          marketSentiment: parsed.fundamentalAnalysis?.marketSentiment || 'Mixed sentiment',
          volumeAnalysis: parsed.fundamentalAnalysis?.volumeAnalysis || 'Normal volume patterns'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback:', error);
      
      // Fallback analysis if parsing fails
      return {
        symbol,
        recommendation: 'HOLD',
        confidence: 50,
        riskLevel: 'MEDIUM',
        priceTarget: {
          timeframe: '1M',
          target: 0,
          probability: 50
        },
        reasoning: 'Unable to complete full AI analysis. Please review manually.',
        keyFactors: ['Technical analysis required', 'Market research needed'],
        technicalAnalysis: {
          trend: 'NEUTRAL',
          support: 0,
          resistance: 0,
          momentum: 'Analysis incomplete'
        },
        fundamentalAnalysis: {
          newsImpact: 'NEUTRAL',
          marketSentiment: 'Analysis incomplete',
          volumeAnalysis: 'Analysis incomplete'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate price trend from historical data
   */
  private calculateTrend(prices: { date: string; price: number }[]): string {
    if (prices.length < 2) return 'Insufficient data';
    
    const firstPrice = prices[0].price;
    const lastPrice = prices[prices.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (change > 5) return 'Strong uptrend';
    if (change > 1) return 'Uptrend';
    if (change < -5) return 'Strong downtrend';
    if (change < -1) return 'Downtrend';
    return 'Sideways';
  }

  /**
   * Analyze volume patterns
   */
  private analyzeVolume(priceData: PriceData): string {
    const avgVolume = priceData.volume24h; // Simplified - would normally calculate average
    
    if (priceData.volume24h > avgVolume * 1.5) {
      return 'High volume - increased interest';
    } else if (priceData.volume24h < avgVolume * 0.5) {
      return 'Low volume - reduced interest';
    }
    return 'Normal volume levels';
  }
}

export default new AIAnalysisService();
