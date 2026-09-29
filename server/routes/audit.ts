import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get audit logs (Admin only)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'operator') {
      return res.status(403).json({ error: 'Unauthorized to view audit logs' });
    }
    const logs = await DB.auditLogs.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
