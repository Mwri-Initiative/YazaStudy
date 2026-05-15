/**
 * Validation utilities for payment requests
 */

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate payment request data
 */
export function validatePaymentRequest(data: any): ValidationResult {
  const errors: ValidationError[] = []

  // Check amount
  if (!data.amount) {
    errors.push({ field: 'amount', message: 'Amount is required' })
  } else if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' })
  }

  // Check currency
  if (!data.currency) {
    errors.push({ field: 'currency', message: 'Currency is required' })
  } else if (!/^[A-Z]{3}$/.test(data.currency)) {
    errors.push({ field: 'currency', message: 'Currency must be a 3-letter code (e.g., MWK)' })
  }

  // Check email
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Email format is invalid' })
  }

  // Check first name
  const firstName = data.first_name || data.firstName
  if (!firstName) {
    errors.push({ field: 'first_name', message: 'First name is required' })
  } else if (typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push({ field: 'first_name', message: 'First name must be a non-empty string' })
  }

  // Check last name
  const lastName = data.last_name || data.lastName
  if (!lastName) {
    errors.push({ field: 'last_name', message: 'Last name is required' })
  } else if (typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push({ field: 'last_name', message: 'Last name must be a non-empty string' })
  }

  // Check reference
  const reference = data.tx_ref || data.reference
  if (!reference) {
    errors.push({ field: 'tx_ref', message: 'Transaction reference is required' })
  } else if (typeof reference !== 'string' || reference.trim().length === 0) {
    errors.push({ field: 'tx_ref', message: 'Transaction reference must be a non-empty string' })
  }

  // Check callback URL
  const callbackUrl = data.callback_url || data.callbackUrl
  if (!callbackUrl) {
    errors.push({ field: 'callback_url', message: 'Callback URL is required' })
  } else if (!isValidUrl(callbackUrl)) {
    errors.push({ field: 'callback_url', message: 'Callback URL is invalid' })
  }

  // Check return URL
  const returnUrl = data.return_url || data.returnUrl || data.redirect_url
  if (!returnUrl) {
    errors.push({ field: 'return_url', message: 'Return URL is required' })
  } else if (!isValidUrl(returnUrl)) {
    errors.push({ field: 'return_url', message: 'Return URL is invalid' })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-()]/g, ''))
}

/**
 * Format validation errors for response
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join(', ')
}
