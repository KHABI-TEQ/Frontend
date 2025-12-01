/** @format */

import { useState, useEffect } from 'react';

interface SystemSettings {
  homePageEnabled: boolean;
  maintenanceMode: boolean;
}

interface SocialLinksSettings {
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  whatsapp_url?: string;
  telegram_url?: string;
  website_url?: string;
}

/**
 * @useSystemSettings - Hook to manage system-wide settings
 * @returns - Object containing settings and loading state
 */
export const useHomePageSettings = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<SystemSettings>({
    homePageEnabled: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    // Simulate loading system settings
    setLoading(true);
    const timeoutID = setTimeout(() => {
      setSettings({
        homePageEnabled: true,
        maintenanceMode: false,
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeoutID);
  }, []);

  return {
    loading,
    settings,
  };
};

/**
 * @useSocialLinksSettings - Hook to manage social media links settings
 * @returns - Object containing social links settings
 */
export const useSocialLinskSettings = () => {
  const [settings, setSettings] = useState<SocialLinksSettings>({
    facebook_url: 'https://facebook.com/khabiteq',
    twitter_url: 'https://twitter.com/khabiteq',
    instagram_url: 'https://instagram.com/khabiteq',
    linkedin_url: 'https://linkedin.com/company/khabiteq',
    youtube_url: 'https://youtube.com/@khabiteq',
  });

  return { settings };
};
