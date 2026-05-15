'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudyMaterial } from '@/types'
import { getPayChanguService, PayChanguPaymentRequest } from '@/lib/paychangu-working'
import { Loader2, CreditCard, X } from 'lucide-react'

function generateReference(): string {
  return `MSCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface PaymentModalProps {
  material: StudyMaterial
  isOpen: boolean
  onClose: () => void
  onSuccess: (reference: string) => void
}

export default function PaymentModal({ material, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const paychanguService = getPayChanguService()
      const paymentData: PayChanguPaymentRequest = {
        amount: material.price,
        currency: 'MWK',
        email: userEmail,
        phone: userPhone,
        first_name: firstName,
        last_name: lastName,
        tx_ref: generateReference(),
        callback_url: `${window.location.origin}/api/payment/callback`,
        return_url: `${window.location.origin}/payment/success`
      }

      const response = await paychanguService.initiatePayment(paymentData)

      if (response.success && response.data?.checkout_url) {
        // Redirect to PayChangu payment page
        window.location.href = response.data.checkout_url
      } else {
        alert('Payment initiation failed: ' + response.error)
      }
    } catch (error) {
      alert('An error occurred during payment processing')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Complete Purchase</CardTitle>
              <CardDescription className="mt-2">
                {material.title}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <Image 
                src="/paychangu-logo.png" 
                alt="PayChangu" 
                width={120} 
                height={40}
                className="h-auto"
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-primary">
                MWK {material.price}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p>• Instant access after payment</p>
              <p>• Secure payment via PayChangu</p>
              <p>• Download materials anytime</p>
            </div>
            <div className="flex justify-center mb-4">
              <Image 
                src="/paychangu-payment-methods.png" 
                alt="PayChangu Payment Methods" 
                width={200} 
                height={60}
                className="h-auto"
              />
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+265 99 123 456"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with PayChangu
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
