import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import passport from 'passport';
import './config/passport-setup.js'; // Import the passport config
import userRoute from "./routes/userRoute.js";
import complaintRoutes from "./routes/complaint.routes.js";
import "./jobs/escalation.job.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import cors from 'cors';


// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(passport.initialize());
app.use("/public", express.static("public"));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());


//Routes
app.use("/api/users",userRoute);
app.use("/api/complaints",complaintRoutes);
app.use("/api/feedback", feedbackRoutes);



// Define a base route for authentication
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎪 Server running on port ${PORT}`);
});