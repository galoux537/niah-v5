const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const analyzeCallRouter = require('./routes/analyzeCall');
const webhookRouter = require('./routes/webhook');
const batchAnalysisRouter = require('./routes/batchAnalysis');
const { router: authRouter } = require('./routes/auth');
const webhookStorageRouter = require('./routes/webhookStorage');

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS robusta
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: Postman, apps mobile)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:5174', // Vite sometimes uses this port
      'http://127.0.0.1:5174'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origin não permitida: ${origin}`);
      callback(null, true); // Permitir temporariamente para debug
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-company-id', 
    'Origin', 
    'X-Requested-With', 
    'Accept',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Para suporte a browsers legados
  preflightContinue: false
}));

// Middleware adicional para CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-company-id,Origin,X-Requested-With,Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Log de requests para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'undefined'}`);
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS Preflight request');
  }
  if (req.headers.authorization) {
    console.log('🔐 Auth header presente');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de áudio são permitidos'), false);
    }
  }
});

// Middleware para parsing de multipart/form-data
app.use('/api/v1/analyze-call', upload.single('audio'));

// 🔐 ROTAS DE AUTENTICAÇÃO JWT
app.use('/api/v1/auth', authRouter);

// 📡 ROTAS DA API
app.use('/api/v1', analyzeCallRouter);
app.use('/api/v1', batchAnalysisRouter);
app.use('/api/v1/webhook', webhookRouter);
app.use('/api/v1/storage', webhookStorageRouter);
app.use('/api/v1/audio', require('./routes/audioStream'));

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NIAH Call Analysis API'
  });
});

// Rota de documentação
app.get('/api/v1/docs', (req, res) => {
  res.json({
    name: 'NIAH Call Analysis API',
    version: '2.0.0',
    description: 'API para análise automatizada de ligações usando IA com suporte a processamento em lote',
    endpoints: {
      'POST /api/v1/analyze-call': {
        description: 'Analisa uma ligação individual usando critérios específicos',
        parameters: {
          audio: 'Arquivo de áudio (.mp3, .wav)',
          criteria: 'JSON com critérios de avaliação',
          webhook_url: 'URL para receber o resultado',
          company_id: 'ID da empresa (header x-company-id)'
        }
      },
      'POST /api/v1/analyze-batch': {
        description: 'Inicia análise em lote de múltiplas ligações (sem limite de quantidade)',
        parameters: {
          audioFiles: 'Array de arquivos de áudio (.mp3, .wav, máx 25MB cada)',
          criteria: 'JSON com critérios de avaliação aplicados a todas as ligações',
          callbackUrl: 'URL para receber notificações em tempo real',
          'metadata_X': 'Metadata específica do arquivo X (JSON)',
          'campaign_X': 'Nome da campanha para o arquivo X',
          'agent_X': 'Nome do agente para o arquivo X'
        },
        response: {
          jobId: 'ID único do lote para acompanhamento',
          status: 'accepted | processing | completed | failed',
          estimatedTimeMinutes: 'Tempo estimado de processamento'
        }
      },
      'GET /api/v1/analyze-batch?jobId={id}': {
        description: 'Consulta status e progresso de um lote específico',
        parameters: {
          jobId: 'ID do lote retornado no POST'
        },
        response: {
          progress: 'Progresso atual (porcentagem, atual/total)',
          estimatedTimeRemaining: 'Tempo estimado restante em minutos',
          partialMetrics: 'Métricas parciais das ligações já processadas',
          metricsSummary: 'Métricas finais (quando completo)',
          calls: 'Status individual de cada ligação'
        }
      },
      'GET /api/v1/batch-jobs': {
        description: 'Lista todos os lotes de análise',
        response: {
          jobs: 'Array com resumo de todos os jobs ordenados por data'
        }
      },
      'POST /api/v1/webhook/result': {
        description: 'Endpoint para receber resultados de análise individual',
        parameters: {
          analysis_id: 'ID da análise',
          result: 'Resultado da análise em JSON'
        }
      }
    },
    batchAnalysis: {
      description: 'Sistema de Análise em Lote - CallAnalyzer API',
      features: [
        'Processamento assíncrono de até 50 ligações por lote',
        'Notificações em tempo real via webhooks',
        'Métricas inteligentes consolidadas',
        'Organização por campanha, agente e cliente',
        'Recuperação de falhas e timeouts',
        'Análise comparativa e ranking de performance'
      ],
      webhookEvents: [
        'job_started - Lote iniciado',
        'call_started - Ligação individual iniciada',
        'call_transcription_completed - Transcrição finalizada',
        'call_completed - Análise de ligação finalizada',
        'call_error - Erro em ligação específica',
        'job_completed - Lote finalizado com métricas',
        'job_failed - Falha no processamento do lote'
      ]
    }
  });
});

// Endpoint de debug removido por segurança

// Middleware de tratamento de erro
app.use((error, req, res, next) => {
  console.error('❌ ERRO NA API:', error);
  console.error('❌ Stack trace:', error.stack);
  console.error('❌ Tipo do erro:', error.constructor.name);
  
  if (error instanceof multer.MulterError) {
    console.error('❌ MULTER ERROR:', error.code, error.message);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'LIMIT_FILE_SIZE',
        message: 'O arquivo de áudio deve ter no máximo 25MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'LIMIT_FILE_COUNT',
        message: 'Limite de arquivos do sistema ultrapassado'
      });
    }
    return res.status(400).json({
      error: 'MULTER_ERROR',
      message: error.message,
      code: error.code
    });
  }

  if (error.message.includes('Apenas arquivos')) {
    console.error('❌ TIPO DE ARQUIVO INVÁLIDO:', error.message);
    return res.status(400).json({
      error: 'INVALID_FILE_TYPE',
      message: error.message
    });
  }

  console.error('❌ ERRO GENÉRICO:', error.message);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor NIAH Call Analysis API rodando na porta ${PORT}`);
  console.log(`📖 Documentação disponível em http://localhost:${PORT}/api/v1/docs`);
  console.log(`❤️  Health check em http://localhost:${PORT}/health`);
}); 