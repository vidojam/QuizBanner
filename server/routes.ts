import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertPreferencesSchema, insertTemplateSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Questions CRUD
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/questions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const question = await storage.updateQuestion(id, req.body);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteQuestion(id);
      if (!success) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions/reorder", async (req, res) => {
    try {
      const { questionIds } = req.body;
      if (!Array.isArray(questionIds)) {
        return res.status(400).json({ error: "questionIds must be an array" });
      }
      await storage.reorderQuestions(questionIds);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const prefs = await storage.getPreferences();
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/preferences", async (req, res) => {
    try {
      const prefs = await storage.updatePreferences(req.body);
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
