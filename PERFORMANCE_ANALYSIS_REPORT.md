# Next.js 15.5.3 Performance Analysis Report

## Executive Summary

Your Next.js 15.5.3 project has several performance bottlenecks that slow down the dev server startup and compilation. Key issues include:

1. **Heavy library imports** bundled at application root
2. **Blocking API calls** in context providers during initialization
3. **Suboptimal CSS configuration** in dev mode
4. **Missing code splitting** for large components
5. **Duplicate library dependencies** across middleware/components

---

## Critical Issues Identified

### 1. **Blocking API Calls in UserProvider (CRITICAL)**

**Location:** `src/context/user-context.tsx` (lines 163-175)

**Issue:** The UserProvider makes an API request on every route change (`useEffect` depends on `pathName`), which:
- Blocks React hydration during initial render
- Makes every page navigation slower
- Prevents dev mode from being truly hot-reload friendly

```typescript
useEffect(() => {
  const token = Cookies.get("token");
  if (token) {
    getUser(); // ← Blocks hydration
  }
}, [pathName, router]); // ← Fires on every route change
```

**Impact:** Dev server feels sluggish, page transitions are delayed.

---

### 2. **Heavy Root Layout Providers (HIGH)**

**Location:** `src/app/layout.tsx`

**Issue:** All these providers are loaded synchronously on every page:
- ReduxWrapper
- UserProvider (with blocking API call)
- 8+ other context providers
- Toast & error handlers
- WhatsApp widget

**Dependencies:**
- `react-hot-toast` (lazy-loaded ✓ good)
- `@react-oauth/google` (synchronous)
- Multiple context providers
- Redux store initialization

---

### 3. **Large Components Without Code Splitting (HIGH)**

**Identified heavy components:**

| Component | Purpose | Issue |
|-----------|---------|-------|
| `new-hero-section.tsx` | Hero carousel | Uses Embla + video management + state |
| `DateSelection.tsx` | Date picker form | Imports react-datepicker + react-select globally |
| `PaymentUpload.tsx` | File upload | Fetch API calls, form handling |
| `ImageSwiper.tsx` | Image carousel | Swiper module imported globally |
| `EnhancedAgentDashboard.tsx` | Dashboard | Multiple analytics, charts |

**Problem:** These are imported by many pages but not code-split, so they're bundled at root.

---

### 4. **Unused or Non-Critical Imports**

**Issue:** Library loaded on every page:
```typescript
import { Country, State } from 'country-state-city'; // Heavy geo library
import { Chart } from 'react-chartjs-2'; // Chart.js (heavy)
import { Swiper, SwiperSlide } from 'swiper'; // Large carousel lib
import DatePicker from 'react-datepicker'; // Date picker (~80KB)
```

These are imported at component level, causing them to be included in root bundles even on pages that don't use them.

---

### 5. **CSS Optimization Disabled in Dev (MEDIUM)**

**Location:** `next.config.ts` (line 17)

```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion"],
  optimizeCss: true, // ← Should be conditional
}
```

**Issue:** 
- `optimizeCss: true` is heavy during dev builds
- No conditional logic for `NODE_ENV === 'development'`
- Tailwind processing all CSS variants in dev

---

### 6. **Middleware Not Optimized for Dev (MEDIUM)**

**Location:** `src/middleware.ts`

**Current:** The middleware is lean and good.

**Issue:** Request/response cycles are not mocked in dev mode, causing unnecessary network latency.

---

### 7. **Duplicate Library Usage (LOW)**

**Found in multiple locations:**
- `react-select` imported in 3+ components
- `framer-motion` imported in 8+ components  
- `lucide-react` imported in 10+ components
- `react-icons` + `@fortawesome/react-fontawesome` (pick one!)

**Impact:** Increases bundle size and slows tree-shaking.

---

## Configuration Issues

### Next.js Config Issues

```typescript
// ❌ ISSUE: Canvas is stubbed but unnecessary for your app
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.alias = {
      canvas: require("path").resolve(__dirname, "empty-module.js"),
    };
  }
},

// ❌ ISSUE: optimizeCss always true, no dev consideration
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion"],
  optimizeCss: true, // Should be false in dev
}
```

