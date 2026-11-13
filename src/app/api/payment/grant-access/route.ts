import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguService } from '../../../../lib/paychangu-working'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '../../../../lib/supabase/server'

// Use service role so we can write without user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/payment/grant-access
 * Called from the payment success page.
 * 1. Verifies the transaction with PayChangu
 * 2. Marks the payment as success in DB
 * 3. Grants the user access to the material
 *
 * This acts as a guaranteed fallback even if the webhook hasn't fired yet.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tx_ref = typeof body.tx_ref === 'string' ? body.tx_ref.trim() : ''

    if (!tx_ref || tx_ref.length > 160) {
      return NextResponse.json({ success: false, error: 'A valid transaction reference is required.' }, { status: 400 })
    }

    // The browser session, not client-supplied userId/materialId, determines ownership.
    const sessionClient = await createSessionClient()
    const { data: { user }, error: authError } = await sessionClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Sign in to verify this purchase.' }, { status: 401 })
    }

    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payments')
      .select('user_id, material_id, amount, status, transaction_id')
      .eq('transaction_id', tx_ref)
      .maybeSingle()

    if (findError) {
      console.error('grant-access payment lookup failed:', findError)
      return NextResponse.json({ success: false, error: 'Unable to find this payment.' }, { status: 500 })
    }
    if (!paymentRecord || paymentRecord.user_id !== user.id || !paymentRecord.material_id) {
      return NextResponse.json({ success: false, error: 'This transaction does not belong to your account.' }, { status: 403 })
    }

    const paychanguService = getPayChanguService()
    const verification = await paychanguService.verifyPayment(tx_ref)

    if (!verification.success) {
      return NextResponse.json({ success: false, error: 'Payment could not be verified with PayChangu.' }, { status: 402 })
    }

    const paymentData = verification.data
    const paymentStatus = ['success', 'completed', 'paid'].includes(String(paymentData?.status || '').toLowerCase())
    const verifiedAmount = Number(paymentData?.amount)
    const expectedAmount = Number(paymentRecord.amount)

    if (!paymentStatus || !Number.isFinite(verifiedAmount) || verifiedAmount !== expectedAmount) {
      return NextResponse.json({ success: false, error: 'Payment is not confirmed for the expected amount.' }, { status: 402 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        payment_method: paymentData?.payment_method || 'paychangu',
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', tx_ref)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('grant-access payment update failed:', updateError)
      return NextResponse.json({ success: false, error: 'Payment verified but could not be recorded.' }, { status: 500 })
    }

    const { error: accessError } = await supabaseAdmin
      .from('user_materials')
      .upsert(
        {
          user_id: user.id,
          material_id: paymentRecord.material_id,
          purchased_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,material_id' }
      )

    if (accessError) {
      console.error('grant-access access grant failed:', accessError)
      return NextResponse.json({ success: false, error: 'Payment verified but access grant failed. Contact support.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and access granted.',
      materialId: paymentRecord.material_id,
    })
  } catch (error) {
    console.error('💥 grant-access error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
