import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import normalizeRole from '../utils/normalizeRole.js';

const protect = async (req, res, next) => {
  let token;

  // Token check
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('_id name email role created_at');
      if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });

      req.user = {
        user_id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        created_at: user.created_at,
      };

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
  const role = normalizeRole(req.user?.role);
  if (req.user && (role === 'Admin' || role === 'Ringmaster' || role === 'Groundmaster')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

export { protect, adminOnly };
