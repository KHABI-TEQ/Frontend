import { configureStore } from '@reduxjs/toolkit';
import subscriptionFeaturesReducer from './subscriptionFeaturesSlice';

export const store = configureStore({
  reducer: {
    subscription: subscriptionFeaturesReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
