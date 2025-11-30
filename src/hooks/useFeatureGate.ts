"use client";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { decrementFeature, selectCanUseFeature, selectFeatureEntry } from '@/store/subscriptionFeaturesSlice';

export const FEATURE_KEYS = {
  LISTINGS: 'LISTINGS',
  AGENT_MARKETPLACE: 'AGENT_MARKETPLACE',
  PUBLIC_PROFILE_PAGE: 'PUBLIC_PROFILE_PAGE',
  PUBLIC_PROFILE_PAGE_EXTAL_DATA: 'PUBLIC_PROFILE_PAGE_EXTAL_DATA',
  VERIFIED_BADGE: 'VERIFIED_BADGE',
  AUTOMATIC_PUSHUP: 'AUTOMATIC_PUSHUP',
  NEGOTIATION_INSPECTION_TOOLS: 'NEGOTIATION_INSPECTION_TOOLS',
  SOCIAL_MEDIA_ADS: 'SOCIAL_MEDIA_ADS',
  SET_INSPECTION_FEE: 'SET_INSPECTION_FEE',
  NO_COMMISSION_FEES: 'NO_COMMISSION_FEES',
} as const;

export function useFeatureGate(key: keyof typeof FEATURE_KEYS | string) {
  const dispatch = useAppDispatch();
  const allowed = useAppSelector(selectCanUseFeature(typeof key === 'string' ? key : FEATURE_KEYS[key]));
  const entry = useAppSelector(selectFeatureEntry(typeof key === 'string' ? key : FEATURE_KEYS[key]));

  const consume = (amount = 1) => {
    if (!entry) return;
    if (entry.type === 'count') {
      dispatch(decrementFeature({ key: entry.key, amount }));
    }
  };

  return { allowed, entry, consume };
}
