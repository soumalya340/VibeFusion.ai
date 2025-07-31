# VibeFusion.ai Documentation

Welcome to the comprehensive documentation for VibeFusion.ai - a decentralized agentic video trading platform powered by AI.

## 📚 Documentation Overview

This documentation provides complete guides for developers, operators, and contributors working with the VibeFusion.ai platform.

### 📑 Available Documents

| Document | Description | Audience |
|----------|-------------|----------|
| **[Frontend Documentation](./FRONTEND.md)** | Complete guide to the Next.js frontend application | Frontend Developers |
| **[Backend Documentation](./BACKEND.md)** | Comprehensive backend API and services guide | Backend Developers |
| **[API Documentation](./API.md)** | RESTful API endpoints and WebSocket events | API Consumers |
| **[Deployment Guide](./DEPLOYMENT.md)** | Production deployment and DevOps guide | DevOps Engineers |

## 🏗️ Architecture Overview

VibeFusion.ai is built as a modern, scalable web3 application with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│   (Cache)       │◄─────────────┘
                        │   Port: 6379    │
                        └─────────────────┘
```

### 🔧 Core Technologies

#### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management
- **Wagmi**: React hooks for Ethereum
- **Framer Motion**: Animation library
- **Socket.io Client**: Real-time communication

#### Backend Stack
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Redis**: In-memory data store
- **Socket.io**: Real-time bidirectional communication
- **JWT**: Authentication tokens
- **Ethers.js**: Ethereum JavaScript library

#### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancer
- **GitHub Actions**: CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/VibeFusion.ai.git
cd VibeFusion.ai

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Start with Docker Compose
docker-compose up -d

# Or start manually
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📖 Documentation Quick Links

### For Developers

#### 🎨 Frontend Development
- [Component Architecture](./FRONTEND.md#-ui-components)
- [State Management](./FRONTEND.md#-state-management)
- [Web3 Integration](./FRONTEND.md#-web3-integration)
- [Styling System](./FRONTEND.md#-styling-system)
- [Testing](./FRONTEND.md#-testing)

#### ⚙️ Backend Development
- [API Routes](./BACKEND.md#-api-routes)
- [Database Models](./BACKEND.md#-database-models)
- [Services Layer](./BACKEND.md#-services-layer)
- [Authentication](./BACKEND.md#-security-implementation)
- [WebSocket Implementation](./BACKEND.md#-real-time-features)

#### 🔗 API Integration
- [Authentication Flow](./API.md#-authentication-endpoints)
- [Portfolio Management](./API.md#-portfolio-endpoints)
- [Trading Operations](./API.md#-trading-endpoints)
- [AI Agents](./API.md#-ai-agents-endpoints)
- [WebSocket Events](./API.md#-websocket-events)

### For DevOps

#### 🚀 Deployment
- [Docker Deployment](./DEPLOYMENT.md#-docker-deployment)
- [Cloud Deployment](./DEPLOYMENT.md#-cloud-deployment)
- [Security Configuration](./DEPLOYMENT.md#-production-security)
- [Monitoring Setup](./DEPLOYMENT.md#-monitoring--logging)
- [CI/CD Pipeline](./DEPLOYMENT.md#-cicd-pipeline)

## 🔑 Key Features

### 💼 Portfolio Management
- Multi-chain wallet integration (Ethereum, Polygon, Base)
- Real-time portfolio tracking
- Performance analytics
- Risk assessment tools

### 🤖 AI Trading Agents
- Automated market analysis
- Smart trading signals
- Risk management
- Performance monitoring

### 📊 Market Data
- Real-time price feeds
- Technical indicators
- News sentiment analysis
- Historical data

### 🔐 Security
- Wallet-based authentication
- JWT token management
- Rate limiting
- Input validation

### ⚡ Real-time Features
- Live portfolio updates
- Trading notifications
- Market data streaming
- Agent status monitoring

## 🔧 Development Workflow

### 1. Environment Setup
```bash
# Frontend development
cd frontend
npm run dev  # http://localhost:3000

# Backend development
cd backend  
npm run dev  # http://localhost:5000
```

### 2. Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Write/update tests
4. Commit with descriptive messages
5. Push and create pull request

### 3. Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Integration tests
npm run test:integration
```

### 4. Building for Production
```bash
# Frontend build
cd frontend && npm run build

# Backend preparation
cd backend && npm start
```

## 📁 Project Structure

