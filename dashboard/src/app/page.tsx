'use client';

import React, { useState, useEffect } from 'react';
import { Post, PostStatus } from '@/types/post';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { PostDetailModal } from '@/components/PostDetailModal';
import { PublishModal } from '@/components/PublishModal';
import { NewPostModal } from '@/components/NewPostModal';
import { VoiceIntakeModal } from '@/components/VoiceIntakeModal';
import {
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderSync,
  Mic,
  Wand2
} from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | PostStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToPublish, setPostToPublish] = useState<Post | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSavePost = async (updatedPost: Post) => {
    try {
      const res = await fetch(`/api/posts/${updatedPost.post_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost)
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts(prev => prev.map(p => p.post_id === updatedPost.post_id ? data.post : p));
      }
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handlePublishComplete = (publishedPost: Post) => {
    setPosts(prev => prev.map(p => p.post_id === publishedPost.post_id ? publishedPost : p));
  };

  const handleSyncExtension = () => {
    setSyncNotice('Connecting to Chrome Extension staging storage...');
    setTimeout(() => {
      fetchPosts();
      setSyncNotice('Extension queue synced successfully!');
      setTimeout(() => setSyncNotice(null), 3000);
    }, 800);
  };

  // Filter posts based on tab and search
  const filteredPosts = posts.filter(post => {
    if (activeTab !== 'all' && post.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = post.client_name.toLowerCase().includes(q);
      const matchProject = post.event_or_project.toLowerCase().includes(q);
      const matchLook = (post.look_type || '').toLowerCase().includes(q);
      const matchStylist = (post.credits.stylist || '').toLowerCase().includes(q);
      return matchClient || matchProject || matchLook || matchStylist;
    }
    return true;
  });

  const missingFullBodyCount = posts.filter(p => !p.media.some(m => m.is_full_body)).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <Header
        posts={posts}
        onNewPostClick={() => setIsNewModalOpen(true)}
        onSyncExtensionClick={handleSyncExtension}
        onVoiceIntakeClick={() => setIsVoiceModalOpen(true)}
      />

      {/* Sync notification toast */}
      {syncNotice && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 font-medium">
          {syncNotice}
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Fast Brain-Dump / Voice Hero Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
                One-Click AI Intake: Voice Dictation & Brain-Dump
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Instant Auto-Sort
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Don’t want to fill out forms? Tap the mic and describe the client, tailoring work, and stylists, or paste a raw list of past jobs. The AI extracts credits, generates clean captions, isolates Reels, and stages everything automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Open Voice / List Intake</span>
          </button>
        </div>

        {/* Priority & Quality Control Alert Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Current P0 Backlog Priorities</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                • <strong className="text-zinc-200">Bright Eyes @ Hollywood Bowl</strong> (Stage suit tailoring)<br />
                • <strong className="text-zinc-200">Charli XCX</strong> (VMAs Chrome Hearts leather hems)
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              missingFullBodyCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {missingFullBodyCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Quality Control Audit</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {missingFullBodyCount > 0
                  ? `${missingFullBodyCount} post(s) missing a verified full-body shot showing hems and fit.`
                  : 'All staged posts contain verified full-length tailoring shots.'}
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Distribution Strategy</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Videos isolate as <span className="text-purple-300 font-medium">Reels</span> for algorithm discovery. Stills group into unwatermarked <span className="text-zinc-200 font-medium">Carousels</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Drafts ({posts.filter(p => p.status === 'draft').length})
            </button>
            <button
              onClick={() => setActiveTab('pending_review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'pending_review'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pending Review ({posts.filter(p => p.status === 'pending_review').length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'scheduled'
                  ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Scheduled ({posts.filter(p => p.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Published ({posts.filter(p => p.status === 'published').length})
            </button>
          </div>

          {/* Search bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client, look, stylist..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={fetchPosts}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Refresh posts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Post Grid */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-zinc-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mb-2" />
            <span>Loading Hollywood portfolio backlog...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
            <Layers className="w-8 h-8 text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No posts in this view</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
              Capture looks from Instagram with the TailorFlow Chrome Extension or add a look manually.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors"
            >
              + Create First Look
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map(post => (
              <PostCard
                key={post.post_id}
                post={post}
                onSelect={setSelectedPost}
                onPublishClick={setPostToPublish}
              />
            ))}
          </div>
        )}
      </main>

      {/* Review & Edit Drawer / Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSave={handleSavePost}
          onPublish={(p) => {
            setSelectedPost(null);
            setPostToPublish(p);
          }}
        />
      )}

      {/* Meta Graph API Publish Pipeline Modal */}
      {postToPublish && (
        <PublishModal
          post={postToPublish}
          onClose={() => setPostToPublish(null)}
          onPublishComplete={handlePublishComplete}
        />
      )}

      {/* New Look Modal */}
      <NewPostModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(newPost) => setPosts(prev => [newPost, ...prev])}
      />

      {/* Voice & Brain Dump AI Intake Modal */}
      <VoiceIntakeModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={(newPosts) => setPosts(prev => [...newPosts, ...prev])}
      />
    </div>
  );
}
