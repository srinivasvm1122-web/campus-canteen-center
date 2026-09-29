import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, DB } from './server/db.ts';
import authRoutes from './server/routes/auth.ts';
import menuRoutes from './server/routes/menu.ts';
import orderRoutes from './server/routes/orders.ts';
import notificationRoutes from './server/routes/notifications.ts';
import analyticsRoutes from './server/routes/analytics.ts';
import branchRoutes from './server/routes/branches.ts';
import transferRoutes from './server/routes/transfers.ts';
import academicRoutes from './server/routes/academic.ts';
import couponRoutes from './server/routes/coupons.ts';
import wasteRoutes from './server/routes/waste.ts';
import auditRoutes from './server/routes/audit.ts';
import { orderEvents } from './server/events.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Public static files
app.use(express.static(path.join(__dirname, 'public')));

// Health & System status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'ONLINE CANTEEN CENTER',
    database: DB.isSupabaseConnected() ? 'Supabase Database (Connected - qnfoycxcalvdczhtgpxj.supabase.co)' : 'Supabase Active',
    provider: 'Supabase',
    timestamp: new Date().toISOString(),
  });
});

// Real-time Server-Sent Events (SSE) stream for instant multi-tab sync
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection ping
  res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);

  orderEvents.addClient(res);

  // Keep alive ping every 25 seconds
  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepAlive);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    orderEvents.removeClient(res);
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/audit-logs', auditRoutes);

// Frontend integration: Vite middleware in dev or static files in production
async function startServer() {
  await initDatabase();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🍽️  ONLINE CANTEEN CENTER - SMART CANTEEN SYSTEM`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Mode: ${isProduction ? 'Production' : 'Development with Vite'}`);
    console.log(`⚡ Database: ${DB.isSupabaseConnected() ? 'Supabase (qnfoycxcalvdczhtgpxj.supabase.co)' : 'Supabase Active'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
