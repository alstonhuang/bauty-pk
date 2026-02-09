'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import { LogIn, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleLogin = async (provider: 'google' | 'line') => {
    try {
      setLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
      setLoading(null)
    }
  }

  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 md:p-12 flex flex-col items-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-8 shadow-xl shadow-pink-500/20"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-4xl font-black mb-2 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          Welcome Back
        </h1>

        <p className="text-white/50 mb-10 text-center">
          Join the ultimate visual showdown and decide who reigns supreme.
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={() => handleLogin('google')}
            disabled={!!loading}
            className="w-full h-14 bg-white hover:bg-white/90 text-gray-900 rounded-2xl flex items-center justify-center gap-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                <path fill="#EA4335" d="M12 4.36c1.6 0 3.06.55 4.19 1.62l3.14-3.14C17.45 1.01 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => handleLogin('line')}
            disabled={!!loading}
            className="w-full h-14 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl flex items-center justify-center gap-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading === 'line' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975 1.739-1.92 2.547-3.954 2.547-5.991zm-15.651 4.354h-2.184c-.201 0-.362-.162-.362-.363v-5.289c0-.201.161-.362.362-.362h.181c.201 0 .362.161.362.362v4.927h1.643c.201 0 .362.161.362.362v.182c0 .201-.161.221-.362.321zm4.184 0h-.181c-.201 0-.363-.162-.363-.363V9.006c0-.201.162-.362.363-.362h.181c.201 0 .362.161.362.362v5.289c0 .201-.161.363-.362.363zm3.725 0h-.1a.362.362 0 01-.262-.12l-2.454-3.328v3.085c0 .201-.162.363-.363.363h-.171a.362.362 0 01-.362-.363V9.006c0-.201.161-.362.362-.362h.11c.101 0 .201.04.262.12l2.444 3.328V9.006c0-.201.162-.362.363-.362h.171c.201 0 .362.161.362.362v5.289c0 .201-.161.363-.362.363zm4.516-2.184c0 .201-.162.362-.363.362h-1.642V9.006c0-.201.161-.362.362-.362h1.642c.201 0 .362.161.362.362v.182c0 .201-.161.362-.362.362h-1.28v1.309h1.28c.201 0 .362.161.362.362v.182c0 .201-.161.362-.362.362h-1.28v1.31h1.28c.201 0 .362.161.362.362v.181z" />
              </svg>
            )}
            <span>Sign in with LINE</span>
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-8 p-4 rounded-xl text-sm font-medium w-full text-center ${message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
          >
            {message.text}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
