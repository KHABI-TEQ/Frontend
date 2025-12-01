/** @format */

import { useState, useEffect } from 'react';

interface SystemSettings {
  homePageEnabled: boolean;
  maintenanceMode: boolean;
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
