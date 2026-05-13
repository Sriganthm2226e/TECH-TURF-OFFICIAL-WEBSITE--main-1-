import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-super-secret-key-for-tech-turf';

/**
 * Generate a JWT token for an authenticated admin
 * @param {object} adminPayload - Payload with id and role
 * @returns {string} Signed JWT token
 */
export const generateAdminToken = (adminPayload) => {
    return jwt.sign(
        {
            id: adminPayload.id,
            adminName: adminPayload.adminName,
            gmail: adminPayload.gmail,
            role: adminPayload.role || 'admin',
            isAdmin: true
        },
        ADMIN_JWT_SECRET,
        {
            expiresIn: '24h' // Token expires in 24 hours
        }
    );
};

/**
 * Verify an admin token
 * @param {string} token - The JWT token from authorization header
 * @returns {object|null} Decoded payload or null if invalid/expired
 */
export const verifyAdminToken = (token) => {
    try {
        return jwt.verify(token, ADMIN_JWT_SECRET);
    } catch (error) {
        return null;
    }
};
