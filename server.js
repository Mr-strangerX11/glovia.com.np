// cPanel NodeJS Selector startup script for Next.js frontend
// Prefers the standalone server built by `next build` (output: 'standalone').
// Falls back to the regular Next.js server if standalone is missing.

const path = require('path');
const fs = require('fs');

const port = Number(process.env.PORT) || 3000;
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

// Graceful shutdown
function setupGracefulShutdown(server) {
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`[frontend] Received ${signal}, shutting down...`);
      if (server && typeof server.close === 'function') {
        server.close(() => {
          console.log('[frontend] HTTP server closed');
          process.exit(0);
        });
        setTimeout(() => process.exit(0), 5000).unref();
      } else {
        setTimeout(() => process.exit(0), 1000).unref();
      }
    });
  });

  process.on('uncaughtException', (err) => {
    console.error('[frontend] Uncaught exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[frontend] Unhandled rejection:', reason);
    process.exit(1);
  });
}

if (fs.existsSync(standaloneServer)) {
  // Production standalone mode — fastest startup, minimal RAM usage
  process.env.NODE_ENV = 'production';
  process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
  process.env.PORT = String(port);

  try {
    // Copy static assets into the standalone directory if not already there
    const standaloneStatic = path.join(__dirname, '.next', 'standalone', '.next', 'static');
    const buildStatic = path.join(__dirname, '.next', 'static');
    if (!fs.existsSync(standaloneStatic) && fs.existsSync(buildStatic)) {
      fs.symlinkSync(buildStatic, standaloneStatic, 'dir');
    }

    const standalonePublic = path.join(__dirname, '.next', 'standalone', 'public');
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(standalonePublic) && fs.existsSync(publicDir)) {
      fs.symlinkSync(publicDir, standalonePublic, 'dir');
    }
  } catch (e) {
    // symlink creation is best-effort; ignore if already exists
  }

  setupGracefulShutdown(null);
  require(standaloneServer);
  console.log(`[frontend] Started via standalone server on port ${port}`);
} else {
  // Fallback: regular Next.js server (slower, higher RAM)
  const { createServer } = require('http');
  const next = require('next');

  const app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      const server = createServer((req, res) => handle(req, res));
      setupGracefulShutdown(server);
      server.listen(port, '0.0.0.0', () => {
        console.log(`[frontend] Started via Next.js server on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('[frontend] Failed to start:', err);
      process.exit(1);
    });
}
