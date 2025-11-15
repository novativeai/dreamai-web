# Firebase Analytics Setup Guide

## Overview
DreamAI now includes industry-standard Firebase Analytics integration with GDPR-compliant user consent controls.

## Features
- ✅ User consent management (opt-in/opt-out)
- ✅ GDPR compliance
- ✅ Industry-standard event tracking
- ✅ Integrated with Data Protection Settings
- ✅ Stored in Firestore for persistence
- ✅ Crash reporting controls

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get your Measurement ID from:
1. Firebase Console → Project Settings
2. General tab → Your apps → Web app
3. Copy the `measurementId` value

## Tracked Events

### Authentication
- `sign_up` - User registration
- `login` - User login

### Image Generation
- `generate_image` - Image generation with style and user type
- `download_image` - Image download
- `share` - Image sharing (native share or clipboard)

### E-commerce
- `purchase` - Subscription or credit purchase
- `begin_checkout` - Checkout started

### User Actions
- `page_view` - Page navigation
- `settings_change` - Settings modification
- `consent_given` - Consent granted
- `account_deletion` - Account deleted

### Errors
- `exception` - Error/crash reporting (if enabled)

## User Consent

Users can control analytics through the Data Protection Settings screen:

### Default Behavior
- **New Users**: Analytics enabled by default (opt-out model)
- **Existing Users**: Analytics enabled unless explicitly disabled

### Storage
User preferences are stored in Firestore:

```typescript
{
  analyticsEnabled: boolean,
  crashReportingEnabled: boolean,
  analyticsConsentUpdated: timestamp
}
```

## Usage Examples

### Track Custom Event
```typescript
import { trackEvent } from '@/services/analyticsService';

// With user consent check
await trackEvent('button_clicked', { button_name: 'generate' }, userId);

// Without user (anonymous)
await trackEvent('page_loaded', { page: '/home' });
```

### Track Login
```typescript
import { trackLogin } from '@/services/analyticsService';

await trackLogin('google', user.uid);
```

### Track Image Generation
```typescript
import { trackImageGeneration } from '@/services/analyticsService';

await trackImageGeneration(user.uid, 'cyberpunk', isPremium);
```

### Check User Consent
```typescript
import { getAnalyticsConsent } from '@/services/analyticsService';

const hasConsent = await getAnalyticsConsent(user.uid);
if (hasConsent) {
  // Track event
}
```

### Update User Consent
```typescript
import { setAnalyticsConsent } from '@/services/analyticsService';

await setAnalyticsConsent(user.uid, true); // Enable
await setAnalyticsConsent(user.uid, false); // Disable
```

## Data Privacy Compliance

### GDPR Compliance
- ✅ User consent required
- ✅ Opt-out mechanism
- ✅ Data export capability
- ✅ Account deletion support
- ✅ Clear privacy policy
- ✅ Transparent data usage

### Data Retention
Analytics data is retained according to Firebase Analytics defaults:
- Event data: 14 months
- User properties: Indefinitely (until user deletion)

Users can delete their account and all associated data through the app.

## Firebase Console Setup

1. **Enable Analytics**
   - Firebase Console → Analytics
   - Enable Google Analytics for your project

2. **Create Web App** (if not done)
   - Project Settings → General
   - Add app → Web
   - Copy configuration

3. **Configure Data Streams**
   - Analytics → Data Streams
   - Select your web stream
   - Configure enhanced measurement

4. **Set up Custom Events** (optional)
   - Analytics → Events
   - Create custom definitions for better reporting

## Viewing Analytics Data

### Firebase Console
1. Go to Analytics → Dashboard
2. View real-time data and reports
3. Create custom reports

### Google Analytics 4
1. Link Firebase to Google Analytics 4
2. Access advanced reports
3. Set up conversion tracking

## Best Practices

1. **Always check consent before tracking**
   ```typescript
   const hasConsent = await getAnalyticsConsent(userId);
   if (hasConsent) {
     await trackEvent('action', params, userId);
   }
   ```

2. **Use dynamic imports for tree-shaking**
   ```typescript
   const { trackEvent } = await import('@/services/analyticsService');
   ```

3. **Track meaningful events**
   - User actions (not every click)
   - Conversion events
   - Errors and exceptions

4. **Respect user privacy**
   - Don't track PII (personally identifiable information)
   - Honor opt-out requests immediately
   - Provide clear privacy policy

## Troubleshooting

### Analytics not initializing
- Check if `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set
- Verify Firebase config is correct
- Check browser console for errors

### Events not showing up
- Wait 24-48 hours for initial data
- Use DebugView for real-time testing
- Check user consent status

### Testing with DebugView
1. Enable debug mode:
   ```typescript
   import { setAnalyticsCollectionEnabled } from 'firebase/analytics';
   setAnalyticsCollectionEnabled(analytics, true);
   ```

2. View in Firebase Console → Analytics → DebugView

## Security Considerations

1. **Never track sensitive data**
   - Passwords
   - Credit card numbers
   - Personal identifiers (email, phone)

2. **Use hashed user IDs**
   - Firebase handles this automatically
   - Never send plain user IDs in event parameters

3. **Respect Do Not Track**
   - Honor browser DNT settings if required by jurisdiction

## Support

For issues or questions:
- Email: support@dreamai.app
- Documentation: https://firebase.google.com/docs/analytics
