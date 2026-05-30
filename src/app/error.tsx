"use client"

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log to console for developers but avoid showing stack traces in UI
    console.debug('Application error:', error.message)
  }, [error])

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  return (
    <html>
      <body>
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0b',
          color: '#fff',
          padding: 20,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 560 }}>
            <img src="/favicon.svg" alt="logo" width={64} height={64} style={{ borderRadius: 12, marginBottom: 12 }} />
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>{isOffline ? 'You are offline' : 'Something went wrong'}</h1>
            <p style={{ color: '#cbd5e1' }}>{isOffline ? 'Your device appears to be offline. Please check your connection and try again.' : 'An unexpected error occurred. Please try refreshing the page.'}</p>
            <div style={{ marginTop: 18 }}>
              <button onClick={() => reset()} style={{ padding: '8px 14px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none' }}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
