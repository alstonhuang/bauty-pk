"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { LogOut, User as UserIcon, Sparkles } from "lucide-react";
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [energy, setEnergy] = useState<{ current: number; max: number } | null>(null);
  const [profile, setProfile] = useState<{ username: string; display_name: string; avatar_url: string | null } | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("user_profiles").select("username, display_name, avatar_url").eq("id", userId).maybeSingle();
      if (data) setProfile(data);
    } catch (e) {
      // Profile might not exist yet
    }
  };

  const fetchEnergy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Call RPC to sync and get energy
      const { data, error } = await supabase.rpc('get_synced_energy');
      if (data) {
        setEnergy({
          current: (data as any).energy,
          max: (data as any).max_energy || 10
        });
      }
    }
  };

  useEffect(() => {
    const initData = (session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEnergy();
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => initData(session));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initData(session);
    });

    // Set up interval to refresh energy periodically (every 30s)
    const interval = setInterval(() => {
      if (user) fetchEnergy();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [user]); // user dependency simplifies logic

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEnergy(null);
    setProfile(null);
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <nav className="glass-panel flex items-center justify-between px-6 py-3 bg-opacity-60 backdrop-blur-xl border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="text-2xl pt-1"
            >
              <Sparkles className="w-6 h-6 text-pink-500 fill-pink-500/20" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Beauty PK
            </span>
          </Link>

          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/pk"
                className={`relative flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/pk") ? "text-white" : "text-white/60 hover:text-white"
                  }`}
              >
                <span>⚔️</span>
                <span className="hidden sm:inline">對決PK</span>
                {isActive("/pk") && (
                  <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                className={`relative flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/leaderboard") ? "text-white" : "text-white/60 hover:text-white"
                  }`}
              >
                <span>🏆</span>
                <span className="hidden sm:inline">名人堂</span>
                {isActive("/leaderboard") && (
                  <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/upload"
                className={`relative flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/upload") ? "text-white" : "text-white/60 hover:text-white"
                  }`}
              >
                <span>📸</span>
                <span className="hidden sm:inline">上傳相片</span>
                {isActive("/upload") && (
                  <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/my-photos"
                className={`relative flex items-center gap-2 text-sm font-bold transition-colors ${isActive("/my-photos") ? "text-white" : "text-white/60 hover:text-white"
                  }`}
              >
                <span>🖼️</span>
                <span className="hidden sm:inline">我的相簿</span>
                {isActive("/my-photos") && (
                  <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
                )}
              </Link>
            </li>

            {/* Auth Section */}
            <li className="pl-4 border-l border-white/10">
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    {/* Energy Display */}
                    <div className="hidden lg:flex flex-col items-end mr-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${energy && energy.current > energy.max ? "text-yellow-400 animate-pulse" : "text-pink-400"}`}>
                        <span className="text-sm">⚡</span>
                        <span className="font-mono">{energy !== null ? `${energy.current} / ${energy.max}` : '-- / --'}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((energy?.current || 0) / (energy?.max || 10)) * 100)}%` }}
                          className={`h-full ${energy && energy.current > energy.max ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gradient-to-r from-pink-500 to-purple-500"} transition-all duration-500 ease-out`}
                        />
                      </div>
                    </div>

                    <Link
                      href={profile ? `/user/${profile.username}` : '/profile/edit'}
                      className="hidden md:flex items-center gap-2 group relative"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-white/10 overflow-hidden group-hover:ring-pink-500 transition-all">
                        {profile?.avatar_url ? (
                          <div className="w-full h-full relative">
                            <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          (profile?.display_name?.[0] || user.email?.charAt(0) || "?").toUpperCase()
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* Anonymous Trial Energy */}
                    <AnonymousEnergy />
                    <Link
                      href="/login"
                      className={`btn-primary px-5 py-2 text-sm rounded-full shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-2`}
                    >
                      <UserIcon className="w-4 h-4" />
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}

function AnonymousEnergy() {
  const [anonEnergy, setAnonEnergy] = useState<number>(5);

  const updateEnergy = () => {
    const energy = localStorage.getItem('anon_energy');
    if (energy !== null) {
      setAnonEnergy(parseInt(energy));
    } else {
      localStorage.setItem('anon_energy', '5');
    }
  };

  useEffect(() => {
    updateEnergy();
    window.addEventListener('storage', updateEnergy);
    return () => window.removeEventListener('storage', updateEnergy);
  }, []);

  return (
    <div className="hidden sm:flex flex-col items-end">
      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mr-1">Trial</span>
        <span>{anonEnergy} / 5</span>
      </div>
      <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full bg-white/20 transition-all duration-300"
          style={{ width: `${(anonEnergy / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
