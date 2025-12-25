# Magic Link Authentication System

## Overview

QuizBanner now uses **passwordless Magic Link authentication** for premium users. After paying $2.99, users receive an email with a secure login link that grants access to their premium features on any device.

## How It Works

### Payment Flow

1. **User pays $2.99** through Stripe checkout
2. **Payment success webhook** triggers automatically
3. **Magic link is sent** to the email provided during checkout
4. **User clicks link** in email to access premium features

### For Guest Premium Users

```
Pay $2.99 → Provide email → Receive magic link → Click link → Instant access
```

- No password needed
- No account creation required upfront
- Premium access tied to their email
- Can access from any device using email

### For Returning Users

1. Visit `/magic-login` page
2. Enter email used during payment
3. Receive new magic link
4. Click link to login

## Key Features

✅ **No passwords to remember** - Completely passwordless authentication
✅ **Cross-device access** - Use premium on any device with your email
✅ **Secure** - Tokens expire in 1 hour and are one-time use
✅ **Automatic** - Magic link sent immediately after payment
✅ **Simple UX** - Just click the link in email

## Technical Implementation

### Database Schema

Added to both `users` and `guest_premium` tables:
- `magic_link_token` - Secure random token (32 bytes hex)
- `magic_link_expires` - Expiration timestamp (1 hour from generation)

### API Endpoints

#### POST `/api/auth/send-magic-link`
Request a new magic link for an email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If a premium account exists with that email, a magic link has been sent."
}
```

#### POST `/api/auth/verify-magic-link`
Verify a magic link token and login.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response (Authenticated User):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "tier": "premium",
    ...
  },
  "token": "jwt-token..."
}
```

**Response (Guest Premium):**
```json
{
  "guestPremium": {
    "guestId": "guest-abc",
    "email": "user@example.com",
    "tier": "premium",
    "subscriptionStatus": "active"
  }
}
```

### Email Template

Magic link emails include:
- Welcome message for new premium users
- Secure login button
- Copy-pasteable link
- Security notice (1 hour expiry)
- Premium features list

### Routes

- `/magic-login` - Request magic link form
- `/verify-magic-link?token=xxx` - Auto-login page

### Payment Webhook Integration

The Stripe webhook (`handlePaymentSucceeded`) now:
1. Creates guest premium record
2. Generates magic link token
3. Sends email with magic link
4. Logs success/failure

### Security Features

- **Token expiry**: Links expire after 1 hour
- **One-time use**: Token is cleared after verification
- **Email enumeration protection**: Always returns success message
- **Secure generation**: Uses crypto.randomBytes(32)

## User Experience Flow

### New Premium User
```
1. User visits landing page
2. Clicks "Premium" button
3. Pays $2.99 via Stripe
4. Receives email: "Payment Successful + Magic Link"
5. Clicks link in email
6. Instantly logged in with premium features
```

### Returning Premium User
```
1. User visits landing page
2. Clicks "Already paid? Access your account"
3. Enters email address
4. Receives magic link email
5. Clicks link
6. Instantly logged in with premium features
```

## Benefits Over Traditional Auth

### For Users
- **No password to remember or reset**
- **Faster login** - Just check email
- **More secure** - No password to be compromised
- **Works everywhere** - Just need email access

### For Development
- **Simpler** - No password hashing/verification needed
- **More secure** - No passwords stored for premium users
- **Better UX** - Fewer friction points
- **Cross-device** - Email is the identifier

## Migration

Existing database installations need to run:
```bash
node migrate-magic-link.cjs
```

This adds the new fields to existing databases.

## Environment Variables

Same email configuration as password reset:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=QuizBanner <noreply@quizbanner.com>
APP_URL=http://localhost:5000
```

## Testing

1. Make a test premium purchase
2. Check email for magic link
3. Click link → Should auto-login
4. Visit `/magic-login`
5. Enter email → Receive new link
6. Verify cross-device works

## Future Enhancements

Potential improvements:
- **Remember device** - Option to stay logged in
- **SMS magic links** - Alternative to email
- **QR code login** - Scan to login on mobile
- **Biometric** - Touch/Face ID for repeat logins
