'use client';

import React, { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Terminal,
  ExternalLink,
  Film,
  Layers
} from 'lucide-react';

interface PublishModalProps {
  post: Post | null;
  onClose: () => void;
  onPublishComplete: (publishedPost: Post) => void;
}

interface StepLog {
  step: string;
  status: 'pending' | 'success' | 'failed' | 'simulated';
  detail: string;
  timestamp: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  post,
  onClose,
  onPublishComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    if (post) {
      setLogs([]);
      setPublishedId(null);
      setError(null);
      setIsSimulated(false);
    }
  }, [post]);

  if (!post) return null;

  const isReel = post.is_standalone_reel && post.media.some(m => m.type === 'video');

  const executePublish = async () => {
    setLoading(true);
    setError(null);
    setLogs([
      {
        step: 'Initializing Pipeline',
        status: 'pending',
        detail: `Preparing payload for ${post.client_name} (${isReel ? 'Standalone Reel' : 'Carousel/Still'})`,
        timestamp: new Date().toISOString()
      }
    ]);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.post_id })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publishing failed');
      }

      setLogs(data.logs || []);
      setPublishedId(data.instagram_post_id);
      setIsSimulated(Boolean(data.simulated));

      if (data.post) {
        onPublishComplete(data.post);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setLogs(prev => [
        ...prev,
        {
          step: 'Execution Error',
          status: 'failed',
          detail: msg,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Meta Graph API Publisher</h3>
              <p className="text-xs text-zinc-400">
                Target Account: <span className="text-amber-400 font-mono">@flowerthief</span> (Instagram Business)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Summary Card */}
        <div className="p-6 space-y-4">
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 flex gap-4 items-center">
            <div className="w-16 h-16 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-800">
              {post.media[0] && (
                post.media[0].type === 'video' ? (
                  <video src={post.media[0].url} className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                )
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-100">{post.client_name}</span>
                {isReel ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Film className="w-3 h-3" /> Standalone Reel
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {post.media.length} Asset Carousel
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-400/90 truncate">{post.look_type}</p>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                Collab: {post.collaborator_account}
              </p>
            </div>
          </div>

          {/* Execution Log Terminal */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-zinc-500 text-[11px] pb-2 border-b border-zinc-800/80 mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>Container Pipeline Log</span>
            </div>

            {logs.length === 0 && !loading && (
              <div className="text-zinc-600 py-4 text-center">
                Ready to invoke Meta Graph API container builder.
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  {log.status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />}
                  {log.status === 'simulated' && <span className="text-amber-400 mt-0.5 text-xs">⚡</span>}
                  {log.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                  {log.status === 'pending' && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <span className="text-zinc-300 font-semibold">{log.step}:</span>{' '}
                    <span className="text-zinc-400">{log.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {publishedId && (
              <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Successfully Published!</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Container ID: {publishedId} {isSimulated ? '(Simulated Sandbox)' : '(Live Instagram)'}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {isSimulated ? 'Running in safe sandbox mode' : 'Pre-flight verified'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
            {!publishedId && (
              <button
                onClick={executePublish}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>{loading ? 'Publishing Containers...' : 'Confirm & Publish'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
