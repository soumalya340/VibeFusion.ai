import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, Asset, PerformanceMetric } from '../../../shared/types';

interface PortfolioState {
  portfolio: Portfolio | null;
  assets: Asset[];
  performance: PerformanceMetric[];
  isLoading: boolean;
  error: string | null;
  totalValue: number;
  totalPnL: number;
  dailyPnL: number;
}

const initialState: PortfolioState = {
  portfolio: null,
  assets: [],
  performance: [],
  isLoading: false,
  error: null,
  totalValue: 0,
  totalPnL: 0,
  dailyPnL: 0,
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.portfolio = action.payload;
      state.assets = action.payload.assets;
      state.totalValue = action.payload.totalValue;
      state.totalPnL = action.payload.totalPnL;
      state.dailyPnL = action.payload.dailyPnL;
    },
    updateAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
      state.totalValue = action.payload.reduce((sum, asset) => sum + asset.value, 0);
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.assets.findIndex(asset => asset.symbol === action.payload.symbol);
      if (index !== -1) {
        state.assets[index] = action.payload;
        state.totalValue = state.assets.reduce((sum, asset) => sum + asset.value, 0);
      }
    },
    addPerformanceMetric: (state, action: PayloadAction<PerformanceMetric>) => {
      state.performance.push(action.payload);
    },
    setPerformance: (state, action: PayloadAction<PerformanceMetric[]>) => {
      state.performance = action.payload;
    },
    updateTotalValue: (state, action: PayloadAction<number>) => {
      state.totalValue = action.payload;
    },
    updatePnL: (state, action: PayloadAction<{ totalPnL: number; dailyPnL: number }>) => {
      state.totalPnL = action.payload.totalPnL;
      state.dailyPnL = action.payload.dailyPnL;
    },
    clearPortfolio: (state) => {
      state.portfolio = null;
      state.assets = [];
      state.performance = [];
      state.totalValue = 0;
      state.totalPnL = 0;
      state.dailyPnL = 0;
    },
  },
});

export const {
  setLoading,
  setError,
  setPortfolio,
  updateAssets,
  updateAsset,
  addPerformanceMetric,
  setPerformance,
  updateTotalValue,
  updatePnL,
  clearPortfolio,
} = portfolioSlice.actions;
