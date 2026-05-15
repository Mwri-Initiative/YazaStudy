# Deployment Guide - MSCE Study App

This guide will help you deploy the MSCE Study App to production with Supabase backend integration.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier works)
- Vercel account (free tier works)
- PayChangu account for payment processing
- Google Gemini AI API key

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `msce-study-app`
   - Database Password: (generate a strong password, save it securely)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY)

### 1.3 Create Database Tables

Go to the SQL Editor in Supabase and run:

```sql
-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Study materials tracking
CREATE TABLE IF NOT EXISTS study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study progress"
  ON study_progress FOR ALL
  USING (auth.uid() = user_id);
```

## Step 2: Configure Environment Variables

### 2.1 Local Development

Update your `.env.local` file:

```env
# PayChangu API Configuration
PAYCHANGU_API_KEY=your_paychangu_api_key_here
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# PayChangu Webhook and Callback URLs
PAYCHANGU_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
PAYCHANGU_CALLBACK_URL=http://localhost:3000/api/payment/callback
PAYCHANGU_RETURN_URL=http://localhost:3000/payment/success
```

### 2.2 Production (Vercel)

You'll set these in Vercel during deployment (see Step 4).

## Step 3: Test Locally

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Test the application at `http://localhost:3000`

4. Verify:
   - Authentication works
   - Payment flow works
   - AI features work
   - Database connections work

## Step 4: Deploy to Vercel

### 4.1 Connect to Vercel

1. Install Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

### 4.2 Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository:
   - Connect your GitHub/GitLab/Bitbucket account
   - Select the `msce-study-app` repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add Environment Variables:
   - `PAYCHANGU_API_KEY`
   - `PAYCHANGU_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your production URL, e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_API_URL` (set to `https://your-app.vercel.app/api`)
   - `PAYCHANGU_WEBHOOK_URL` (set to `https://your-app.vercel.app/api/payment/webhook`)
   - `PAYCHANGU_CALLBACK_URL` (set to `https://your-app.vercel.app/api/payment/callback`)
   - `PAYCHANGU_RETURN_URL` (set to `https://your-app.vercel.app/payment/success`)
6. Click "Deploy"
7. Wait for deployment to complete

### 4.3 Deploy via CLI (Alternative)

```bash
vercel
```

Follow the prompts and add environment variables when asked.

## Step 5: Post-Deployment Configuration

### 5.1 Update PayChangu Webhooks

1. Log in to your PayChangu dashboard
2. Update webhook URLs to point to your production domain:
   - Webhook URL: `https://your-app.vercel.app/api/payment/webhook`
   - Callback URL: `https://your-app.vercel.app/api/payment/callback`
   - Return URL: `https://your-app.vercel.app/payment/success`

### 5.2 Configure Supabase Auth

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 5.3 Test Production Deployment

1. Visit your production URL
2. Test all features:
   - User registration/login
   - Payment processing
   - AI-powered features
   - Database operations

## Step 6: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update environment variables with new domain
5. Update PayChangu and Supabase URLs

## Monitoring and Maintenance

### Check Logs

- **Vercel**: Dashboard → Your Project → Logs
- **Supabase**: Dashboard → Your Project → Logs

### Database Backups

Supabase automatically backs up your database. Check:
- Dashboard → Your Project → Database → Backups

### Performance Monitoring

Consider adding:
- Vercel Analytics (built-in)
- Supabase Dashboard metrics

## Troubleshooting

### Build Errors

- Check environment variables are set correctly
- Verify all dependencies are installed
- Check Next.js configuration

### Database Connection Issues

- Verify Supabase credentials
- Check Supabase project is active
- Ensure RLS policies are correct

### Payment Issues

- Verify PayChangu API keys
- Check webhook URLs are accessible
- Test in PayChangu sandbox first

### Auth Issues

- Check Supabase auth configuration
- Verify redirect URLs
- Check cookie settings in middleware

## Security Checklist

- [ ] Change default Supabase database password
- [ ] Use environment variables for all secrets
- [ ] Enable RLS on all Supabase tables
- [ ] Never commit `.env.local` to Git
- [ ] Use HTTPS in production
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities

## Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **PayChangu**: Contact their support
