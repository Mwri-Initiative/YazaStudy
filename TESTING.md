# Paychangu Integration Testing Guide

## Overview
This guide provides comprehensive instructions for testing the PayChangu payment integration in the MSCE Study App.

## Prerequisites
1. PayChangu API credentials (API key)
2. Node.js 18+ installed
3. Dev server running (`npm run dev`)

## Step 1: Configure Environment

### Create `.env.local`
```bash
cp .env.example .env.local
```

### Update with your credentials
```
PAYCHANGU_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYCHANGU_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
```

### Verify Configuration
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/api/payment/initiate
3. You should see: `"apiConfigured": true`

If `apiConfigured` is `false`, your API key is not set correctly.

## Step 2: Test API Endpoints

### Test Payment Initiation Endpoint
**Endpoint:** `POST /api/payment/initiate`

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "MWK",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "tx_ref": "TEST_'$(date +%s)'",
    "callback_url": "http://localhost:3000/api/payment/webhook",
    "return_url": "http://localhost:3000/payment-final"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.paychangu.com/...",
    "tx_ref": "TEST_...",
    "status": "pending"
  },
  "message": "Payment initiated successfully"
}
```

### Test Verification Endpoint
**Endpoint:** `POST /api/payment/verify`

```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "YOUR_TRANSACTION_REFERENCE"
  }'
```

### Test Webhook Endpoint
**Endpoint:** `POST /api/payment/webhook`

```bash
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST_12345",
    "status": "success",
    "amount": 100,
    "currency": "MWK",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "transaction_id": "TXN_123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "reference": "TEST_12345",
  "status": "success"
}
```

## Step 3: Use Web Testing Page

The application includes a comprehensive testing interface:

1. Navigate to: http://localhost:3000/test-paychangu-final
2. You'll see four test buttons:
   - **Test Payment Initiation**: Creates a test payment
   - **Test Verification**: Verifies payment status
   - **Test Webhook Endpoint**: Checks webhook health
   - **Test Webhook Payload**: Simulates PayChangu webhook

### Using the Test Page

#### Test 1: Payment Initiation
1. Click "Test Payment Initiation"
2. Wait for response
3. You should see ✅ success message
4. A checkout URL will be generated
5. **Optional**: Click the URL to test actual payment flow

#### Test 2: Payment Verification
1. Complete Test 1 first
2. Click "Test Verification"
3. If payment not completed yet, you'll see status: pending
4. After completing payment, status will be: success

#### Test 3: Webhook Endpoint
1. Click "Test Webhook Endpoint"
2. Should see ✅ success message
3. This confirms webhook endpoint is accessible

#### Test 4: Webhook Payload
1. Click "Test Webhook Payload"
2. Simulates PayChangu sending payment confirmation
3. Should see ✅ success message

## Step 4: Full Payment Flow

### Manual Complete Payment Test

1. **Go to Shop Page**
   - Navigate to: http://localhost:3000/shop
   - Click on a material to view details

2. **Initiate Purchase**
   - Click "Buy Now" button
   - You'll be redirected to payment page

3. **Fill Payment Form**
   ```
   First Name: Test
   Last Name: User
   Email: test@example.com
   Phone: +265881234567 (Airtel or TNM)
   ```

4. **Click "Pay" Button**
   - You'll be sent to PayChangu checkout
   - **Note**: In test mode, PayChangu provides test cards

5. **Complete Payment**
   - Use test card credentials from PayChangu
   - Approve payment on your phone (for Airtel/TNM)

6. **Return to App**
   - After payment, PayChangu redirects back to app
   - You should see success page

## Step 5: Monitor Logs

### Browser Console
- Open DevTools (F12)
- Go to Console tab
- You'll see detailed logs with emojis:
  - 🚀 Initiation
  - 📡 API responses
  - ✅ Success
  - ❌ Errors
  - 💥 Network issues

### Terminal Logs
- Check server terminal where `npm run dev` runs
- You'll see backend logs with same emoji indicators

## Troubleshooting

### Issue: "API Key Missing"
**Solution:**
1. Check `.env.local` has `PAYCHANGU_API_KEY`
2. Verify it's not empty
3. Restart dev server

### Issue: "Invalid API Key"
**Solution:**
1. Verify key from PayChangu dashboard
2. Copy exact value without spaces
3. Restart dev server

### Issue: Checkout URL not received
**Solution:**
1. Check PayChangu API endpoint is accessible
2. Verify network connectivity
3. Check API response in browser DevTools Network tab

### Issue: Webhook not being called
**For local testing:**
1. Use ngrok to expose local server:
   ```bash
   ngrok http 3000
   ```
2. Update webhook URL in PayChangu dashboard:
   ```
   https://your-ngrok-url.ngrok.io/api/payment/webhook
   ```

### Issue: Payment verification fails
**Possible causes:**
1. Payment reference doesn't exist yet
2. Reference spelled incorrectly
3. PayChangu hasn't processed payment yet (try after 1-2 minutes)

## Expected Field Names

The API expects the following field names (case-sensitive):

```
{
  "amount": number (required)
  "currency": string (e.g., "MWK", required)
  "email": string (required)
  "first_name": string (not firstName)
  "last_name": string (not lastName)
  "tx_ref": string (transaction reference, required)
  "callback_url": string (webhook URL, required)
  "return_url": string (redirect after payment, required)
  "phone": string (optional)
  "description": string (optional)
}
```

## Supported Payment Methods

- **Airtel Money**: Mobile phone with Airtel
- **TNM Mpamba**: Mobile phone with TNM
- **Bank Transfer**: Direct bank transfers (where available)

## Testing Checklist

- [ ] Environment variables configured
- [ ] API health check passing (apiConfigured: true)
- [ ] Payment initiation endpoint returns checkout URL
- [ ] Webhook endpoint is accessible
- [ ] Webhook payload processing works
- [ ] Payment verification endpoint works
- [ ] Web test page loads correctly
- [ ] Payment page displays correctly
- [ ] Form validation works
- [ ] Actual payment flow completes

## Next Steps

After all tests pass:
1. Deploy to staging environment
2. Test with real PayChangu account
3. Implement database persistence
4. Add email confirmations
5. Deploy to production

## Support

- Check browser console for detailed error messages
- Look at terminal logs for backend errors
- Verify all fields match expected names
- Ensure API key is valid and active
- Check network connectivity

---

**Last Updated:** May 2026
**Version:** 1.0
