"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ error: 'Name, email, and message are required' });
            return;
        }
        await prisma_1.default.contactMessage.create({
            data: { name, email, phone, subject, message },
        });
        console.log('📩 Contact form saved:', { name, email, subject });
        res.status(200).json({
            success: true,
            message: 'Thank you for your message. We will get back to you within 24 hours.',
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map