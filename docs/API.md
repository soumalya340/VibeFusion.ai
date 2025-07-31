# VibeFusion.ai API Documentation

## 📖 Overview

The VibeFusion.ai API provides comprehensive endpoints for decentralized trading, portfolio management, AI agent orchestration, and real-time market data. This RESTful API is built with Express.js and supports JWT authentication, real-time WebSocket connections, and multi-chain blockchain integration.

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://api.vibefusion.ai/api
```

## 🔐 Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Wallet Connection Flow

1. **Connect Wallet**: Submit wallet address and signature
2. **Receive JWT**: Get authentication token
3. **Access Protected Routes**: Include token in subsequent requests

## 📋 API Endpoints

## 🔑 Authentication Endpoints

### POST `/auth/connect-wallet`
Authenticate user via wallet signature.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68",
  "signature": "0x1234567890abcdef...",
  "message": "Sign this message to authenticate with VibeFusion.ai"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f1b2b3c4d5e6f7a8b9c0d1",
    "walletAddress": "0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68",
    "username": null,
    "email": null,
    "riskProfile": {
      "tolerance": "moderate",
      "experience": "beginner",
      "maxRiskPerTrade": 5
    }
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Validation failed",
  "details": [
    {
      "field": "walletAddress",
      "message": "Invalid wallet address format"
    }
  ]
}

// 401 Unauthorized
{
  "error": "Invalid signature",
  "message": "Wallet signature verification failed"
}
```

---

### GET `/auth/verify`
Verify JWT token and get user information.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "60f1b2b3c4d5e6f7a8b9c0d1",
    "walletAddress": "0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68",
    "username": "crypto_trader_123",
    "email": "trader@example.com",
    "riskProfile": {
      "tolerance": "aggressive",
      "experience": "advanced",
      "maxRiskPerTrade": 15
    },
    "tradingPreferences": {
      "autoTradingEnabled": true,
      "maxDailyTrades": 20,
      "tradingBudget": 5000
    }
  }
}
```

---

### POST `/auth/risk-assessment`
Complete user risk assessment profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "riskTolerance": "aggressive",
  "investmentExperience": "advanced",
  "investmentGoals": ["growth", "speculation"],
  "maxRiskPerTrade": 15.0,
  "preferredAssets": ["crypto", "defi_tokens"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Risk assessment completed successfully",
  "riskProfile": {
    "tolerance": "aggressive",
    "experience": "advanced",
    "maxRiskPerTrade": 15,
    "riskScore": 85
  }
}
```

---

### PUT `/auth/profile`
Update user profile information.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "crypto_master_2025",
  "email": "newtrader@example.com"
}
```

---

### POST `/auth/logout`
Logout user (client-side token removal).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 💼 Portfolio Endpoints

### GET `/portfolio`
Get user's portfolio information.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "portfolio": {
    "totalValue": 15420.75,
    "totalProfit": 3420.75,
    "totalProfitPercentage": 28.5,
    "dailyChange": 234.50,
    "assets": [
      {
        "symbol": "ETH",
        "name": "Ethereum",
        "balance": 5.25,
        "averagePrice": 2200.00,
        "currentPrice": 2580.75,
        "value": 13549.94,
        "profit": 1999.94,
        "profitPercentage": 17.3,
        "lastUpdated": "2025-01-31T10:30:00Z"
      },
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "balance": 0.045,
        "averagePrice": 40000.00,
        "currentPrice": 42350.25,
        "value": 1905.76,
        "profit": 105.76,
        "profitPercentage": 5.9,
        "lastUpdated": "2025-01-31T10:30:00Z"
      }
    ],
    "riskMetrics": {
      "volatility": 0.34,
      "sharpeRatio": 1.85,
      "maxDrawdown": 0.15,
      "beta": 1.2
    }
  }
}
```

---

### GET `/portfolio/wallet/:address`
Get real portfolio data for any wallet address (public endpoint).

**Parameters:**
- `address` (string): Ethereum wallet address

**Example:**
```http
GET /portfolio/wallet/0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalValue": 8750.25,
    "assets": [
      {
        "symbol": "ETH",
        "balance": 3.2,
        "price": 2580.75,
        "value": 8258.40,
        "network": "ethereum",
        "change24h": 2.45
      },
      {
        "symbol": "MATIC",
        "balance": 578.90,
        "price": 0.85,
        "value": 492.07,
        "network": "polygon",
        "change24h": -1.2
      }
    ],
    "networks": {
      "ethereum": {
        "totalValue": 8258.40,
        "tokenCount": 1
      },
      "polygon": {
        "totalValue": 492.07,
        "tokenCount": 1
      }
    },
    "lastUpdated": "2025-01-31T10:35:00Z"
  }
}
```

