'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>

        <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          Welcome Back
        </h1>

        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', textAlign: 'center' }}>
          Sign in to start voting and uploading.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="glass-panel"
          style={{
            width: '100%',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            background: 'white',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '50px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
            <path fill="#EA4335" d="M12 4.36c1.6 0 3.06.55 4.19 1.62l3.14-3.14C17.45 1.01 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(255, 64, 129, 0.2)',
            border: '1px solid #ff4081',
            color: 'white',
            fontSize: '0.9rem',
            textAlign: 'center',
            width: '100%'
          }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
