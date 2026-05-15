# Quick Reference Guide

## Getting Started (5 minutes)

### 1. Install & Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your PayChangu API key
# PAYCHANGU_API_KEY=your_key_here

# Start dev server
npm run dev
```

### 2. Verify Installation
Visit: http://localhost:3000/test-paychangu-final

Click "Test Payment Initiation" button. If you see ✅, everything is working!

### 3. Test Payment Flow
1. Go to http://localhost:3000/payment
2. Fill form with test data:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +265881234567
3. Click "Pay" button
4. Complete payment on PayChangu

---

## API Endpoints Quick Reference

### Initiate Payment
```bash
POST /api/payment/initiate
Content-Type: application/json

{
  "amount": 2500,
  "currency": "MWK",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "tx_ref": "MSCE_1234567890",
  "callback_url": "http://localhost:3000/api/payment/webhook",
  "return_url": "http://localhost:3000/payment-final",
  "phone": "+265881234567"  // optional
}
```

Response:
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.paychangu.com/...",
    "tx_ref": "MSCE_1234567890",
    "status": "pending"
  }
}
```

### Verify Payment
```bash
POST /api/payment/verify
Content-Type: application/json

{
  "reference": "MSCE_1234567890"
}
```

### Webhook Callback
```bash
POST /api/payment/webhook
Content-Type: application/json

{
  "reference": "MSCE_1234567890",
  "status": "success",
  "amount": 2500,
  "currency": "MWK",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## Component Usage

### Using usePayment Hook
```typescript
import { usePayment } from '@/lib/hooks'

export function MyComponent() {
  const { isLoading, error, initiatePayment } = usePayment()

  const handlePay = async () => {
    try {
      const checkoutUrl = await initiatePayment({
        amount: 2500,
        currency: 'MWK',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        tx_ref: 'MSCE_' + Date.now(),
        callback_url: 'http://localhost:3000/api/payment/webhook',
        return_url: 'http://localhost:3000/payment-final'
      })
      
      window.location.href = checkoutUrl
    } catch (err) {
      console.error('Payment failed:', err)
    }
  }

  return (
    <button onClick={handlePay} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  )
}
```

### Using useMaterials Hook
```typescript
import { useMaterials } from '@/lib/hooks'

export function MaterialsList() {
  const { materials, isLoading, fetchMaterials } = useMaterials()

  useEffect(() => {
    fetchMaterials({ subject: 'mathematics' })
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {materials.map(material => (
        <div key={material.id}>{material.title}</div>
      ))}
    </div>
  )
}
```

---

## File Field Names

### Request Fields (Flexible - accepts both)

| PayChangu Standard | JavaScript Style |
|-------------------|------------------|
| first_name | firstName |
| last_name | lastName |
| tx_ref | reference |
| callback_url | callbackUrl |
| return_url | returnUrl |
| redirect_url | redirect_url |

### Always use in responses:
- `checkout_url` (not payment_url)
- `status` (pending, success, failed)
- `tx_ref` (transaction reference)

---

## Debugging Tips

### Check Logs
1. **Browser Console** (F12 → Console tab)
   - Look for 🚀, ✅, ❌, 💥 emojis
   - Shows request/response details

2. **Terminal** (where `npm run dev` runs)
   - Shows backend logs
   - Look for same emoji indicators

### Test in Isolation
```javascript
// Test API from browser console
fetch('/api/payment/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    currency: 'MWK',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    tx_ref: 'TEST_' + Date.now(),
    callback_url: 'http://localhost:3000/api/payment/webhook',
    return_url: 'http://localhost:3000/payment-final'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Common Error Solutions

| Error | Solution |
|-------|----------|
| "API Key is not set" | Check .env.local has PAYCHANGU_API_KEY |
| Checkout URL undefined | Check response in Network tab |
| "Validation failed" | Check field names are correct |
| Webhook not called | Use ngrok for local testing |
| Payment stays pending | Wait 1-2 min, then verify |

---

## Key Files

| File | Purpose |
|------|---------|
| src/lib/paychangu-working.ts | PayChangu API wrapper |
| src/lib/validation.ts | Input validation |
| src/lib/database.ts | Data models |
| src/lib/hooks.ts | React hooks |
| src/app/api/payment/\* | API routes |
| src/app/payment/page.tsx | Payment page |
| src/app/test-paychangu-final/page.tsx | Test interface |

---

## Environment Variables

### Required
```
PAYCHANGU_API_KEY=your_api_key_here
```

### Optional (defaults provided)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYCHANGU_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
PAYCHANGU_RETURN_URL=http://localhost:3000/payment-final
```

---

## Payment Field Names Reference

```typescript
interface PaymentData {
  amount: number              // Required: amount in base currency
  currency: string            // Required: 3-letter code (MWK, USD, etc)
  email: string              // Required: user email
  first_name: string         // Required: first name (NOT firstName)
  last_name: string          // Required: last name (NOT lastName)
  tx_ref: string             // Required: unique transaction ref
  callback_url: string       // Required: webhook endpoint
  return_url: string         // Required: redirect after payment
  phone?: string             // Optional: phone number
  description?: string       // Optional: payment description
}
```

---

## Testing Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] .env.local has PAYCHANGU_API_KEY
- [ ] Test page loads (test-paychangu-final)
- [ ] "Test Payment Initiation" works
- [ ] Checkout URL generated
- [ ] Payment page displays correctly
- [ ] Form validation works
- [ ] Can submit payment
- [ ] PayChangu opens checkout
- [ ] Webhook endpoint accessible

---

## Performance Tips

- Cache materials data with React Query or SWR
- Paginate material listings
- Debounce form inputs
- Lazy load payment component
- Use NextImage for optimization

---

## Security Checklist

- [ ] API key not exposed in client code
- [ ] Webhook signature verification implemented
- [ ] Rate limiting on payment endpoints
- [ ] Input validation on all fields
- [ ] CORS properly configured
- [ ] Sensitive data not logged
- [ ] HTTPS enforced in production

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Testing
# Visit http://localhost:3000/test-paychangu-final

# Environment
cp .env.example .env.local    # Copy env template
```

---

## Resources

- **PayChangu Docs:** https://paychangu.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Setup Guide:** See SETUP.md
- **Testing Guide:** See TESTING.md
- **Full Summary:** See INTEGRATION_SUMMARY.md

---

**Need Help?**
1. Check TESTING.md for detailed troubleshooting
2. Look at browser console for error details
3. Check terminal logs for backend errors
4. Review API endpoint documentation above

---

**Last Updated:** May 12, 2026
**Version:** 1.0
