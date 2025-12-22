# DreamAI Project

## Stack
- Frontend: Next.js with TypeScript, Tailwind CSS
- Backend: Python FastAPI (deployed on Railway)
- Database: Firebase Firestore
- Auth: Firebase Authentication
- Payments: Paddle

## Security Notes

### Credit System
- New user profiles are created with 5 credits (Firestore rules enforce this)
- Credits are SET (not incremented) after restoration check to prevent race condition exploits
- Trial-blocked users get 0 credits, others get 5 free credits
- Age/terms verification requires profile to already exist (prevents bypass)
- Premium users: 80 credits/month, Premium+ users: 120 credits/month
- ALL users (including premium) deduct 1 credit per generation

### Trial Prevention
- Device fingerprinting uses canvas + navigator properties
- Both device ID and email can block free trial access
- `deletionArchived` flag prevents re-archiving exploit during failed deletions

### Account Deletion Order
1. Archive user data (if not already archived)
2. Delete Firestore document FIRST (while still authenticated)
3. Delete Firebase Auth user LAST (invalidates auth token)

## Admin Credentials
See `.admin-keys` file (not tracked in git)
