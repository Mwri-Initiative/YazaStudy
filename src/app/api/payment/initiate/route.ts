import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguService } from '@/lib/paychangu-working'
import { validatePaymentRequest, formatValidationErrors } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/payment/initiate
 * Initiates a payment request with PayChangu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🚀 Payment initiation request received')

    // Get Supabase client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Validate request data
    const validation = validatePaymentRequest(body)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    // Extract validated fields
    const amount = body.amount
    const currency = body.currency || 'MWK'
    const email = body.email
    const firstName = body.first_name || body.firstName
    const lastName = body.last_name || body.lastName
    const reference = body.tx_ref || body.reference
    const callbackUrl = body.callback_url || body.callbackUrl
    const returnUrl = body.return_url || body.returnUrl || body.redirect_url
    const materialId = body.material_id || body.materialId

    // 1. Create a pending payment record in Supabase
    const { error: dbError } = await supabase.from('payments').insert({
      user_id: user?.id || null,
      material_id: materialId || null,
      amount: amount,
      status: 'pending',
      transaction_id: reference,
      payment_method: 'unknown', // Will be updated by webhook
    })

    if (dbError) {
      console.error('❌ Database error creating payment record:', dbError)
      // We continue anyway so the user can still pay, but we log the error
    }

    // Get PayChangu service
    const paychanguService = getPayChanguService()

    // Call PayChangu API
    const result = await paychanguService.initiatePayment({
      amount,
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: reference,
      callback_url: callbackUrl,
      return_url: returnUrl,
      phone: body.phone,
      description: body.description,
    })

    if (!result.success) {
      // Update status to failed in DB
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('transaction_id', reference)

      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    console.log('✅ Payment initiated successfully')

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Payment initiated successfully'
    })

  } catch (error) {
    console.error('💥 Payment initiation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/payment/initiate
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PAYCHANGU_API_KEY
    return NextResponse.json({
      message: 'PayChangu Payment Initiation API',
      status: 'active',
      timestamp: new Date().toISOString(),
      apiConfigured: !!apiKey
    })
  } catch (error) {
    return NextResponse.json({
      message: 'PayChangu Payment Initiation API',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
