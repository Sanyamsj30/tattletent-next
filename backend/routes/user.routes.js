import express from 'express';
import { getUsers } from '../controllers/user.controllers.js';
import { protect, staffOrAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/search', protect, staffOrAdmin, getUsers);

export default router;
