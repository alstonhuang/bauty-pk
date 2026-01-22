'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Photo {
  id: string
  url: string
  score: number
  created_at: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        // If no user, we can't show "user photos". 
        // But for testing purposes, if no Auth is implemented yet, maybe showing generic public photos or empty
        // Requirement says: "Display photos uploaded by the current user"
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching photos:', error)
      } else {
        setPhotos(data as Photo[] || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container min-h-screen py-10">
      <div className="flex items-center justify-between mb-12">
        <div className="animate-in slide-in-from-left duration-500">
          <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            My Gallery
          </h1>
          <p className="text-white/50">Your personal collection of beauty</p>
        </div>
        <div className="animate-in slide-in-from-right duration-500">
          <Link href="/upload">
            <button className="btn-primary flex items-center gap-2">
              <span>+</span> New Upload
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : !user ? (
        <div className="glass-panel p-10 text-center animate-in zoom-in duration-300">
          <p className="text-xl text-yellow-500 mb-4">Please log in to view your gallery.</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel p-16 text-center animate-in zoom-in duration-300 flex flex-col items-center">
          <div className="text-6xl mb-6 opacity-30">🖼️</div>
          <p className="text-2xl mb-4 font-light">No photos found</p>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            It looks like you haven't uploaded any photos yet. Start building your portfolio now!
          </p>
          <Link href="/upload">
            <button className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition">
              Upload First Photo
            </button>
          </Link>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="glass-panel p-3 break-inside-avoid relative group overflow-hidden animate-in fade-in fill-mode-backwards"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={photo.url}
                alt="Gallery Item"
                loading="lazy"
                className="w-full h-auto rounded-lg transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay Info */}
              <div className="absolute inset-x-3 bottom-3 rounded-b-lg p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Score</p>
                    <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                      ★ {photo.score}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
