const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500, 'SERVER_ERROR');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  const user = await User.findById(payload.id).select('-passwordHash');
  if (!user) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
