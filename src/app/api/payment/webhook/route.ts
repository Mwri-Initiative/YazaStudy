import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the direct supabase-js client with the SERVICE_ROLE_KEY 
// because webhooks run in the background and need administrative access to the DB.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/payment/webhook
 * PayChangu webhook callback - receives payment status updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 PayChangu webhook received')

    const {
      reference,
      status,
      amount,
      payment_method,
      transaction_id,
    } = body

    if (!reference || !status) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    // 1. Find the payment record to get the user_id and material_id
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('transaction_id', reference)
      .single()

    if (findError || !paymentRecord) {
      console.error('❌ Could not find payment record for reference:', reference)
      // Return 200 to acknowledge receipt even if record not found
      return NextResponse.json({ success: false, error: 'Record not found' })
    }

    // 2. Update payment status in database
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: status === 'success' || status === 'completed' ? 'success' : status,
        payment_method: payment_method || 'unknown',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', reference)

    if (updateError) {
      console.error('❌ Error updating payment status:', updateError)
    }

    // 3. If successful, grant access to material
    if ((status === 'success' || status === 'completed') && paymentRecord.user_id && paymentRecord.material_id) {
      console.log(`✅ Granting access to User ${paymentRecord.user_id} for Material ${paymentRecord.material_id}`)
      
      const { error: accessError } = await supabaseAdmin
        .from('user_materials')
        .upsert({
          user_id: paymentRecord.user_id,
          material_id: paymentRecord.material_id
        })

      if (accessError) {
        console.error('❌ Error granting material access:', accessError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      reference,
      status
    })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed'
    }, { status: 500 })
  }
}

/**
 * GET /api/payment/webhook
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PayChangu Webhook Callback Endpoint',
    status: 'active',
    usage: 'POST - PayChangu sends payment updates here',
    expectedPayload: {
      reference: 'unique_transaction_reference',
      status: 'success|failed|pending',
      amount: 0,
      currency: 'MWK',
      email: 'user@example.com',
      first_name: 'First',
      last_name: 'Last',
      transaction_id: 'paychangu_transaction_id'
    },
    timestamp: new Date().toISOString()
  })
}
