'use client';

import React, { useState } from 'react';
import { X, Link2, Download, Check, AlertCircle, Sparkles, Loader2, Play } from 'lucide-react';
import { Post } from '@/types/post';

interface PasteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const PasteLinkModal: React.FC<PasteLinkModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  if (!isOpen) return null;

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const res = await fetch('/api/instagram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch media from URL');
      }
      setPreviewData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!previewData) return;

    const mediaUrl = previewData.url || previewData.local_url || previewData.thumbnail;
    const isVideo = previewData.media_type === 'VIDEO';

    const newPost: Partial<Post> = {
      client_name: previewData.uploader || 'Imported Client',
      event_or_project: 'Instagram Import',
      look_type: previewData.title || 'Outfit Look',
      status: 'pending_review',
      media: [
        {
          url: mediaUrl,
          type: isVideo ? 'video' : 'image',
          is_full_body: true,
          quality_rating: 'high',
          source_url: url
        }
      ],
      is_standalone_reel: isVideo,
      caption: previewData.caption || '',
      collaborator_account: '@flowerthief',
      additional_collaborators: [],
      location: 'Los Angeles, CA',
      credits: {
        tailoring: '@flowerthief',
        stylist: '',
        assistants: [],
        hair: '',
        makeup: '',
        nails: '',
        photographer: ''
      },
      rate_billed: 20
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      if (data.success && data.post) {
        onPostCreated(data.post);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Paste Instagram Link</h2>
              <p className="text-xs text-zinc-400">Download reel or import high-res media directly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Instagram Post or Reel URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.instagram.com/p/... or /reel/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetch()}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-200">Instagram Login Required for Server Scraping</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Instagram blocks anonymous server downloads for this post. You can use the <strong>TailorFlow Chrome Extension</strong> while browsing Instagram to clip this with 1 click, or quickly create the draft below:
                  </p>
                </div>
              </div>

              {/* Quick Fallback Creator */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-200">Quick Draft Fallback</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      id="fallback-client"
                      placeholder="e.g. Charli XCX, Bright Eyes"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Look / Event</label>
                    <input
                      type="text"
                      id="fallback-look"
                      placeholder="e.g. Tour Suit, Red Carpet"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Image or Media URL (Optional)</label>
                  <input
                    type="text"
                    id="fallback-media-url"
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono text-[11px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const clientInput = (document.getElementById('fallback-client') as HTMLInputElement)?.value.trim() || 'New Client';
                    const lookInput = (document.getElementById('fallback-look') as HTMLInputElement)?.value.trim() || 'Tailoring Project';
                    const mediaInput = (document.getElementById('fallback-media-url') as HTMLInputElement)?.value.trim() || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';

                    const newPost: Partial<Post> = {
                      client_name: clientInput,
                      event_or_project: lookInput,
                      look_type: lookInput,
                      status: 'pending_review',
                      media: [
                        {
                          url: mediaInput,
                          type: 'image',
                          is_full_body: true,
                          quality_rating: 'high',
                          source_url: url
                        }
                      ],
                      is_standalone_reel: false,
                      caption: `${clientInput} • ${lookInput}\n\nTailoring: @flowerthief`,
                      collaborator_account: '@flowerthief',
                      credits: {
                        tailoring: '@flowerthief',
                        stylist: '',
                        assistants: [],
                        hair: '',
                        makeup: '',
                        nails: '',
                        photographer: ''
                      },
                      rate_billed: 20
                    };

                    const res = await fetch('/api/posts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newPost)
                    });
                    const data = await res.json();
                    if (data.success && data.post) {
                      onPostCreated(data.post);
                      onClose();
                    }
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded transition-colors"
                >
                  Create Staged Post (+$20 Rate)
                </button>
              </div>
            </div>
          )}

          {previewData && (
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Media Resolved ({previewData.source})
                </span>
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {previewData.media_type}
                </span>
              </div>

              {previewData.media_type === 'VIDEO' ? (
                <div className="relative aspect-[9/16] max-h-56 mx-auto rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={previewData.local_url || previewData.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative aspect-square max-h-48 mx-auto rounded-lg overflow-hidden bg-zinc-950">
                  <img
                    src={previewData.url || previewData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {previewData.caption && (
                <p className="text-xs text-zinc-300 line-clamp-3 bg-zinc-950 p-2.5 rounded border border-zinc-800/80 font-mono">
                  {previewData.caption}
                </p>
              )}

              <button
                onClick={handleCreatePost}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Sparkles className="w-4 h-4" />
                <span>Import to TailorFlow Pipeline (+$20 Rate)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
