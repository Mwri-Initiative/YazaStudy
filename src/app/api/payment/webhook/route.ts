import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/payment/webhook
 * PayChangu webhook — receives payment status updates server-to-server.
 *
 * PayChangu sends the webhook with these fields:
 *   reference   — your tx_ref (same as what you sent during initiation)
 *   tx_ref      — alias for reference (PayChangu uses both)
 *   status      — "success" | "failed" | "pending"
 *   amount      — amount paid
 *   currency    — e.g. "MWK"
 *   payment_method — e.g. "airtel_money" | "mpamba" | "visa"
 *   transaction_id — PayChangu's internal transaction ID
 *
 * WEBHOOK SETUP GUIDE (see bottom of this file)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 PayChangu webhook received:', JSON.stringify(body).slice(0, 500))

    // PayChangu uses both "reference" and "tx_ref" interchangeably
    const reference = body.reference || body.tx_ref || body.txRef
    const status = (body.status || '').toLowerCase()
    const paymentMethod = body.payment_method || body.paymentMethod || 'unknown'
    const transactionId = body.transaction_id || body.transactionId || reference

    if (!reference) {
      console.error('❌ Webhook: No reference/tx_ref in payload')
      // Always return 200 so PayChangu doesn't keep retrying with bad data
      return NextResponse.json({ success: false, error: 'No reference in payload' })
    }

    // ─── Find existing payment record ─────────────────────────────────────
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('transaction_id', reference)
      .maybeSingle()

    if (findError) {
      console.error('❌ Webhook: DB lookup error:', findError)
    }

    // ─── Normalize status ─────────────────────────────────────────────────
    const isSuccess = status === 'success' || status === 'completed' || status === 'paid'
    const normalizedStatus = isSuccess ? 'success' : status === 'failed' ? 'failed' : 'pending'

    // ─── Update payment record ────────────────────────────────────────────
    if (paymentRecord) {
      // Skip update if already marked success (idempotency — webhook may fire multiple times)
      if (paymentRecord.status === 'success' && normalizedStatus === 'success') {
        console.log('ℹ️ Webhook: Already processed successfully. Skipping duplicate.')
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      const { error: updateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: normalizedStatus,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', reference)

      if (updateError) {
        console.error('❌ Webhook: Failed to update payment record:', updateError)
      }
    } else {
      // Payment record not found — create one
      console.warn(`⚠️ Webhook: No payment record found for reference: ${reference}`)
      // We still try to grant access based on body data if we have it
    }

    // ─── Grant material access on success ────────────────────────────────
    if (isSuccess) {
      const userId = paymentRecord?.user_id || body.user_id || null
      const materialId = paymentRecord?.material_id || body.material_id || null

      if (userId && materialId) {
        console.log(`✅ Webhook: Granting access — user=${userId} material=${materialId}`)

        const { error: accessError } = await supabaseAdmin
          .from('user_materials')
          .upsert(
            {
              user_id: userId,
              material_id: materialId,
              purchased_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,material_id' }
          )

        if (accessError) {
          console.error('❌ Webhook: Failed to grant material access:', accessError)
        } else {
          console.log('✅ Webhook: Material access granted successfully')
        }
      } else {
        console.warn('⚠️ Webhook: Cannot grant access — userId or materialId missing from record')
      }
    }

    // Always respond 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      reference,
      status: normalizedStatus,
    })
  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    // Return 200 even on error so PayChangu doesn't keep retrying
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    })
  }
}

/**
 * GET /api/payment/webhook — Health check
 */
export async function GET() {
  return NextResponse.json({
    message: 'PayChangu Webhook Endpoint',
    status: 'active',
    usage: 'POST — PayChangu sends payment status updates here',
    expectedFields: {
      reference: 'Your tx_ref sent during payment initiation',
      status: 'success | failed | pending',
      amount: 'Amount paid',
      currency: 'MWK',
      payment_method: 'airtel_money | mpamba | visa | mastercard',
    },
    timestamp: new Date().toISOString(),
  })
}

/*
 * ═══════════════════════════════════════════════════════════════
 *   HOW TO SET UP PAYCHANGU WEBHOOK (READ THIS!)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Go to https://paychangu.com → Dashboard → Settings → Webhooks
 *
 * 2. Add a new webhook URL:
 *      https://YOUR-DOMAIN.com/api/payment/webhook
 *    (Replace YOUR-DOMAIN with your Vercel/production domain)
 *
 * 3. Select events to listen to:
 *      ✅ payment.success
 *      ✅ payment.failed
 *
 * 4. PayChangu will POST to your webhook whenever a payment changes status.
 *    The payload looks like:
 *      {
 *        "reference": "MSCE_1234567_abc123",   ← your tx_ref
 *        "status": "success",
 *        "amount": 2000,
 *        "currency": "MWK",
 *        "payment_method": "airtel_money",
 *        "transaction_id": "paychangu-txn-id"
 *      }
 *
 * 5. IMPORTANT — For LOCAL DEVELOPMENT testing:
 *    Use ngrok to expose your local server:
 *      npx ngrok http 3000
 *    Then set your PayChangu webhook URL to:
 *      https://xxxx.ngrok.io/api/payment/webhook
 *
 * 6. The grant-access route (/api/payment/grant-access) is the PRIMARY
 *    access granter (called from the success page). This webhook is the
 *    SECONDARY fallback — it will process delayed/background notifications.
 * ═══════════════════════════════════════════════════════════════
 */
