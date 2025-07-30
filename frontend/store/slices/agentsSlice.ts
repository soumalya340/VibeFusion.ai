import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent, AgentMetrics } from '../../../shared/types';

interface AgentsState {
  agents: Agent[];
  status: { [agentId: string]: 'active' | 'inactive' | 'error' };
  metrics: { [agentId: string]: AgentMetrics };
  lastUpdate: { [agentId: string]: Date };
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  status: {},
  metrics: {},
  lastUpdate: {},
  isLoading: false,
  error: null,
};

export const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
      // Update status and metrics for each agent
      action.payload.forEach(agent => {
        state.status[agent.id] = agent.status;
        state.metrics[agent.id] = agent.metrics;
        state.lastUpdate[agent.id] = agent.lastUpdate;
      });
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex(agent => agent.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      } else {
        state.agents.push(action.payload);
      }
      state.status[action.payload.id] = action.payload.status;
      state.metrics[action.payload.id] = action.payload.metrics;
      state.lastUpdate[action.payload.id] = action.payload.lastUpdate;
    },
    updateAgentStatus: (state, action: PayloadAction<{ agentId: string; status: 'active' | 'inactive' | 'error' }>) => {
      const { agentId, status } = action.payload;
      state.status[agentId] = status;
      
      const agent = state.agents.find(a => a.id === agentId);
      if (agent) {
        agent.status = status;
        agent.lastUpdate = new Date();
        state.lastUpdate[agentId] = new Date();
      }
    },
    updateAgentMetrics: (state, action: PayloadAction<{ agentId: string; metrics: AgentMetrics }>) => {
      const { agentId, metrics } = action.payload;
      state.metrics[agentId] = metrics;
      
      const agent = state.agents.find(a => a.id === agentId);
      if (agent) {
        agent.metrics = metrics;
        agent.lastUpdate = new Date();
        state.lastUpdate[agentId] = new Date();
      }
    },
    incrementAgentRequests: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      if (state.metrics[agentId]) {
        state.metrics[agentId].requestsProcessed += 1;
      }
    },
    incrementAgentErrors: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      if (state.metrics[agentId]) {
        state.metrics[agentId].errors += 1;
        // Recalculate success rate
        const metrics = state.metrics[agentId];
        metrics.successRate = ((metrics.requestsProcessed - metrics.errors) / metrics.requestsProcessed) * 100;
      }
    },
    updateResponseTime: (state, action: PayloadAction<{ agentId: string; responseTime: number }>) => {
      const { agentId, responseTime } = action.payload;
      if (state.metrics[agentId]) {
        // Simple moving average for response time
        const currentAvg = state.metrics[agentId].averageResponseTime;
        state.metrics[agentId].averageResponseTime = (currentAvg + responseTime) / 2;
      }
    },
    clearAgents: (state) => {
      state.agents = [];
      state.status = {};
      state.metrics = {};
      state.lastUpdate = {};
    },
  },
});

export const {
  setLoading,
  setError,
  setAgents,
  updateAgent,
  updateAgentStatus,
  updateAgentMetrics,
  incrementAgentRequests,
  incrementAgentErrors,
  updateResponseTime,
  clearAgents,
} = agentsSlice.actions;
