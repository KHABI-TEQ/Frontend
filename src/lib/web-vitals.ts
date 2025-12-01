/** @format */

/**
 * Web Vitals monitoring - tracks Core Web Vitals metrics
 * Sends metrics to console in dev, analytics in production
 */

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

export const getWebVitals = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Use Web Vitals library if available
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

    getCLS(reportWebVital);
    getFID(reportWebVital);
    getFCP(reportWebVital);
    getLCP(reportWebVital);
    getTTFB(reportWebVital);
  } catch (error) {
    // Web Vitals library not installed, use performance API instead
    if (typeof window !== 'undefined' && window.performance) {
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
