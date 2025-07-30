import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { updateMarketPrice, addSignal, updateTrade } from '../store/slices/tradingSlice';
import { updateAgentStatus, updateAgentMetrics } from '../store/slices/agentsSlice';
import { updateAsset } from '../store/slices/portfolioSlice';
import { WS_EVENTS } from '../lib/constants';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      toast.success('Connected to real-time data feed');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      toast.error('Lost connection to data feed');
    });

    newSocket.on('reconnect', () => {
      console.log('Reconnected to WebSocket server');
      setIsConnected(true);
      toast.success('Reconnected to real-time data feed');
    });

    // Handle price updates
    newSocket.on(WS_EVENTS.MARKET_DATA, (data) => {
      dispatch(updateMarketPrice(data));
    });

    // Handle new trading signals
    newSocket.on(WS_EVENTS.TRADE_SIGNAL, (signal) => {
      dispatch(addSignal(signal));
      toast.success(`New ${signal.type} signal for ${signal.symbol}`);
    });

    // Handle trade updates
    newSocket.on(WS_EVENTS.PORTFOLIO_UPDATE, (trade) => {
      dispatch(updateTrade(trade));
      toast.success(`Trade ${trade.type} ${trade.fromToken} executed`);
    });

    // Handle portfolio updates
    newSocket.on(WS_EVENTS.PORTFOLIO_UPDATE, (asset) => {
      dispatch(updateAsset(asset));
    });

    // Handle agent status updates
    newSocket.on(WS_EVENTS.AGENT_STATUS, (agentData) => {
      if (agentData.status) {
        dispatch(updateAgentStatus({ agentId: agentData.id, status: agentData.status }));
      }
      if (agentData.metrics) {
        dispatch(updateAgentMetrics({ agentId: agentData.id, metrics: agentData.metrics }));
      }
    });

    // Handle notifications
    newSocket.on('notification', (notification) => {
      switch (notification.severity) {
        case 'success':
          toast.success(notification.message);
          break;
        case 'warning':
          toast.error(notification.message, { icon: '⚠️' });
          break;
        case 'error':
          toast.error(notification.message);
          break;
        default:
          toast(notification.message);
      }
    });

    // Handle errors
    newSocket.on(WS_EVENTS.ERROR, (error) => {
      console.error('WebSocket error:', error);
      toast.error(`Error: ${error.message}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
