import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Book appointment (authenticated user)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { doctorId, date, time, symptoms } = req.body;
        const appointment = await prisma.appointment.create({
            data: {
                userId: req.userId!,
                doctorId,
                date: new Date(date),
                time,
                symptoms,
            },
            include: {
                doctor: { include: { user: { select: { name: true } } } },
            },
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Get user's appointments
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId: req.userId },
            include: {
                doctor: { include: { user: { select: { name: true, image: true } } } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Get doctor's appointments
router.get('/doctor', authenticate, requireRole('DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
        if (!doctor) {
            res.status(404).json({ error: 'Doctor profile not found' });
            return;
        }
        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, medicalHistory: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Update appointment status (doctor)
router.patch('/:id/status', authenticate, requireRole('DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const appointment = await prisma.appointment.update({
            where: { id: id as string },
            data: { status, notes },
            include: {
                user: { select: { name: true, email: true } },
                doctor: { include: { user: { select: { name: true } } } },
            },
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Cancel appointment (user)
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.update({
            where: { id: id as string, userId: req.userId },
            data: { status: 'CANCELLED' },
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

export default router;
