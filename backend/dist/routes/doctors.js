"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// List all doctors (public)
router.get('/', async (_req, res) => {
    try {
        const doctors = await prisma_1.default.doctor.findMany({
            include: { user: { select: { name: true, email: true, image: true } } },
        });
        res.json(doctors);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});
// Get doctor profile (for logged-in doctor) — MUST be before /:id
router.get('/me/profile', auth_1.authenticate, (0, auth_1.requireRole)('DOCTOR'), async (req, res) => {
    try {
        const doctor = await prisma_1.default.doctor.findUnique({
            where: { userId: req.userId },
            include: { user: { select: { name: true, email: true, image: true, phone: true } } },
        });
        if (!doctor) {
            res.status(404).json({ error: 'Doctor profile not found' });
            return;
        }
        res.json(doctor);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
// Get doctor by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const doctor = await prisma_1.default.doctor.findUnique({
            where: { id: req.params.id },
            include: { user: { select: { name: true, email: true, image: true } } },
        });
        if (!doctor) {
            res.status(404).json({ error: 'Doctor not found' });
            return;
        }
        res.json(doctor);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});
// Update availability (doctor only)
router.put('/availability', auth_1.authenticate, (0, auth_1.requireRole)('DOCTOR'), async (req, res) => {
    try {
        const { availability } = req.body;
        const doctor = await prisma_1.default.doctor.update({
            where: { userId: req.userId },
            data: { availability },
        });
        res.json(doctor);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update availability' });
    }
});
exports.default = router;
//# sourceMappingURL=doctors.js.map