import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db, users } from './db';
import { eq } from 'drizzle-orm';
import SubscriptionManager from './subscriptionManager';
import { storage } from './storage';

// Initialize Stripe (you'll need to add your Stripe secret key to environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return res.status(400).send('Webhook signature verification failed');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  const metadata = paymentIntent.metadata;
  const isGuest = metadata?.isGuest === 'true';
  const guestId = metadata?.guestId;
  const email = metadata?.email;

  if (isGuest && guestId) {
    // Handle guest payment
    console.log(`Guest payment succeeded for guestId: ${guestId}`);
    
    try {
      await storage.createGuestPremium({
        guestId,
        email,
        stripePaymentIntentId: paymentIntent.id,
      });
      console.log(`Created guest premium for ${guestId}`);
    } catch (error) {
      console.error('Error creating guest premium:', error);
    }
    return;
  }
  
  // Handle authenticated user payment
  const userResults = await db.select()
    .from(users)
    .where(eq(users.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (userResults.length === 0) {
    console.error('User not found for payment intent:', paymentIntent.id);
    return;
  }

  const user = userResults[0];
  
  // Activate subscription for 12 months
  await SubscriptionManager.activateSubscription(
    user.id,
    paymentIntent.id, // Using payment intent as subscription ID for one-time payments
    paymentIntent.customer as string
  );

  console.log(`Activated premium subscription for user ${user.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Find user by Stripe customer ID
  const userResults = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, subscription.customer as string))
    .limit(1);

  if (userResults.length === 0) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  const user = userResults[0];
  
  if (subscription.status === 'active') {
    // Calculate expiry date based on current period end
    const expiresAt = new Date(subscription.current_period_end * 1000);
    
    await db.update(users)
      .set({
        tier: 'premium',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt.toISOString(),
        stripeSubscriptionId: subscription.id,
        lastPaymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));
      
    console.log(`Updated subscription for user ${user.id}, expires at ${expiresAt}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription cancelled:', subscription.id);
  
  const userResults = await db.select()
    .from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (userResults.length === 0) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  const user = userResults[0];
  await SubscriptionManager.cancelSubscription(user.id);
  
  console.log(`Cancelled subscription for user ${user.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // This is a subscription renewal
    const userResults = await db.select()
      .from(users)
      .where(eq(users.stripeSubscriptionId, invoice.subscription as string))
      .limit(1);

    if (userResults.length > 0) {
      const user = userResults[0];
      
      // Extend subscription by 12 months from current expiry or now
      const currentExpiry = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : new Date();
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), new Date().getTime()));
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      
      await db.update(users)
        .set({
          subscriptionExpiresAt: newExpiry.toISOString(),
          subscriptionStatus: 'active',
          lastPaymentDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id));
        
      console.log(`Renewed subscription for user ${user.id}, new expiry: ${newExpiry}`);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error('Invoice payment failed:', invoice.id);
  
  if (invoice.subscription) {
    const userResults = await db.select()
      .from(users)
      .where(eq(users.stripeSubscriptionId, invoice.subscription as string))
      .limit(1);

    if (userResults.length > 0) {
      const user = userResults[0];
      console.log(`Payment failed for user ${user.id} - subscription may be at risk`);
      
      // You might want to send an email notification here
      // or mark the subscription as having payment issues
    }
  }
}

export { stripe };