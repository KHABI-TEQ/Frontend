"use client";

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors globally
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's a ChunkLoadError
      if (error?.name === 'ChunkLoadError' || error?.message?.includes('ChunkLoadError')) {
        console.warn('ChunkLoadError detected, attempting to reload page...');
        
        // Attempt to reload the page to fix chunk issues
        window.location.reload();
      }
    };

    // Listen for global errors
    window.addEventListener('error', handleChunkError);

    // Also handle unhandled promise rejections (for dynamic imports)
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'ChunkLoadError' || 
          event.reason?.message?.includes('ChunkLoadError')) {
        console.warn('ChunkLoadError in promise rejection, attempting to reload page...');
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}
