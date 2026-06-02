import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import passport from 'passport';
import './config/passport-setup.js';
import userRoutes from './routes/user.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import './jobs/escalation.job.js';
import feedbackRoutes from './routes/feedback.routes.js';
import publicRoutes from './routes/public.js';
import aiRoutes from './routes/ai.routes.js';
import jobRoutes from './routes/job.routes.js';
import cors from 'cors';
import path from 'path';
import connectMongo from './db/mongo.js';
import { createDefaultAdmin } from './utils/createAdmindefault.js';

import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use('/public', express.static('public'));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authAndAiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 sensitive requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Routes
app.use('/api/users', globalLimiter, userRoutes);
app.use('/api/complaints', globalLimiter, complaintRoutes);
app.use('/api/feedback', globalLimiter, feedbackRoutes);
app.use('/api/auth', authAndAiLimiter, authRoutes);
app.use('/api/public', globalLimiter, publicRoutes);
app.use('/api/ai', authAndAiLimiter, aiRoutes);
app.use('/api/jobs', globalLimiter, jobRoutes);

// Serve images under /temp
app.use('/temp', express.static(path.join(process.cwd(), 'public/temp')));

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectMongo();
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🎪 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
