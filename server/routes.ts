import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  // Auth routes  
  app.get('/api/auth/user', async (req: any, res) => {
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

  // Subscription management routes
  app.get('/api/subscription/status', async (req: any, res) => {
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

  app.post('/api/subscription/create-payment-intent', async (req: any, res) => {
    try {
      const { stripe } = await import('./stripeWebhooks');
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create payment intent for $1.99 (199 cents)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 199, // $1.99 in cents
        currency: 'usd',
        metadata: {
          userId: user.id,
          tier: 'premium',
          duration: '12months'
        }
      });

      // Store payment intent ID for webhook verification
      await storage.updateUser(user.id, {
        stripePaymentIntentId: paymentIntent.id
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post('/api/subscription/cancel', async (req: any, res) => {
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

  // Questions CRUD (all protected)
  app.get("/api/questions", async (req: any, res) => {
    try {
      const userId = req.user.id;
      const questions = await storage.getQuestions(userId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/:id", async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post("/api/questions", async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Enforce tier limits
      const currentCount = await storage.getQuestionCount(userId);
      const limit = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS];
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          error: `Question limit reached. ${user.tier === 'free' ? 'Upgrade to premium for up to 50 questions.' : 'Maximum of 50 questions reached.'}`,
          currentCount,
          limit,
          tier: user.tier
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

  app.patch("/api/questions/:id", async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.delete("/api/questions", async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.deleteAllQuestions(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions/:id", async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post("/api/questions/reorder", async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // Preferences (protected)
  app.get("/api/preferences", async (req: any, res) => {
    try {
      const userId = req.user.id;
      const prefs = await storage.getPreferences(userId);
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/preferences", async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  const httpServer = createServer(app);

  return httpServer;
}
