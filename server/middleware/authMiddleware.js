const authMiddleware = (req, res, next) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Auth middleware not implemented yet' },
  });
};

module.exports = authMiddleware;