---

### POST `/portfolio/sync`
Sync portfolio with blockchain data.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Portfolio synced successfully",
  "portfolio": {
    // Updated portfolio data
  }
}
```

---

### GET `/portfolio/performance`
Get portfolio performance history.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `period` (string): 7d, 30d, 90d, 1y (default: 30d)

**Example:**
```http
GET /portfolio/performance?period=30d
```

**Response (200 OK):**
```json
{
  "success": true,
  "performance": [
    {
      "date": "2025-01-01T00:00:00Z",
      "totalValue": 12000.00,
      "dailyReturn": 0.02,
      "cumulativeReturn": 0.15
    },
    {
      "date": "2025-01-02T00:00:00Z",
      "totalValue": 12250.00,
      "dailyReturn": 0.021,
      "cumulativeReturn": 0.171
    }
  ],
  "riskMetrics": {
    "volatility": 0.34,
    "sharpeRatio": 1.85,
    "maxDrawdown": 0.15
  },
  "summary": {
    "totalValue": 15420.75,
    "totalProfit": 3420.75,
    "totalProfitPercentage": 28.5
  }
}
```

---

### POST `/portfolio/add-asset`
Add asset to portfolio manually.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "symbol": "ADA",
  "name": "Cardano",
  "balance": 1000.0,
  "averagePrice": 0.40,
  "currentPrice": 0.425
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Asset added to portfolio",
  "portfolio": {
    // Updated portfolio data
  }
}
```

---

### DELETE `/portfolio/remove-asset/:symbol`
Remove asset from portfolio.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `symbol` (string): Asset symbol (e.g., ETH, BTC)

**Request Body (optional):**
```json
{
  "amount": 0.5  // Partial removal amount
}
```

---

### GET `/portfolio/historical/:symbol`
Get historical price data for a token.

**Parameters:**
- `symbol` (string): Token symbol

**Query Parameters:**
- `days` (number): Number of days (default: 7)

**Example:**
```http
GET /portfolio/historical/ETH?days=30
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-01T00:00:00Z",
      "price": 2400.00,
      "volume": 15000000
    },
    {
      "date": "2025-01-02T00:00:00Z",
      "price": 2450.25,
      "volume": 18500000
    }
  ]
}
```

## 📈 Trading Endpoints

### GET `/trading/signals`
Get AI-generated trading signals.

**Response (200 OK):**
```json
{
  "success": true,
  "signals": [
    {
      "id": "signal_001",
      "symbol": "ETH",
      "type": "buy",
      "confidence": 85,
      "strength": "strong",
      "reason": "Strong technical indicators and positive sentiment",
      "targetPrice": 2650.00,
      "stopLoss": 2450.00,
      "timeframe": "4h",
      "timestamp": "2025-01-31T10:45:00Z",
      "technicalIndicators": {
        "rsi": 35,
        "macd": "bullish",
        "ema": "above",
        "volume": "increasing"
      }
    },
    {
      "id": "signal_002",
      "symbol": "BTC",
      "type": "sell",
      "confidence": 72,
      "strength": "moderate",
      "reason": "Resistance at current levels, profit taking recommended",
      "targetPrice": 41500.00,
      "stopLoss": 43000.00,
      "timeframe": "1d",
      "timestamp": "2025-01-31T10:45:00Z"
    }
  ]
}
```

---

