"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const doctors_1 = __importDefault(require("./routes/doctors"));
const blogs_1 = __importDefault(require("./routes/blogs"));
const services_1 = __importDefault(require("./routes/services"));
const contact_1 = __importDefault(require("./routes/contact"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/appointments', appointments_1.default);
app.use('/api/doctors', doctors_1.default);
app.use('/api/blogs', blogs_1.default);
app.use('/api/services', services_1.default);
app.use('/api/contact', contact_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🌿 SiddhaWellness API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map