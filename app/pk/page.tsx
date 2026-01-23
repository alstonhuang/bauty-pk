'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Photo = {
  id: string;
  url: string;
  score: number;
};

type Match = {
  match_id: string;
  photos: [Photo, Photo];
};

export default function PKPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingState, setVotingState] = useState<'idle' | 'voting' | 'result'>('idle');
  const [voteResult, setVoteResult] = useState<{ winnerId: string; gained: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = async (isRetry = false) => {
    try {
      if (!isRetry) setLoading(true);
      const res = await fetch('/api/match/random', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch match');
      const data = await res.json();
      setMatch(data);
      setLoading(false);
      setVotingState('idle');
      setVoteResult(null);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleVote = async (winnerId: string, loserId: string) => {
    if (votingState !== 'idle') return;

    setVotingState('voting');

    try {
      // 1. Consume Energy (RPC Check)
      // We check this client-side first via RPC to give instant feedback, 
      // although arguably the API route could do it. 
      // Doing it here allows us to stop the "Vote" fetch if energy is low.
      const { data: energyData, error: energyError } = await (supabase as any).rpc('consume_energy', { cost: 1 });

      if (energyError) {
        setError('Energy System Error: ' + energyError.message);
        setVotingState('idle');
        return;
      }

      const { success, energy: remainingEnergy, message } = energyData as any;

      if (!success) {
        setError('⚡ Not enough energy! Wait for it to regenerate.');
        setVotingState('idle');
        return;
      }

      // Force a slight UI update for the header to pick up the new energy? 
      // The interval in Header will eventually pick it up, or we can use an event bus.
      // For now, rely on interval or page refresh.

      // 2. Proceed with Vote
      const res = await fetch('/api/match/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: match?.match_id,
          winner_id: winnerId,
          loser_id: loserId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVoteResult({ winnerId, gained: data.points_gained });
        setVotingState('result');

        // Auto-refresh after delay
        setTimeout(() => {
          fetchMatch();
        }, 2000);
      }
    } catch (err) {
      console.error('Vote failed', err);
      setVotingState('idle');
    }
  };

  if (loading && !match) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white/50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-sm font-mono tracking-[0.3em] uppercase">Initializing Arena...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white">
        <AlertCircle className="w-12 h-12 mb-4 text-white/20" />
        <p className="mb-6 text-xl font-light">No competitors found.</p>
        <Link href="/upload" className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold transition">
          Upload Photos First
        </Link>
        <Link href="/" className="mt-4 text-sm text-white/40 hover:text-white">Return to Home</Link>
      </div>
    );
  }

  const [photoA, photoB] = match.photos;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0f] grid grid-cols-2">
      <Link href="/" className="absolute top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition">
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* VS Badge */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none drop-shadow-[0_0_50px_rgba(255,0,255,0.5)]">
        <span className="font-black italic text-4xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">VS</span>
      </div>

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-10 left-1/2 z-[100] px-6 py-3 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-200 font-bold shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDE */}
      <ContestantSide
        photo={photoA}
        opponentId={photoB.id}
        side="left"
        onVote={handleVote}
        votingState={votingState}
        result={voteResult}
      />

      {/* RIGHT SIDE */}
      <ContestantSide
        photo={photoB}
        opponentId={photoA.id}
        side="right"
        onVote={handleVote}
        votingState={votingState}
        result={voteResult}
      />
    </div>
  );
}

function ContestantSide({ photo, opponentId, side, onVote, votingState, result }: any) {
  const isWinner = result?.winnerId === photo.id;
  const isLoser = result?.winnerId && result?.winnerId !== photo.id;
  const disabled = votingState !== 'idle';

  return (
    <div className={`
      relative w-full h-full
      flex flex-col items-center justify-center
      border-b md:border-b-0 md:border-r border-white/5
      transition-all duration-700
      ${isLoser ? 'grayscale opacity-30 contrast-125' : ''}
      ${isWinner ? 'bg-gradient-to-b from-pink-500/10 to-purple-500/10' : ''}
      group
    `}>

      {/* 1. Image Container (Strictly constrained) */}
      <div className="relative w-full h-[60%] flex items-center justify-center p-4">
        {/* Background Blur */}
        <div
          className="absolute inset-0 opacity-20 blur-3xl scale-90"
          style={{ backgroundImage: `url(${photo.url})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        />

        {/* Main Image Wrapper: FORCE HEIGHT VIA INLINE STYLE */}
        <div
          className="relative z-10 w-full h-full flex items-center justify-center group"
          onClick={() => !disabled && onVote(photo.id, opponentId)}
        >
          <img
            src={photo.url}
            alt="Contestant"
            style={{ maxHeight: '50vh', maxWidth: '100%', objectFit: 'contain' }}
            className={`
                 rounded-lg shadow-2xl
                 transition-all duration-300
                 ${!disabled && 'cursor-pointer hover:scale-105 hover:border-4 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]'}
               `}
          />
        </div>

        {/* Winner Overlay */}
        <AnimatePresence>
          {isWinner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Explosion Effect Background */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2, opacity: [0, 0.2, 0] }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
              />

              <motion.div
                initial={{ scale: 0.5, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="relative flex flex-col items-center"
              >
                {/* Crown Icon with Glow */}
                <div className="relative mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Trophy className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                  </motion.div>

                  {/* Floating Particles Around Trophy */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [-20, -100],
                        x: [0, (i % 2 === 0 ? 50 : -50)],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-2xl border-2 border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                >
                  <span className="text-yellow-400 font-black text-3xl md:text-4xl italic tracking-tighter">
                    WINNER <span className="text-white ml-2">+{result.gained}</span>
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Action Area - REMOVED BUTTON, just a label or empty space if needed, keeping structure simple */}
      <div className="relative z-20 mt-4 md:mt-0 opacity-0 pointer-events-none">
        {/* Placeholder to keep spacing if necessary, or just remove content */}
      </div>

    </div>
  )
}
