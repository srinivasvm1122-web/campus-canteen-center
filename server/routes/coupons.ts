import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all coupons (Public / active ones or admin)
router.get('/', async (_req, res: Response) => {
  try {
    const coupons = await DB.coupons.getAll();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Validate coupon during checkout
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code required' });
    }
    const result = await DB.coupons.validate(code, Number(orderTotal) || 0, req.user?.course);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Admin: Create or update coupon
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create coupons' });
    }
    const coupon = await DB.coupons.create(req.body);
    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'COUPON_CREATED_OR_UPDATED',
      target: coupon.code,
      metadata: req.body,
    });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save coupon' });
  }
});

export default router;
