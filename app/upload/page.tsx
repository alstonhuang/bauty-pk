'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [tags, setTags] = useState<string[]>(['綜合'])
  const router = useRouter()

  const AVAILABLE_TAGS = ['綜合', '動漫', '寫實', '寵物', '風景', '可愛', '帥氣', '藝術', '人物']

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      if (tags.length > 1) {
        setTags(tags.filter(t => t !== tag))
      }
    } else {
      setTags([...tags, tag])
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        // Optional: Redirect to login if that exists, or just show message
        // setMessage('Please log in to upload.')
      }
    }
    checkUser()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setMessage('')
    }
  }

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob || file),
            'image/webp',
            0.8
          );
        };
      };
    });
  };

  const handleUpload = async () => {
    if (!file) return
    if (!user) {
      setMessage('Error: You must be logged in to upload.')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // 0. Compress Image
      setMessage('Compressing image...')
      const compressedBlob = await compressImage(file)
      const uploadFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
        type: 'image/webp'
      })

      // 1. Upload to Supabase Storage
      const fileExt = 'webp'
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadFile)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // 3. Ensure public.users record exists (Self-healing)
      // This prevents "photos_user_id_fkey" errors if the DB trigger failed
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.log('User record missing in public.users, creating it now...');
        await supabase
          .from('users')
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();
      }

      // 4. Insert record into DB
      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            user_id: user.id,
            url: publicUrl,
            score: 1000, // Default score
            category: tags[0], // 舊版本相容性
            tags: tags // 新版本標籤系統
          }
        ])

      if (dbError) throw dbError

      // 4. Add Energy Bonus (+5)
      try {
        await supabase.rpc('add_energy', { amount: 5 });
      } catch (e) {
        console.error('Failed to add energy bonus:', e);
      }

      setMessage('Upload successful! +5 Energy Bonus Granted! Redirecting...')

      // Delay to show success message
      setTimeout(() => {
        router.push('/gallery')
      }, 1500)

    } catch (error) {
      console.error('Upload Error:', error)
      const err = error as Error
      setMessage(`Error: ${err.message || 'Upload failed'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container min-h-screen flex flex-col items-center justify-center py-20 relative">
      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition">
        &larr; 返回首頁
      </Link>

      <div className="glass-panel p-8 w-full max-w-md flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
          上傳完美瞬間
        </h1>

        <div className="w-full relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
          />

          <div className={`
             border-2 border-dashed rounded-xl p-8 min-h-[300px]
             flex flex-col items-center justify-center gap-4
             transition-all duration-300 relative overflow-hidden
             ${preview ? 'border-pink-500/50' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
           `}>
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-lg p-1 opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <>
                <div className="text-6xl text-white/20 group-hover:text-pink-500/80 transition-colors">📸</div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white/80">點擊或拖放照片</p>
                  <p className="text-sm text-white/40 mt-1">支援 JPG, PNG, WebP</p>
                </div>
              </>
            )}

            {/* Loading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-pink-500 font-medium tracking-wider text-sm">UPLOADING</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 多重標籤選取 */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-bold text-white/70">選取標籤 (多選)</label>
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Tags System</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`
                  py-1.5 px-3 rounded-full text-xs font-bold transition-all border
                  ${tags.includes(tag)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white'}
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {uploading ? '處理中...' : '立即上傳'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm text-center w-full ${message.includes('Error') || message.includes('錯誤') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
            {message}
          </div>
        )}

        {!user && (
          <div className="flex flex-col gap-4 w-full items-center text-center mt-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl">🔒</div>
            <h3 className="text-xl font-bold text-white">需要身分驗證</h3>
            <p className="text-white/60 mb-2">
              您必須先登入才能將照片上傳至平台。
            </p>
            <Link
              href="/login"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <span>立即登入 / 註冊</span>
              <span>&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
