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


// --- LOGIN and GOOGLE OAUTH routes remain unchanged ---
// ... (paste your existing /login and /google routes here)


export default router;