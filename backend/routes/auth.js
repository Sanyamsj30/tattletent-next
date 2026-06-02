import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import normalizeRole from '../utils/normalizeRole.js';

const router = Router();

// In-memory OTP store (email -> { otpHash, expiresAt })
const otpStore = new Map();
const resetOtpStore = new Map();

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) return res.status(400).json({ message: 'Email is required.' });

    const existingVerified = await User.findOne({ email: normalizedEmail, is_verified: true });
    if (existingVerified) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    otpStore.set(normalizedEmail, { otpHash, expiresAt });

    await sendEmail({
      email: normalizedEmail,
      subject: 'Your Verification Code',
      html: `<h1>Your TattleTent Verification Code is: ${otp}</h1><p>This code will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ message: 'OTP has been sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/send-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: normalizedEmail, is_verified: true }).select('_id');
    if (!user)
      return res.status(404).json({ message: 'No verified account found with this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    resetOtpStore.set(normalizedEmail, { otpHash, expiresAt });

    await sendEmail({
      email: normalizedEmail,
      subject: 'Reset your password (OTP)',
      html: `<h1>Your password reset code is: ${otp}</h1><p>This code will expire in 5 minutes.</p>`,
    });

    return res.status(200).json({ message: 'Reset OTP has been sent to your email.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const user = await User.findOne({ email: normalizedEmail, is_verified: true });
    if (!user)
      return res.status(404).json({ message: 'No verified account found with this email.' });
    if (!user.password_hash) {
      return res
        .status(400)
        .json({ message: 'This account uses Google login. Please sign in with Google.' });
    }

    const stored = resetOtpStore.get(normalizedEmail);
    if (!stored)
      return res
        .status(400)
        .json({ message: 'OTP not found or expired. Please request a new one.' });
    if (new Date() > new Date(stored.expiresAt)) {
      resetOtpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const validOtp = await bcrypt.compare(String(otp), stored.otpHash);
    if (!validOtp) return res.status(400).json({ message: 'OTP incorrect. Please try again.' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.must_change_password = false;
    await user.save();

    resetOtpStore.delete(normalizedEmail);

    return res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!name || !normalizedEmail || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const stored = otpStore.get(normalizedEmail);
    if (!stored)
      return res
        .status(400)
        .json({ message: 'OTP not found or expired. Please request a new one.' });
    if (new Date() > new Date(stored.expiresAt)) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const validOtp = await bcrypt.compare(String(otp), stored.otpHash);
    if (!validOtp) return res.status(400).json({ message: 'OTP incorrect. Please try again.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await User.create({
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'Citizen',
      is_verified: true,
    });

    otpStore.delete(normalizedEmail);

    const token = generateToken(created._id.toString());
    res.status(201).json({
      token,
      user: {
        user_id: created._id.toString(),
        name: created.name,
        email: created.email,
        role: normalizeRole(created.role),
      },
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ message: 'An account with this email already exists.' });
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/admin/create-staff', protect, adminOnly, async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!name || !normalizedEmail)
      return res.status(400).json({ message: 'Name and email are required.' });

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.role === 'Citizen') {
        existingUser.role = 'Staff';
        existingUser.is_verified = true;
        existingUser.must_change_password = true;
        await existingUser.save();

        await sendEmail({
          email: existingUser.email,
          subject: 'Your Staff Account for TattleTent',
          html: `
            <h2>Welcome to TattleTent</h2>
            <p>Dear ${existingUser.name},</p>
            <p>Your role has been upgraded to Staff. Please log in using your existing account credentials.</p>
            <p><b>Login here:</b> https://your-frontend-url.com/login</p>
          `,
        });

        return res.status(200).json({
          message: 'Existing citizen account upgraded to Staff and notified by email.',
          staff: {
            user_id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            must_change_password: existingUser.must_change_password,
          },
        });
      }

      return res
        .status(409)
        .json({ message: `User is already ${existingUser.role}. Cannot upgrade.` });
    }

    const tempPassword = 'Temp@1234';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const createdStaff = await User.create({
      name,
      email: normalizedEmail,
      password_hash: hashedPassword,
      role: 'Staff',
      is_verified: true,
      must_change_password: true,
    });

    await sendEmail({
      email: normalizedEmail,
      subject: 'Your Staff Account for TattleTent',
      html: `
        <h2>Welcome to TattleTent</h2>
        <p>Dear ${name},</p>
        <p>An account has been created for you by the TattleTent admin. Use the credentials below to log in:</p>
        <ul>
          <li><b>Email:</b> ${normalizedEmail}</li>
          <li><b>Temporary Password:</b> ${tempPassword}</li>
        </ul>
        <p>For security reasons, you must change your password after your first login.</p>
        <p><b>Login here:</b> https://your-frontend-url.com/login</p>
      `,
    });

    res.status(201).json({
      message: 'Staff account created successfully and credentials emailed.',
      staff: {
        user_id: createdStaff._id.toString(),
        name: createdStaff.name,
        email: createdStaff.email,
        role: createdStaff.role,
        must_change_password: createdStaff.must_change_password,
      },
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ message: 'An account with this email already exists.' });
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail || !password)
      return res.status(400).json({ message: 'Please enter all fields.' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: 'Please verify your email address before logging in.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({
        message: 'Account was created with a social provider. Please use Google to log in.',
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.must_change_password) {
      const token = generateToken(user._id.toString());
      return res.status(200).json({
        token,
        must_change_password: true,
        message: 'Password change required before continuing.',
        user: {
          user_id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
        },
      });
    }

    const token = generateToken(user._id.toString());
    res.status(200).json({
      token,
      user: {
        user_id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new password.' });
    }

    const user = await User.findById(req.user.user_id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ok = await bcrypt.compare(oldPassword, user.password_hash || '');
    if (!ok) return res.status(401).json({ message: 'Old password is incorrect.' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.must_change_password = false;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully.',
      user: {
        user_id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        must_change_password: user.must_change_password,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id)
      .select('_id name email role created_at')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({
      user: {
        user_id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// OAUTH
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id?.toString?.() || req.user.user_id);
      res.redirect(`${FRONTEND_URL}/auth-success?token=${token}&role=${req.user.role}`);
    } catch (err) {
      console.error(err);
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('_id');
    if (user) return res.status(200).json({ exists: true });
    return res.status(404).json({ exists: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
