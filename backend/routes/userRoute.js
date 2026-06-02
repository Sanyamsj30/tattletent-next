import express from 'express';
import { getUsers } from '../controllers/userControllers.js';
import { protect, staffOrAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, staffOrAdmin, getUsers);

export default router;