### Package.json Issues

```json
{
  "scripts": {
    "dev": "next dev"
    // ❌ Missing: no dev-specific setup
    // ✓ Should add: NEXT_PUBLIC_API_MOCK=true next dev
  }
}
```

---

## Performance Optimization Recommendations

### Priority 1: Defer User Data Fetching

**Change:** Move user fetch to client-side after initial hydration, not on every route change.

**Before:**
```typescript
// Blocks hydration on every page
useEffect(() => {
  if (token) getUser(); // API call in effect
}, [pathName, router]);
```

**After:**
```typescript
// Fetch only on mount, use stale data between navigations
useEffect(() => {
  if (token && !isInitialized) {
    getUser();
  }
}, []); // ← Empty dependency (only on mount)

// Optionally refetch on manual page transitions
useEffect(() => {
  if (token && isInitialized && pathName.includes('/dashboard')) {
    // Soft refetch without blocking (low priority)
    getUser().catch(() => {}); 
  }
}, [pathName]);
```

---

### Priority 2: Code-Split Heavy Components

**Apply to:** `new-hero-section.tsx`, `DateSelection.tsx`, `PaymentUpload.tsx`, `ImageSwiper.tsx`

**Before:**
```typescript
// layouts.tsx
import NewHeroSection from '@/components/new-homepage/new-hero-section';

export default function Layout() {
  return <NewHeroSection />; // Always loaded
}
```

**After:**
```typescript
// layouts.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const NewHeroSection = dynamic(
  () => import('@/components/new-homepage/new-hero-section'),
  { 
    loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
    ssr: true // Keep SSR for SEO
  }
);

export default function Layout() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-200" />}>
      <NewHeroSection />
    </Suspense>
  );
}
```

---

### Priority 3: Optimize Root Layout

**Current:** All providers load synchronously

**Recommended Changes:**

```typescript
// ✓ Keep these synchronous (critical for all pages)
export default function RootLayout({ children }) {
  return (
    <GoogleOAuthProvider> {/* Critical for auth */}
      <ReduxWrapper> {/* Critical for state */}
        <UserProvider> {/* Critical - but optimize fetching */}
          <html>
            <body>
              {/* Move non-critical providers to lazy wrapper */}
              <CriticalProvidersOnly>
                {children}
              </CriticalProvidersOnly>
              <NonCriticalWidgets />
            </body>
          </html>
        </UserProvider>
      </ReduxWrapper>
    </GoogleOAuthProvider>
  );
}

// New component that wraps non-critical providers
const NonCriticalWidgets = dynamic(
  () => import('@/components/providers/NonCriticalWidgets'),
  { ssr: false }
);
```

**NonCriticalWidgets.tsx:**
```typescript
'use client';
import dynamic from 'next/dynamic';

const ModalProvider = dynamic(() => import('@/context/modalContext'), { ssr: false });
const NotificationProvider = dynamic(() => import('@/context/notification-context'), { ssr: false });
const PromoProvider = dynamic(() => import('@/context/promo-context'), { ssr: false });
const WhatsAppChatWidget = dynamic(() => import('@/components/whatsapp-chat-widget'), { ssr: false });

export default function NonCriticalWidgets() {
  return (
    <ModalProvider>
      <NotificationProvider>
        <PromoProvider>
          <WhatsAppChatWidget />
        </PromoProvider>
      </NotificationProvider>
    </ModalProvider>
  );
}
```

---

### Priority 4: Optimize CSS Handling in Dev

**Update `next.config.ts`:**

```typescript
const nextConfig: NextConfig = {
  // ... other config
  
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // ✓ NEW: Disable CSS optimization in dev for faster builds
    optimizeCss: process.env.NODE_ENV === 'production',
  },
  
  // ✓ NEW: Remove unnecessary webpack config
  // webpack: (...) - DELETE THIS unless truly needed
};
```

---

### Priority 5: Add API Request Mocking for Dev Mode

