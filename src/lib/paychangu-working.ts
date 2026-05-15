/**
 * Complete PayChangu Payment Service
 * Handles all payment operations with PayChangu API
 */

export interface PayChanguPaymentRequest {
  amount: number
  currency: string
  email: string
  phone?: string
  first_name: string
  last_name: string
  tx_ref: string
  callback_url: string
  return_url: string
  description?: string
}

export interface PayChanguPaymentData {
  checkout_url: string
  tx_ref: string
  status: string
  amount?: number
  currency?: string
  [key: string]: any
}

export interface PayChanguResponse {
  success: boolean
  data?: PayChanguPaymentData
  error?: string
  message?: string
}

export class PayChanguService {
  private apiKey: string
  private baseUrl = 'https://api.paychangu.com'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('PayChangu API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Initiate a new payment
   */
  async initiatePayment(paymentData: PayChanguPaymentRequest): Promise<PayChanguResponse> {
    try {
      this.log('🚀 Initiating payment', paymentData)

      const payload = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        email: paymentData.email,
        phone: paymentData.phone || '',
        first_name: paymentData.first_name,
        last_name: paymentData.last_name,
        tx_ref: paymentData.tx_ref,
        callback_url: paymentData.callback_url,
        return_url: paymentData.return_url,
        description: paymentData.description || 'MSCE Study Materials Purchase',
      }

      const response = await fetch(`${this.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      this.log('📡 PayChangu Response', { status: response.status, body: responseText })

      if (!response.ok) {
        this.log('❌ PayChangu API Error', responseText)
        return {
          success: false,
          error: `Payment initiation failed: ${responseText}`,
        }
      }

      const result = JSON.parse(responseText)
      this.log('✅ Payment initiated successfully', result)

      // Extract checkout URL - handle different response formats
      const checkoutUrl =
        result.data?.checkout_url ||
        result.data?.payment_url ||
        result.checkout_url ||
        result.payment_url

      if (!checkoutUrl) {
        return {
          success: false,
          error: 'No checkout URL received from PayChangu',
        }
      }

      return {
        success: true,
        data: {
          checkout_url: checkoutUrl,
          tx_ref: paymentData.tx_ref,
          status: 'pending',
          ...result.data,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.log('💥 Network error', errorMessage)
      return {
        success: false,
        error: `Network error: ${errorMessage}`,
      }
    }
  }

  /**
   * Verify a payment status
   */
  async verifyPayment(reference: string): Promise<PayChanguResponse> {
    try {
      this.log('🔍 Verifying payment', reference)

      // Try the standard endpoint first
      let response = await fetch(`${this.baseUrl}/payment/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })

      // If not found, try v1 endpoint
      if (response.status === 404) {
        response = await fetch(`${this.baseUrl}/v1/payment/${reference}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      }

      const responseText = await response.text()
      this.log('📡 Verification response', responseText)

      if (!response.ok) {
        this.log('❌ Verification failed', responseText)
        return {
          success: false,
          error: `Payment verification failed: ${responseText}`,
        }
      }

      const result = JSON.parse(responseText)
      this.log('✅ Payment verified', result)

      return {
        success: true,
        data: result.data || result,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.log('💥 Verification error', errorMessage)
      return {
        success: false,
        error: `Verification error: ${errorMessage}`,
      }
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateReference(): string {
    return `MSCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Internal logging method
   */
  private log(title: string, data?: any): void {
    if (typeof window === 'undefined') {
      // Server-side logging
      console.log(`${title}`, data)
    } else {
      // Client-side logging
      console.log(`${title}`, data)
    }
  }
}

/**
 * Export singleton instance
 * Uses PAYCHANGU_SECRET_KEY for server-side API calls.
 * The public key (PAYCHANGU_API_KEY) is only for client-side widgets.
 */
export function getPayChanguService(): PayChanguService {
  // PayChangu requires the SECRET key for server-side payment initiation
  const secretKey = process.env.PAYCHANGU_SECRET_KEY || process.env.PAYCHANGU_API_KEY
  if (!secretKey) {
    throw new Error('PAYCHANGU_SECRET_KEY environment variable is not set')
  }
  return new PayChanguService(secretKey)
}
