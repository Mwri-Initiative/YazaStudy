'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, HardDrive, Trash2, WifiOff, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { getOfflineMaterials, getOfflineStorageBytes, getOfflineMaterialUrl, removeMaterialOffline, type OfflineMaterialMeta } from '../../lib/offline-materials'
import PdfViewerModal from '../../components/PdfViewerModal'

function formatBytes(bytes: number) {
  if (!bytes) return '0 MB'
  const mb = bytes / 1024 / 1024
  return `${mb < 1 ? mb.toFixed(1) : mb.toFixed(1)} MB`
}

export default function OfflineLibraryPage() {
  const [items, setItems] = useState<OfflineMaterialMeta[]>([])
  const [size, setSize] = useState(0)
  const [active, setActive] = useState<OfflineMaterialMeta | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const refresh = async () => {
    setItems(getOfflineMaterials())
    setSize(await getOfflineStorageBytes())
  }

  useEffect(() => { refresh() }, [])

  const open = async (item: OfflineMaterialMeta) => {
    const url = await getOfflineMaterialUrl(item.id)
    if (!url) return
    setPdfUrl(url)
    setActive(item)
  }

  const remove = async (id: string) => {
    await removeMaterialOffline(id)
    await refresh()
    if (active?.id === id) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setActive(null)
      setPdfUrl(null)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/my-materials" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" /> My Materials
        </Link>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary"><WifiOff className="h-3 w-3" /> Offline library</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-text sm:text-5xl">Study without internet.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">Everything here is stored on this device and can be opened without a connection.</p>
          </div>
          <div className="glass rounded-2xl border border-white/10 px-4 py-3 text-sm text-text-secondary"><HardDrive className="mr-2 inline h-4 w-4 text-primary" /> {items.length} saved · {formatBytes(size)}</div>
        </div>

        {items.length === 0 ? (
          <div className="glass mt-8 rounded-[28px] border border-white/10 px-6 py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-text-muted" />
            <h2 className="mt-5 text-xl font-bold text-text">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">Go to My Materials and tap Save Offline on the resources you want available without internet.</p>
            <Button asChild className="mt-6 rounded-xl bg-primary font-bold text-white"><Link href="/my-materials">Browse My Materials</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map(item => (
              <article key={item.id} className="glass rounded-3xl border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.subject || 'Study material'}</p><h2 className="mt-2 line-clamp-2 text-lg font-bold text-text">{item.title}</h2></div>
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">OFFLINE</span>
                </div>
                <p className="mt-3 text-xs text-text-muted">Saved {new Date(item.savedAt).toLocaleDateString()} · {formatBytes(item.size || 0)}</p>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                  <Button onClick={() => open(item)} className="min-h-11 rounded-xl bg-primary font-bold text-white">Open & Study</Button>
                  <Button variant="outline" onClick={() => remove(item.id)} aria-label={`Remove ${item.title} from offline storage`} className="min-h-11 rounded-xl border-white/10 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {active && pdfUrl && <PdfViewerModal isOpen={true} onClose={() => { URL.revokeObjectURL(pdfUrl); setActive(null); setPdfUrl(null) }} title={active.title} pdfUrl={pdfUrl} />}
    </div>
  )
}
