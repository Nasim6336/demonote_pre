import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = 'super-secret-key-for-dev';

router.post('/register', async (req, res) => {
  console.log('inside backend register:',req.body)
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    
    const token = jwt.sign({ id: user._id, email, name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true , sameSite: 'none',maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: { id: user._id, email, name } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  console.log('inside login',req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true , sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000});
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),      // Force immediate expiration (Jan 1, 1970)
    secure: true,              // Required for HTTPS/Production
    sameSite: 'none',          // Required for Cross-Site (Vercel -> Render)
    path: '/'                  // Ensure it clears for the whole domain
  });

  return res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
