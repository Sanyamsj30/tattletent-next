import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

const protect = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header (it's in the format "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the database using the id from the token
      // We select everything EXCEPT the password hash for security
      const userResult = await pool.query(
        'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1',
        [decoded.id]
      );
      
      if (userResult.rows.length === 0) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 4. Attach the user object to the request for future use
      req.user = userResult.rows[0];

      // 5. Move on to the next step (the actual route handler)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Restrict access to admin users only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

export { protect, adminOnly };