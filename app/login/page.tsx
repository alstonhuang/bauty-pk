'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL (from callback)
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      setMessage({
        type: 'error',
        text: `Authentication failed: ${decodeURIComponent(error)}`
      })
    }
  }, [])

  const handleLogin = async (provider: 'google' | 'line') => {
    try {
      setLoading(provider)
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        })
        if (error) throw error
      } else {
        const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
        if (!clientId) throw new Error('LINE 伺服器配置中 (ID Missing)');
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/line/callback`);
        const state = Math.random().toString(36).substring(7);
        const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
        window.location.href = lineAuthUrl;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050508] font-sans">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel group relative overflow-hidden p-10 md:p-12 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col items-center text-center">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="relative mb-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-20 h-20 rounded-[28%] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl border border-white/20">
                <Sparkles className="w-10 h-10 text-white fill-white/20" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                Beauty <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">PK</span>
              </h1>
              <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto">
                Discover perfection through the world's most elegant visual showdown.
              </p>
            </motion.div>

            <div className="w-full space-y-4">
              <LoginButton
                provider="google"
                loading={loading === 'google'}
                onClick={() => handleLogin('google')}
              />
              <LoginButton
                provider="line"
                loading={loading === 'line'}
                onClick={() => handleLogin('line')}
              />
            </div>

            <div className="mt-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-white/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure Authentication</span>
            </div>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-8 overflow-hidden`}
              >
                <div className={`p-4 rounded-2xl text-[13px] font-medium border ${message.type === 'success'
                  ? 'bg-green-500/5 text-green-400 border-green-500/20'
                  : 'bg-red-500/5 text-red-400 border-red-500/20'
                  }`}>
                  {message.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => window.history.back()}
            className="text-white/30 hover:text-white/60 text-xs font-semibold flex items-center justify-center gap-2 mx-auto transition-colors group"
          >
            <span>Cancel and go back</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

function LoginButton({ provider, loading, onClick }: { provider: 'google' | 'line', loading: boolean, onClick: () => void }) {
  const isLine = provider === 'line'

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      onClick={onClick}
      className={`relative w-full h-[60px] rounded-2xl flex items-center justify-center gap-4 font-bold text-[15px] shadow-lg transition-all disabled:opacity-50 group overflow-hidden ${isLine
        ? 'bg-[#06C755] text-white hover:bg-[#05b34c]'
        : 'bg-white text-gray-900 shadow-white/5'
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

      {loading ? (
        <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isLine ? 'border-white/30 border-t-white' : 'border-gray-200 border-t-gray-900'}`} />
      ) : (
        <>
          {isLine ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975 1.739-1.92 2.547-3.954 2.547-5.991zm-15.651 4.354h-2.184c-.201 0-.362-.162-.362-.363v-5.289c0-.201.161-.362.362-.362h.181c.201 0 .362.161.362.362v4.927h1.643c.201 0 .362.161.362.362v.182c0 .201-.161.221-.362.321zm4.184 0h-.181c-.201 0-.363-.162-.363-.363V9.006c0-.201.162-.362.363-.362h.181c.201 0 .362.161.362.362v5.289c0 .201-.161.363-.362.363zm3.725 0h-.1a.362.362 0 01-.262-.12l-2.454-3.328v3.085c0 .201-.162.363-.363.363h-.171a.362.362 0 01-.362-.363V9.006c0-.201.161-.362.362-.362h.11c.101 0 .201.04.262.12l2.444 3.328V9.006c0-.201.162-.362.363-.362h.171c.201 0 .362.161.362.362v5.289c0 .201-.161.363-.362.363zm4.516-2.184c0 .201-.162.362-.363.362h-1.642V9.006c0-.201.161-.362.362-.362h1.642c.201 0 .362.161.362.362v.182c0 .201-.161.362-.362.362h-1.28v1.309h1.28c.201 0 .362.161.362.362v.182c0 .201-.161.362-.362.362h-1.28v1.31h1.28c.201 0 .362.161.362.362v.181z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
              <path fill="#EA4335" d="M12 4.36c1.6 0 3.06.55 4.19 1.62l3.14-3.14C17.45 1.01 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Sign in with {isLine ? 'LINE' : 'Google'}</span>
        </>
      )}
    </motion.button>
  )
}
