/** @format */

import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { 
  SystemSettingsApiResponse, 
  SystemSetting, 
  SystemSettingsCategory,
  SubscriptionSettings,
  HomePageSettings,
  DocumentVerificationSettings,
  InspectionSettings,
  SocialLinksSettings
} from "@/types/system-settings";

/**
 * Fetch all system settings or filter by category
 */
export const getSystemSettings = async (
  category?: SystemSettingsCategory
): Promise<SystemSettingsApiResponse> => {
  try {
    // Check if BASE URL is configured
    if (!URLS.BASE || URLS.BASE.includes('undefined')) {
      console.warn('API base URL not configured, using default settings');
      return {
        success: false,
        message: 'API not configured',
        data: []
      };
    }

    const url = category
      ? `${URLS.BASE}${URLS.getSystemSettings}?category=${category}`
      : `${URLS.BASE}${URLS.getSystemSettings}`;

    const response = await GET_REQUEST<SystemSetting[]>(url);

    return {
      success: response.success || false,
      message: response.message || '',
      data: response.data || []
    };
  } catch (error) {
    console.warn('System settings API not available, using defaults:', error);
    return {
      success: false,
      message: 'Failed to fetch system settings',
      data: []
    };
  }
};

/**
 * Convert system settings array to a key-value object
 */
export const convertSettingsToObject = <T extends Record<string, unknown>>(settings: SystemSetting[]): T => {
  const result: Record<string, unknown> = {};

  settings.forEach(setting => {
    // Convert key from subscription_fee_monthly to monthly_fee format
    const key = setting.key.replace(`${setting.category}_`, '').replace('subscription_fee_', '');
    result[key] = setting.value;
  });

  return result as T;
};

/**
 * Get subscription settings as typed object
 */
export const getSubscriptionSettings = async (): Promise<SubscriptionSettings> => {
  try {
    const response = await getSystemSettings('subscription');
    if (response.success && response.data) {
      return convertSettingsToObject<SubscriptionSettings>(response.data);
    }
    return {};
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    return {};
  }
};

/**
 * Get home page settings as typed object
 */
export const getHomePageSettings = async (): Promise<HomePageSettings> => {
  try {
    const response = await getSystemSettings('home-page');
    if (response.success && response.data) {
      return convertSettingsToObject<HomePageSettings>(response.data);
    }
    return {};
  } catch (error) {
    console.error('Error fetching home page settings:', error);
    return {};
  }
};


/**
 * Get home page settings as typed object
 */
export const getSocialLinksSettings = async (): Promise<SocialLinksSettings> => {
  try {
    const response = await getSystemSettings('social-links');
    if (response.success && response.data) {
      return convertSettingsToObject<SocialLinksSettings>(response.data);
    }
    return {};
  } catch (error) {
    console.error('Error fetching home page settings:', error);
    return {};
  }
};



/**
 * Get document verification settings as typed object
 */
export const getDocumentVerificationSettings = async (): Promise<DocumentVerificationSettings> => {
  try {
    const response = await getSystemSettings('document-verification');
    if (response.success && response.data) {
      return convertSettingsToObject<DocumentVerificationSettings>(response.data);
    }
    return {};
  } catch (error) {
    console.error('Error fetching document verification settings:', error);
    return {};
  }
};

/**
 * Get document verification prices with individual document pricing
 */
export const getDocumentVerificationPrices = async (): Promise<{ [key: string]: number }> => {
  try {
    const response = await getSystemSettings('document-verification');
    if (response.success && response.data) {
      const prices: { [key: string]: number } = {};
      response.data.forEach(setting => {
        if (setting.key.endsWith('_price') && setting.status === 'active') {
          // Extract document type from key (e.g., "certificate-of-occupancy_price" -> "certificate-of-occupancy")
          const documentType = setting.key.replace('_price', '');
          prices[documentType] = Number(setting.value) || 0;
        }
      });
      return prices;
    }
    return {};
  } catch (error) {
    console.error('Error fetching document verification prices:', error);
    return {};
  }
};

/**
 * Get inspection settings as typed object
 */
export const getInspectionSettings = async (): Promise<InspectionSettings> => {
  try {
    const response = await getSystemSettings('continue-inspection');
    if (response.success && response.data) {
      return convertSettingsToObject<InspectionSettings>(response.data);
    }
    return {};
  } catch (error) {
    console.error('Error fetching inspection settings:', error);
    return {};
  }
};

/**
 * Helper function to get a specific setting value by key
 */
export const getSettingValue = (settings: SystemSetting[], key: string, defaultValue?: any) => {
  const setting = settings.find(s => s.key === key);
  return setting ? setting.value : defaultValue;
};

/**
 * Helper function to format subscription features from newline-separated string to array
 */
export const formatSubscriptionFeatures = (featuresString?: string): string[] => {
  if (!featuresString) return [];
  return featuresString.split('\n').filter(feature => feature.trim() !== '');
};
