const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';

  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    status = 409;
    code = 'CONFLICT';
    message = 'A record with this value already exists';
  }

  if (status >= 500) {
    console.error({
      code,
      message: err.message,
      stack: err.stack,
    });
    message = 'An unexpected error occurred';
  }

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
};

module.exports = errorHandler;
