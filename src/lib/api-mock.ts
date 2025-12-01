/**
 * Development-only API mocking to prevent network requests from blocking builds
 * This is only active when NODE_ENV === 'development'
 */

interface MockConfig {
  enabled: boolean;
  logRequests: boolean;
}

const config: MockConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logRequests: process.env.DEBUG_API_MOCKS === 'true',
};

// Store the original fetch
const originalFetch = typeof globalThis !== 'undefined' ? globalThis.fetch : null;

// Mock responses for common endpoints
const mockResponses: Record<string, any> = {
  '/profile': {
    success: true,
    data: {
      user: {
        id: 'dev-user-123',
        email: 'dev@khabiteq.local',
        firstName: 'Dev',
        lastName: 'User',
        userType: 'Agent',
        accountApproved: true,
        isAccountVerified: true,
        activeSubscription: null,
      }
    }
  },
  '/admin/properties': {
    success: true,
    data: {
      properties: [],
      total: 0,
      page: 1,
      limit: 10,
    }
  },
  '/admin/request/all': {
    success: true,
    data: {
      requests: [],
      total: 0,
      page: 1,
      limit: 10,
    }
  },
};

/**
 * Should request be mocked?
 * Add more patterns as needed
 */
function shouldMock(urlStr: string): boolean {
  if (!config.enabled) return false;
  
  const patterns = [
    '/profile',
    '/admin/properties',
    '/admin/request/all',
  ];
  
  return patterns.some(pattern => urlStr.includes(pattern));
}

/**
 * Get mock response for URL
 */
function getMockResponse(urlStr: string) {
  // Check exact matches first
  for (const [key, response] of Object.entries(mockResponses)) {
    if (urlStr.includes(key)) {
      return response;
    }
  }
  
  // Return generic success response for unmocked endpoints
  return { success: true, data: null };
}

/**
 * Initialize API mocking for development
 */
export function setupApiMocks() {
  if (!config.enabled || !originalFetch) return;

  if (config.logRequests) {
    console.log('🧪 API Mocking enabled for development');
  }

  globalThis.fetch = async (url: string | Request, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    if (shouldMock(urlStr)) {
      const mockData = getMockResponse(urlStr);
      
      if (config.logRequests) {
        console.log(`📡 Mocked: ${urlStr}`, mockData);
      }
      
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Fall back to real fetch for non-mocked endpoints
    return originalFetch!(url, options);
  };
}

/**
 * Disable API mocking (useful for testing)
 */
export function disableApiMocks() {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
}
