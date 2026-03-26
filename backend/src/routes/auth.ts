import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res: Response): Promise<void> => {
    try {
        const { email, name, password, phone } = req.body;

        if (!password || password.length < 8) {
            res.status(400).json({ error: 'Password must be at least 8 characters long' });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword, phone },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token,
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token,
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true, email: true, name: true, role: true,
                phone: true, image: true, medicalHistory: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, phone, medicalHistory } = req.body;
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { name, phone, medicalHistory },
            select: {
                id: true, email: true, name: true, role: true,
                phone: true, image: true, medicalHistory: true,
            },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Google OAuth — upsert user from Google sign-in
router.post('/google', async (req, res: Response): Promise<void> => {
    try {
        const { email, name, image } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, name: name || email.split('@')[0], image },
            });
        } else {
            user = await prisma.user.update({
                where: { email },
                data: {
                    name: name || user.name,
                    image: image || user.image,
                },
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token,
        });
    } catch (error) {
        res.status(500).json({ error: 'Google authentication failed' });
    }
});

export default router;
