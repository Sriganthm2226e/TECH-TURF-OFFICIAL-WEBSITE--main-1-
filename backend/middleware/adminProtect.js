import { verifyAdminToken } from '../utils/adminToken.js';

/**
 * Middleware to protect admin endpoints.
 * Verifies the JWT token and checks for the admin role.
 */
export const adminProtect = (req, res, next) => {
    try {
        let token;

        // Check for Bearer token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            // Support token in query parameter for file downloads or easy debugging
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: No token provided. Authorization required.'
            });
        }

        // Verify token
        const decoded = verifyAdminToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: Invalid or expired token.'
            });
        }

        // Verify admin role (must be admin or superadmin)
        const allowedRoles = ['admin', 'superadmin'];
        if (!decoded.role || !allowedRoles.includes(decoded.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Privileged admin role required.'
            });
        }

        // Attach decoded admin user to request object
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('[ADMIN PROTECT MIDDLEWARE ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authorization verification.'
        });
    }
};

/**
 * Optional admin authorization middleware.
 * Attaches admin data to request if valid, but does not block if missing or invalid.
 */
export const optionalAdmin = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = verifyAdminToken(token);
            if (decoded && ['admin', 'superadmin'].includes(decoded.role)) {
                req.admin = decoded;
            }
        }
    } catch (error) {
        // Silently fail as it is optional auth
    }
    next();
};
