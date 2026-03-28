import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
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
export declare function roleGuard(allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export default roleGuard;
//# sourceMappingURL=roleGuard.d.ts.map