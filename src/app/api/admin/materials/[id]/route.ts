import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'

function getStoragePath(value: string | null | undefined): string | null {
  if (!value) return null
  if (!/^https?:\/\//i.test(value)) {
    const path = value.replace(/^\/+/, '')
    return path && !path.includes('..') ? path : null
  }
  try {
    const pathname = new URL(value).pathname
    for (const marker of [
      '/storage/v1/object/public/materials/',
      '/storage/v1/object/sign/materials/',
      '/storage/v1/object/authenticated/materials/',
    ]) {
      const index = pathname.indexOf(marker)
      if (index !== -1) return decodeURIComponent(pathname.slice(index + marker.length))
    }
  } catch { return null }
  return null
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    if (profileError || profile?.is_admin !== true) {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
    }

    const { data: material, error: lookupError } = await supabase
      .from('materials').select('id, previewUrl, downloadUrl').eq('id', params.id).maybeSingle()
    if (lookupError) return NextResponse.json({ error: 'Unable to load material.' }, { status: 500 })
    if (!material) return NextResponse.json({ error: 'Material not found.' }, { status: 404 })

    const candidates = Array.from(new Set([
      getStoragePath(material.downloadUrl),
      getStoragePath(material.previewUrl),
    ].filter((path): path is string => !!path)))

    if (candidates.length) {
      const { error: storageError } = await supabase.storage.from('materials').remove(candidates)
      if (storageError) {
        console.error('Material storage deletion failed:', storageError)
        return NextResponse.json({ error: 'PDF could not be removed. Catalogue record was kept.' }, { status: 502 })
      }
    }

    const { error: deleteError } = await supabase.from('materials').delete().eq('id', params.id)
    if (deleteError) {
      console.error('Material database deletion failed:', deleteError)
      return NextResponse.json({ error: 'PDF removed, but catalogue deletion failed. Please retry.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin material deletion failed:', error)
    return NextResponse.json({ error: 'Unable to delete this material.' }, { status: 500 })
  }
}
