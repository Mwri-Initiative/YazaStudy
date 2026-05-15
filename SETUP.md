# MSCE Study App - Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- PayChangu API Key

## Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your PayChangu API key:
   ```
   PAYCHANGU_API_KEY=your_actual_api_key_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Visit: http://localhost:3000

## PayChangu Integration

### Getting Your API Key
1. Go to https://paychangu.com
2. Create an account or log in
3. Navigate to Developer/API settings
4. Copy your API key and add it to `.env.local`

### Payment Flow
1. User selects material and clicks "Buy Now"
2. Frontend sends payment request to `/api/payment/initiate`
3. Backend creates payment with PayChangu
4. User redirected to PayChangu payment page
5. After payment, PayChangu sends webhook to `/api/payment/webhook`
6. App grants access to purchased material

### Testing Payment
1. Visit http://localhost:3000/test-paychangu-final
2. Click "Test PayChangu Connection"
3. You should see the checkout URL

## Available Routes

- `/` - Home page
- `/payment` - Make payments for materials
- `/shop` - Browse all materials
- `/my-materials` - View purchased materials
- `/test-paychangu-final` - Test PayChangu integration
- `/api/payment/initiate` - Start payment (POST)
- `/api/payment/verify` - Check payment status (POST/GET)
- `/api/payment/webhook` - Webhook callback from PayChangu (POST)

## Troubleshooting

### "API Key Missing" Error
- Check `.env.local` has `PAYCHANGU_API_KEY` set
- Restart dev server after changing env vars

### Payment Creation Fails
- Verify API key is valid in PayChangu dashboard
- Check network tab in browser DevTools for actual error
- Look at terminal logs for PayChangu error response

### Webhook Not Received
- Ensure your app is accessible externally (use ngrok for local testing)
- Update webhook URL in PayChangu dashboard
- Check if firewall is blocking inbound requests
