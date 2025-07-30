import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, RiskProfile } from '../../../shared/types';

interface AuthState {
  user: User | null;
  isConnected: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isConnected: false,
  walletAddress: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    connectWallet: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload;
      state.isConnected = true;
      state.error = null;
    },
    disconnectWallet: (state) => {
      state.walletAddress = null;
      state.isConnected = false;
      state.user = null;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateRiskProfile: (state, action: PayloadAction<RiskProfile>) => {
      if (state.user) {
        state.user.riskProfile = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  connectWallet,
  disconnectWallet,
  setUser,
  updateRiskProfile,
  clearError,
} = authSlice.actions;
