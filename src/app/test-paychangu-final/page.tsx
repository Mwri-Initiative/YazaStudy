'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function TestPayChanguFinal() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [testReference, setTestReference] = useState<string>('')

  const runTest = async () => {
    setIsLoading(true)
    setTestResult('Testing PayChangu connection...')
    setPaymentUrl('')

    try {
      // Generate unique reference
      const reference = `MSCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setTestReference(reference)

      // Test with correct field names
      const testPaymentData = {
        amount: 100,
        currency: 'MWK',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        tx_ref: reference,
        callback_url: 'http://localhost:3000/api/payment/webhook',
        return_url: 'http://localhost:3000/payment/success'
      }

      console.log('🚀 Sending test payment:', testPaymentData)

      // Call our API route
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPaymentData),
      })

      const result = await response.json()
      console.log('📡 Test response:', result)

      if (result.success && result.data?.checkout_url) {
        setTestResult('✅ PayChangu connection successful!')
        setPaymentUrl(result.data.checkout_url)
      } else {
        setTestResult(`❌ Test failed: ${result.error || JSON.stringify(result)}`)
      }
    } catch (error) {
      console.error('💥 Test error:', error)
      setTestResult(`💥 Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testVerification = async () => {
    if (!testReference) {
      setTestResult('❌ Please run payment test first')
      return
    }

    setIsLoading(true)
    setTestResult('Testing payment verification...')

    try {
      console.log('🔍 Verifying payment:', testReference)

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: testReference }),
      })

      const result = await response.json()
      console.log('📡 Verification response:', result)

      if (result.success) {
        setTestResult('✅ Verification endpoint working!')
      } else {
        setTestResult(`❌ Verification failed: ${result.error || 'Payment not found yet'}`)
      }
    } catch (error) {
      console.error('💥 Verification test error:', error)
      setTestResult(`💥 Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    setIsLoading(true)
    setTestResult('Testing webhook endpoint...')

    try {
      console.log('🔔 Testing webhook endpoint')

      const response = await fetch('/api/payment/webhook', {
        method: 'GET',
      })

      const result = await response.json()
      console.log('📡 Webhook response:', result)

      if (result.message) {
        setTestResult('✅ Webhook endpoint working!')
      } else {
        setTestResult('❌ Webhook endpoint not responding correctly')
      }
    } catch (error) {
      console.error('💥 Webhook test error:', error)
      setTestResult(`💥 Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhookPayload = async () => {
    setIsLoading(true)
    setTestResult('Testing webhook with sample payload...')

    try {
      const testPayload = {
        reference: testReference || 'TEST_123456789',
        status: 'success',
        amount: 100,
        currency: 'MWK',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        payment_method: 'mwk_mtn',
        transaction_id: 'TXN_123456789'
      }

      console.log('📤 Sending webhook payload:', testPayload)

      const response = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      })

      const result = await response.json()
      console.log('📡 Webhook response:', result)

      if (result.success) {
        setTestResult('✅ Webhook processing working correctly!')
      } else {
        setTestResult(`❌ Webhook processing failed: ${result.error}`)
      }
    } catch (error) {
      console.error('💥 Webhook payload test error:', error)
      setTestResult(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">PayChangu Integration Test</CardTitle>
            <CardDescription>
              Test your PayChangu payment integration end-to-end. All tests use correct field names.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Reference */}
            {testReference && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Current Test Reference:</p>
                <p className="text-sm font-mono text-blue-700">{testReference}</p>
              </div>
            )}

            {/* Test Buttons */}
            <div className="space-y-4">
              <h3 className="font-medium">Test Functions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={runTest}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Test Payment Initiation
                    </>
                  )}
                </Button>

                <Button
                  onClick={testVerification}
                  disabled={isLoading || !testReference}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Test Verification
                    </>
                  )}
                </Button>

                <Button
                  onClick={testWebhook}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Test Webhook Endpoint
                    </>
                  )}
                </Button>

                <Button
                  onClick={testWebhookPayload}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Webhook Payload
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results */}
            {testResult && (
              <div
                className={`p-4 rounded-lg border ${
                  testResult.includes('✅')
                    ? 'bg-green-50 border-green-200'
                    : testResult.includes('❌')
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  {testResult.includes('✅') && (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  {testResult.includes('❌') && (
                    <AlertCircle className="mr-2 h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        testResult.includes('✅')
                          ? 'text-green-800'
                          : testResult.includes('❌')
                          ? 'text-red-800'
                          : 'text-blue-800'
                      }`}
                    >
                      {testResult}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment URL */}
            {paymentUrl && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium mb-2 text-green-900">Checkout URL Generated</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Click below to open PayChangu checkout:
                </p>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                >
                  {paymentUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Testing Steps:</h4>
              <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                <li>Click "Test Payment Initiation" to create a test payment</li>
                <li>Copy the generated checkout URL to test the payment flow</li>
                <li>After payment, click "Test Verification" to verify the status</li>
                <li>Test webhook endpoints to ensure callbacks are processed</li>
                <li>Check browser console (F12) for detailed logs</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Field Names Used:</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1 text-gray-700">
                <p>first_name: String (not firstName)</p>
                <p>last_name: String (not lastName)</p>
                <p>tx_ref: String (transaction reference)</p>
                <p>callback_url: String (webhook endpoint)</p>
                <p>return_url: String (redirect after payment)</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Environment Setup:</h4>
              <p className="text-gray-600">
                Make sure you have set PAYCHANGU_API_KEY in your .env.local file. Check SETUP.md for details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
