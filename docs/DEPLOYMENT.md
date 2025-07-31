# VibeFusion.ai Deployment Guide

## 📖 Overview

This guide covers the deployment of VibeFusion.ai to various environments including development, staging, and production. The application consists of a Next.js frontend, Node.js backend, MongoDB database, and Redis cache.

## 🏗️ Architecture Overview

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

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **MongoDB**: 6.x or higher
- **Redis**: 7.x or higher
- **Git**: Latest version

### Development Environment
```bash
# Check versions
node --version    # v18.17.0+
npm --version     # 9.6.7+
git --version     # 2.40.0+
```

## 🌍 Environment Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id
NEXT_PUBLIC_APP_NAME=VibeFusion.ai
NEXT_PUBLIC_CHAIN_ID=1

# Blockchain APIs
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key

# News & Market Data APIs
NEXT_PUBLIC_NEWS_API_KEY=your-news-api-key
NEXT_PUBLIC_CRYPTO_COMPARE_API_KEY=your-crypto-compare-api-key
NEXT_PUBLIC_COINGECKO_API_KEY=your-coingecko-api-key

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

#### Backend (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vibefusion
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
BCRYPT_ROUNDS=12

# API Keys
ALCHEMY_API_KEY=your-alchemy-api-key
COINGECKO_API_KEY=your-coingecko-api-key
NEWS_API_KEY=your-news-api-key

# External Services
WEBSOCKET_PORT=5001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-key
POLYGON_RPC_URL=https://polygon-mainnet.alchemyapi.io/v2/your-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🐳 Docker Deployment

### Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - vibefusion-network

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/vibefusion
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ALCHEMY_API_KEY=${ALCHEMY_API_KEY}
    depends_on:
      - mongo
      - redis
    networks:
      - vibefusion-network

  mongo:
    image: mongo:7
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=vibefusion
    networks:
      - vibefusion-network

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - vibefusion-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - vibefusion-network

volumes:
  mongo_data:
  redis_data:

networks:
  vibefusion-network:
    driver: bridge
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_ALCHEMY_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_CHAIN_ID=$NEXT_PUBLIC_CHAIN_ID
ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Copy source code
COPY --chown=backend:nodejs src/ ./src/

# Switch to non-root user
USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).end()"

# Start the application
CMD ["npm", "start"]
```

### Deployment Commands

```bash
# Clone repository
git clone https://github.com/your-org/VibeFusion.ai.git
cd VibeFusion.ai

# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Edit environment files with your configuration
nano .env
nano frontend/.env.local

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### AWS ECS with Fargate

```yaml
# aws-task-definition.json
{
  "family": "vibefusion-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/vibefusion-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.vibefusion.ai"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vibefusion-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/vibefusion-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:vibefusion/mongodb"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:vibefusion/jwt"
        }
      ]
    }
  ]
}
```

#### AWS CDK Deployment Script

```typescript
// infrastructure/lib/vibefusion-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';

export class VibeFusionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'VibeFusionVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'VibeFusionCluster', {
      vpc,
      clusterName: 'vibefusion-cluster'
    });

    // Application Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'VibeFusionLB', {
      vpc,
      internetFacing: true
    });

    // MongoDB (DocumentDB)
    const docdb = new rds.DatabaseCluster(this, 'VibeFusionDB', {
      engine: rds.DatabaseClusterEngine.auroraMongodbServerless(),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this, 'ParamGroup', 'default.docdb4.0'
      )
    });

    // Redis (ElastiCache)
    const redis = new elasticache.CfnCacheCluster(this, 'VibeFusionRedis', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [vpc.vpcDefaultSecurityGroup]
    });

    // ECS Service definitions...
  }
}
```

### Vercel Deployment (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
# or use Vercel CLI
vercel env add NEXT_PUBLIC_API_URL
```

### Railway Deployment

```yaml
# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10

[environments.production.variables]
  NODE_ENV = "production"
  PORT = "5000"

[environments.production.services.backend]
  source = "backend/"
  
[environments.production.services.frontend]
  source = "frontend/"
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: vibefusion-ai
services:
  - name: frontend
    source_dir: frontend
    github:
      repo: your-username/VibeFusion.ai
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: ${backend.PUBLIC_URL}
    routes:
      - path: /

  - name: backend
    source_dir: backend
    github:
      repo: your-username/VibeFusion.ai
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: ${JWT_SECRET}
    routes:
      - path: /api

databases:
  - name: vibefusion-db
    engine: MONGODB
    version: "5"
    size: db-s-1vcpu-1gb

  - name: vibefusion-redis
    engine: REDIS
    version: "7"
    size: db-s-1vcpu-1gb
