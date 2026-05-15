/**
 * Database models for the MSCE Study App
 * These are TypeScript interfaces that define the data structures
 */

export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  reference: string // Unique PayChangu reference
  userId: string
  materialId: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  paymentMethod?: string
  transactionId?: string
  failureReason?: string
  createdAt: Date
  completedAt?: Date
  updatedAt: Date
}

export interface Purchase {
  id: string
  userId: string
  materialId: string
  paymentId: string
  accessGrantedAt: Date
  expiresAt?: Date // Optional: when access expires
  createdAt: Date
}

export interface Material {
  id: string
  title: string
  description: string
  subject: string
  price: number
  type: 'pdf' | 'video' | 'practice'
  pages?: number
  duration?: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  thumbnailUrl?: string
  downloadUrl?: string
  previewUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Receipt {
  id: string
  paymentId: string
  userId: string
  materialId: string
  reference: string
  amount: number
  currency: string
  paidAt: Date
  issuedAt: Date
}

// Request/Response Types
export interface PaymentRequest {
  userId: string
  materialId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface PaymentStatus {
  reference: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  amount: number
  currency: string
  message: string
}

export interface UserPurchaseHistory {
  totalPurchases: number
  totalSpent: number
  materials: Array<{
    materialId: string
    title: string
    purchasedAt: Date
    amount: number
  }>
}
