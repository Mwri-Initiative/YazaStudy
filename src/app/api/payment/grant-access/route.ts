import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguService } from '../../../../lib/paychangu-working'
import { createClient } from '@supabase/supabase-js'

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
    const { tx_ref, materialId, userId } = body

    if (!tx_ref) {
      return NextResponse.json(
        { success: false, error: 'tx_ref is required' },
        { status: 400 }
      )
    }

    console.log(`🔐 grant-access: Verifying tx_ref=${tx_ref}`)

    // ─── Step 1: Verify with PayChangu ──────────────────────────────────────
    const paychanguService = getPayChanguService()
    const verification = await paychanguService.verifyPayment(tx_ref)

    if (!verification.success) {
      console.error('❌ grant-access: PayChangu verification failed:', verification.error)
      return NextResponse.json(
        { success: false, error: 'Payment could not be verified with PayChangu.' },
        { status: 402 }
      )
    }

    const paymentData = verification.data
    const paymentStatus =
      paymentData?.status?.toLowerCase?.() === 'success' ||
      paymentData?.status?.toLowerCase?.() === 'completed'

    if (!paymentStatus) {
      console.warn(`⚠️ grant-access: PayChangu status is "${paymentData?.status}" — not yet successful.`)
      return NextResponse.json(
        { success: false, error: `Payment status is "${paymentData?.status}". Not yet confirmed.` },
        { status: 402 }
      )
    }

    // ─── Step 2: Find payment record in DB ──────────────────────────────────
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('transaction_id', tx_ref)
      .maybeSingle()

    // Determine user_id and material_id (fallback to what was passed from client)
    const resolvedUserId = paymentRecord?.user_id || userId || null
    const resolvedMaterialId = paymentRecord?.material_id || materialId || null

    // ─── Step 3: Update payment record to success ────────────────────────────
    if (paymentRecord) {
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'success',
          payment_method: paymentData?.payment_method || paymentRecord.payment_method || 'paychangu',
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', tx_ref)
      console.log('✅ grant-access: Payment record updated to success')
    } else {
      // Insert a new record if one doesn't exist (edge case)
      if (resolvedUserId && resolvedMaterialId) {
        await supabaseAdmin.from('payments').insert({
          user_id: resolvedUserId,
          material_id: resolvedMaterialId,
          amount: paymentData?.amount || 0,
          status: 'success',
          transaction_id: tx_ref,
          payment_method: paymentData?.payment_method || 'paychangu',
        })
      }
    }

    // ─── Step 4: Grant material access ──────────────────────────────────────
    if (resolvedUserId && resolvedMaterialId) {
      const { error: accessError } = await supabaseAdmin
        .from('user_materials')
        .upsert(
          {
            user_id: resolvedUserId,
            material_id: resolvedMaterialId,
            purchased_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,material_id' }
        )

      if (accessError) {
        console.error('❌ grant-access: Failed to insert user_materials:', accessError)
        return NextResponse.json(
          { success: false, error: 'Payment verified but access grant failed. Contact support.' },
          { status: 500 }
        )
      }

      console.log(`✅ grant-access: Access granted for user=${resolvedUserId} material=${resolvedMaterialId}`)
    } else {
      console.warn('⚠️ grant-access: Cannot grant access — missing userId or materialId.')
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and access granted.',
      materialId: resolvedMaterialId,
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
