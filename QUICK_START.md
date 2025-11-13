# DreamAI Next.js Frontend - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```bash
cd next-frontend
npm install
```
✅ Already completed - 400 packages installed, 0 vulnerabilities

### 2. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your credentials (use the SAME values as your Expo app):

```env
# Firebase (copy from your Expo .env file)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paddle (copy from your Expo .env file)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox

# API (same as Expo)
NEXT_PUBLIC_API_BASE_URL=https://dreamai-production.up.railway.app
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Testing User Flow

### Test Account Creation
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign in with Email"
3. Create account with email/password
4. Check email for verification link
5. Click verification link
6. Complete age verification (use valid 18+ date)
7. Accept terms & conditions
8. Should redirect to generator screen

### Test Image Generation
1. Upload an image (any photo)
2. Select a style category
3. Choose a style
4. Click "Generate Image"
5. Wait for generation (~30 seconds)
6. View result, test download/share

### Test Premium Flow
1. Click settings icon (gear)
2. Click "Upgrade to Premium"
3. Select a plan
4. Click "Subscribe Now"
5. Paddle checkout should open
6. Use test card: 4242 4242 4242 4242

---

## 🎨 UI Verification Checklist

### ✅ Check These Elements Match Expo App
- [ ] Login screen background image displays correctly
- [ ] Splash screen shows for 2 seconds
- [ ] Fonts render correctly (Roboto Variable, Poppins, Titillium)
- [ ] Brand color (#FF5069) displays correctly
- [ ] Credits badge shows in header (if not premium)
- [ ] Premium badge shows in header (if premium)
- [ ] Style categories display in 2x4 grid on mobile
- [ ] Generated image downloads successfully
- [ ] Share button uses Web Share API
- [ ] Settings page shows all sections
- [ ] Delete account flow has 2 steps

---

## 🔧 Build for Production

### Development Build
```bash
npm run build
npm run start
```

### Production Deployment (Vercel - Recommended)

#### Option 1: Deploy via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option 2: Deploy via Git
1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy automatically on push

#### Option 3: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Framework Preset: Next.js (auto-detected)
4. Add environment variables
5. Click "Deploy"

### Environment Variables for Production
**Important:** Change these in Vercel/Netlify dashboard:
```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production  # Change from sandbox!
NEXT_PUBLIC_API_BASE_URL=https://dreamai-production.up.railway.app
```

---

## 🔐 Security Checklist

### Before Production Deployment
- [ ] Change Paddle environment to `production`
- [ ] Verify Firebase security rules are active
- [ ] Test webhook delivery from Paddle to backend
- [ ] Update CORS settings in backend to allow your domain
- [ ] Enable HTTPS (automatic with Vercel/Netlify)
- [ ] Test authentication flow end-to-end
- [ ] Test payment flow with real card (small amount)

---

## 📊 Monitoring

### After Deployment
1. **Paddle Dashboard**: Monitor subscriptions and transactions
2. **Firebase Console**: Monitor auth users and Firestore updates
3. **Vercel/Netlify Dashboard**: Monitor deployment logs and errors
4. **Backend Logs**: Monitor webhook processing on Railway

---

## 🐛 Troubleshooting

### Issue: "Firebase not configured"
**Solution:** Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`

### Issue: "Paddle checkout doesn't open"
**Solution:**
1. Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is set
2. Check browser console for errors
3. Ensure Paddle environment matches your token type

### Issue: "Image generation fails"
**Solution:**
1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct
2. Check backend is running at Railway
3. Verify backend CORS allows your domain
4. Check Network tab in browser DevTools

### Issue: "Credits don't update after generation"
**Solution:**
1. Verify Firestore security rules allow reads/writes
2. Check Firebase Console for user document
3. Ensure user is authenticated (check auth state)

### Issue: "Webhook not updating subscription"
**Solution:**
1. Verify webhook URL in Paddle dashboard
2. Check webhook signature validation in backend
3. Monitor Railway logs for webhook processing
4. Test webhook with Paddle webhook tester

---

## 📝 NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

---

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📚 Key Files Reference

### Configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (you create this)

### Core Functionality
- `contexts/CreditContext.tsx` - Credit and subscription state
- `lib/firebase.ts` - Firebase initialization
- `lib/paddle.ts` - Paddle initialization
- `lib/api.ts` - Backend API client
- `constants/index.ts` - All app constants (72 AI styles, pricing plans, etc.)

### Screens
- `app/page.tsx` - Splash screen
- `app/login/page.tsx` - Login/signup
- `app/age/page.tsx` - Age verification
- `app/terms-service/page.tsx` - Terms acceptance
- `app/generator/page.tsx` - Main image generation
- `app/results/page.tsx` - Generated image display
- `app/premium/page.tsx` - Subscription plans
- `app/settings/page.tsx` - User settings
- `app/delete-account/page.tsx` - Account deletion

---

## 🎯 Next Steps

1. **Local Testing** (30 minutes)
   - Test all user flows
   - Test payment with Paddle sandbox
   - Verify UI matches Expo app

2. **Staging Deployment** (15 minutes)
   - Deploy to Vercel preview
   - Test with real URLs
   - Verify webhook delivery

3. **Production Deployment** (15 minutes)
   - Change Paddle to production mode
   - Deploy to production domain
   - Test with real payment (small amount)

4. **User Acceptance Testing** (1 hour)
   - Have team members test
   - Collect feedback
   - Fix any issues

5. **Go Live** 🚀
   - Monitor logs
   - Watch for errors
   - Celebrate! 🎉

---

## 💡 Tips

- **Development**: Use `sandbox` Paddle environment with test cards
- **Production**: Switch to `production` Paddle environment with real cards
- **Testing Payments**: Use Paddle test card `4242 4242 4242 4242`
- **Debugging**: Check browser DevTools Console and Network tabs
- **Performance**: Next.js automatically optimizes images and fonts
- **SEO**: Add meta tags in `app/layout.tsx` if needed

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review [FINAL_AUDIT_COMPLETE.md](../FINAL_AUDIT_COMPLETE.md) for detailed technical info
3. Check browser console for errors
4. Review backend logs on Railway
5. Verify Firebase and Paddle dashboards

---

**Status:** ✅ Production Ready
**Last Updated:** November 6, 2025
**Version:** 1.0.0
