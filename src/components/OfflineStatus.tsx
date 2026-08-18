'use client'

import { useEffect, useState } from 'react'

export default function OfflineStatus() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-zinc-950/95 px-4 py-3 text-center text-sm text-zinc-200 backdrop-blur"
    >
      You’re offline. Yaza Study is showing what’s available on this device.
    </div>
  )
}
