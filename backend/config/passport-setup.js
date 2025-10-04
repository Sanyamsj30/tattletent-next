import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/db.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our DB
        const existingUser = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

        if (existingUser.rows.length > 0) {
          // If they exist, pass the user object to the next step
          return done(null, existingUser.rows[0]);
        }

        // If it's a new user, create them in our DB
        const newUser = await pool.query(
          "INSERT INTO users (google_id, name, email, role) VALUES ($1, $2, $3, 'Citizen') RETURNING *",
          [profile.id, profile.displayName, profile.emails[0].value]
        );

        // Pass the new user object to the next step
        done(null, newUser.rows[0]);
      } catch (err) {
        done(err, null);
      }
    }
  )
);