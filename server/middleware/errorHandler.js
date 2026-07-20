const errorHandler = (err, req, res, next) => {
  console.error({
    code: err.code || 'SERVER_ERROR',
    message: err.message,
    stack: err.stack,
  });

  const status = err.statusCode || 500;
  const code = err.code || 'SERVER_ERROR';
  const message =
    status === 500 ? 'An unexpected error occurred' : err.message;

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
};

module.exports = errorHandler;
