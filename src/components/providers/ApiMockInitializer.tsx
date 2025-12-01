'use client';

import { useEffect } from 'react';
import { setupApiMocks } from '@/lib/api-mock';

/**
 * Initialize API mocks on client-side to prevent blocking requests in dev
 * This component mounts early and sets up mock responses before page loads
 */
export default function ApiMockInitializer() {
  useEffect(() => {
    setupApiMocks();
  }, []);
  
  return null;
}
