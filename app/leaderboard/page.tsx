"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  score: number;
  wins: number;
  matches: number;
  users?: {
    email: string;
    username: string;
    display_name: string;
  } | null;
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1
  }
};

export default function LeaderboardPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Get total count
      const { count } = await supabase
        .from("photos")
        .select("*", { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Get paginated data
      const { data, error } = await supabase
        .from("photos")
        .select(`
          id, 
          url, 
          score, 
          wins, 
          matches,
          user_id,
          user_profiles!inner(username, display_name)
        `)
        .order("score", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Transform data to match our Photo type
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        url: item.url,
        score: item.score,
        wins: item.wins,
        matches: item.matches,
        users: item.user_profiles ? {
          email: 'hidden@example.com',
          username: item.user_profiles.username,
          display_name: item.user_profiles.display_name
        } : null
      }));

      setPhotos(transformedData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getRankStyle = (index: number) => {
    if (index === 0) return "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)]";
    if (index === 1) return "border-gray-400/50 bg-gray-400/10 shadow-[0_0_30px_-5px_rgba(156,163,175,0.2)]";
    if (index === 2) return "border-orange-500/50 bg-orange-500/10 shadow-[0_0_30px_-5px_rgba(249,115,22,0.2)]";
    return "border-transparent hover:border-white/10 hover:bg-white/5";
  };

  const RenderRankIcon = ({ index }: { index: number }) => {
    if (index === 0) return (
      <div className="relative group">
        <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 fill-yellow-400/20 relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
      </div>
    );
    if (index === 1) return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gray-300 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <Medal className="w-8 h-8 md:w-10 md:h-10 text-gray-300 fill-gray-300/20 relative z-10 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" />
      </div>
    );
    if (index === 2) return (
      <div className="relative group">
        <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <Medal className="w-8 h-8 md:w-10 md:h-10 text-orange-400 fill-orange-400/20 relative z-10 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
      </div>
    );
    return <span className="font-mono text-xl md:text-2xl text-white/20">{(index + 1).toString().padStart(2, '0')}</span>;
  };

  return (
    <div className="container min-h-screen py-20 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-400 to-purple-500 pb-2">
          Leaderboard
        </h1>
        <p className="text-white/60 text-lg">The world's most stunning visuals, ranked by you.</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {loading ? (
          // Skeleton Loading
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel h-24 w-full animate-pulse flex items-center px-6 gap-6"
            >
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="w-16 h-16 bg-white/10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {photos.map((photo, index) => {
              const winRate = photo.matches > 0 ? Math.round((photo.wins / photo.matches) * 100) : 0;

              return (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.06)" }}
                  className={`glass-panel p-3 md:p-5 flex items-center transition-all cursor-pointer border-l-4 ${getRankStyle(index)} ${index === 0 ? 'border-l-yellow-500' : index === 1 ? 'border-l-gray-400' : index === 2 ? 'border-l-orange-500' : 'border-l-transparent'}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Rank & Avatar container */}
                  <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                    <div className="w-10 md:w-14 flex justify-center items-center">
                      <RenderRankIcon index={index} />
                    </div>

                    <div className={`relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full overflow-hidden p-0.5 bg-gradient-to-br transition-shadow ${index === 0 ? 'from-yellow-400/50 to-orange-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                      index === 1 ? 'from-gray-300/50 to-gray-500/50 shadow-[0_0_15px_rgba(156,163,175,0.3)]' :
                        index === 2 ? 'from-orange-400/50 to-red-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'from-white/10 to-white/5'
                      }`}>
                      <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-white/10">
                        <img
                          src={photo.url}
                          alt={`Rank ${index + 1}`}
                          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="ml-4 md:ml-8 flex-1 min-w-0 pr-4">
                    {photo.users?.username ? (
                      <Link
                        href={`/user/${photo.users.username}`}
                        className="block text-base md:text-lg font-bold text-white/90 hover:text-pink-400 truncate transition group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photo.users.display_name}
                      </Link>
                    ) : (
                      <div className="text-base md:text-lg font-bold text-white/60 truncate italic">
                        Anonymous
                      </div>
                    )}
                    <div className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em] font-black">Competitor</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex items-center gap-4 md:gap-10 shrink-0">
                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-2xl md:text-3xl font-black font-mono tabular-nums tracking-tighter ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-white/80'}`}>
                        {photo.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold">Elo Rating</div>
                    </div>

                    {/* Win Rate (Desktop only for space) */}
                    <div className="hidden sm:block text-right border-l border-white/5 pl-4 md:pl-8">
                      <div className={`text-lg md:text-xl font-bold font-mono tabular-nums ${winRate >= 50 ? 'text-green-400' : 'text-white/50'}`}>
                        {winRate}%
                      </div>
                      <div className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.1em] font-semibold">Win Rate</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!loading && photos.length === 0 && (
          <div className="text-center py-20 text-white/50 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="mb-4">No champions yet.</p>
            <a href="/upload" className="text-primary hover:text-primary-glow font-bold hover:underline">Be the first to upload!</a>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition font-medium ${currentPage === pageNum
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white/60'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt="Full size"
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/70 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/90 transition flex items-center justify-center text-2xl font-light border border-white/20 z-10"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent rounded-b-lg p-6 pt-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-3xl font-bold text-yellow-400 font-mono mb-2">
                      {selectedPhoto.score.toLocaleString()} <span className="text-lg text-white/60">Points</span>
                    </div>
                    <div className="text-sm text-white/60 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{selectedPhoto.wins} wins</span>
                      <span>•</span>
                      <span>{selectedPhoto.matches} matches</span>
                      {selectedPhoto.users?.email && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">by {selectedPhoto.users.email.split('@')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