### POST `/trading/execute`
Execute a trade order.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "symbol": "ETH",
  "type": "buy",
  "amount": 1.0,
  "orderType": "market",
  "stopLoss": 2450.00,
  "takeProfit": 2750.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "trade": {
    "id": "trade_001",
    "symbol": "ETH",
    "type": "buy",
    "amount": 1.0,
    "price": 2580.75,
    "value": 2580.75,
    "status": "executed",
    "executedAt": "2025-01-31T10:50:00Z",
    "fees": 12.90
  }
}
```

---

### GET `/trading/history`
Get trading history.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)
- `status` (string): Filter by status
- `symbol` (string): Filter by symbol

**Response (200 OK):**
```json
{
  "success": true,
  "trades": [
    {
      "id": "trade_001",
      "symbol": "ETH",
      "type": "buy",
      "amount": 2.0,
      "price": 2300.00,
      "value": 4600.00,
      "status": "executed",
      "executedAt": "2025-01-30T14:30:00Z",
      "profit": 561.50,
      "profitPercentage": 12.2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### GET `/trading/positions`
Get current open positions.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "positions": [
    {
      "symbol": "ETH",
      "amount": 3.5,
      "averagePrice": 2400.00,
      "currentPrice": 2580.75,
      "unrealizedPnL": 632.63,
      "unrealizedPnLPercentage": 7.5,
      "openDate": "2025-01-25T09:15:00Z"
    }
  ]
}
```

## 🤖 AI Agents Endpoints

### GET `/agents`
Get all AI agents with status and performance.

**Query Parameters:**
- `status` (string): Filter by status (active, inactive, error)
- `type` (string): Filter by type (trading, analysis, risk)

**Response (200 OK):**
```json
{
  "success": true,
  "agents": [
    {
      "id": "trade-executor",
      "name": "Trade Executor",
      "type": "trading",
      "status": "active",
      "description": "Executes trades based on signals with risk management",
      "performance": {
        "winRate": 72.5,
        "totalTrades": 156,
        "profit": 2847.50,
        "averageHoldTime": "4h 23m",
        "sharpeRatio": 1.8
      },
      "settings": {
        "riskPerTrade": 2.5,
        "maxPositions": 5,
        "stopLoss": 3.0,
        "takeProfit": 6.0
      },
      "lastActive": "2025-01-31T10:48:00Z",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "statistics": {
    "totalAgents": 4,
    "activeAgents": 3,
    "inactiveAgents": 1,
    "averagePerformance": 68.5
  }
}
```

---

### GET `/agents/:agentId`
Get specific agent details.

**Parameters:**
- `agentId` (string): Agent identifier

**Response (200 OK):**
```json
{
  "success": true,
  "agent": {
    "id": "market-analyzer",
    "name": "Market Analyzer",
    "type": "analysis",
    "status": "active",
    "description": "Analyzes market trends and generates trading signals",
    "performance": {
      "accuracy": 84.2,
      "totalSignals": 324,
      "successfulSignals": 273,
      "averageConfidence": 78.5,
      "responseTime": "1.2s"
    },
    "settings": {
      "timeframes": ["1h", "4h", "1d"],
      "indicators": ["RSI", "MACD", "EMA", "Volume"],
      "confidenceThreshold": 70
    },
    "lastActive": "2025-01-31T10:49:30Z"
  }
}
```

---

### POST `/agents/:agentId/start`
Start an AI agent.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `agentId` (string): Agent identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Agent started successfully",
  "agent": {
    "id": "trade-executor",
    "status": "active",
    "lastActive": "2025-01-31T10:50:00Z"
  }
}
```

---

### POST `/agents/:agentId/stop`
Stop an AI agent.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Agent stopped successfully",
  "agent": {
    "id": "trade-executor",
    "status": "inactive",
    "lastActive": "2025-01-31T10:50:00Z"
  }
}
```

---

### PUT `/agents/:agentId/settings`
Update agent settings.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "settings": {
    "riskPerTrade": 3.0,
    "maxPositions": 8,
    "confidenceThreshold": 75
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Agent settings updated successfully",
  "agent": {
    "id": "trade-executor",
    "settings": {
      "riskPerTrade": 3.0,
      "maxPositions": 8,
      "stopLoss": 3.0,
      "takeProfit": 6.0,
      "confidenceThreshold": 75
    }
  }
}
```

---

### GET `/agents/:agentId/performance`
Get agent performance metrics.

**Parameters:**
- `agentId` (string): Agent identifier

**Query Parameters:**
- `period` (string): 7d, 30d, 90d (default: 30d)

**Response (200 OK):**
```json
{
  "success": true,
  "performance": {
    "period": "30d",
    "metrics": {
      "totalTrades": 45,
      "winningTrades": 32,
      "losingTrades": 13,
      "winRate": 71.1,
      "totalProfit": 1250.75,
      "averageProfit": 27.79,
      "sharpeRatio": 1.65,
      "maxDrawdown": 0.08
    },
    "dailyPerformance": [
      {
        "date": "2025-01-30",
        "trades": 3,
        "profit": 125.50,
        "winRate": 66.7
      }
    ]
  }
}
```

---

### GET `/agents/:agentId/logs`
Get agent activity logs.

**Parameters:**
- `agentId` (string): Agent identifier

**Query Parameters:**
- `limit` (number): Number of logs (default: 50)
- `level` (string): Log level filter (info, warning, error)

**Response (200 OK):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_001",
      "level": "info",
      "message": "Trade signal generated for ETH",
      "timestamp": "2025-01-31T10:45:00Z",
      "metadata": {
        "symbol": "ETH",
        "confidence": 85,
        "action": "buy"
      }
    },
    {
      "id": "log_002",
      "level": "warning",
      "message": "Risk threshold exceeded for BTC trade",
      "timestamp": "2025-01-31T10:30:00Z",
      "metadata": {
        "symbol": "BTC",
        "riskLevel": 8.5,
        "threshold": 7.0
      }
    }
  ]
}
```

## 📊 Market Data Endpoints

### GET `/market-data/prices`
Get current market prices.

**Query Parameters:**
- `symbols` (string): Comma-separated symbols (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "BTC": 42350.25,
    "ETH": 2580.75,
    "ADA": 0.425,
    "SOL": 105.80,
    "MATIC": 0.85,
    "DOT": 8.45,
    "LINK": 15.20,
    "UNI": 6.75
  },
  "timestamp": "2025-01-31T10:45:00Z"
}
```

