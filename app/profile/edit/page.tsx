"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Upload, Save, X, Camera, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);
    await fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUsername(data.username || "");
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url);
      setBannerUrl(data.banner_url);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, folder: "avatars" | "banners"): Promise<string> => {
    if (!user) throw new Error("No user");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("user-content")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);
      const url = await uploadImage(file, "avatars");
      setAvatarUrl(url);
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    try {
      setUploadingBanner(true);
      setError(null);
      const url = await uploadImage(file, "banners");
      setBannerUrl(url);
    } catch (err) {
      console.error("Error uploading banner:", err);
      setError("Failed to upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          username: username.trim(),
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        })
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505") {
          throw new Error("Username already taken");
        }
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/user/${username}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <Link href={`/user/${username}`} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </Link>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
            ✅ Profile updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3 uppercase tracking-wider">
              Banner Image
            </label>
            <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 group">
              {bannerUrl && (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm font-medium">
                    {uploadingBanner ? "Uploading..." : "Change Banner"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-white/40 mt-2">Recommended: 1500x500px, max 10MB</p>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3 uppercase tracking-wider">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500 group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {displayName[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-sm text-white/60">
                {uploadingAvatar ? "Uploading..." : "Click to upload"}
                <br />
                <span className="text-xs text-white/40">Max 5MB</span>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wider">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition"
              placeholder="Your display name"
              maxLength={50}
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wider">
              Username *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white/40">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition"
                placeholder="username"
                maxLength={30}
                required
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              Letters, numbers, and underscores only. Min 3 characters.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wider">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-2 text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/user/${username}`}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-bold transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
