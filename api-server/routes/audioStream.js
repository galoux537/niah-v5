const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE4MzQ0NiwiZXhwIjoyMDY1NzU5NDQ2fQ.HXm8vNfJuWkFpxO7wjGYKEKNGOYI98Qqc-PshAUkJm8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 🎵 GET /api/v1/audio/:callId - Servir áudio por ID da ligação
router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    console.log(`🎵 Solicitando áudio para ligação: ${callId}`);
    
    // Verificar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(callId)) {
      return res.status(400).json({
        error: 'ID da ligação inválido',
        message: 'O ID deve ser um UUID válido'
      });
    }
    
    // Buscar dados do áudio no banco
    const { data: audioData, error } = await supabase
      .rpc('get_audio_by_call_id', { 
        call_id_param: callId 
      });
    
    if (error) {
      console.error('❌ Erro ao buscar áudio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o áudio'
      });
    }
    
    if (!audioData || audioData.length === 0) {
      console.log(`📭 Áudio não encontrado para ligação: ${callId}`);
      return res.status(404).json({
        error: 'Áudio não encontrado',
        message: 'Esta ligação não possui áudio armazenado'
      });
    }
    
    const audio = audioData[0];
    
    // Verificar se os dados do áudio estão disponíveis
    if (!audio.audio_data) {
      return res.status(404).json({
        error: 'Dados do áudio não disponíveis',
        message: 'O áudio existe mas os dados não puderam ser recuperados'
      });
    }
    
    console.log(`✅ Áudio encontrado: ${audio.original_name} (${audio.content_type}, ${Math.round(audio.file_size / 1024)}KB)`);
    
    // Configurar headers para streaming de áudio
    res.set({
      'Content-Type': audio.content_type || 'audio/mpeg',
      'Content-Length': audio.file_size,
      'Content-Disposition': `inline; filename="${audio.original_name || 'audio.mp3'}"`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type'
    });
    
    // Suporte para Range requests (importante para players de áudio)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : audio.file_size - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206); // Partial Content
      res.set({
        'Content-Range': `bytes ${start}-${end}/${audio.file_size}`,
        'Content-Length': chunksize
      });
      
      // Enviar apenas a parte solicitada
      const audioBuffer = Buffer.from(audio.audio_data);
      const chunk = audioBuffer.slice(start, end + 1);
      res.end(chunk);
    } else {
      // Enviar áudio completo
      const audioBuffer = Buffer.from(audio.audio_data);
      res.end(audioBuffer);
    }
    
  } catch (err) {
    console.error('💥 Erro inesperado ao servir áudio:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro inesperado ao processar solicitação de áudio'
    });
  }
});

// 🎵 GET /api/v1/audio/:callId/info - Obter informações do áudio sem baixar
router.get('/:callId/info', async (req, res) => {
  try {
    const { callId } = req.params;
    
    console.log(`ℹ️ Solicitando informações de áudio para: ${callId}`);
    
    // Verificar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(callId)) {
      return res.status(400).json({
        error: 'ID da ligação inválido'
      });
    }
    
    // Buscar informações do áudio
    const { data: audioInfo, error } = await supabase
      .rpc('get_audio_info', { 
        call_id_param: callId 
      });
    
    if (error) {
      console.error('❌ Erro ao buscar informações do áudio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
    
    if (!audioInfo || audioInfo.length === 0) {
      return res.status(404).json({
        error: 'Ligação não encontrada'
      });
    }
    
    const info = audioInfo[0];
    
    res.json({
      has_audio: info.has_audio,
      content_type: info.content_type,
      size_mb: info.size_mb,
      original_name: info.original_name,
      audio_url: info.has_audio ? `/api/v1/audio/${callId}` : null,
      data_url_preview: info.data_url_preview
    });
    
  } catch (err) {
    console.error('💥 Erro ao obter informações do áudio:', err);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// 🎵 GET /api/v1/audio/:callId/base64 - Obter áudio como Data URL (para uso direto no front-end)
router.get('/:callId/base64', async (req, res) => {
  try {
    const { callId } = req.params;
    
    console.log(`📄 Solicitando áudio como Base64 para: ${callId}`);
    
    // Verificar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(callId)) {
      return res.status(400).json({
        error: 'ID da ligação inválido'
      });
    }
    
    // Buscar áudio como Base64
    const { data: base64Data, error } = await supabase
      .rpc('get_audio_as_base64', { 
        call_id_param: callId 
      });
    
    if (error) {
      console.error('❌ Erro ao converter áudio para Base64:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
    
    if (!base64Data) {
      return res.status(404).json({
        error: 'Áudio não encontrado'
      });
    }
    
    res.json({
      data_url: base64Data,
      ready_to_use: true
    });
    
  } catch (err) {
    console.error('💥 Erro ao obter áudio como Base64:', err);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 