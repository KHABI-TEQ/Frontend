/** @format */

'use client';
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DevelopmentNotice = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Only show in development mode and if API URL is not configured
    const isDevelopment = process.env.NODE_ENV === 'development';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (isDevelopment && (!apiUrl || apiUrl.includes('undefined'))) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 text-sm mb-1">
            Development Mode
          </h4>
          <p className="text-yellow-700 text-xs mb-2">
            API URL not configured. Using sample data. Set <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> in .env.local for full functionality.
          </p>
          <p className="text-yellow-600 text-xs">
            This notice only appears in development.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-600 hover:text-yellow-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DevelopmentNotice;
