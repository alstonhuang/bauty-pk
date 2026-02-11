"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Edit, Camera, MapPin, Calendar, Trophy, Target, TrendingUp, ArrowLeft, Image as ImageIcon } from "lucide-react";
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
        <div className="text-white/60">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/" className="text-pink-400 hover:underline">
            Go back home
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
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 text-white/80 text-lg leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Photos</span>
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums">{stats.totalPhotos}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Total Score</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 font-mono tabular-nums">{stats.totalScore.toLocaleString()}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Win Rate</span>
                </div>
                <div className={`text-3xl font-bold font-mono tabular-nums ${stats.winRate >= 50 ? 'text-green-400' : 'text-white/60'}`}>
                  {stats.winRate}%
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Avg Score</span>
                </div>
                <div className="text-3xl font-bold text-purple-400 font-mono tabular-nums">{stats.avgScore}</div>
              </div>
            </div>
          )}

          {/* Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-pink-400" />
              Gallery
            </h2>

            {photos.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                <Camera className="w-12 h-12 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">No photos uploaded yet</p>
                {isOwnProfile && (
                  <Link href="/upload" className="text-pink-400 hover:underline mt-2 inline-block">
                    Upload your first photo
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
                        <div className="text-yellow-400 font-bold font-mono tabular-nums">{photo.score}</div>
                        <div className="text-xs text-white/60">
                          {photo.wins}W / {photo.matches}M
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
