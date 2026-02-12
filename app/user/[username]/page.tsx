"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Edit, Camera, MapPin, Calendar, Trophy, Target, TrendingUp, ArrowLeft, Image as ImageIcon, Share2, Award, Star, Swords } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  created_at: string;
};

type UserPhoto = {
  id: string;
  url: string;
  score: number;
  wins: number;
  matches: number;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  badge_url?: string | null;  // 新增支援自定義圖片
  earned_at: string;
};

type UserStats = {
  totalPhotos: number;
  totalScore: number;
  totalWins: number;
  totalMatches: number;
  winRate: number;
  avgScore: number;
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("username", decodeURIComponent(username)) // Ensure encoded characters are handled
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setIsOwnProfile(user?.id === profileData.id);

      // Fetch user's photos
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("id, url, score, wins, matches")
        .eq("user_id", profileData.id)
        .order("score", { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      // Calculate stats
      if (photosData && photosData.length > 0) {
        const totalScore = photosData.reduce((sum, p) => sum + p.score, 0);
        const totalWins = photosData.reduce((sum, p) => sum + p.wins, 0);
        const totalMatches = photosData.reduce((sum, p) => sum + p.matches, 0);

        setStats({
          totalPhotos: photosData.length,
          totalScore,
          totalWins,
          totalMatches,
          winRate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
          avgScore: Math.round(totalScore / photosData.length),
        });
      }

      // If viewing own profile, trigger achievement check FIRST to ensure new ones are awarded
      if (user && user.id === profileData.id) {
        await supabase.rpc('check_user_achievements', { p_user_id: user.id });
      }

      // Fetch achievements (including newly awarded ones)
      const { data: achievementData, error: achievementError } = await supabase
        .from("user_achievements")
        .select(`
          earned_at,
          achievements (
            id,
            name,
            description,
            icon_type,
            badge_url
          )
        `)
        .eq("user_id", profileData.id);

      if (!achievementError && achievementData) {
        const mappedAchievements = achievementData.map((item: any) => ({
          earned_at: item.earned_at,
          ...item.achievements
        }));
        console.log("Fetched achievements for profile:", mappedAchievements);
        setAchievements(mappedAchievements);
      } else if (achievementError) {
        console.error("Achievement fetch error:", achievementError);
      }

    } catch (err) {
      console.error("Error fetching profile:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white/60 font-medium tracking-widest text-sm uppercase">載入檔案中...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">找不到該用戶</h1>
          <Link href="/" className="text-pink-400 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 overflow-hidden">
        {profile.banner_url && (
          <Image
            src={profile.banner_url}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Profile Content */}
      <div className="container max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/20 bg-gradient-to-br from-pink-500 to-purple-500">
                {profile.avatar_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white">
                    {profile.display_name[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.display_name}</h1>
                  <p className="text-white/60 text-lg">@{profile.username}</p>
                </div>

                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">編輯個人檔案</span>
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 text-white/80 text-lg leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>於 {new Date(profile.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })} 加入</span>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  const shareText = `來看看 ${profile.display_name} 在 Beauty-PK 的戰績吧！總分：${stats?.totalScore}，排名不斷上升中！`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Beauty-PK 個人檔案',
                      text: shareText,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
                    alert('已複製分享連結至剪貼簿！');
                  }
                }}
                className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-bold">分享戰績</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">照片數量</span>
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums">{stats.totalPhotos}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">總積分</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 font-mono tabular-nums">{stats.totalScore.toLocaleString()}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">勝率</span>
                </div>
                <div className={`text-3xl font-bold font-mono tabular-nums ${stats.winRate >= 50 ? 'text-green-400' : 'text-white/60'}`}>
                  {stats.winRate}%
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">平均分</span>
                </div>
                <div className="text-3xl font-bold text-purple-400 font-mono tabular-nums">{stats.avgScore}</div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                成就勳章
              </h2>
              <div className="flex flex-wrap gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="group relative bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-yellow-500/50 hover:bg-white/10 transition-all cursor-help"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30 overflow-hidden">
                      {achievement.badge_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={achievement.badge_url}
                            alt={achievement.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <>
                          {achievement.icon_type === 'Camera' && <Camera className="w-6 h-6 text-yellow-400 share-icon" />}
                          {achievement.icon_type === 'Swords' && <Swords className="w-6 h-6 text-yellow-400 share-icon" />}
                          {achievement.icon_type === 'Star' && <Star className="w-6 h-6 text-yellow-400 share-icon" />}
                          {achievement.icon_type === 'Trophy' && <Trophy className="w-6 h-6 text-yellow-400 share-icon" />}
                          {achievement.icon_type === 'Award' && <Award className="w-6 h-6 text-yellow-400 share-icon" />}
                        </>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-bold">{achievement.name}</div>
                      <div className="text-white/40 text-xs">{new Date(achievement.earned_at).toLocaleDateString()} 達成</div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-black/90 backdrop-blur-md text-white text-xs rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {achievement.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-pink-400" />
              作品展示
            </h2>

            {photos.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                <Camera className="w-12 h-12 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">目前尚無上傳照片</p>
                {isOwnProfile && (
                  <Link href="/upload" className="text-pink-400 hover:underline mt-2 inline-block">
                    上傳您的第一張照片
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-white/5"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={photo.url}
                        alt="Photo"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-yellow-400 font-bold font-mono tabular-nums">{photo.score} 分</div>
                        <div className="text-[10px] text-yellow-400/60 font-bold uppercase tracking-tighter mb-1">全站評分</div>
                        <div className="text-xs text-white/60">
                          {photo.wins} 勝 / {photo.matches} 對決
                        </div>
                        {/* Tags on Card */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(photo as any).tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/60 border border-white/5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
