"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Book appointment (authenticated user)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { doctorId, date, time, symptoms } = req.body;
        const appointment = await prisma_1.default.appointment.create({
            data: {
                userId: req.userId,
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});
// Get user's appointments
router.get('/my', auth_1.authenticate, async (req, res) => {
    try {
        const appointments = await prisma_1.default.appointment.findMany({
            where: { userId: req.userId },
            include: {
                doctor: { include: { user: { select: { name: true, image: true } } } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});
// Get doctor's appointments
router.get('/doctor', auth_1.authenticate, (0, auth_1.requireRole)('DOCTOR'), async (req, res) => {
    try {
        const doctor = await prisma_1.default.doctor.findUnique({ where: { userId: req.userId } });
        if (!doctor) {
            res.status(404).json({ error: 'Doctor profile not found' });
            return;
        }
        const appointments = await prisma_1.default.appointment.findMany({
            where: { doctorId: doctor.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, medicalHistory: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});
// Update appointment status (doctor)
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.requireRole)('DOCTOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const appointment = await prisma_1.default.appointment.update({
            where: { id: id },
            data: { status, notes },
            include: {
                user: { select: { name: true, email: true } },
                doctor: { include: { user: { select: { name: true } } } },
            },
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});
// Cancel appointment (user)
router.patch('/:id/cancel', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma_1.default.appointment.update({
            where: { id: id, userId: req.userId },
            data: { status: 'CANCELLED' },
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map