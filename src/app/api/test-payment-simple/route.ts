import { NextRequest, NextResponse } from 'next/server'

// Simple test payment endpoint that bypasses complex PayChangu service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Simple test payment request received')
    
    // Direct API call to PayChangu with correct endpoint
    const response = await fetch('https://api.paychangu.com/v1/payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log('Simple test payment response status:', response.status)
    
    // Simple response handling
    if (response.ok) {
      try {
        const result = JSON.parse(responseText)
        console.log('Simple test payment success: status', response.status)
        return NextResponse.json({
          success: true,
          data: result.data,
          message: 'Payment initiated successfully'
        })
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API response format'
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `Payment failed: ${responseText}`
      })
    }
  } catch (error) {
    console.error('Simple test payment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Network error occurred'
    })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Simple Payment Test Endpoint',
    status: 'success',
    timestamp: new Date().toISOString(),
    configured: !!process.env.PAYCHANGU_API_KEY || !!process.env.PAYCHANGU_SECRET_KEY
  })
}
