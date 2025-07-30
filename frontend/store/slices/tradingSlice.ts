import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TradingSignal, Trade, MarketData } from '../../../shared/types';

interface TradingState {
  signals: TradingSignal[];
  trades: Trade[];
  marketData: { [symbol: string]: MarketData };
  activeOrders: Trade[];
  isTrading: boolean;
  error: string | null;
  isLoading: boolean;
}

const initialState: TradingState = {
  signals: [],
  trades: [],
  marketData: {},
  activeOrders: [],
  isTrading: false,
  error: null,
  isLoading: false,
};

export const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTrading: (state, action: PayloadAction<boolean>) => {
      state.isTrading = action.payload;
    },
    addSignal: (state, action: PayloadAction<TradingSignal>) => {
      state.signals.unshift(action.payload);
      // Keep only last 50 signals
      if (state.signals.length > 50) {
        state.signals = state.signals.slice(0, 50);
      }
    },
    updateSignal: (state, action: PayloadAction<TradingSignal>) => {
      const index = state.signals.findIndex(signal => signal.id === action.payload.id);
      if (index !== -1) {
        state.signals[index] = action.payload;
      }
    },
    removeSignal: (state, action: PayloadAction<string>) => {
      state.signals = state.signals.filter(signal => signal.id !== action.payload);
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
      if (action.payload.status === 'pending') {
        state.activeOrders.push(action.payload);
      }
    },
    updateTrade: (state, action: PayloadAction<Trade>) => {
      const tradeIndex = state.trades.findIndex(trade => trade.id === action.payload.id);
      if (tradeIndex !== -1) {
        state.trades[tradeIndex] = action.payload;
      }
      
      const orderIndex = state.activeOrders.findIndex(order => order.id === action.payload.id);
      if (orderIndex !== -1) {
        if (action.payload.status !== 'pending') {
          state.activeOrders.splice(orderIndex, 1);
        } else {
          state.activeOrders[orderIndex] = action.payload;
        }
      }
    },
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
      state.activeOrders = action.payload.filter(trade => trade.status === 'pending');
    },
    updateMarketData: (state, action: PayloadAction<{ [symbol: string]: MarketData }>) => {
      state.marketData = { ...state.marketData, ...action.payload };
    },
    updateMarketPrice: (state, action: PayloadAction<{ symbol: string; data: MarketData }>) => {
      state.marketData[action.payload.symbol] = action.payload.data;
    },
    clearSignals: (state) => {
      state.signals = [];
    },
    clearTrades: (state) => {
      state.trades = [];
      state.activeOrders = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setTrading,
  addSignal,
  updateSignal,
  removeSignal,
  addTrade,
  updateTrade,
  setTrades,
  updateMarketData,
  updateMarketPrice,
  clearSignals,
  clearTrades,
} = tradingSlice.actions;
