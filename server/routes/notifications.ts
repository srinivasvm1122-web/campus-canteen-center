import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get student notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const list = await DB.notifications.getByUserId(req.user!._id);
    const unreadCount = list.filter(n => !n.read).length;
    res.json({
      notifications: list,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await DB.notifications.markAllRead(req.user!._id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// Mark one as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await DB.notifications.markOneRead(req.params.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

export default router;
