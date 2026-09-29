import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { DB } from '../db.ts';
import { IUser } from '../models.ts';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Student Registration
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      studentId,
      email,
      password,
      phone,
      course,
      year,
      studentType,
      academicCategory,
      department,
      semester,
      section,
      hostelBuilding,
      roomNumber
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!studentType || (studentType !== 'Degree' && studentType !== 'Master\'s')) {
      return res.status(400).json({ error: 'Please select a valid Student Type (Degree or Master\'s).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await DB.users.findByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await DB.users.create({
      name: name.trim(),
      studentId: (studentId || '').trim().toUpperCase(),
      email: cleanEmail,
      password: hashedPassword,
      phone: (phone || '').trim(),
      course: (course || 'BCA').trim(),
      year: (year || '1st Year').trim(),
      studentType,
      academicCategory: academicCategory || (course || 'BCA'),
      department: department || 'General',
      semester: semester || '1st Semester',
      section: section || 'A',
      hostelBuilding: hostelBuilding || '',
      roomNumber: roomNumber || '',
      role: 'student',
    });

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPass } = newUser;

    res.status(201).json({
      message: 'Student registration successful!',
      token,
      user: userWithoutPass,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// Login for both Students and Operators
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await DB.users.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    // Role check if logging in via specific portal
    if (expectedRole && user.role !== expectedRole) {
      const isStaffExpected = expectedRole === 'operator';
      const isStaffRole = ['operator', 'kitchen', 'delivery', 'branch_manager', 'admin'].includes(user.role);
      if (!(isStaffExpected && isStaffRole)) {
        return res.status(403).json({
          error: `Access Denied: This account is registered as ${user.role.replace('_', ' ')}. Please select the matching login portal.`
        });
      }
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPass } = user;

    res.json({
      message: 'Login successful!',
      token,
      user: userWithoutPass,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login. Please try again.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { password: _, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { name, phone, course, year, studentType, department, semester, section, hostelBuilding, roomNumber } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (course) updates.course = course.trim();
    if (year) updates.year = year.trim();
    if (studentType && (studentType === 'Degree' || studentType === 'Master\'s')) {
      updates.studentType = studentType;
    }
    if (department !== undefined) updates.department = department.trim();
    if (semester !== undefined) updates.semester = semester.trim();
    if (section !== undefined) updates.section = section.trim();
    if (hostelBuilding !== undefined) updates.hostelBuilding = hostelBuilding.trim();
    if (roomNumber !== undefined) updates.roomNumber = roomNumber.trim();

    const updated = await DB.users.update(req.user._id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...userWithoutPass } = updated;
    res.json({ message: 'Profile updated successfully!', user: userWithoutPass });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Admin: List all users
router.get('/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can view all users' });
    }
    const allUsers = await DB.users.getAll();
    const safeUsers = allUsers.map((u: IUser) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Change user role
router.patch('/users/:id/role', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can change roles' });
    }
    const { role } = req.body;
    const allowed = ['student', 'operator', 'kitchen', 'delivery', 'branch_manager', 'admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    const updated = await DB.users.update(req.params.id, { role });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    await DB.auditLogs.log({
      user: req.user!.email,
      role: req.user!.role,
      action: 'USER_ROLE_CHANGED',
      target: updated.email,
      metadata: { newRole: role }
    });

    const { password, ...safe } = updated;
    res.json({ message: `Role changed to ${role}`, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
