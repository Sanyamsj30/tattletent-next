import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import passport from 'passport';
import './config/passport-setup.js'; // Import the passport config
import complaintRoutes from "./routes/complaint.routes.js"


// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(passport.initialize());
app.use("/public", express.static("public"));


//Routes
app.use("/api/complaints",complaintRoutes);




// Define a base route for authentication
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎪 Server running on port ${PORT}`);
});