import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import passport from 'passport';
import './config/passport-setup.js';
import userRoute from './routes/userRoute.js';
import complaintRoutes from './routes/complaint.routes.js';
import './jobs/escalation.job.js';
import feedbackRoutes from './routes/feedback.routes.js';
import cors from 'cors';
import path from 'path';
import connectMongo from './db/mongo.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use('/public', express.static('public'));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Routes
app.use('/api/users', userRoute);
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Serve images under /temp
app.use('/temp', express.static(path.join(process.cwd(), 'public/temp')));

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`🎪 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

