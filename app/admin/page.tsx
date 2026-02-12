'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Shield, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  badge_url: string | null;
  criteria_type: string;
  criteria_value: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      // 檢查是否為管理員
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await fetchAchievements();
    } catch (error) {
      console.error('Admin check failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAchievements(data);
    }
  };

  const startEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon_type: achievement.icon_type,
      badge_url: achievement.badge_url,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({
          name: formData.name,
          description: formData.description,
          icon_type: formData.icon_type,
          badge_url: formData.badge_url || null,
        })
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '成就更新成功！' });
      setEditingId(null);
      setFormData({});
      await fetchAchievements();

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '更新失敗' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white/50 animate-pulse">載入中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          返回首頁
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <Shield className="w-8 h-8 text-pink-500" />
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            管理員後台
          </h1>
        </div>
        <p className="text-white/40 text-sm">成就勳章管理系統</p>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg flex items-center gap-3 ${message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                : 'bg-red-500/20 border border-red-500/50 text-red-200'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements List */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition"
            >
              {editingId === achievement.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/60 mb-2">成就名稱</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/60 mb-2">描述</label>
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/60 mb-2">圖示類型 (Lucide Icon)</label>
                    <input
                      type="text"
                      value={formData.icon_type || ''}
                      onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                      placeholder="例如: Award, Trophy, Star"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/60 mb-2">自定義圖片網址 (選填)</label>
                    <input
                      type="text"
                      value={formData.badge_url || ''}
                      onChange={(e) => setFormData({ ...formData, badge_url: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                      placeholder="https://example.com/badge.png"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => saveEdit(achievement.id)}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition"
                    >
                      <Save className="w-4 h-4" />
                      儲存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-white/10 rounded-lg font-bold hover:bg-white/20 transition"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                    <p className="text-white/60 mb-3">{achievement.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-3 py-1 bg-white/10 rounded-full">
                        圖示: {achievement.icon_type}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full">
                        條件: {achievement.criteria_type} = {achievement.criteria_value}
                      </span>
                      {achievement.badge_url && (
                        <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                          自定義圖片
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(achievement)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition"
                  >
                    編輯
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
