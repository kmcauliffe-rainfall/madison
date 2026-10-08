'use client';

import React from 'react';
import { Scissors, DollarSign, Camera, Plus, Sparkles } from 'lucide-react';
import { Post } from '@/types/post';

interface HeaderProps {
  posts: Post[];
  onNewPostClick: () => void;
  onSyncExtensionClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  posts,
  onNewPostClick,
  onSyncExtensionClick,
}) => {
  const draftsCount = posts.filter(p => p.status === 'draft').length;
  const pendingCount = posts.filter(p => p.status === 'pending_review').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  // Rate billing calculation: $20 / completed or processed post
  const totalBilled = posts.reduce((sum, p) => sum + (p.rate_billed || 20), 0);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-zinc-100">TailorFlow</h1>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Hollywood Client Suite
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Portfolio & Social Workflow • Primary Handle: <span className="text-amber-400 font-mono">@flowerthief</span>
            </p>
          </div>
        </div>

        {/* Quick Stats & QuickBooks Invoicing Meter */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
              <span className="text-zinc-400">Drafts:</span>
              <span className="font-semibold text-zinc-200">{draftsCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-zinc-400">Review:</span>
              <span className="font-semibold text-amber-400">{pendingCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-zinc-400">Scheduled:</span>
              <span className="font-semibold text-blue-400">{scheduledCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-400">Published:</span>
              <span className="font-semibold text-emerald-400">{publishedCount}</span>
            </div>
          </div>

          {/* Rate Tracker */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-300">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>${totalBilled}</span>
            <span className="text-zinc-400 text-[10px]">({posts.length} @ $20)</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSyncExtensionClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              title="Sync with Chrome Extension Storage"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Extension</span>
            </button>
            <button
              onClick={onNewPostClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Look</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
