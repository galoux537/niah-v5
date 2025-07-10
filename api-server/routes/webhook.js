const express = require('express');

const router = express.Router();

// Rota de teste do webhook
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;