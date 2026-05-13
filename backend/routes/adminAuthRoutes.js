import express from 'express';
import { loginAdmin, validateAdminSession } from '../controllers/adminAuthController.js';
import { adminProtect } from '../middleware/adminProtect.js';

const router = express.Router();

// Admin Login
router.post('/login', loginAdmin);

// Validate Session / Fetch profile
router.get('/session', adminProtect, validateAdminSession);

export default router;
