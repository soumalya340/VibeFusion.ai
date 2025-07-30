class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Agent orchestrator is already running');
      return;
    }

    console.log('🤖 Starting Agent Orchestrator...');
    this.isRunning = true;

    // Initialize mock agents
    this.initializeAgents();

    // Start agent monitoring
    this.startMonitoring();
  }

  stop() {
    console.log('🛑 Stopping Agent Orchestrator...');
    this.isRunning = false;
  }

  initializeAgents() {
    const mockAgents = [
      {
        id: 'data-scraper',
        name: 'Data Scraper',
        type: 'data-scraper',
        status: 'active',
        lastUpdate: new Date(),
        metrics: {
          uptime: 99.5,
          requestsProcessed: 1250,
          errors: 3,
          successRate: 99.8,
          averageResponseTime: 150,
        },
      },
      {
        id: 'data-analyzer',
        name: 'Data Analyzer',
        type: 'data-analyzer',
        status: 'active',
        lastUpdate: new Date(),
        metrics: {
          uptime: 98.9,
          requestsProcessed: 845,
          errors: 5,
          successRate: 99.4,
          averageResponseTime: 280,
        },
      },
      {
        id: 'trade-executor',
        name: 'Trade Executor',
        type: 'trade-executor',
        status: 'active',
        lastUpdate: new Date(),
        metrics: {
          uptime: 99.9,
          requestsProcessed: 125,
          errors: 0,
          successRate: 100,
          averageResponseTime: 450,
        },
      },
      {
        id: 'trade-monitor',
        name: 'Trade Monitor',
        type: 'trade-monitor',
        status: 'active',
        lastUpdate: new Date(),
        metrics: {
          uptime: 99.7,
          requestsProcessed: 2100,
          errors: 1,
          successRate: 99.95,
          averageResponseTime: 85,
        },
      },
    ];

    mockAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    console.log(`🤖 Initialized ${mockAgents.length} mock agents`);
  }

  startMonitoring() {
    // Simulate agent activity updates every 30 seconds
    setInterval(() => {
      if (!this.isRunning) return;

      this.agents.forEach((agent, id) => {
        // Simulate metric updates
        agent.metrics.requestsProcessed += Math.floor(Math.random() * 10);
        agent.metrics.averageResponseTime += Math.floor(Math.random() * 20 - 10);
        agent.lastUpdate = new Date();

        // Occasionally simulate errors
        if (Math.random() < 0.1) {
          agent.metrics.errors += 1;
        }

        // Recalculate success rate
        const totalRequests = agent.metrics.requestsProcessed;
        const successfulRequests = totalRequests - agent.metrics.errors;
        agent.metrics.successRate = (successfulRequests / totalRequests) * 100;

        this.agents.set(id, agent);
      });

      console.log(`🔄 Updated metrics for ${this.agents.size} agents`);
    }, 30000);
  }

  getAgentStatus(agentId) {
    return this.agents.get(agentId);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  async updateAgentMetrics(agentId, metrics) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.metrics = { ...agent.metrics, ...metrics };
      agent.lastUpdate = new Date();
      this.agents.set(agentId, agent);

      // Store in memory (Redis removed for simplicity)
    }
  }
}

module.exports = AgentOrchestrator;
