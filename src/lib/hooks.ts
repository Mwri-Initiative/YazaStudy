/**
 * React hooks for database operations
 * These are client-side hooks for interacting with backend APIs
 */

import { useState, useCallback } from 'react'

/**
 * Hook for processing payments
 */
export function usePayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = useCallback(
    async (paymentData: {
      amount: number
      currency: string
      email: string
      first_name: string
      last_name: string
      tx_ref: string
      callback_url: string
      return_url: string
      phone?: string
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Payment initiation failed')
        }

        return result.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const verifyPayment = useCallback(
    async (reference: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Payment verification failed')
        }

        return result.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    error,
    initiatePayment,
    verifyPayment,
  }
}

/**
 * Hook for managing user purchases
 */
export function usePurchases() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<any[]>([])

  const fetchPurchases = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/${userId}/purchases`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch purchases')
      }

      setPurchases(result.data || [])
      return result.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
  }
}

/**
 * Hook for managing materials
 */
export function useMaterials() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [materials, setMaterials] = useState<any[]>([])

  const fetchMaterials = useCallback(
    async (filters?: { subject?: string; difficulty?: string }) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (filters?.subject) queryParams.set('subject', filters.subject)
        if (filters?.difficulty) queryParams.set('difficulty', filters.difficulty)

        const response = await fetch(`/api/materials?${queryParams.toString()}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch materials')
        }

        setMaterials(result.data || [])
        return result.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    materials,
    isLoading,
    error,
    fetchMaterials,
  }
}
