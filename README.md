# DreamAI Next.js Frontend

A modern web application built with Next.js 15, React 19, Tailwind CSS 4, and Firebase that mirrors the Expo React Native app.

## Tech Stack

- **Framework**: Next.js 15.1.8 (App Router)
- **React**: 19.0.0
- **Styling**: Tailwind CSS 4.0
- **Authentication**: Firebase 11.10.0
- **Payments**: Paddle.js 1.4.2
- **State Management**: Zustand 5.0.3 + React Context
- **HTTP Client**: Axios 1.8.1
- **Notifications**: react-hot-toast 2.4.1
- **TypeScript**: 5.x

## Project Structure

```
next-frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Splash screen
│   └── globals.css          # Global styles
├── components/              # React components
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       └── Modal.tsx
├── contexts/                # React contexts
│   └── CreditContext.tsx   # Credit/subscription state
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   └── useImageUpload.ts
├── lib/                     # Core libraries
│   ├── firebase.ts         # Firebase config
│   ├── paddle.ts           # Paddle config
│   └── api.ts              # API client
├── services/                # Business logic
│   └── userService.ts      # User operations
├── utils/                   # Utility functions
│   ├── errors.ts
│   ├── validation.ts
│   └── routes.ts
├── types/                   # TypeScript types
│   └── index.ts
├── constants/               # App constants
│   └── index.ts
├── public/                  # Static assets
│   └── assets/             # Images, fonts, icons
├── .env.local.example       # Environment variables template
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Paddle account for payments

### Installation

1. **Install dependencies:**

```bash
cd next-frontend
npm install
```

2. **Set up environment variables:**

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paddle Configuration
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # or "production"

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://dreamai-production.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=DreamAI
NEXT_PUBLIC_BRAND_COLOR=#FF5069
```

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Features Implemented

### ✅ Core Infrastructure
- Next.js 15 App Router setup
- Tailwind CSS 4 with custom design system
- TypeScript configuration
- Global styles and animations
- Roboto Variable, Poppins, and Titillium font integration

### ✅ Firebase Integration
- Authentication (Email/Password, Google OAuth)
- Firestore database connection
- Real-time listeners
- User profile management

### ✅ State Management
- CreditContext for credits/subscriptions
- Custom hooks (useAuth, useImageUpload)
- Real-time Firestore synchronization

### ✅ UI Components
- Button component (4 variants)
- Modal component
- Loading states
- Toast notifications

### ✅ Services & Utilities
- User service (verification, profiles, deletion)
- API client (image generation, products)
- Error handling utilities
- Form validation utilities
- Route management

### ✅ Constants & Types
- All style categories from Expo app (70+ AI prompts)
- Premium features and pricing plans
- Legal documents (Terms, Privacy, Cookies)
- TypeScript type definitions

## Screens to Implement

The following screens need to be created to match the Expo app:

### Authentication Flow (5 screens)
1. ✅ Splash Screen (`app/page.tsx`) - COMPLETED
2. 🔲 Login (`app/login/page.tsx`)
3. 🔲 Age Verification (`app/age/page.tsx`)
4. 🔲 Age Blocked (`app/age-blocked/page.tsx`)
5. 🔲 Terms of Service (`app/terms-service/page.tsx`)

### Main App (8 screens)
6. 🔲 Generator (`app/generator/page.tsx`)
7. 🔲 Results (`app/results/page.tsx`)
8. 🔲 Premium (`app/premium/page.tsx`)
9. 🔲 Settings (`app/settings/page.tsx`)
10. 🔲 Delete Account (`app/delete-account/page.tsx`)
11. 🔲 Generator Tips (`app/generator-tips/page.tsx`)
12. 🔲 Text Documents (`app/docs/[slug]/page.tsx`)
13. 🔲 404 Not Found (`app/not-found.tsx`)

## Next Steps

### 1. Create Authentication Pages
Implement the login, age verification, and terms acceptance flow.

### 2. Create Main Generator Screen
The core image generation interface with:
- Image upload component
- Style selector (8 categories, 70+ styles)
- Credit display
- Generation button

### 3. Implement Premium/Subscription Flow
- Premium features page
- Paddle checkout integration
- Subscription management

### 4. Complete Remaining Screens
- Results display
- Settings modal
- Account deletion flow
- Tips modal
- Legal documents

## Design System

### Colors
- **Brand**: `#FF5069`
- **Background**: `#000000` (black)
- **Text**: White with varying opacity
- **Neutral Grays**: 50-900 scale

### Typography
- **Font Family**: Roboto Variable (primary), Poppins Bold (logo), Titillium (documents)
- **Headings**: h1 (24px) → h5 (12px)
- **Body**: xl (18px) → xs (10px)

### Spacing
- **Scale**: xxs (4px) → xxl (48px)
- **Screen Padding**: 24px horizontal, 16px vertical

### Border Radius
- **Scale**: s (4px) → xl (24px), round (999px)

## API Integration

The app connects to the backend at:
```
https://dreamai-production.up.railway.app
```

### Endpoints Used
- `POST /generate/` - Generate AI images
- `GET /products` - Fetch available products
- `POST /create-checkout` - Create Paddle checkout
- `POST /verify-subscription` - Verify user subscription

## Contributing

When adding new screens or components:

1. Follow the Expo app's design exactly
2. Use Tailwind classes matching the design system
3. Implement the same user flow and state management
4. Add TypeScript types for all data structures
5. Handle errors gracefully with user-friendly messages

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## License

Proprietary - DreamAI Team

## Support

For issues or questions, contact: support@dreamai.app
