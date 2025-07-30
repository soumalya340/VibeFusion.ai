'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const AgentStatus = () => {
  const { agents } = useSelector((state: RootState) => state.agents);

  // Mock data if no agents are loaded
  const mockAgents = [
    {
      id: 'data-scraper',
      name: 'Data Scraper',
      type: 'data-scraper' as const,
      status: 'active' as const,
      lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
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
      type: 'data-analyzer' as const,
      status: 'active' as const,
      lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
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
      type: 'trade-executor' as const,
      status: 'active' as const,
      lastUpdate: new Date(Date.now() - 30 * 1000),
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
      type: 'trade-monitor' as const,
      status: 'active' as const,
      lastUpdate: new Date(Date.now() - 10 * 1000),
      metrics: {
        uptime: 99.7,
        requestsProcessed: 2100,
        errors: 1,
        successRate: 99.95,
        averageResponseTime: 85,
      },
    },
  ];

  const displayAgents = agents.length > 0 ? agents : mockAgents;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircleIcon;
      case 'inactive':
        return ExclamationCircleIcon;
      case 'error':
        return XCircleIcon;
      default:
        return CpuChipIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'inactive':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900';
      case 'inactive':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'error':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Agent Status
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI agents monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {displayAgents.map((agent, index) => {
            const StatusIcon = getStatusIcon(agent.status);
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(agent.status)}`}>
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(agent.status)}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last update: {formatDistanceToNow(agent.lastUpdate)} ago
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(agent.status)} ${getStatusBg(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.metrics.uptime.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Success Rate</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {agent.metrics.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Requests</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.metrics.requestsProcessed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Avg Response</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {agent.metrics.averageResponseTime}ms
                      </span>
                    </div>
                  </div>
                </div>

                {agent.metrics.errors > 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2">
                      <ExclamationCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {agent.metrics.errors} error{agent.metrics.errors !== 1 ? 's' : ''} recorded
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Overall System Health</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium text-green-600 dark:text-green-400">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentStatus;
