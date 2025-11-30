/** @format */

/**
 * Environment variables validation utility
 * Checks for required environment variables and provides helpful error messages
 */

export interface EnvConfig {
  apiUrl: string;
  googleClientId: string;
  facebookAppId: string;
  nodeEnv: string;
}

export function validateEnvironmentVariables(): EnvConfig {
  const config: EnvConfig = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'google-client-id-not-configured',
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '0000000000000000',
    nodeEnv: process.env.NODE_ENV || 'development',
  };

  // Check for missing critical environment variables
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_API_URL) {
    missingVars.push('NEXT_PUBLIC_API_URL');
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    missingVars.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID (Google OAuth will be disabled)');
  }

  if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
    missingVars.push('NEXT_PUBLIC_FACEBOOK_APP_ID (Facebook OAuth will be disabled)');
  }

  // In development, just warn about missing variables
  if (missingVars.length > 0 && config.nodeEnv === 'development') {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('💡 Create a .env.local file with the required variables for full functionality');
  }

  return config;
}

export function getEnvConfig(): EnvConfig {
  return validateEnvironmentVariables();
}
