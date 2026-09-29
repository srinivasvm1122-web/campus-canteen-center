import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';
import { orderEvents } from '../events.ts';

const router = Router();

// Public: Get all menu items
router.get('/', async (_req, res: Response) => {
  try {
    const items = await DB.menu.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

// Operator: Add new menu item
router.post('/', authenticateToken, requireRole('operator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image, category, available, isTodaySpecial } = req.body;

    if (!name || price === undefined || Number(price) <= 0) {
      return res.status(400).json({ error: 'Valid food name and positive price are required.' });
    }

    const newItem = await DB.menu.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      category: category || 'Meals',
      available: available !== undefined ? Boolean(available) : true,
      isTodaySpecial: Boolean(isTodaySpecial),
      date: new Date().toISOString().split('T')[0],
    });

    // Broadcast menu update to students
    orderEvents.broadcast('menu_updated', newItem);

    res.status(201).json({ message: 'Menu item added successfully!', item: newItem });
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(500).json({ error: 'Failed to add menu item.' });
  }
});

// Operator: Update menu item
router.put('/:id', authenticateToken, requireRole('operator'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, available, isTodaySpecial } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (image !== undefined) updates.image = image;
    if (category !== undefined) updates.category = category;
    if (available !== undefined) updates.available = Boolean(available);
    if (isTodaySpecial !== undefined) updates.isTodaySpecial = Boolean(isTodaySpecial);

    const updated = await DB.menu.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    orderEvents.broadcast('menu_updated', updated);

    res.json({ message: 'Menu item updated successfully!', item: updated });
  } catch (err) {
    console.error('Update menu error:', err);
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

// Operator: Delete menu item
router.delete('/:id', authenticateToken, requireRole('operator'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await DB.menu.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    orderEvents.broadcast('menu_deleted', { id });
    res.json({ message: 'Menu item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

export default router;
