"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Upload, Trash2, Eye, Trophy, TrendingUp, Target, Pencil, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  score: number;
  wins: number;
  losses: number;
  matches: number;
  created_at: string;
  tags?: string[];
};

export default function MyPhotosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [tempTags, setTempTags] = useState<string[]>([]);

  const AVAILABLE_TAGS = ['綜合', '動漫', '寫實', '寵物', '風景', '可愛', '帥氣', '藝術', '人物'];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchMyPhotos(user.id);
      fetchProfile(user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("user_profiles").select("username").eq("id", userId).maybeSingle();
      if (data) setProfile(data);
    } catch (e) { }
  };

  const fetchMyPhotos = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("photos")
        .select("id, url, score, wins, losses, matches, created_at, tags")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("確定要刪除這張照片嗎？")) return;

    try {
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;
      if (user) fetchMyPhotos(user.id);
    } catch (err) {
      console.error("Error deleting photo:", err);
      alert("刪除失敗");
    }
  };

  const handleUpdateTags = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from("photos")
        .update({ tags: tempTags })
        .eq("id", editingPhoto.id);

      if (error) throw error;
      setEditingPhoto(null);
      if (user) fetchMyPhotos(user.id);
    } catch (err) {
      console.error("Error updating tags:", err);
      alert("更新失敗");
    }
  };

  if (!user) {
    return (
      <div className="container min-h-screen py-20 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center max-w-md"
        >
          <Upload className="w-16 h-16 mx-auto mb-6 text-pink-400" />
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            請先登入
          </h1>
          <p className="text-white/60 mb-8">您需要登入才能查看上傳的照片。</p>
          <Link href="/login" className="btn-primary px-8 py-3 rounded-lg inline-block">
            前往登入
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 pb-2">
            我的照片庫
          </h1>
          <p className="text-white/60 text-lg mb-4">管理您上傳的作品並追蹤對決成效。</p>
          {profile && (
            <Link href={`/user/${profile.username}`} className="text-pink-400 hover:text-pink-300 font-bold transition flex items-center justify-center gap-2 mb-8">
              <span>查看公開個人檔案</span>
              <span>→</span>
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel h-96 animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-16 text-center max-w-2xl mx-auto"
          >
            <Upload className="w-20 h-20 mx-auto mb-6 text-pink-400/40" />
            <h2 className="text-2xl font-bold mb-4 text-white">尚無照片</h2>
            <p className="text-white/60 mb-8">您還沒有上傳過任何作品。現在就開始吧！</p>
            <Link href="/upload" className="btn-primary px-8 py-3 rounded-lg inline-block">
              上傳您的第一張照片
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => {
              const winRate = photo.matches > 0 ? Math.round((photo.wins / photo.matches) * 100) : 0;

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel p-0 overflow-hidden group hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300"
                >
                  {/* Photo */}
                  <div
                    className="relative aspect-square cursor-pointer overflow-hidden bg-black/20"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Image
                      src={photo.url}
                      alt="My photo"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>

                    {/* Score Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/50">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold font-mono text-sm">{photo.score}</span>
                      </div>
                    </div>

                    {/* Tags List */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                        {photo.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white/80 border border-white/10">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs text-white/40 uppercase tracking-wider font-bold">全站勝率</span>
                        </div>
                        <div className={`text-xl font-bold font-mono ${winRate >= 50 ? 'text-green-400' : 'text-white/60'}`}>
                          {winRate}%
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs text-white/40 uppercase tracking-wider font-bold">對決次數</span>
                        </div>
                        <div className="text-xl font-bold text-white/80 font-mono">{photo.matches}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                      <div className="text-white/40">
                        <span className="text-green-400 font-mono">{photo.wins} 勝</span>
                        <span className="mx-1">-</span>
                        <span className="text-red-400 font-mono">{photo.losses} 敗</span>
                      </div>
                      <div className="text-white/30 text-xs">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPhoto(photo);
                          setTempTags(photo.tags || ['綜合']);
                        }}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="font-medium">編輯標籤</span>
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all flex items-center justify-center border border-red-500/20 hover:border-red-500/40"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.url}
                alt="Full size"
                fill
                className="object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/70 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/90 transition flex items-center justify-center text-2xl font-light border border-white/20"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 glass-panel p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-yellow-400/60 uppercase tracking-widest font-bold mb-1">全站評分</div>
                    <div className="text-3xl font-bold text-yellow-400 font-mono mb-2">{selectedPhoto.score} 分</div>
                    <div className="text-white/60">
                      <span className="text-green-400 font-mono">{selectedPhoto.wins} 勝</span>
                      <span className="mx-2">-</span>
                      <span className="text-red-400 font-mono">{selectedPhoto.losses} 敗</span>
                      <span className="mx-2">•</span>
                      <span>{selectedPhoto.matches} 次對決</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/40 mb-1">勝率</div>
                    <div className={`text-2xl font-bold font-mono ${selectedPhoto.matches > 0 && Math.round((selectedPhoto.wins / selectedPhoto.matches) * 100) >= 50
                      ? 'text-green-400'
                      : 'text-white/60'
                      }`}>
                      {selectedPhoto.matches > 0 ? Math.round((selectedPhoto.wins / selectedPhoto.matches) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Edit Tags Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel p-8 w-full max-w-md space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">編輯照片標籤</h3>
                <button onClick={() => setEditingPhoto(null)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tempTags.includes(tag)) {
                        if (tempTags.length > 1) setTempTags(tempTags.filter(t => t !== tag));
                      } else {
                        setTempTags([...tempTags, tag]);
                      }
                    }}
                    className={`
                      py-1.5 px-3 rounded-full text-xs font-bold transition-all border
                      ${tempTags.includes(tag)
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent'
                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateTags}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                >
                  儲存變更
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
