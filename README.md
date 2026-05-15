# Yaza Stuff

A modern Next.js web application for MSCE students in Malawi to purchase and access premium study materials with PayChangu payment integration.

## Features

- **Homepage**: Beautiful landing page with subject categories (Mathematics, Physics, Chemistry, Biology, English, Chichewa)
- **Shop**: Browse and filter study materials with preview functionality
- **Payment Integration**: Secure PayChangu payment gateway for Malawian students
- **User Accounts**: Authentication system for accessing purchased materials
- **Materials Library**: Personal dashboard for downloaded study materials
- **Responsive Design**: Optimized for both desktop and mobile devices

## Color Palette

- Primary: #2E8B57 (Green)
- Secondary: #FFC107 (Yellow)
- Accent: #2196F3 (Blue)
- Background: #F5F5F5
- Text: #212121

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom color scheme
- **UI Components**: Radix UI with custom components
- **Icons**: Lucide React
- **Payment**: PayChangu API integration
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your PayChangu API keys to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

```env
PAYCHANGU_API_KEY=your_paychangu_api_key_here
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── auth/            # Authentication pages
│   ├── shop/            # Materials shop
│   ├── my-materials/    # User's purchased materials
│   └── layout.tsx       # Root layout with header
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── Header.tsx      # Navigation header
│   ├── SubjectCard.tsx # Subject display cards
│   ├── MaterialCard.tsx # Material cards with purchase options
│   └── PaymentModal.tsx # PayChangu payment modal
├── lib/                # Utility functions
│   ├── utils.ts        # Common utilities
│   └── paychangu.ts    # PayChangu API service
└── types/              # TypeScript type definitions
    └── index.ts        # Core application types
```

## Deployment

This app is configured for Vercel deployment:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## PayChangu Integration

The app integrates with PayChangu for secure payments:

- Payment initiation with user details
- Automatic redirect to PayChangu payment page
- Payment verification and material access
- Callback handling for payment confirmation

## Features for Malawian Students

- **Affordable Pricing**: Materials priced in MWK for local students
- **Mobile Friendly**: Works well on smartphones and basic devices
- **Offline Access**: Downloaded materials available offline
- **Local Payment**: PayChangu integration familiar to Malawian users
- **MSCE Focused**: Content aligned with Malawi School Certificate of Education

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
