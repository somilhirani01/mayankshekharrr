const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Register not implemented yet' },
  });
});

router.post('/login', (req, res) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Login not implemented yet' },
  });
});

module.exports = router;
