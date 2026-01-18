/** @format */

import { useState, useEffect } from 'react';
import {
  getSystemSettings,
  getSubscriptionSettings,
  getHomePageSettings,
  getDocumentVerificationSettings,
  getInspectionSettings,
  getDocumentVerificationPrices,
  getSocialLinksSettings
} from '@/services/systemSettingsService';
import { 
  SystemSettingsCategory, 
  SubscriptionSettings, 
  HomePageSettings, 
  DocumentVerificationSettings, 
  InspectionSettings, 
  SocialLinksSettings
} from '@/types/system-settings';

interface UseSystemSettingsReturn<T> {
  settings: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching system settings by category
 */
export const useSystemSettings = <T>(
  category?: SystemSettingsCategory
): UseSystemSettingsReturn<T> => {
  const [settings, setSettings] = useState<T>({} as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: any = {};

      switch (category) {
        case 'subscription':
          result = await getSubscriptionSettings();
          break;
        case 'home-page':
          result = await getHomePageSettings();
          break;
        case 'social-links':
          result = await getSocialLinksSettings();
          break;
        case 'document-verification':
          result = await getDocumentVerificationSettings();
          break;
        case 'continue-inspection':
          result = await getInspectionSettings();
          break;
        default:
          const response = await getSystemSettings();
          result = response.data || [];
          break;
      }

      setSettings(result);
    } catch (err) {
      console.warn(`System settings not available for ${category || 'all'} - using defaults:`, err);
      setError(`Failed to load ${category || 'system'} settings`);
      // Set empty settings to allow components to use their fallbacks
      setSettings({} as T);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch settings in browser environment (not during SSR)
    if (typeof window !== 'undefined') {
      fetchSettings();
    } else {
      // During SSR, immediately return empty settings
      setSettings({} as T);
      setLoading(false);
    }
  }, [category]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
};

/**
 * Specialized hooks for specific settings categories
 */
export const useSubscriptionSettings = (): UseSystemSettingsReturn<SubscriptionSettings> => {
  return useSystemSettings<SubscriptionSettings>('subscription');
}; 

export const useHomePageSettings = (): UseSystemSettingsReturn<HomePageSettings> => {
  return useSystemSettings<HomePageSettings>('home-page');
};

export const useSocialLinskSettings = (): UseSystemSettingsReturn<SocialLinksSettings> => {
  return useSystemSettings<SocialLinksSettings>('social-links');
};

export const useDocumentVerificationSettings = (): UseSystemSettingsReturn<DocumentVerificationSettings> => {
  return useSystemSettings<DocumentVerificationSettings>('document-verification');
};

export const useInspectionSettings = (): UseSystemSettingsReturn<InspectionSettings> => {
  return useSystemSettings<InspectionSettings>('continue-inspection');
};

/**
 * Hook for fetching document verification prices with individual document pricing
 */
export const useDocumentVerificationPrices = (): UseSystemSettingsReturn<{ [key: string]: number }> => {
  const [settings, setSettings] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDocumentVerificationPrices();
      setSettings(result);
    } catch (err) {
      console.warn('Document verification prices not available - using defaults:', err);
      setError('Failed to load document verification prices');
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchPrices,
  };
};
