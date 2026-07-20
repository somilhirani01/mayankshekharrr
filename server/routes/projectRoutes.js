const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Projects list not implemented yet' },
  });
});

module.exports = router;
