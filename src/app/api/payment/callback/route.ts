import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/payment/callback
 * PayChangu redirects the USER'S browser here after they complete payment.
 * This is the `return_url` — it should forward them to the success page
 * which will do the actual payment verification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // PayChangu attaches these to the return_url redirect
  const txRef = searchParams.get('tx_ref') || searchParams.get('reference') || searchParams.get('txRef')
  const status = searchParams.get('status') || searchParams.get('payment_status')
  const materialId = searchParams.get('materialId') || searchParams.get('material_id')

  // Build the success page URL with all params
  const successUrl = new URL('/payment/success', request.url)
  if (txRef) successUrl.searchParams.set('tx_ref', txRef)
  if (materialId) successUrl.searchParams.set('materialId', materialId)

  // If PayChangu explicitly says failed, redirect to a failed state
  if (status && (status === 'failed' || status === 'cancelled' || status === 'canceled')) {
    const shopUrl = new URL('/shop', request.url)
    shopUrl.searchParams.set('payment_status', 'failed')
    if (txRef) shopUrl.searchParams.set('tx_ref', txRef)
    return NextResponse.redirect(shopUrl)
  }

  // For success or unknown status — redirect to success page (which will verify)
  return NextResponse.redirect(successUrl)
}

/**
 * POST /api/payment/callback
 * Some payment providers POST to the callback — handle gracefully.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📬 Payment callback POST received:', JSON.stringify(body).slice(0, 300))

    // Acknowledge receipt — the webhook route handles DB updates
    return NextResponse.json({
      success: true,
      message: 'Callback received',
    })
  } catch {
    return NextResponse.json({ success: true, message: 'Callback acknowledged' })
  }
}