```
VibeFusion.ai/
├── frontend/                    # Next.js Frontend Application
│   ├── app/                    # Next.js App Router
│   ├── components/             # React Components
│   ├── services/               # API Services
│   ├── store/                  # Redux Store
│   └── config/                 # Configuration
│
├── backend/                     # Node.js Backend Application
│   ├── src/
│   │   ├── models/             # Database Models
│   │   ├── routes/             # API Routes
│   │   ├── services/           # Business Logic
│   │   ├── middleware/         # Express Middleware
│   │   └── utils/              # Utilities
│   └── tests/                  # Backend Tests
│
├── shared/                      # Shared Types & Constants
│   ├── types.ts               # TypeScript Definitions
│   ├── constants.ts           # Platform Constants
│   └── index.ts               # Exports
│
├── docs/                       # Documentation (this folder)
│   ├── FRONTEND.md            # Frontend Guide
│   ├── BACKEND.md             # Backend Guide
│   ├── API.md                 # API Reference
│   └── DEPLOYMENT.md          # Deployment Guide
│
├── agents/                     # AI Trading Agents (Future)
├── contracts/                  # Smart Contracts (Future)
├── docker-compose.yml         # Development Environment
└── README.md                  # Project Overview
```

## 🔍 API Quick Reference

### Authentication
```bash
# Connect wallet
POST /api/auth/connect-wallet

# Verify token
GET /api/auth/verify
```

### Portfolio
```bash
# Get portfolio
GET /api/portfolio

# Get wallet portfolio
GET /api/portfolio/wallet/:address

# Sync portfolio
POST /api/portfolio/sync
```

### Trading
```bash
# Get signals
GET /api/trading/signals

# Execute trade
POST /api/trading/execute

# Get history
GET /api/trading/history
```

### AI Agents
```bash
# List agents
GET /api/agents

# Start agent
POST /api/agents/:id/start

# Get performance
GET /api/agents/:id/performance
```

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: Cypress for user flows
- **Visual Tests**: Storybook component testing

### Backend Testing
- **Unit Tests**: Service and utility testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing
- **Load Tests**: Performance and scalability

### Test Commands
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🔧 Configuration Management

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ALCHEMY_API_KEY=your-key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-id
```

#### Backend (.env)
```bash
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vibefusion
JWT_SECRET=your-secret
ALCHEMY_API_KEY=your-key
```

### Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `docker-compose.yml` - Development environment

## 📊 Performance Monitoring

### Metrics to Track
- **API Response Times**: Average and 95th percentile
- **Database Queries**: Execution time and frequency
- **Memory Usage**: Heap size and garbage collection
- **Error Rates**: 4xx and 5xx response rates
- **User Metrics**: Page load times and user interactions

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **ELK Stack**: Log aggregation and analysis
- **Sentry**: Error tracking and performance monitoring

## 🔐 Security Considerations

### Frontend Security
- Environment variable protection
- XSS prevention
- CSRF protection
- Content Security Policy

### Backend Security
- JWT token validation
- Rate limiting
- Input sanitization
- SQL injection prevention
- CORS configuration

### Infrastructure Security
- HTTPS/TLS encryption
- Firewall configuration
- Database authentication
- Secret management

## 🤝 Contributing

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive commit messages

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Performance impact considered

## 🆘 Troubleshooting

### Common Issues

#### Frontend
- **Build Errors**: Check TypeScript types and imports
- **API Connection**: Verify NEXT_PUBLIC_API_URL
- **Wallet Issues**: Check WalletConnect configuration

#### Backend
- **Database Connection**: Verify MongoDB URI and credentials
- **Authentication**: Check JWT secret and token validation
- **API Errors**: Review error logs and validation

#### Infrastructure
- **Docker Issues**: Check container logs and ports
- **Network Problems**: Verify service discovery and ports
- **Performance**: Monitor resource usage and scaling

### Debug Commands
```bash
# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Health checks
curl http://localhost:5000/health
curl http://localhost:3000

# Database check
docker-compose exec mongo mongosh
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

### Tutorials
- [Web3 Development](https://ethereum.org/en/developers/)
- [React Best Practices](https://react.dev/learn)
- [Node.js Patterns](https://nodejs.org/en/docs/guides/)

### Community
- [GitHub Issues](https://github.com/your-org/VibeFusion.ai/issues)
- [Discord Channel](#)
- [Developer Forum](#)

---

## 📝 Document Maintenance

This documentation is actively maintained and updated with each release. If you find any issues or have suggestions for improvement, please:

1. **File an Issue**: [GitHub Issues](https://github.com/your-org/VibeFusion.ai/issues)
2. **Submit a PR**: Update documentation and submit pull request
3. **Contact Team**: Reach out via Discord or email

**Last Updated**: January 31, 2025  
**Documentation Version**: 1.0.0  
**Platform Version**: 0.1.0  
**Maintainers**: VibeFusion.ai Development Team
