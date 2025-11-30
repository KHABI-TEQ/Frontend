/** @format */

'use client';

import React from 'react';

const NotificationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Checkbox Placeholder */}
        <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>

        {/* Icon Placeholder */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Content Placeholder */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Title Placeholder */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              {/* Message Placeholder Lines */}
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              {/* Date Placeholder */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>

            {/* Actions Menu Placeholder */}
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCardSkeleton;