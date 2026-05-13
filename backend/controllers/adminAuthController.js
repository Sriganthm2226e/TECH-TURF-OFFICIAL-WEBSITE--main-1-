import bcrypt from 'bcryptjs';
import { findAdminByUsername, findAdminByGmail, findAdminById } from '../models/Admin.js';
import { generateAdminToken } from '../utils/adminToken.js';

/**
 * @desc    Login admin
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
    const { loginType, username, gmail, password } = req.body;
    const db = req.db;

    if (!loginType || (loginType !== 'username' && loginType !== 'gmail')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid login type. Must be either "username" or "gmail".'
        });
    }

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required.'
        });
    }

    try {
        let admin;

        if (loginType === 'username') {
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin username is required.'
                });
            }
            admin = await findAdminByUsername(db, username.trim());
        } else {
            if (!gmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Gmail ID is required.'
                });
            }
            admin = await findAdminByGmail(db, gmail.trim().toLowerCase());
        }

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: Admin account not found.'
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: Incorrect password.'
            });
        }

        const adminData = {
            id: admin.id,
            adminName: admin.adminName,
            gmail: admin.gmail,
            role: admin.role || 'admin',
            createdAt: admin.createdAt
        };

        const token = generateAdminToken(adminData);

        return res.status(200).json({
            success: true,
            token,
            adminData
        });
    } catch (error) {
        console.error('[ADMIN AUTH ERROR] Error during admin login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

/**
 * @desc    Get current admin profile / Validate session
 * @route   GET /api/admin/session
 * @access  Private (Admin)
 */
export const validateAdminSession = async (req, res) => {
    const db = req.db;
    try {
        const admin = await findAdminById(db, req.admin.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found.'
            });
        }

        return res.status(200).json({
            success: true,
            adminData: admin
        });
    } catch (error) {
        console.error('[ADMIN AUTH ERROR] Error validating session:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error validating session.'
        });
    }
};
