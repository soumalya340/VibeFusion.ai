class MarketDataService {
  constructor() {
    this.priceCache = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    console.log("📈 Starting Market Data Service...");
    this.isRunning = true;
    this.startPriceUpdates();
  }

  stop() {
    console.log("📈 Stopping Market Data Service...");
    this.isRunning = false;
  }

  startPriceUpdates() {
    setInterval(() => {
      if (!this.isRunning) return;
      this.updatePrices();
    }, 5000);
  }

  updatePrices() {
    const symbols = ["BTC", "ETH", "ADA", "SOL", "MATIC"];
    const basePrices = {
      BTC: 42350.25,
      ETH: 2580.75,
      ADA: 0.425,
      SOL: 105.80,
      MATIC: 0.85,
    };

    const updatedPrices = {};
    symbols.forEach(symbol => {
      const basePrice = basePrices[symbol];
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = basePrice * (1 + change);
      
      updatedPrices[symbol] = parseFloat(newPrice.toFixed(8));
      this.priceCache.set(symbol, updatedPrices[symbol]);
    });

    console.log("📊 Updated cryptocurrency prices");
    return updatedPrices;
  }

  async getPrice(symbol) {
    return this.priceCache.get(symbol) || 0;
  }

  async getAllPrices() {
    return Object.fromEntries(this.priceCache);
  }
}

module.exports = MarketDataService;
