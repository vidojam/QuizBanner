import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  generateResetToken,
  generateMagicLinkToken,
  isValidEmail,
  isValidPassword,
  getPasswordValidationError
} from "./auth";
import { sendPasswordResetEmail, sendWelcomeEmail, sendMagicLinkEmail } from "./emailService";
import { z } from "zod";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

const sendMagicLinkSchema = z.object({
  email: z.string().email(),
});

const verifyMagicLinkSchema = z.object({
  token: z.string(),
});

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  
  /**
   * POST /api/auth/register
   * Register a new user
   */
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate input
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Validate password strength
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        tier: 'free',
        emailVerified: 0,
      } as any);

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        tier: user.tier,
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, firstName || '').catch(err => 
        console.error('Failed to send welcome email:', err)
      );

      // Return user data and token
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          emailVerified: Boolean(user.emailVerified),
        },
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate input
      const { email, password } = loginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        tier: user.tier,
      });

      // Return user data and token
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          emailVerified: Boolean(user.emailVerified),
        },
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  });

  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   */
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      // Validate input
      const { email } = forgotPasswordSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          message: 'If an account exists with that email, a password reset link has been sent.' 
        });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      // Save reset token to database
      await storage.setResetToken(user.id, resetToken, expires);

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);

      res.json({ 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      // Always return success to prevent error enumeration
      res.json({ 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    }
  });

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      // Validate input
      const { token, password } = resetPasswordSchema.parse(req.body);

      // Validate password strength
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      // Find user with reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update password and clear reset token
      await storage.updatePassword(user.id, passwordHash);
      await storage.clearResetToken(user.id);

      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Password reset failed' });
    }
  });

  /**
   * POST /api/auth/send-magic-link
   * Send magic link to email for passwordless login (premium users only)
   */
  app.post('/api/auth/send-magic-link', async (req: Request, res: Response) => {
    try {
      const { email } = sendMagicLinkSchema.parse(req.body);

      // Check if email exists in users table or guestPremium table
      const user = await storage.getUserByEmail(email);
      const guestPremium = await storage.getGuestPremiumByEmail(email);

      if (!user && !guestPremium) {
        // Always return success to prevent email enumeration
        return res.json({ 
          message: 'If a premium account exists with that email, a magic link has been sent.' 
        });
      }

      // Generate magic link token (1 hour expiry)
      const magicLinkToken = generateMagicLinkToken();
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      if (user) {
        // Set token for authenticated user
        await storage.setMagicLinkToken(user.id, magicLinkToken, expires);
        try {
          await sendMagicLinkEmail(email, magicLinkToken, user.tier === 'premium');
        } catch (emailError) {
          console.error('Failed to send magic link email:', emailError);
          // Continue anyway to prevent email enumeration
        }
      } else if (guestPremium) {
        // Set token for guest premium user
        await storage.setGuestMagicLinkToken(guestPremium.guestId, magicLinkToken, expires);
        try {
          await sendMagicLinkEmail(email, magicLinkToken, true);
        } catch (emailError) {
          console.error('Failed to send magic link email:', emailError);
          // Continue anyway to prevent email enumeration
        }
      }

      res.json({ 
        message: 'If a premium account exists with that email, a magic link has been sent.' 
      });
    } catch (error: any) {
      console.error('Send magic link error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to send magic link' });
    }
  });

  /**
   * POST /api/auth/verify-magic-link
   * Verify magic link token and log user in
   */
  app.post('/api/auth/verify-magic-link', async (req: Request, res: Response) => {
    try {
      const { token } = verifyMagicLinkSchema.parse(req.body);

      // Try to find user or guest premium by token
      const user = await storage.getUserByMagicLinkToken(token);
      const guestPremium = await storage.getGuestPremiumByMagicLinkToken(token);

      if (!user && !guestPremium) {
        return res.status(400).json({ message: 'Invalid or expired magic link' });
      }

      if (user) {
        // Clear the magic link token
        await storage.clearMagicLinkToken(user.id);

        // Generate JWT token
        const jwtToken = generateToken({
          userId: user.id,
          email: user.email,
          tier: user.tier,
        });

        return res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tier: user.tier,
            emailVerified: Boolean(user.emailVerified),
          },
          token: jwtToken,
        });
      }

      if (guestPremium) {
        // Clear the magic link token
        await storage.clearGuestMagicLinkToken(guestPremium.guestId);

        // Return guest premium info (no JWT needed, use guestId)
        return res.json({
          guestPremium: {
            guestId: guestPremium.guestId,
            email: guestPremium.email,
            tier: guestPremium.tier,
            subscriptionStatus: guestPremium.subscriptionStatus,
          },
        });
      }
    } catch (error: any) {
      console.error('Verify magic link error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Magic link verification failed' });
    }
  });
}
