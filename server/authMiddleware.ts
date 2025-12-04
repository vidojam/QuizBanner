import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tier: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Attach user info to request
  req.user = {
    id: payload.userId,
    email: payload.email,
    tier: payload.tier,
  };

  next();
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      req.user = {
        id: payload.userId,
        email: payload.email,
        tier: payload.tier,
      };
    }
  }

  next();
}
