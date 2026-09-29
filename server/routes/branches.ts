import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all branches
router.get('/', async (_req, res: Response) => {
  try {
    const branches = await DB.branches.getAll();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Update branch status (Admin or Branch Manager)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    if (role !== 'admin' && role !== 'branch_manager' && role !== 'operator') {
      return res.status(403).json({ error: 'Unauthorized to update branch settings' });
    }
    const updated = await DB.branches.updateStatus(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'BRANCH_STATUS_UPDATED',
      target: updated.name,
      metadata: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

export default router;
