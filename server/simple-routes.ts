import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Health check endpoint (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });

  const server = createServer(app);
  return server;
}