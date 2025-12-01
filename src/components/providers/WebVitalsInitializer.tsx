/** @format */

'use client';

import { useEffect } from 'react';
import { getWebVitals } from '@/lib/web-vitals';

/**
 * WebVitalsInitializer - Initialize Web Vitals monitoring
 * Monitors Core Web Vitals metrics and reports them
 */
export default function WebVitalsInitializer() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    getWebVitals();

    // Also measure route change performance
    if (process.env.NODE_ENV === 'development') {
      const handleRouteChange = () => {
        console.log('📍 Route changed');
      };

      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, []);

  return null;
}
