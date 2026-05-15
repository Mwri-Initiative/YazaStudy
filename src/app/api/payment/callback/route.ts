import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('PayChangu callback received:', body)
    
    // Handle different callback types
    if (body.status === 'success') {
      console.log('Payment successful:', body)
      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully',
        data: body
      })
    } else if (body.status === 'failed') {
      console.log('Payment failed:', body)
      return NextResponse.json({
        success: false,
        message: 'Payment failed',
        data: body
      })
    } else {
      console.log('Unknown callback status:', body)
      return NextResponse.json({
        success: false,
        message: 'Unknown payment status',
        data: body
      })
    }
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Callback processing failed'
    })
  }
}
