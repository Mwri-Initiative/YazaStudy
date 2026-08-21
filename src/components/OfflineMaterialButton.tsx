'use client'

import { useEffect, useState } from 'react'
import { Check, Download, Loader2, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { createClient } from '../lib/supabase/client'
import { isMaterialOffline, removeMaterialOffline, saveMaterialOffline } from '../lib/offline-materials'
import type { StudyMaterial } from '../types'

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split('/public/materials/')
    if (parts.length > 1) return parts[1].split('?')[0]
    const bucketIdx = url.pathname.indexOf('/materials/')
    return bucketIdx !== -1 ? url.pathname.slice(bucketIdx + '/materials/'.length).split('?')[0] : null
  } catch {
    return null
  }
}

export default function OfflineMaterialButton({ material }: { material: StudyMaterial }) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    isMaterialOffline(material.id).then(setSaved).catch(() => setSaved(false))
  }, [material.id])

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (saved) {
        await removeMaterialOffline(material.id)
        setSaved(false)
        return
      }

      const url = material.downloadUrl || material.previewUrl
      const path = url ? extractStoragePath(url) : null
      if (!path) throw new Error('This material has no downloadable file.')
      const { data, error } = await supabase.storage.from('materials').createSignedUrl(path, 600)
      if (error) throw error

      await saveMaterialOffline({
        id: material.id,
        title: material.title,
        subject: material.subject,
        pages: material.pages,
      }, data.signedUrl, setProgress)
      setSaved(true)
    } catch (error) {
      console.error('Offline material error:', error)
      alert(error instanceof Error ? error.message : 'Could not save this material offline.')
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <Button
      variant="outline"
      disabled={busy}
      onClick={toggle}
      className={`min-h-11 rounded-xl border-white/10 font-bold ${saved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'glass text-text hover:bg-white/5'}`}
      title={saved ? 'Remove this material from offline storage' : 'Save this material for offline reading'}
    >
      {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : saved ? <Check className="mr-1.5 h-4 w-4" /> : <Download className="mr-1.5 h-4 w-4" />}
      {busy ? `${progress}%` : saved ? 'Saved Offline' : 'Save Offline'}
      {saved && !busy ? <Trash2 className="ml-1.5 h-3.5 w-3.5 opacity-60" /> : null}
    </Button>
  )
}