```

## 🔒 Production Security

### SSL/TLS Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream backend {
        server backend:5000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name vibefusion.ai www.vibefusion.ai;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Configuration
    server {
        listen 443 ssl http2;
        server_name vibefusion.ai www.vibefusion.ai;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket Support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Security Checklist

- [ ] **Environment Variables**: All secrets in environment variables
- [ ] **HTTPS**: SSL/TLS certificates properly configured
- [ ] **JWT Secret**: Strong, unique JWT secret (min 32 characters)
- [ ] **CORS**: Proper CORS configuration for production domains
- [ ] **Rate Limiting**: API rate limits configured
- [ ] **Input Validation**: All user inputs validated
- [ ] **Security Headers**: HTTP security headers configured
- [ ] **Database Security**: MongoDB authentication enabled
- [ ] **Redis Security**: Redis password protection
- [ ] **Firewall**: Proper firewall rules
- [ ] **Updates**: Regular dependency updates
- [ ] **Monitoring**: Error tracking and monitoring
- [ ] **Backups**: Automated database backups

## 📊 Monitoring & Logging

### Application Monitoring

```javascript
// backend/src/middleware/monitoring.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});

// Middleware
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path)
      .observe(duration);
  });
  
  next();
};

module.exports = { monitoringMiddleware };
```

### Health Checks

```javascript
// backend/src/routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('../config/redis');

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();
    health.services.mongodb = { status: 'connected' };
  } catch (error) {
    health.services.mongodb = { status: 'disconnected', error: error.message };
    health.status = 'ERROR';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.redis = { status: 'connected' };
  } catch (error) {
    health.services.redis = { status: 'disconnected', error: error.message };
    health.status = 'ERROR';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
  };

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

module.exports = router;
```

### Log Aggregation

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # ... existing services ...

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  elasticsearch_data:
  grafana_data:
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy VibeFusion.ai

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            backend/package-lock.json
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm test
      
      - name: Run backend tests
        run: |
          cd backend
          npm test
      
      - name: Run frontend build
        run: |
          cd frontend
          npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        service: [frontend, backend]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment script here
          # This could be kubectl, docker-compose, or cloud provider CLI
          echo "Deploying to production..."
```

### Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting VibeFusion.ai deployment..."

# Configuration
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}

echo "📋 Environment: $ENVIRONMENT"
echo "🏷️  Image Tag: $IMAGE_TAG"

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🔍 Performing health checks..."
curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1

echo "✅ Deployment completed successfully!"

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 VibeFusion.ai is now live!"
```

## 🔄 Backup & Recovery

### Database Backup

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/vibefusion"
DATE=$(date +%Y%m%d_%H%M%S)
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/vibefusion"}

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB backup
echo "📦 Creating MongoDB backup..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Compress backup
echo "🗜️  Compressing backup..."
tar -czf "$BACKUP_DIR/vibefusion_backup_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/mongodb_$DATE"

# Upload to cloud storage (optional)
# aws s3 cp "$BACKUP_DIR/vibefusion_backup_$DATE.tar.gz" s3://your-backup-bucket/

echo "✅ Backup completed: vibefusion_backup_$DATE.tar.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "vibefusion_backup_*.tar.gz" -mtime +7 -delete
```

### Automated Backup with Cron

```bash
# Add to crontab (crontab -e)
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh

# Weekly full system backup
0 3 * * 0 /path/to/scripts/full-backup.sh
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    build: ./backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      - NODE_ENV=production
    depends_on:
      - mongo
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
```

### Load Balancer Configuration

```nginx
# nginx-lb.conf
upstream backend_pool {
    least_conn;
    server backend_1:5000 weight=1 max_fails=3 fail_timeout=30s;
    server backend_2:5000 weight=1 max_fails=3 fail_timeout=30s;
    server backend_3:5000 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location /api {
        proxy_pass http://backend_pool;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

#### 2. Database Connection Issues
```bash
# Check MongoDB connection
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Check Redis connection
docker-compose exec redis redis-cli ping

# Verify environment variables
docker-compose exec backend printenv | grep MONGODB_URI
```

#### 3. Port Conflicts
```bash
# Check what's using the port
lsof -i :5000
lsof -i :3000

# Kill process using port
kill -9 $(lsof -ti:5000)
```

#### 4. Memory Issues
```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Debug Mode

```bash
# Enable debug mode
export DEBUG=true
export LOG_LEVEL=debug

# Start with debug logging
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up
```

## 📚 Additional Resources

- [Frontend Documentation](./FRONTEND.md)
- [Backend Documentation](./BACKEND.md)
- [API Documentation](./API.md)
- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Last Updated**: January 31, 2025  
**Version**: 1.0.0  
**Maintainer**: VibeFusion.ai Team
