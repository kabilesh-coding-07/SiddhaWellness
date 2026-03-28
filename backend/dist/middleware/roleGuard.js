"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = roleGuard;
/**
 * Role-based access control middleware.
 * Requires the `authenticate` middleware to run first to populate `req.userRole`.
 *
 * @param allowedRoles - Array of roles that are permitted to access the route.
 * @returns Express middleware that checks the user's role.
 *
 * @example
 * router.get('/admin-only', authenticate, roleGuard(['ADMIN']), handler);
 * router.get('/doctor-area', authenticate, roleGuard(['DOCTOR', 'ADMIN']), handler);
 */
function roleGuard(allowedRoles) {
    return (req, res, next) => {
        if (!req.userRole) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.userRole)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
            });
            return;
        }
        next();
    };
}
exports.default = roleGuard;
//# sourceMappingURL=roleGuard.js.map