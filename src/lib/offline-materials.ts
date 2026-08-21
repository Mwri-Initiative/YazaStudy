export type OfflineMaterialMeta = {
  id: string
  title: string
  subject?: string | null
  pages?: number | null
  savedAt: number
  size?: number
}

const CACHE_NAME = 'yaza-study-materials-v1'
const META_KEY = 'yaza-study-offline-materials'

function cacheKey(id: string) {
  return new Request(`/__yaza_offline_material__/${encodeURIComponent(id)}.pdf`)
}

function readMeta(): OfflineMaterialMeta[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '[]') as OfflineMaterialMeta[]
  } catch {
    return []
  }
}

function writeMeta(items: OfflineMaterialMeta[]) {
  localStorage.setItem(META_KEY, JSON.stringify(items))
}

export function getOfflineMaterials() {
  return readMeta().sort((a, b) => b.savedAt - a.savedAt)
}

export async function isMaterialOffline(id: string) {
  if (!('caches' in window)) return false
  const cache = await caches.open(CACHE_NAME)
  return Boolean(await cache.match(cacheKey(id)))
}

export async function saveMaterialOffline(
  material: OfflineMaterialMeta,
  signedUrl: string,
  onProgress?: (value: number) => void,
) {
  if (!('caches' in window)) throw new Error('Offline storage is not supported by this browser.')

  const response = await fetch(signedUrl, { credentials: 'omit' })
  if (!response.ok) throw new Error(`Could not download material (${response.status})`)

  const contentLength = Number(response.headers.get('content-length') || 0)
  const contentType = response.headers.get('content-type') || 'application/pdf'

  if (!response.body) {
    const blob = await response.blob()
    const cache = await caches.open(CACHE_NAME)
    await cache.put(cacheKey(material.id), new Response(blob, { headers: { 'Content-Type': contentType } }))
    onProgress?.(100)
    writeMeta([{ ...material, savedAt: Date.now(), size: blob.size }, ...readMeta().filter(item => item.id !== material.id)])
    return
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      received += value.byteLength
      if (contentLength) onProgress?.(Math.min(99, Math.round((received / contentLength) * 100)))
    }
  }

  const blob = new Blob(chunks, { type: contentType })
  const cache = await caches.open(CACHE_NAME)
  await cache.put(cacheKey(material.id), new Response(blob, { headers: { 'Content-Type': contentType } }))
  onProgress?.(100)

  writeMeta([{ ...material, savedAt: Date.now(), size: blob.size }, ...readMeta().filter(item => item.id !== material.id)])
}

export async function getOfflineMaterialUrl(id: string) {
  if (!('caches' in window)) return null
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(cacheKey(id))
  if (!response) return null
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function removeMaterialOffline(id: string) {
  if ('caches' in window) {
    const cache = await caches.open(CACHE_NAME)
    await cache.delete(cacheKey(id))
  }
  writeMeta(readMeta().filter(item => item.id !== id))
}

export async function getOfflineStorageBytes() {
  return getOfflineMaterials().reduce((total, item) => total + (item.size || 0), 0)
}