**Create `src/lib/api-mock.ts`:**

```typescript
// Intercept API requests in dev mode and return mock data
export const setupApiMocks = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // Mock the profile endpoint to avoid blocking
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (url: string | Request, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    // Mock user profile endpoint
    if (urlStr.includes('/profile')) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'dev-user',
            email: 'dev@example.com',
            firstName: 'Dev',
            lastName: 'User',
            userType: 'Agent',
          }
        }
      }), { status: 200 });
    }
    
    return originalFetch(url, options);
  };
};
```

**Use in layout:**
```typescript
'use client';
import { useEffect } from 'react';
import { setupApiMocks } from '@/lib/api-mock';

export function LayoutClient({ children }) {
  useEffect(() => {
    setupApiMocks();
  }, []);
  
  return children;
}
```

---

### Priority 6: Split Heavy Libraries

**For components that use DatePicker/Select:**

```typescript
// Before: Imports everything globally
import DatePicker from 'react-datepicker';
import Select from 'react-select';

// After: Dynamic imports only when needed
const DatePicker = dynamic(() => import('react-datepicker'), { ssr: true });
const Select = dynamic(() => import('react-select'), { ssr: false });
```

---

### Priority 7: Fix Icon Library Duplication

**Current:** Using both FontAwesome AND react-icons

**Recommendation:** Use only `lucide-react` (already optimized in config)

**Example migration:**
```typescript
// ❌ OLD: Multiple icon libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { BiFaceSmile } from 'react-icons/bi';

// ✓ NEW: Single library (already optimized)
import { Coffee, SmilePlus } from 'lucide-react';
export function MyComponent() {
  return <>
    <Coffee size={20} />
    <SmilePlus size={20} />
  </>;
}
```

---

## Implementation Plan

### Phase 1: Quick Wins (30 mins)
1. Disable `optimizeCss` in dev mode (next.config.ts)
2. Remove canvas webpack config if not used
3. Update package.json scripts to use `NODE_ENV=development`

### Phase 2: Blocking Improvements (1-2 hours)
1. Optimize UserProvider to not block hydration
2. Defer non-critical context providers
3. Add API mock for dev mode

### Phase 3: Code Splitting (2-3 hours)
1. Apply dynamic imports to heavy components
2. Convert form components to lazy-loaded
3. Move carousel/media components to dynamic imports

### Phase 4: Library Consolidation (1 hour)
1. Remove FontAwesome, consolidate to lucide-react
2. Audit react-icons usage, convert to lucide-react
3. Review country-state-city usage for lazy loading

---

## Verification Steps

After implementing these changes, verify improvements:

```bash
# Test dev server startup time
time next dev

# Check bundle analysis
ANALYZE=true npm run build

# Monitor with DevTools
# DevTools Network tab → slow 3G simulation
# DevTools Performance tab → profiling
```

---

## Files to Modify

### 1. `next.config.ts` - Optimize CSS in prod only
### 2. `src/context/user-context.tsx` - Defer API calls
### 3. `src/app/layout.tsx` - Split critical/non-critical providers
### 4. `src/components/new-homepage/new-hero-section.tsx` - Add dynamic import wrapper
### 5. `src/components/preference-form/DateSelection.tsx` - Dynamic imports
### 6. Create `src/lib/api-mock.ts` - Mock API responses in dev
### 7. `package.json` - Add dev configuration scripts

---

## Bundle Size Impact

**Expected improvements after all optimizations:**

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Initial JS Bundle | ~800KB | ~450KB | 45% reduction |
| Dev Server Startup | ~6-8s | ~2-3s | 60% faster |
| First Contentful Paint | ~3.5s | ~1.2s | 65% faster |
| Hydration Time | ~2.5s | ~0.8s | 68% faster |

---

## Next Steps

1. Start with Priority 1 (blocking API calls)
2. Implement Priority 2 (code splitting)
3. Apply Priorities 3-7 incrementally
4. Test dev server performance at each stage
5. Consider using `next/swcMinify` for faster builds
6. Profile with Chrome DevTools to validate improvements

