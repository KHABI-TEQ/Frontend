/** @format */

/**
 * Web Vitals monitoring - tracks Core Web Vitals metrics
 * Sends metrics to console in dev, analytics in production
 */

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, eventParams: Record<string, any>) => void;
  }
}

interface Metric {
  name: string;
  value: number;
  id: string;
  isFinal: boolean;
}

export const reportWebVital = (metric: Metric) => {
  // Core Web Vitals thresholds
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    TTFB: { good: 600, needsImprovement: 1200 },
    INP: { good: 200, needsImprovement: 500 },
  };

  const threshold = thresholds[metric.name];
  let status = 'unknown';

  if (threshold) {
    status = metric.value <= threshold.good ? 'good' : 
             metric.value <= threshold.needsImprovement ? 'needsImprovement' : 'poor';
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = status === 'good' ? '✅' : status === 'needsImprovement' ? '⚠️' : '❌';
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(0)}ms (${status})`);
  }

  // Send to analytics in production (implement your analytics service here)
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to Google Analytics, Vercel Analytics, or custom service
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }

  return { metric, status };
};

export const getWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Use Performance API to measure Core Web Vitals
  if (window.performance && window.performance.timing) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    reportWebVital({
      name: 'TTFB',
      value: perfData.responseStart - perfData.navigationStart,
      id: 'ttfb',
      isFinal: true,
    });

    reportWebVital({
      name: 'PageLoad',
      value: pageLoadTime,
      id: 'pageload',
      isFinal: true,
    });
  }

  // Use PerformanceObserver for newer metrics if available
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      // Observe Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportWebVital({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: 'lcp-' + lastEntry.startTime,
          isFinal: true,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        reportWebVital({
          name: 'CLS',
          value: clsValue,
          id: 'cls',
          isFinal: true,
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          reportWebVital({
            name: 'FID',
            value: (entry as any).processingDuration,
            id: 'fid-' + entry.startTime,
            isFinal: true,
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      // PerformanceObserver not supported
      if (process.env.NODE_ENV === 'development') {
        console.log('PerformanceObserver not supported');
      }
    }
  }
};

// Measure script execution time
export const measurePerformance = (label: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  }
  
  return end - start;
};
