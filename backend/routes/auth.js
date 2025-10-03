import { Router } from 'express';
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

const router = Router();

// In-memory store for OTPs. A Map is used for efficient lookups and deletions.
// It will store data like: { 'user@email.com' => { otpHash: '...', expiresAt: ... } }
const otpStore = new Map();


// --- STEP 1: SEND OTP FOR EMAIL VERIFICATION ---
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
    if (user.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    
    // Set OTP expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Store the OTP hash and expiry in our in-memory map
    otpStore.set(email, { otpHash, expiresAt });

    await sendEmail({
      email: email,
      subject: 'Your Verification Code',
      html: `<h1>Your TattleTent Verification Code is: ${otp}</h1><p>This code will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ message: 'OTP has been sent to your email.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- STEP 2: REGISTER USER AFTER OTP VERIFICATION ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Retrieve the OTP data from our in-memory store
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    const { otpHash, expiresAt } = storedData;

    // Check if OTP has expired
    if (new Date() > new Date(expiresAt)) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Compare the provided OTP with the stored hash
    const isValidOtp = await bcrypt.compare(otp, otpHash);
    if (!isValidOtp) {
      // Allow user to re-enter without requesting a new OTP
      return res.status(400).json({ message: 'OTP incorrect. Please try again.' });
    }

    // --- OTP is valid ---
    // 1. Create the user in the database
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Citizen', TRUE) RETURNING user_id, name, email, role",
      [name, email, passwordHash]
    );

    // 2. IMPORTANT: Clean up the used OTP from the store to prevent reuse
    otpStore.delete(email);
    
    // 3. Generate JWT and log the user in
    const token = generateToken(newUser.rows[0].user_id);
    res.status(201).json({ token });

  } catch (err) {
    if (err.code === '23505') { 
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- LOGIN A USER ---
// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const user = userResult.rows[0];

        // Check if user is verified (for email/password signups)
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        
        // Ensure user has a password (they might have signed up with Google)
        if (!user.password_hash) {
            return res.status(401).json({ message: 'Account was created with a social provider. Please use Google to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = generateToken(user.user_id);
        
        // --- KEY CHANGE ---
        // Respond with the token AND the user's details (excluding password)
        // The frontend will use the 'role' for redirection.
        res.status(200).json({ 
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- GOOGLE OAUTH ROUTES ---

// 1. Route to start the Google OAuth flow
// Route: GET /api/auth/google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// 2. Callback route that Google redirects to
// Route: GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // req.user is attached by passport after successful authentication
    const token = generateToken(req.user.user_id);
    
    // On a real project, you would redirect to your frontend application
    // Example: res.redirect(`http://yourfrontend.com/auth-success?token=${token}`);
    
    // For now, we'll just send the token as a response
    res.status(200).json({ token });
});

export default router;