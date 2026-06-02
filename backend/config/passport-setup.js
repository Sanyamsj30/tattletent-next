import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

// Google OAuth Strategy (optional in local/dev)
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${process.env.FRONTEND_ORIGIN}/api/auth/google/callback`,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = (profile?.emails?.[0]?.value || '').toLowerCase();
          const googleId = profile.id;

          // Check if user exists by google_id or email
          const existingUser = await User.findOne({
            $or: [{ google_id: googleId }, { email }],
          });

          if (existingUser) {
            // Attach google id if the account existed by email
            if (!existingUser.google_id) {
              existingUser.google_id = googleId;
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          // Create new user
          const newUser = await User.create({
            google_id: googleId,
            name: profile.displayName || 'User',
            email,
            role: 'Citizen',
            is_verified: true,
          });

          done(null, newUser);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    '⚠️ Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable /api/auth/google'
  );
}
