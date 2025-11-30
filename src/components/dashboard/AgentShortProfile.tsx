'use client';
import React from 'react';
import Link from 'next/link';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserContext } from '@/context/user-context';

const AgentShortProfile: React.FC = () => {
  const { user } = useUserContext();

  const publicUrl =
    (user as any)?.publicProfileUrl || (user as any)?.publicUrl || (user as any)?.agentData?.publicProfileUrl ||
    (user && (user as any)._id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/agent-profile/${(user as any)._id}` : null);

  if (!publicUrl) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public profile URL copied');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-emerald-50 overflow-hidden flex items-center justify-center text-2xl font-bold text-emerald-700">
        {user?.profile_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(user as any).profile_picture} alt={user?.firstName || 'A'} className="w-full h-full object-cover" />
        ) : (
          <span>{(user?.firstName || 'A').charAt(0)}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Public Profile</div>
            <div className="font-medium text-[#09391C]">{(user?.firstName || '') + ' ' + (user?.lastName || '')}</div>
          </div>
          <div className="flex items-center gap-2">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 hover:bg-emerald-100">
              <ExternalLink size={16} /> Open
            </a>
            <button onClick={handleCopy} className="text-sm px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 inline-flex items-center gap-2">
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-[#5A5D63] line-clamp-1">{publicUrl}</div>
      </div>
    </div>
  );
};

export default AgentShortProfile;
