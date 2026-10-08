'use client';

import React, { useState, useEffect } from 'react';
import { Post, MediaAsset } from '@/types/post';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Send,
  Calendar,
  Copy,
  Plus,
  Trash2,
  Film,
  Camera,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (updatedPost: Post) => Promise<void>;
  onPublish: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onSave,
  onPublish
}) => {
  const [formData, setFormData] = useState<Post | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(JSON.parse(JSON.stringify(post)));
      setActiveMediaIdx(0);
    }
  }, [post]);

  if (!formData) return null;

  const hasFullBody = formData.media.some(m => m.is_full_body);

  // Auto-generate clean caption
  const generateFormattedCaption = (data: Post): string => {
    const header = data.look_type
      ? `${data.client_name} • ${data.look_type}`
      : `${data.client_name} • ${data.event_or_project}`;

    const lines: string[] = [header, ''];
    lines.push(`Tailoring: ${data.credits.tailoring || '@flowerthief'}`);
    if (data.credits.stylist) lines.push(`Styling: ${data.credits.stylist}`);
    if (data.credits.assistants && data.credits.assistants.length > 0) {
      lines.push(`Assistants: ${data.credits.assistants.join(', ')}`);
    }
    if (data.credits.hair) lines.push(`Hair: ${data.credits.hair}`);
    if (data.credits.makeup) lines.push(`Makeup: ${data.credits.makeup}`);
    if (data.credits.nails) lines.push(`Nails: ${data.credits.nails}`);
    if (data.credits.photographer) lines.push(`Photo: ${data.credits.photographer}`);

    return lines.join('\n');
  };

  const handleFieldChange = (field: keyof Post, val: unknown) => {
    setFormData(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: val };
      // Keep caption auto-synced
      if (field === 'client_name' || field === 'look_type' || field === 'event_or_project') {
        updated.caption = generateFormattedCaption(updated);
      }
      return updated;
    });
  };

  const handleCreditChange = (key: keyof Post['credits'], val: string | string[]) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedCredits = { ...prev.credits, [key]: val };
      const updated = { ...prev, credits: updatedCredits };
      updated.caption = generateFormattedCaption(updated);
      return updated;
    });
  };

  const handleToggleFullBody = (idx: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const newMedia = [...prev.media];
      newMedia[idx] = {
        ...newMedia[idx],
        is_full_body: !newMedia[idx].is_full_body
      };
      return { ...prev, media: newMedia };
    });
  };

  const handleRemoveMedia = (idx: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const newMedia = prev.media.filter((_, i) => i !== idx);
      return { ...prev, media: newMedia };
    });
    if (activeMediaIdx >= formData.media.length - 1) {
      setActiveMediaIdx(Math.max(0, formData.media.length - 2));
    }
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) return;
    const isVideo = newMediaUrl.includes('.mp4') || newMediaUrl.includes('video');
    const asset: MediaAsset = {
      url: newMediaUrl.trim(),
      type: isVideo ? 'video' : 'image',
      is_full_body: true,
      quality_rating: 'high'
    };
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, media: [...prev.media, asset] };
    });
    setNewMediaUrl('');
  };

  const handleSave = async (statusOverride?: Post['status']) => {
    setIsSaving(true);
    try {
      const toSave = {
        ...formData,
        status: statusOverride || formData.status,
        caption: formData.caption || generateFormattedCaption(formData)
      };
      await onSave(toSave);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const copyCaptionToClipboard = () => {
    const text = formData.caption || generateFormattedCaption(formData);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAsset = formData.media[activeMediaIdx];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Review & Stage Look</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {formData.client_name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Banner Check */}
        {!hasFullBody && (
          <div className="bg-amber-950/40 border-b border-amber-600/30 px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-semibold">Quality Rule Warning:</span> No full-body outfit image is currently flagged.
              Madison’s portfolio strategy prioritizes full-length photos to display pant hems, silhouettes, and alterations.
            </div>
          </div>
        )}

        {/* Modal Body: Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Media Workspace */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Active Media Preview */}
            <div className="relative aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
              {currentAsset ? (
                currentAsset.type === 'video' ? (
                  <video
                    src={currentAsset.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentAsset.url}
                    alt="Active look asset"
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="text-zinc-600 text-xs">No media assets</div>
              )}

              {currentAsset && (
                <div className="absolute top-3 left-3 flex gap-2">
                  <button
                    onClick={() => handleToggleFullBody(activeMediaIdx)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-md transition-colors ${
                      currentAsset.is_full_body
                        ? 'bg-emerald-500/90 text-white border-emerald-400'
                        : 'bg-black/70 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {currentAsset.is_full_body ? '✓ Full-Body Fit' : '+ Mark as Full-Body'}
                  </button>
                </div>
              )}

              {currentAsset && (
                <button
                  onClick={() => handleRemoveMedia(activeMediaIdx)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/30"
                  title="Remove asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Media Thumbnails Carousel strip */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Media Assets ({formData.media.length})
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {formData.media.map((asset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                      idx === activeMediaIdx ? 'border-amber-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {asset.type === 'video' ? (
                      <video src={asset.url} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {asset.is_full_body && (
                      <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Media input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste high-res image / video URL..."
                value={newMediaUrl}
                onChange={e => setNewMediaUrl(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddMedia}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Posting Strategy Toggles */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-purple-400" />
                    <span>Standalone Reel Isolation</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Publish video clips as independent Reels for maximum algorithm reach
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_standalone_reel}
                  onChange={e => handleFieldChange('is_standalone_reel', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800/60">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Collaborator Account (Co-Author)
                </label>
                <input
                  type="text"
                  value={formData.collaborator_account}
                  onChange={e => handleFieldChange('collaborator_account', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Enables cross-posting between @flowerthief and client account.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata, Structured Credits, and Clean Caption Preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Project / Look Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Client / Artist Name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={e => handleFieldChange('client_name', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-semibold outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Event / Project
                </label>
                <input
                  type="text"
                  value={formData.event_or_project}
                  onChange={e => handleFieldChange('event_or_project', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                Look / Alteration Type (e.g. Chrome Hearts Pant Hem, Stage Suit)
              </label>
              <input
                type="text"
                value={formData.look_type}
                onChange={e => handleFieldChange('look_type', e.target.value)}
                placeholder="e.g. Custom Double-Stitched Trouser Hem"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-medium outline-none focus:border-amber-500"
              />
            </div>

            {/* Structured Credits Section */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Structured Industry Credits
                </span>
                <span className="text-[10px] text-zinc-400">Strict line-separated standard</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Tailoring (Client)</label>
                  <input
                    type="text"
                    value={formData.credits.tailoring}
                    onChange={e => handleCreditChange('tailoring', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Stylist / Styled By</label>
                  <input
                    type="text"
                    value={formData.credits.stylist}
                    onChange={e => handleCreditChange('stylist', e.target.value)}
                    placeholder="@chrishoran20"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Styling Assistants (comma separated)</label>
                  <input
                    type="text"
                    value={(formData.credits.assistants || []).join(', ')}
                    onChange={e => handleCreditChange('assistants', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="@asst1, @asst2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Hair Stylist</label>
                  <input
                    type="text"
                    value={formData.credits.hair}
                    onChange={e => handleCreditChange('hair', e.target.value)}
                    placeholder="@hairstylist"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Makeup Artist</label>
                  <input
                    type="text"
                    value={formData.credits.makeup}
                    onChange={e => handleCreditChange('makeup', e.target.value)}
                    placeholder="@mua"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nails</label>
                  <input
                    type="text"
                    value={formData.credits.nails}
                    onChange={e => handleCreditChange('nails', e.target.value)}
                    placeholder="@nailartist"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-400 block mb-1">Photographer / Publication</label>
                  <input
                    type="text"
                    value={formData.credits.photographer}
                    onChange={e => handleCreditChange('photographer', e.target.value)}
                    placeholder="@photographer or W Magazine"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Live Auto-Formatted Caption Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Live Formatted Caption (No Fluff)
                </label>
                <button
                  onClick={copyCaptionToClipboard}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={formData.caption}
                onChange={e => handleFieldChange('caption', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono leading-relaxed outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Notes & Scheduled time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Internal Notes (Alterations / Timing)
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={e => handleFieldChange('notes', e.target.value)}
                  placeholder="e.g. Hold until MV drops..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Scheduled Time (ISO-8601)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_time ? formData.scheduled_time.slice(0, 16) : ''}
                  onChange={e => handleFieldChange('scheduled_time', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>Rate Billed:</span>
            <span className="text-amber-400 font-semibold">${formData.rate_billed}</span>
            <span>(Status: {formData.status})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Save Draft
            </button>

            <button
              onClick={() => handleSave('pending_review')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              Ready for Madison Review
            </button>

            {formData.scheduled_time && (
              <button
                onClick={() => handleSave('scheduled')}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Post</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onPublish(formData);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish via Meta Graph API</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
