import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguService } from '@/lib/paychangu-working'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'PayChangu API Test Endpoint',
    status: 'success',
    timestamp: new Date().toISOString(),
    configured: !!process.env.PAYCHANGU_API_KEY || !!process.env.PAYCHANGU_SECRET_KEY
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test payment request received')

    const paychanguService = getPayChanguService()
    const response = await paychanguService.initiatePayment(body)
    
    return NextResponse.json({
      success: response.success,
      data: response.data,
      error: response.error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test payment error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
