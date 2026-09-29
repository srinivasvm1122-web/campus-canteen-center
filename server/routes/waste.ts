import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get food waste records
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const records = await DB.waste.getAll();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch waste records' });
  }
});

// Record end of day food waste
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { branch, itemId, itemName, preparedQty, soldQty, remainingQty, wastedQty, reason, date } = req.body;
    if (!branch || !itemId || !itemName) {
      return res.status(400).json({ error: 'Branch and item are required' });
    }

    const todayStr = date || new Date().toISOString().split('T')[0];
    const newRecord = await DB.waste.create({
      branch,
      date: todayStr,
      itemId,
      itemName,
      preparedQty: Number(preparedQty) || 0,
      soldQty: Number(soldQty) || 0,
      remainingQty: Number(remainingQty) || 0,
      wastedQty: Number(wastedQty) || 0,
      reason,
    });

    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'FOOD_WASTE_RECORDED',
      target: `${wastedQty} wasted of ${itemName}`,
      metadata: { branch, preparedQty, soldQty, remainingQty, wastedQty }
    });

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record waste' });
  }
});

export default router;
