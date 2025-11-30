'use client';

import React, { memo, useCallback } from 'react';
import { Pause, Play, ExternalLink, Copy, History } from 'lucide-react';
import type { DealSiteLog } from '@/types/api-responses';

interface OverviewTabProps {
  isPaused: boolean;
  slugLocked: boolean;
  previewUrl: string | null;
  isOnHold: boolean;
  overviewLogsLoading: boolean;
  overviewLogs: DealSiteLog[];
  onPause: () => void;
  onResume: () => void;
  onEditSettings: () => void;
  onViewAll: () => void;
  onCopyLink: () => void;
}

const OverviewTab = memo(({
  isPaused,
  slugLocked,
  previewUrl,
  isOnHold,
  overviewLogsLoading,
  overviewLogs,
  onPause,
  onResume,
  onEditSettings,
  onViewAll,
  onCopyLink,
}: OverviewTabProps) => {
  const cleanLogText = (text: string | undefined) => {
    if (!text) return '';
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatDateTime = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActorName = (log: DealSiteLog) => {
    if (log.actor?.firstName) return log.actor.firstName;
    if (log.actor?.email) return log.actor.email;
    return 'Unknown';
  };

  const handlePauseClick = useCallback(() => {
    onPause();
  }, [onPause]);

  const handleResumeClick = useCallback(() => {
    onResume();
  }, [onResume]);

  const handleEditClick = useCallback(() => {
    onEditSettings();
  }, [onEditSettings]);

  const handleViewAllClick = useCallback(() => {
    onViewAll();
  }, [onViewAll]);

  const handleCopyClick = useCallback(() => {
    onCopyLink();
  }, [onCopyLink]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#09391C]">
              Your public access page is {isPaused ? 'paused' : slugLocked ? 'live' : 'in draft'}
            </h2>
            {previewUrl ? (
              <div className="mt-1 text-sm text-[#0B572B] flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                  {previewUrl}
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={handleCopyClick}
                  className="inline-flex items-center gap-1 text-emerald-700"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            ) : (
              <p className="text-sm text-[#5A5D63]">Set your public link to go live.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPaused ? (
              <button
                onClick={handlePauseClick}
                disabled={isOnHold}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button
                onClick={handleResumeClick}
                disabled={isOnHold}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={16} /> Resume
              </button>
            )}
            <button
              onClick={handleEditClick}
              disabled={isOnHold}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-base font-semibold text-[#09391C] flex items-center gap-2">
            <History size={18} /> Recent Activities
          </h3>
          <button
            type="button"
            onClick={handleViewAllClick}
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
          >
            View all <ExternalLink size={14} />
          </button>
        </div>
        {overviewLogsLoading ? (
          <div className="py-6 text-sm text-gray-500">Loading activities...</div>
        ) : overviewLogs.length === 0 ? (
          <div className="py-6 text-sm text-gray-500">No activities recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {overviewLogs.map((log) => (
              <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#09391C]">
                      {cleanLogText(log.action) || cleanLogText(log.category) || 'Activity'}
                    </p>
                    {cleanLogText(log.description) ? (
                      <p className="text-xs text-[#5A5D63] mt-1">{cleanLogText(log.description)}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-[#5A5D63] whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#5A5D63]">
                  <span>By {formatActorName(log)}</span>
                  {log.actorModel ? (
                    <span className="uppercase tracking-wide text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      {log.actorModel}
                    </span>
                  ) : null}
                  {log.ipAddress ? <span>IP: {log.ipAddress}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
