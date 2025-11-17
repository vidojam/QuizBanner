# Stripe Integration Setup Guide

## Environment Variables Required

Add the following to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key (test or live)
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key (test or live)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret from Stripe dashboard

# Optional: For production
STRIPE_WEBHOOK_URL=https://yourdomain.com/api/stripe/webhook
```

## Stripe Dashboard Setup

### 1. Create Stripe Account
- Go to https://stripe.com and create an account
- Get your API keys from the Stripe Dashboard > Developers > API Keys

### 2. Create Webhook Endpoint
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret (starts with `whsec_`) and add it to your `.env`

### 3. Test Mode vs Live Mode
- Use test keys (starting with `sk_test_` and `pk_test_`) during development
- Switch to live keys for production
- Test payments can be made with test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

## How the System Works

### Payment Flow
1. User clicks "Upgrade to Premium" 
2. Frontend calls `/api/subscription/create-payment-intent`
3. Server creates Stripe PaymentIntent for $1.99
4. User completes payment with Stripe Elements
5. Stripe sends webhook to `/api/stripe/webhook`
6. Server verifies payment and activates 12-month subscription

### Subscription Management
1. **Payment Verification**: Stripe webhooks verify all payments
2. **Expiry Tracking**: Database stores `subscription_expires_at` (12 months from payment)
3. **Auto-Downgrade**: Background task checks daily and downgrades expired users
4. **Renewal Reminders**: System identifies users with <7 days remaining
5. **Status Checks**: Every login checks subscription status and updates tier

### User Experience
- **Active Premium**: Shows expiry date and days remaining
- **Expiring Soon**: Warning banner with renewal button (7 days before expiry)
- **Expired**: Automatic downgrade to free tier, renewal option
- **Cancelled**: Keep access until expiry date, reactivation option

### Background Tasks
- Runs daily at midnight to process expired subscriptions
- Identifies users needing renewal reminders
- Automatically downgrades expired premium users to free tier

## Development Testing

### Test the Flow
1. Start the server with Stripe environment variables
2. Use the dev login to access the app
3. Try upgrading to premium with test card `4242 4242 4242 4242`
4. Check database to see subscription fields populated
5. Test expiry by manually setting `subscription_expires_at` to a past date

### Webhook Testing
1. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
2. Or use ngrok to expose your local server to Stripe
3. Test different webhook events in Stripe Dashboard

## Production Deployment

### 1. Environment Setup
- Use live Stripe keys
- Set proper webhook URL
- Ensure HTTPS is enabled

### 2. Database Migration
- Run the updated schema to add subscription fields:
  - `stripe_subscription_id`
  - `subscription_expires_at` 
  - `subscription_status`
  - `last_payment_date`

### 3. Cron Job Setup
Set up a daily cron job to process expired subscriptions:
```bash
# Run at midnight every day
0 0 * * * /path/to/node /path/to/server/backgroundTasks.js
```

### 4. Monitoring
- Monitor Stripe webhooks in dashboard
- Set up alerts for failed payments
- Track subscription metrics

## Security Notes

- Webhook signatures are verified using Stripe's signature
- Payment intents are created server-side only
- User subscription status is always verified on login
- Background tasks run automatically to prevent manual bypass

## Troubleshooting

### Common Issues
1. **Webhooks not received**: Check webhook URL and ensure it's publicly accessible
2. **Signature verification failed**: Verify webhook secret is correct
3. **Payments not activating premium**: Check webhook events are properly configured
4. **Users not being downgraded**: Ensure background tasks are running

### Debug Mode
Set `NODE_ENV=development` to see detailed logs for:
- Payment intent creation
- Webhook processing
- Subscription status changes
- Background task execution