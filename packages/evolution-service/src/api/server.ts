/**
 * OpenClaw Evolution Service - HTTP Server
 *
 * Main HTTP server built with Hono framework.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { serve } from '@hono/node-server';

// Type declarations for Bun runtime
declare global {
  // eslint-disable-next-line no-var
  var Bun: {
    serve: (options: {
      fetch: (request: Request) => Response | Promise<Response>;
      hostname: string;
      port: number;
    }) => {
      port: number;
      stop: () => void;
    };
  } | undefined;
}

// Hono types

// Import routes
import { handshakeRouter } from './routes/handshake';
import { eventsRouter } from './routes/events';
import { candidatesRouter } from './routes/candidates';
import { evaluationsRouter } from './routes/evaluations';
import { cardsRouter } from './routes/cards';
import { skillsRouter } from './routes/skills';
import { insightsRouter } from './routes/insights';

// =============================================================================
// Server Configuration
// =============================================================================

export interface ServerConfig {
  port?: number;
  host?: string;
  enableCors?: boolean;
  enableLogging?: boolean;
}

// Server type union for different runtimes
type Server = {
  port?: number;
  address?: { port: number };
  close?: () => void;
  stop?: () => void;
};

// =============================================================================
// Application Types
// =============================================================================

// No custom types needed for MVP

// =============================================================================
// Evolution Service Server
// =============================================================================

export class EvolutionServer {
  private app: Hono;
  private config: Required<ServerConfig>;
  private server?: Server;
  private actualPort?: number;

  constructor(config: ServerConfig = {}) {
    this.config = {
      port: config.port ?? 3001,
      host: config.host ?? '0.0.0.0',
      enableCors: config.enableCors ?? true,
      enableLogging: config.enableLogging ?? true,
    };

    this.app = new Hono();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Set start time
    this.app.use('*', async (_c, next) => {
      await next();
    });

    // Enable CORS
    if (this.config.enableCors) {
      this.app.use('*', cors({
        origin: '*',
        credentials: true,
      }));
    }

    // Request logging
    if (this.config.enableLogging) {
      this.app.use('*', logger());
    }

    // Pretty JSON output
    this.app.use('*', prettyJSON());
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/', (c) => {
      return c.json({
        name: 'OpenClaw Evolution Service',
        version: '0.1.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get('/health', (c) => {
      return c.json({ status: 'ok' });
    });

    // API v1 routes
    const v1 = new Hono();

    v1.route('/runtime', handshakeRouter);
    v1.route('/events', eventsRouter);
    v1.route('/candidates', candidatesRouter);
    v1.route('/evaluations', evaluationsRouter);
    v1.route('/cards', cardsRouter);
    v1.route('/skills', skillsRouter);
    v1.route('/insights', insightsRouter);

    this.app.route('/v1', v1);

    // 404 handler
    this.app.notFound((c) => {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      }, 404);
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.onError((err, c) => {
      console.error('Server error:', err);

      return c.json({
        success: false,
        error: 'Internal Server Error',
        message: err.message,
      }, 500);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const url = `http://${this.config.host}:${this.config.port}`;

    console.log(`Starting OpenClaw Evolution Service on ${url}...`);

    // Check for Bun runtime
    if (typeof globalThis.Bun !== 'undefined') {
      this.server = globalThis.Bun.serve({
        fetch: this.app.fetch,
        hostname: this.config.host,
        port: this.config.port,
      });

      this.actualPort = this.config.port;
      console.log(`Server running on ${url}`);
    } else {
      // Node.js environment
      this.server = await serve({
        fetch: this.app.fetch,
        hostname: this.config.host,
        port: this.config.port,
      });

      // @hono/node-server returns server with port info
      this.actualPort = this.server.port ?? this.server.address?.port ?? this.config.port;

      console.log(`Server running on http://${this.config.host}:${this.actualPort}`);
    }
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (this.server) {
      // Try different cleanup methods for different runtimes
      if (this.server.close) {
        this.server.close();
      } else if (this.server.stop) {
        this.server.stop();
      }
      this.server = undefined;
      console.log('Server stopped');
    }
  }

  /**
   * Get the Hono app instance
   */
  getApp(): Hono {
    return this.app;
  }

  /**
   * Get the actual port the server is listening on
   */
  getPort(): number {
    return this.actualPort || this.config.port;
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createServer(config?: ServerConfig): EvolutionServer {
  return new EvolutionServer(config);
}

// Start server if this is the main module
// Note: import.meta.main works in ESM, require.main works in CJS
// @ts-expect-error - import.meta may not be defined in all environments
if (import.meta.main || (typeof require !== 'undefined' && require.main === module)) {
  const server = createServer({
    port: parseInt(process.env.PORT ?? '3001', 10),
    host: process.env.HOST ?? '0.0.0.0',
  });

  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
