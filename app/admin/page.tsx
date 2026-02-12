'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Shield, Save, AlertCircle, CheckCircle, ArrowLeft, Upload, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  badge_url: string | null;
  criteria_type: string;
  criteria_value: number;
};

type BadgeImage = {
  name: string;
  url: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badgeImages, setBadgeImages] = useState<BadgeImage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
      await Promise.all([fetchAchievements(), fetchBadgeImages()]);
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

  const fetchBadgeImages = async () => {
    const { data, error } = await supabase.storage
      .from('achievement_badges')
      .list();

    if (!error && data) {
      const images = data.map(file => ({
        name: file.name,
        url: supabase.storage.from('achievement_badges').getPublicUrl(file.name).data.publicUrl
      }));
      setBadgeImages(images);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('achievement_badges')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setMessage({ type: 'success', text: '圖片上傳成功！' });
      await fetchBadgeImages();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '上傳失敗' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (fileName: string) => {
    if (!confirm('確定要刪除此圖片嗎？')) return;

    try {
      const { error } = await supabase.storage
        .from('achievement_badges')
        .remove([fileName]);

      if (error) throw error;

      setMessage({ type: 'success', text: '圖片已刪除' });
      await fetchBadgeImages();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '刪除失敗' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const startEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon_type: achievement.icon_type,
      badge_url: achievement.badge_url,
      criteria_type: achievement.criteria_type,
      criteria_value: achievement.criteria_value,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setShowImagePicker(false);
  };

  const selectBadgeImage = (url: string) => {
    setFormData({ ...formData, badge_url: url });
    setShowImagePicker(false);
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
          criteria_type: formData.criteria_type,
          criteria_value: formData.criteria_value,
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

      <div className="max-w-6xl mx-auto grid gap-8">
        {/* Badge Image Manager */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-pink-500" />
              徽章圖片庫
            </h2>
            <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? '上傳中...' : '上傳圖片'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badgeImages.map((img) => (
              <div key={img.name} className="relative group">
                <div className="aspect-square bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-pink-500/50 transition">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <button
                  onClick={() => deleteImage(img.name)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <p className="text-xs text-white/40 mt-1 truncate">{img.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements List */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">成就列表</h2>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition"
            >
              {editingId === achievement.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                      <label className="block text-sm font-bold text-white/60 mb-2">圖示類型 (Lucide Icon)</label>
                      <input
                        type="text"
                        value={formData.icon_type || ''}
                        onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                        placeholder="例如: Award, Trophy, Star"
                      />
                    </div>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white/60 mb-2">達成條件類型</label>
                      <select
                        value={formData.criteria_type || ''}
                        onChange={(e) => setFormData({ ...formData, criteria_type: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                      >
                        <option value="upload_count">上傳照片數量</option>
                        <option value="match_count">參與對決次數</option>
                        <option value="score_threshold">單張照片分數門檻</option>
                        <option value="win_rate_threshold">勝率門檻 (%)</option>
                        <option value="tag_win_count:寵物">寵物標籤勝利次數</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/60 mb-2">達成門檻值</label>
                      <input
                        type="number"
                        value={formData.criteria_value || 0}
                        onChange={(e) => setFormData({ ...formData, criteria_value: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/60 mb-2">自定義徽章圖片</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.badge_url || ''}
                        onChange={(e) => setFormData({ ...formData, badge_url: e.target.value })}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                        placeholder="或從圖片庫選擇"
                        readOnly
                      />
                      <button
                        onClick={() => setShowImagePicker(!showImagePicker)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition"
                      >
                        選擇圖片
                      </button>
                    </div>

                    {showImagePicker && (
                      <div className="mt-4 grid grid-cols-4 gap-2 p-4 bg-white/5 rounded-lg max-h-64 overflow-y-auto">
                        {badgeImages.map((img) => (
                          <button
                            key={img.name}
                            onClick={() => selectBadgeImage(img.url)}
                            className="aspect-square bg-white/10 rounded-lg overflow-hidden border-2 border-transparent hover:border-pink-500 transition"
                          >
                            <Image
                              src={img.url}
                              alt={img.name}
                              width={100}
                              height={100}
                              className="object-contain p-2"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {formData.badge_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden">
                          <Image
                            src={formData.badge_url}
                            alt="預覽"
                            width={48}
                            height={48}
                            className="object-contain p-1"
                          />
                        </div>
                        <span className="text-xs text-white/60">目前選擇的圖片</span>
                      </div>
                    )}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {achievement.badge_url && (
                      <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={achievement.badge_url}
                          alt={achievement.name}
                          width={64}
                          height={64}
                          className="object-contain p-2"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                      <p className="text-white/60 mb-3">{achievement.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 bg-white/10 rounded-full">
                          圖示: {achievement.icon_type}
                        </span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                          條件: {achievement.criteria_type} ≥ {achievement.criteria_value}
                        </span>
                        {achievement.badge_url && (
                          <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                            自定義圖片
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(achievement)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition flex-shrink-0"
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
