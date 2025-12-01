/**
 * Utility function to lazily load components with optimized loading state
 * Reduces initial bundle size by deferring non-critical component loading
 */

import dynamic from 'next/dynamic';
import React from 'react';

interface DynamicComponentOptions {
  ssr?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Creates a lazy-loaded component with a loading placeholder
 * @param importFunc - Dynamic import function
 * @param options - Configuration options
 * @returns Lazily loaded component
 */
export const createLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  options: DynamicComponentOptions = {}
) => {
  const { ssr = false, loadingComponent = null } = options;

  return dynamic(importFunc, {
    ssr,
    loading: () => loadingComponent || <div className="min-h-[200px]" />,
  });
};

/**
 * Predefined lazy-loaded components for common use cases
 * These should be used for components that aren't critical to initial render
 */
export const lazyLoadWithMinimalUI = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  return createLazyComponent(importFunc, {
    ssr: false,
    loadingComponent: <div className="min-h-[100px] animate-pulse" />,
  });
};
