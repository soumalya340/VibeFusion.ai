import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { portfolioSlice } from './slices/portfolioSlice';
import { tradingSlice } from './slices/tradingSlice';
import { agentsSlice } from './slices/agentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    portfolio: portfolioSlice.reducer,
    trading: tradingSlice.reducer,
    agents: agentsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