---

### GET `/market-data/signals`
Get market trading signals.

**Response (200 OK):**
```json
{
  "success": true,
  "signals": [
    {
      "symbol": "ETH",
      "signal": "bullish",
      "confidence": 78,
      "indicators": {
        "rsi": 35,
        "macd": "bullish_crossover",
        "volume": "above_average"
      },
      "recommendation": "buy",
      "targetPrice": 2750.00
    }
  ],
  "timestamp": "2025-01-31T10:45:00Z"
}
```

## 🌐 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');

// Join user-specific rooms
socket.emit('join_portfolio', userId);
socket.emit('join_trading', userId);
```

### Events Received

#### `portfolio_update`
Real-time portfolio value changes.
```json
{
  "userId": "60f1b2b3c4d5e6f7a8b9c0d1",
  "totalValue": 15650.25,
  "dailyChange": 234.50,
  "assets": [
    {
      "symbol": "ETH",
      "currentPrice": 2590.00,
      "value": 13597.50,
      "change": 47.25
    }
  ]
}
```

#### `trade_signal`
New AI trading signals.
```json
{
  "symbol": "BTC",
  "type": "sell",
  "confidence": 82,
  "reason": "Technical resistance level reached",
  "timestamp": "2025-01-31T10:55:00Z"
}
```

#### `trade_executed`
Trade execution notifications.
```json
{
  "userId": "60f1b2b3c4d5e6f7a8b9c0d1",
  "trade": {
    "id": "trade_002",
    "symbol": "ETH",
    "type": "buy",
    "amount": 1.0,
    "price": 2590.00,
    "status": "executed"
  }
}
```

#### `market_data`
Live market data updates.
```json
{
  "symbol": "ETH",
  "price": 2590.00,
  "change24h": 2.45,
  "volume24h": 15000000,
  "timestamp": "2025-01-31T10:55:00Z"
}
```

#### `agent_status`
AI agent status changes.
```json
{
  "agentId": "trade-executor",
  "status": "active",
  "performance": {
    "winRate": 73.2,
    "totalTrades": 158
  }
}
```

## ❌ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### Common Error Codes
- `INVALID_TOKEN` - JWT token is invalid or expired
- `WALLET_NOT_CONNECTED` - Wallet connection required
- `INSUFFICIENT_BALANCE` - Not enough funds for trade
- `RISK_LIMIT_EXCEEDED` - Trade exceeds risk parameters
- `AGENT_NOT_FOUND` - AI agent doesn't exist
- `VALIDATION_ERROR` - Request validation failed

## 🔒 Rate Limiting

### Rate Limits
- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **Trading**: 20 requests per minute
- **WebSocket**: 1000 events per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
Retry-After: 900
```

## 📝 Request/Response Examples

### Complete Trading Flow

1. **Connect Wallet**
```bash
curl -X POST http://localhost:5000/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6639C0532fEb98b6fceb43BB13fc7C68",
    "signature": "0x1234...",
    "message": "Authentication message"
  }'
```

2. **Get Portfolio**
```bash
curl -X GET http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

3. **Get Trading Signals**
```bash
curl -X GET http://localhost:5000/api/trading/signals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

4. **Execute Trade**
```bash
curl -X POST http://localhost:5000/api/trading/execute \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH",
    "type": "buy",
    "amount": 1.0,
    "orderType": "market"
  }'
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Testing with Postman
Import the Postman collection: `VibeFusion_API.postman_collection.json`

### Integration Tests
```bash
npm test
```

## 📚 Additional Resources

- [Frontend Documentation](./FRONTEND.md)
- [Backend Documentation](./BACKEND.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [WebSocket API Reference](./WEBSOCKET.md)

---

**Last Updated**: January 31, 2025  
**Version**: 1.0.0  
**Base URL**: `http://localhost:5000/api`
