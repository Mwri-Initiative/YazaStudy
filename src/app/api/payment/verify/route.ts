import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguService } from '@/lib/paychangu-working'

/**
 * POST /api/payment/verify
 * Verifies payment status with PayChangu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Payment verification request:', body)

    const reference = body.reference || body.tx_ref

    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference (reference or tx_ref) is required'
      }, { status: 400 })
    }

    const paychanguService = getPayChanguService()
    const result = await paychanguService.verifyPayment(reference)

    if (!result.success) {
      console.log('❌ Verification error:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    console.log('✅ Payment verified:', result.data)

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('💥 Payment verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/payment/verify?reference=xxx
 * Verify payment via query parameter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference') || searchParams.get('tx_ref')

    if (!reference) {
      return NextResponse.json({
        message: 'PayChangu Payment Verification API',
        usage: 'POST with reference in body OR GET with ?reference=xxx',
        status: 'active',
        timestamp: new Date().toISOString()
      })
    }

    const paychanguService = getPayChanguService()
    const result = await paychanguService.verifyPayment(reference)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('💥 Verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
