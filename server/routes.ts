import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, optionalAuth } from "./authMiddleware";
import { sendContactFormEmail } from "./emailService";

import { insertQuestionSchema, insertPreferencesSchema, insertTemplateSchema, insertStudySessionSchema, TIER_LIMITS } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Stripe webhook (must be before body parsing middleware)
  app.post('/api/stripe/webhook', async (req, res) => {
    const { handleStripeWebhook } = await import('./stripeWebhooks');
    await handleStripeWebhook(req, res);
  });

  // Auth routes - get current user (requires authentication)
  app.get('/api/auth/user', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let user = await storage.getUser(userId);
      
      // Check subscription status and update tier if needed
      if (user) {
        const SubscriptionManager = await import('./subscriptionManager');
        const subscriptionInfo = await SubscriptionManager.default.checkSubscriptionStatus(user.id);
        
        // If subscription expired, downgrade user to free tier
        if (user.tier === 'premium' && !subscriptionInfo.isActive && subscriptionInfo.status === 'expired') {
          await SubscriptionManager.default.expireSubscription(user.id);
          user = await storage.getUser(userId); // Fetch updated user
        }
        
        // Add subscription info to user response
        (user as any).subscriptionInfo = subscriptionInfo;
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Guest premium check (public)
  app.get('/api/guest/premium/:guestId', async (req, res) => {
    try {
      const { guestId } = req.params;
      const guestPremium = await storage.getGuestPremium(guestId);
      
      if (!guestPremium) {
        return res.json({ isPremium: false });
      }
      
      // Check if subscription is still active
      const isActive = guestPremium.subscriptionStatus === 'active' &&
        (!guestPremium.subscriptionExpiresAt || new Date(guestPremium.subscriptionExpiresAt) > new Date());
      
      res.json({
        isPremium: isActive,
        expiresAt: guestPremium.subscriptionExpiresAt,
        status: guestPremium.subscriptionStatus,
      });
    } catch (error: any) {
      console.error("Error checking guest premium:", error);
      res.status(500).json({ error: "Failed to check guest premium status" });
    }
  });

  // Link guest purchase to user account (requires authentication)
  app.post('/api/guest/link', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { guestId } = req.body;
      
      if (!guestId) {
        return res.status(400).json({ error: "guestId required" });
      }
      
      await storage.linkGuestToUser(guestId, userId);
      res.json({ success: true, message: "Guest premium linked to account" });
    } catch (error: any) {
      console.error("Error linking guest to user:", error);
      res.status(500).json({ error: "Failed to link guest premium" });
    }
  });

  // Subscription management routes
  app.get('/api/subscription/status', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const SubscriptionManager = await import('./subscriptionManager');
      const subscriptionInfo = await SubscriptionManager.default.checkSubscriptionStatus(userId);
      res.json(subscriptionInfo);
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post('/api/subscription/create-payment-intent', optionalAuth, async (req: any, res) => {
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY not configured");
        return res.status(500).json({ message: "Payment system not configured. Please contact support." });
      }

      const { stripe } = await import('./stripeWebhooks');
      const { email, guestId } = req.body || {};
      
      // Support both authenticated users and guests
      const userId = req.user?.id;
      const isGuest = !userId;
      
      // For authenticated users, get their info
      let user;
      if (userId) {
        user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      // If no authenticated user and no guest info, we can still create payment intent
      // The email will be collected in the Stripe checkout form
      const receiptEmail = email || user?.email || undefined;

      // Create payment intent for $0.99 (99 cents)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 99, // $0.99 in cents
        currency: 'usd',
        receipt_email: receiptEmail,
        metadata: {
          userId: userId || 'guest',
          guestId: guestId || '',
          email: receiptEmail || '',
          tier: 'premium',
          duration: '1month',
          isGuest: isGuest.toString()
        }
      });

      // Store payment intent ID for authenticated users
      if (userId && user) {
        await storage.updateUser(user.id, {
          stripePaymentIntentId: paymentIntent.id
        });
      }

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      const errorMessage = error.message || "Failed to create payment intent";
      res.status(500).json({ message: `Payment setup failed: ${errorMessage}` });
    }
  });

  app.post('/api/subscription/confirm-payment', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has a payment intent
      if (!user.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found" });
      }

      // Verify payment with Stripe
      const { stripe } = await import('./stripeWebhooks');
      const paymentIntent = await stripe.paymentIntents.retrieve(user.stripePaymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Activate premium subscription
        const SubscriptionManager = await import('./subscriptionManager');
        await SubscriptionManager.default.activateSubscription(
          user.id,
          paymentIntent.id,
          paymentIntent.customer as string
        );

        console.log(`Manually activated premium for user ${user.id} after payment confirmation`);
        res.json({ message: "Subscription activated", tier: "premium" });
      } else {
        res.status(400).json({ message: "Payment not completed", status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.post('/api/subscription/cancel', authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const SubscriptionManager = await import('./subscriptionManager');
      await SubscriptionManager.default.cancelSubscription(userId);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Questions CRUD (support guests and authenticated users)
  app.get("/api/questions", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.query.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const questions = await storage.getQuestions(userId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.query.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const id = req.params.id;
      const question = await storage.getQuestion(id, userId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.body.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      
      // Get user for tier limits (guests default to free tier)
      const user = req.user?.id ? await storage.getUser(req.user.id) : null;
      const guestPremium = !user && userId ? await storage.getGuestPremium(userId) : null;
      
      // Determine tier from user or guest premium
      const tier = user?.tier || (guestPremium?.tier) || 'free';

      // Enforce tier limits
      const currentCount = await storage.getQuestionCount(userId);
      const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          error: `Question limit reached. ${tier === 'free' ? 'Upgrade to premium for up to 50 questions.' : 'Maximum of 50 questions reached.'}`,
          currentCount,
          limit,
          tier
        });
      }

      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData, userId);
      res.status(201).json(question);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/questions/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.body.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const id = req.params.id;
      const question = await storage.updateQuestion(id, req.body, userId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.query.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const count = await storage.deleteAllQuestions(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions/:id", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.query.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const id = req.params.id;
      const success = await storage.deleteQuestion(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions/reorder", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.body.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const { questionIds } = req.body;
      if (!Array.isArray(questionIds)) {
        return res.status(400).json({ error: "questionIds must be an array" });
      }
      await storage.reorderQuestions(questionIds, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Preferences (support guests and authenticated users)
  app.get("/api/preferences", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.query.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const prefs = await storage.getPreferences(userId);
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/preferences", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.body.guestId || req.headers['x-guest-id'];
      if (!userId) {
        return res.status(400).json({ error: "User ID or Guest ID required" });
      }
      const prefs = await storage.updatePreferences(req.body, userId);
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteTemplate(id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Study Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const session = await storage.updateStudySession(id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getRecentSessions(limit);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact form submission (no auth required)
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      
      // Save to database
      const result = await storage.createContactMessage({ name, email, message });
      
      // Send email notification
      try {
        await sendContactFormEmail(name, email, message);
        console.log('Contact form email sent successfully');
      } catch (emailError) {
        console.error('Failed to send contact form email:', emailError);
        // Don't fail the request if email fails, message is still saved
      }
      
      res.json({ success: true, id: result.id });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
