import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../../../../../lib/supabase/server'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getStoragePath(value: string | null | undefined): string | null {
  if (!value) return null

  // New records store the bucket-relative object path directly.
  if (!/^https?:\/\//i.test(value)) {
    const path = value.replace(/^\/+/, '')
    return path && !path.includes('..') ? path : null
  }

  try {
    const pathname = new URL(value).pathname
    const markers = [
      '/storage/v1/object/public/materials/',
      '/storage/v1/object/sign/materials/',
      '/storage/v1/object/authenticated/materials/',
    ]
    for (const marker of markers) {
      const index = pathname.indexOf(marker)
      if (index !== -1) return decodeURIComponent(pathname.slice(index + marker.length))
    }
  } catch {
    return null
  }

  return null
}

/**
 * GET /api/materials/[id]/access
 * Issues a short-lived PDF URL only after checking the signed-in user's access.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to access this material.' }, { status: 401 })
    }

    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('id, price, type, previewUrl, downloadUrl')
      .eq('id', params.id)
      .maybeSingle()

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found.' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = profile?.is_admin === true
    let hasPurchased = false

    if (!isAdmin && Number(material.price) > 0) {
      const { data: ownership, error: ownershipError } = await supabase
        .from('user_materials')
        .select('material_id')
        .eq('user_id', user.id)
        .eq('material_id', material.id)
        .maybeSingle()

      if (ownershipError) {
        console.error('Material ownership lookup failed:', ownershipError)
        return NextResponse.json({ error: 'Unable to verify material access.' }, { status: 500 })
      }
      hasPurchased = !!ownership
    }

    if (!isAdmin && Number(material.price) > 0 && !hasPurchased) {
      return NextResponse.json({ error: 'Purchase this material to access its PDF.' }, { status: 403 })
    }

    const storagePath = getStoragePath(material.downloadUrl || material.previewUrl)
    if (!storagePath) {
      return NextResponse.json({ error: 'This material has no valid stored PDF.' }, { status: 404 })
    }

    const { data: signedFile, error: signedUrlError } = await supabaseAdmin.storage
      .from('materials')
      .createSignedUrl(storagePath, 120, { download: false })

    if (signedUrlError || !signedFile?.signedUrl) {
      console.error('Signed PDF URL generation failed:', signedUrlError)
      return NextResponse.json({ error: 'Unable to prepare this PDF. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      url: signedFile.signedUrl,
      expiresIn: 120,
    }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    })
  } catch (error) {
    console.error('Material access error:', error)
    return NextResponse.json({ error: 'Unable to access this material.' }, { status: 500 })
  }
}
