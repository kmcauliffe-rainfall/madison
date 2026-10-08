'use client';

import React, { useState } from 'react';
import { Post, MediaAsset } from '@/types/post';
import { X, Plus, Sparkles, Layers } from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPost: Post) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [clientName, setClientName] = useState('Charli XCX');
  const [customClient, setCustomClient] = useState('');
  const [eventProject, setEventProject] = useState('');
  const [lookType, setLookType] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [stylist, setStylist] = useState('');
  const [assistants, setAssistants] = useState('');
  const [hair, setHair] = useState('');
  const [makeup, setMakeup] = useState('');
  const [photo, setPhoto] = useState('');
  const [isFullBody, setIsFullBody] = useState(true);
  const [isReel, setIsReel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalClient = clientName === 'custom' ? customClient.trim() : clientName;
    if (!finalClient) {
      alert('Please provide a client name');
      return;
    }

    setSubmitting(true);

    const urls = mediaUrls
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const mediaList: MediaAsset[] = (urls.length > 0 ? urls : [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
    ]).map(u => ({
      url: u,
      type: u.includes('.mp4') || u.includes('video') ? 'video' : 'image',
      is_full_body: isFullBody,
      quality_rating: 'high'
    }));

    const lines = [
      lookType ? `${finalClient} • ${lookType}` : finalClient,
      '',
      'Tailoring: @flowerthief'
    ];
    if (stylist.trim()) lines.push(`Styling: ${stylist.trim()}`);
    if (assistants.trim()) lines.push(`Assistants: ${assistants.trim()}`);
    if (hair.trim()) lines.push(`Hair: ${hair.trim()}`);
    if (makeup.trim()) lines.push(`Makeup: ${makeup.trim()}`);
    if (photo.trim()) lines.push(`Photo: ${photo.trim()}`);

    const payload: Partial<Post> = {
      client_name: finalClient,
      event_or_project: eventProject || 'Editorial / Tour Look',
      look_type: lookType,
      status: 'draft',
      media: mediaList,
      is_standalone_reel: isReel,
      caption: lines.join('\n'),
      collaborator_account: '@flowerthief',
      credits: {
        tailoring: '@flowerthief',
        stylist: stylist.trim(),
        assistants: assistants.split(',').map(s => s.trim()).filter(Boolean),
        hair: hair.trim(),
        makeup: makeup.trim(),
        nails: '',
        photographer: photo.trim()
      },
      rate_billed: 20
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.post) {
        onCreated(data.post);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Add New Backlog Look</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Client / Artist
              </label>
              <select
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              >
                <option value="Bright Eyes">Bright Eyes</option>
                <option value="Charli XCX">Charli XCX</option>
                <option value="Music of Luna">Music of Luna</option>
                <option value="Demi Lovato">Demi Lovato</option>
                <option value="Pandora Knox">Pandora Knox</option>
                <option value="Replicant Labs">Replicant Labs</option>
                <option value="custom">-- Custom Client --</option>
              </select>
              {clientName === 'custom' && (
                <input
                  type="text"
                  placeholder="Client name..."
                  value={customClient}
                  onChange={e => setCustomClient(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 mt-2 outline-none"
                />
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Event / Project
              </label>
              <input
                type="text"
                value={eventProject}
                onChange={e => setEventProject(e.target.value)}
                placeholder="e.g. VMAs / Stage Tour"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Look / Alteration Description
            </label>
            <input
              type="text"
              value={lookType}
              onChange={e => setLookType(e.target.value)}
              placeholder="e.g. Leather Trouser Hems, Custom Corset Fit"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Media URLs (one per line, high-res direct CDN links)
            </label>
            <textarea
              rows={3}
              value={mediaUrls}
              onChange={e => setMediaUrls(e.target.value)}
              placeholder="https://images.unsplash.com/...&#10;https://example.com/bts-video.mp4"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Stylist</label>
              <input
                type="text"
                value={stylist}
                onChange={e => setStylist(e.target.value)}
                placeholder="@chrishoran20"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Photographer</label>
              <input
                type="text"
                value={photo}
                onChange={e => setPhoto(e.target.value)}
                placeholder="@photographer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isFullBody}
                onChange={e => setIsFullBody(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Includes Full-Body Outfit Fit</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isReel}
                onChange={e => setIsReel(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Isolate as Standalone Reel</span>
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
