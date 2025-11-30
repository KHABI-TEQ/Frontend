"use client";
"use client";
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchFeaturesCatalog, initializeFromProfile } from '@/store/subscriptionFeaturesSlice';
import { useUserContext } from '@/context/user-context';

export default function SubscriptionInitializer() {
  const dispatch = useAppDispatch();
  const { user, isInitialized } = useUserContext();

  useEffect(() => {
    dispatch(fetchFeaturesCatalog());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;
    dispatch(initializeFromProfile(user as any));
  }, [dispatch, user, isInitialized]);

  return null;
}
