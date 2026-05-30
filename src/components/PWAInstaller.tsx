'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.debug('Service worker registered')
          },
          (registrationError) => {
            console.debug('Service worker registration failed')
          }
        )
      })
    }
  }, [])

  return null
}
