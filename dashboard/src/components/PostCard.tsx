'use client';

import React from 'react';
import { Post } from '@/types/post';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Film,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Calendar,
  Send
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  onPublishClick: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect, onPublishClick }) => {
  const hasFullBody = post.media.some(m => m.is_full_body);
  const isVideoReel = post.is_standalone_reel && post.media.some(m => m.type === 'video');
  const coverMedia = post.media[0];

  const statusConfig = {
    draft: { label: 'Draft', bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
    pending_review: { label: 'Pending Review', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    scheduled: { label: 'Scheduled', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    published: { label: 'Published', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
  }[post.status];

  const handleCopyCaption = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.caption);
    alert('Clean caption copied to clipboard!');
  };

  return (
    <div
      onClick={() => onSelect(post)}
      className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col hover:shadow-lg hover:shadow-amber-500/5"
    >
      {/* Media Cover / Carousel preview */}
      <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
        {coverMedia ? (
          coverMedia.type === 'video' ? (
            <video
              src={coverMedia.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverMedia.url}
              alt={post.client_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
            No media attached
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center gap-2">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border backdrop-blur-md ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>

          <div className="flex items-center gap-1.5">
            {isVideoReel ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/90 text-white flex items-center gap-1 backdrop-blur-md">
                <Film className="w-3 h-3" /> Reel
              </span>
            ) : post.media.length > 1 ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-zinc-200 flex items-center gap-1 backdrop-blur-md">
                <Layers className="w-3 h-3" /> {post.media.length} Stills
              </span>
            ) : null}
          </div>
        </div>

        {/* Quality Banner (Full-body indicator check) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          {hasFullBody ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1 backdrop-blur-md">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Full-Body Fit
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-600/50 flex items-center gap-1 backdrop-blur-md">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Missing Full-Body Shot
            </span>
          )}

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-400 border border-amber-500/30">
            ${post.rate_billed}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Client & Project */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
              {post.client_name}
            </h3>
            <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
              {post.event_or_project}
            </span>
          </div>

          {/* Look / Alteration Type */}
          <p className="text-xs text-amber-400/90 font-medium mb-2.5 line-clamp-1">
            ✂️ {post.look_type || 'Custom Fit & Alterations'}
          </p>

          {/* Credits summary preview */}
          <div className="text-[11px] text-zinc-400 space-y-0.5 mb-3 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60 font-mono">
            <div className="truncate">
              <span className="text-zinc-500">Tailor:</span> {post.credits.tailoring || '@flowerthief'}
            </div>
            {post.credits.stylist && (
              <div className="truncate">
                <span className="text-zinc-500">Styling:</span> {post.credits.stylist}
              </div>
            )}
            {post.collaborator_account && (
              <div className="truncate">
                <span className="text-zinc-500">Collab:</span> {post.collaborator_account}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-2 rounded hover:bg-zinc-800"
            title="Copy Clean Caption"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          <div className="flex items-center gap-2">
            {post.status !== 'published' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublishClick(post);
                }}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Publish</span>
              </button>
            )}
            {post.status === 'published' && (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Live
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
