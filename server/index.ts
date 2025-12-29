import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./authRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { startBackgroundTasks } from "./backgroundTasks";
import { verifyEmailConfig } from "./emailService";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test route for mobile debugging (before other routes)
  app.get('/test-mobile', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QuizBanner Mobile Test</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
              .status { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .success { border-left: 4px solid #10b981; }
              .error { border-left: 4px solid #ef4444; }
              button { background: #3b82f6; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; margin: 10px 0; width: 100%; }
          </style>
      </head>
      <body>
          <h1>QuizBanner Mobile Test</h1>
          <div id="results"></div>
          <button onclick="testAPI()">Test API Endpoint</button>
          <button onclick="goToApp()">Go to App (/app)</button>
          <button onclick="goToLanding()">Go to Landing (/)</button>
          <script>
              function addResult(message, type = 'success') {
                  const div = document.createElement('div');
                  div.className = \`status \${type}\`;
                  div.innerHTML = \`<strong>\${new Date().toLocaleTimeString()}</strong><br>\${message}\`;
                  document.getElementById('results').appendChild(div);
              }
              async function testAPI() {
                  addResult('Testing API endpoint...', 'success');
                  try {
                      const response = await fetch('/api/guest/premium/test-id');
                      const data = await response.json();
                      addResult(\`✓ API responded: \${JSON.stringify(data)}\`, 'success');
                  } catch (error) {
                      addResult(\`✗ API failed: \${error.message}\`, 'error');
                  }
              }
              function goToApp() {
                  addResult('Navigating to /app...', 'success');
                  window.location.href = '/app';
              }
              function goToLanding() {
                  addResult('Navigating to /...', 'success');
                  window.location.href = '/';
              }
              window.addEventListener('load', () => {
                  addResult('✓ Test page loaded successfully!', 'success');
                  addResult(\`User Agent: \${navigator.userAgent}\`, 'success');
              });
          </script>
      </body>
      </html>
    `);
  });

  // Register auth routes first (these don't require authentication)
  registerAuthRoutes(app);
  
  // Register other routes (these require authentication)
  const server = await registerRoutes(app);

  // Verify email configuration on startup
  verifyEmailConfig();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5000 for local development
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = '0.0.0.0'; // Allow network access from other devices
  
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
    
    // Start background tasks for subscription management
    startBackgroundTasks();
  });
})();
