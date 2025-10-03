import { Router } from 'express';
import pool from '../db/db.js'; // Import your database connection pool
import bcrypt from 'bcryptjs';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = Router();

// --- REGISTER A NEW CITIZEN ---
// Route: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // 1. Destructure the request body
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    // 2. Check if the user already exists in the database
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      // 409 Conflict status code is appropriate here
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insert the new user into the database with the 'Citizen' role
    // The RETURNING * clause gives us back the user data we just inserted
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'Citizen') RETURNING user_id, name, email, role, created_at",
      [name, email, passwordHash]
    );

    const token = generateToken(newUser.rows[0].user_id);
    res.status(201).json({ token });

  } catch (err) {
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

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        // Ensure user has a password (they might have signed up with Google)
        if (!user.rows[0].password_hash) {
            return res.status(401).json({ message: 'You registered with a social provider. Please use that to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT and send it back
        const token = generateToken(user.rows[0].user_id);
        res.status(200).json({ token });

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