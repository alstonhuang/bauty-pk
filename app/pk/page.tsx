'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

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
  const [imagesLoaded, setImagesLoaded] = useState({ a: false, b: false });
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchMatch = async (excludeIds: string[] = [], category = selectedCategory) => {
    try {
      setLoading(true);
      setImagesLoaded({ a: false, b: false }); // Hide images during transition

      const params = new URLSearchParams({
        t: Date.now().toString(),
        exclude: excludeIds.join(','),
        category: category
      });
      const res = await fetch(`/api/match/random?${params.toString()}`, { cache: 'no-store' });
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

    // 1. Optimistic UI: Show winner/loser state immediately
    setVoteResult({ winnerId, gained: 0 }); // Points will be updated later
    setVotingState('voting');

    try {
      // 2. Check Auth & Handle Energy (Async)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        const { data: energyData, error: energyError } = await (supabase as any).rpc('consume_energy', { cost: 1 });
        if (energyError || !(energyData as any).success) {
          setError(energyError ? 'Energy Error: ' + energyError.message : '⚡ Not enough energy!');
          setVotingState('idle');
          setVoteResult(null);
          return;
        }
      } else {
        const anonEnergy = parseInt(localStorage.getItem('anon_energy') ?? '5');
        if (anonEnergy <= 0) {
          setError('🎁 Trial Ended! Sign up for 10 Energy.');
          setVotingState('idle');
          setVoteResult(null);
          return;
        }
        localStorage.setItem('anon_energy', (anonEnergy - 1).toString());
        window.dispatchEvent(new Event('storage'));
      }

      // 3. Show Result Transition (Trophy)
      setVotingState('result');

      // 4. Record Vote in Backend
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
        setTimeout(() => {
          const currentIds = match?.photos.map(p => p.id) || [];
          fetchMatch(currentIds);
        }, 2000);
      }
    } catch (err) {
      console.error('Vote failed', err);
      setError('Connection failed. Please retry.');
      setVotingState('idle');
      setVoteResult(null);
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

      {/* Top Controls - Category Selector */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-[90%] md:w-auto">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          {['All', 'Anime', 'Realistic', 'Pets', 'Landscape'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (selectedCategory !== cat) {
                  setSelectedCategory(cat);
                  fetchMatch([], cat);
                }
              }}
              className={`
                px-4 py-2 rounded-xl text-[10px] md:text-xs font-black tracking-[0.1em] transition-all
                ${selectedCategory === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                  : 'text-white/30 hover:text-white hover:bg-white/5'}
              `}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase">Arena Mode</div>
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
        isReady={imagesLoaded.a && imagesLoaded.b}
        onLoad={() => setImagesLoaded(prev => ({ ...prev, a: true }))}
      />

      {/* RIGHT SIDE */}
      <ContestantSide
        photo={photoB}
        opponentId={photoA.id}
        side="right"
        onVote={handleVote}
        votingState={votingState}
        result={voteResult}
        isReady={imagesLoaded.a && imagesLoaded.b}
        onLoad={() => setImagesLoaded(prev => ({ ...prev, b: true }))}
      />

      {/* OVERLAY LOADING (For next match) */}
      <AnimatePresence>
        {(loading || !imagesLoaded.a || !imagesLoaded.b) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <RefreshCw className="w-12 h-12 text-pink-500 animate-spin" />
              <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-black italic tracking-[0.2em] text-white/80">PREPARING ARENA</p>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function ContestantSide({ photo, opponentId, side, onVote, votingState, result, isReady, onLoad }: any) {
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
      ${!isReady ? 'opacity-0' : 'opacity-100'}
      group
    `}>

      {/* 1. Image Container (Strictly constrained) */}
      <div className="relative w-full h-[60%] flex items-center justify-center p-4">
        {/* Background Blur */}
        {isReady && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl scale-90"
            style={{ backgroundImage: `url(${photo.url})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          />
        )}

        {/* Main Image Wrapper: FORCE HEIGHT VIA INLINE STYLE */}
        <div
          className="relative z-10 w-full h-full flex items-center justify-center group"
          onClick={() => !disabled && onVote(photo.id, opponentId)}
        >
          <Image
            src={photo.url}
            alt="Contestant"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onLoad={onLoad}
            style={{ objectFit: 'contain' }}
            className={`
                 rounded-lg shadow-2xl p-4
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
                {/* 3D Trophy Image with Glow */}
                <div className="relative mb-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      y: [0, -15, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative z-10 w-40 h-40 md:w-64 md:h-64 filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                  >
                    <div className="absolute inset-0 bg-yellow-500/30 blur-[60px] rounded-full scale-75 animate-pulse" />
                    <Image
                      src="/victory-trophy.png"
                      alt="Victory Trophy"
                      fill
                      priority
                      sizes="(max-width: 768px) 160px, 256px"
                      className="object-contain relative z-10"
                    />
                  </motion.div>

                  {/* Floating Particles Around Trophy - Centered Origin */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        top: "50%",
                        left: "50%",
                      }}
                      animate={{
                        y: [0, -150 - Math.random() * 50],
                        x: [0, (Math.random() - 0.5) * 200],
                        opacity: [0, 1, 0],
                        scale: [0, Math.random() * 1.5 + 0.5, 0],
                        rotate: [0, Math.random() * 360]
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full blur-[1px] shadow-[0_0_15px_rgba(253,224,71,1)] z-0"
                    />
                  ))}

                </div>

                <AnimatePresence>
                  {result.gained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="bg-black/80 backdrop-blur-xl px-8 py-3 rounded-full border-2 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center gap-3"
                    >
                      <span className="text-yellow-400 font-black text-3xl md:text-5xl italic tracking-tighter drop-shadow-lg">
                        WINNER
                      </span>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white font-black text-3xl md:text-5xl"
                      >
                        +<AnimatedCounter value={result.gained} />
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
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
