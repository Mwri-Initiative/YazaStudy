import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Return a user-friendly error message for network or unexpected errors.
 */
export function friendlyErrorMessage(err: unknown) {
  if (typeof err === 'string') return err
  if (err instanceof Error) {
    const msg = err.message || ''
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
      return 'No internet connection — you appear to be offline.'
    }
    return 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
