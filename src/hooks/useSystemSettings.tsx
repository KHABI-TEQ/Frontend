/** @format */

import { useState, useEffect } from 'react';

interface SystemSettings {
  homePageEnabled: boolean;
  maintenanceMode: boolean;
  document_verification_video_url?: string;
  document_verification_thumbnail_url?: string;
  submit_preference_video_url?: string;
  submit_preference_thumbnail_url?: string;
  agent_marketplace_video_url?: string;
  agent_marketplace_thumbnail_url?: string;
  subscription_plan_video_url?: string;
  subscription_plan_thumbnail_url?: string;
  post_property_video_url?: string;
  post_property_thumbnail_url?: string;
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
    // Default thumbnail URLs - video URLs should come from your CMS/API
    document_verification_thumbnail_url: '/placeholder-property.svg',
    submit_preference_thumbnail_url: '/placeholder-property.svg',
    agent_marketplace_thumbnail_url: '/placeholder-property.svg',
    subscription_plan_thumbnail_url: '/placeholder-property.svg',
    post_property_thumbnail_url: '/placeholder-property.svg',
  });

  useEffect(() => {
    // Simulate loading system settings
    setLoading(true);
    const timeoutID = setTimeout(() => {
      setSettings({
        homePageEnabled: true,
        maintenanceMode: false,
        // Default thumbnail URLs - video URLs should come from your CMS/API
        document_verification_thumbnail_url: '/placeholder-property.svg',
        submit_preference_thumbnail_url: '/placeholder-property.svg',
        agent_marketplace_thumbnail_url: '/placeholder-property.svg',
        subscription_plan_thumbnail_url: '/placeholder-property.svg',
        post_property_thumbnail_url: '/placeholder-property.svg',
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
