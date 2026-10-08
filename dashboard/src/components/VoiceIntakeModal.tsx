'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Wand2, Loader2, Volume2, CheckCircle2 } from 'lucide-react';
import { Post } from '@/types/post';

interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPosts: Post[]) => void;
}

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if available in browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setErrorMsg('Web Speech API is not supported in this browser. You can type or paste your description below!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Could not start microphone:', err);
        setErrorMsg('Microphone permission required or already active.');
        setIsRecording(false);
      }
    }
  };

  const handleProcess = async () => {
    if (!transcript.trim()) {
      setErrorMsg('Please dictate into the mic or paste a list of looks first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: transcript })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse looks');
      }

      setResultCount(data.count);
      onSuccess(data.posts);
      setTimeout(() => {
        setResultCount(null);
        setTranscript('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running AI sort');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExample = (exampleText: string) => {
    setTranscript(exampleText);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                AI Voice Dictation & Brain-Dump Sorter
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  One-Click Intake
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Dictate with your mic or paste a list — the AI extracts clients, credits, and strategy automatically.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Big Mic Button */}
          <div className="flex flex-col items-center justify-center py-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl relative overflow-hidden">
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 ring-4 ring-amber-500/20'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="mt-3 text-xs font-medium text-zinc-300">
              {isRecording ? 'Listening... Speak naturally about your looks' : 'Tap to start voice dictation'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5">
              Mention the client, alterations (hems, fits), and stylists/credits
            </span>
          </div>

          {/* Transcript / Input Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Voice Transcript or Pasted Backlog List
              </label>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="e.g.: 'We tailored Charli XCX custom Chrome Hearts leather pants, hemmed and fitted by Madison at @flowerthief, styled by Chris Horan with Sam assisting. Photo by Cobrasnake.' Or paste a whole list of past projects!"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 outline-none focus:border-amber-500 leading-relaxed font-mono resize-none"
            />
          </div>

          {/* Quick Examples for 1-Click Testing */}
          <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Try a Quick Backlog Example:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadExample(
                  "Bright Eyes at Hollywood Bowl: Conor Oberst stage suits tailored and altered. Styled by Chris Horan with Sam and Taylor assisting. Includes backstage video clip for a Reel."
                )}
                className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800 transition-colors"
              >
                🎸 Bright Eyes Bowl Show
              </button>
              <button
                type="button"
                onClick={() => loadExample(
                  "- Charli XCX VMAs afterparty Chrome Hearts leather pants hemmed. Styling by Chris Horan, hair by Sams Hair, photo by Cobrasnake.\n- Music of Luna custom fairy corsetry and wire work, styled by Gabby, photo W Magazine."
                )}
                className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800 transition-colors"
              >
                ✨ Batch: Charli + Music of Luna
              </button>
            </div>
          </div>

          {/* Status / Result Notice */}
          {resultCount !== null && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Successfully generated and staged {resultCount} new post(s) into your dashboard!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-400 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Auto-formats credits • Isolates Reels • Sets @flowerthief collab
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={isProcessing || !transcript.trim()}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Sorting & Formatting...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>AI Auto-Sort Everything</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
