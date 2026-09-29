import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all courses (Public)
router.get('/courses', async (_req, res: Response) => {
  try {
    const courses = await DB.courses.getAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Admin: Add new course
router.post('/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add courses' });
    }
    const { code, name, type, department } = req.body;
    if (!code || !name || !type || !department) {
      return res.status(400).json({ error: 'Missing course details' });
    }
    const newCourse = await DB.courses.create({ code, name, type, department });
    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'COURSE_CREATED',
      target: `${code} - ${name}`,
      metadata: { type, department }
    });
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Admin: Delete course
router.delete('/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete courses' });
    }
    const success = await DB.courses.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Course not found' });
    }
    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'COURSE_DELETED',
      target: req.params.id,
    });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
