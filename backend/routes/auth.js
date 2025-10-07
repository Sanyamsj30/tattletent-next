import { Router } from 'express';
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

const router = Router();

// otp
const otpStore = new Map();
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
    if (user.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    
    // 5 mins
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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


// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    const { otpHash, expiresAt } = storedData;

    // Otp Expire
    if (new Date() > new Date(expiresAt)) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isValidOtp = await bcrypt.compare(otp, otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'OTP incorrect. Please try again.' });
    }

    // --- OTP is valid ---
    // User -> DB
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Citizen', TRUE) RETURNING user_id, name, email, role",
      [name, email, passwordHash]
    );

    otpStore.delete(email);
    
    // JWT
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

// Login
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

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        
        if (!user.password_hash) {
            return res.status(401).json({ message: 'Account was created with a social provider. Please use Google to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = generateToken(user.user_id);
        
        // Resirect
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


// OAUTH
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = generateToken(req.user.user_id);
    res.status(200).json({ token });
});

export default router;