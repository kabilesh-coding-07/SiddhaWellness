"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// List all services
router.get('/', async (_req, res) => {
    try {
        const services = await prisma_1.default.service.findMany();
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const service = await prisma_1.default.service.findUnique({
            where: { id: req.params.id },
        });
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map