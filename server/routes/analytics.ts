import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = Router();

router.get('/', authenticateToken, requireRole('operator'), async (_req: AuthRequest, res: Response) => {
  try {
    const overview = await DB.analytics.getOverview();
    res.json(overview);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch canteen analytics.' });
  }
});

export default router;
