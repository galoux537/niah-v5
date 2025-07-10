const express = require('express');
const multer = require('multer');

const router = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de áudio são permitidos'), false);
    }
  }
});

// Rota de teste simples
router.get('/analyze-call/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de análise de chamada funcionando',
    timestamp: new Date().toISOString()
  });
});

// Temporariamente desabilitando as rotas que dependem do OpenAI
// até configurarmos adequadamente

module.exports = router; 