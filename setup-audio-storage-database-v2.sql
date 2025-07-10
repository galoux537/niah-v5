-- ====================================================================
-- SISTEMA DE ARMAZENAMENTO DE ÁUDIOS NO BANCO - NIAH! v2.0
-- ====================================================================
-- Script corrigido sem erros de sintaxe
-- Execute no SQL Editor do Supabase

-- 1. Adicionar colunas para armazenar áudio na tabela calls
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_data') THEN
    ALTER TABLE calls ADD COLUMN audio_data BYTEA;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_content_type') THEN
    ALTER TABLE calls ADD COLUMN audio_content_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_size') THEN
    ALTER TABLE calls ADD COLUMN audio_size BIGINT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_original_name') THEN
    ALTER TABLE calls ADD COLUMN audio_original_name TEXT;
  END IF;
END $$;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_calls_audio_data ON calls(id) WHERE audio_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calls_audio_content_type ON calls(audio_content_type) WHERE audio_content_type IS NOT NULL;

-- 3. Verificar estrutura da tabela calls (novos campos de áudio)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'calls' 
  AND column_name IN ('id', 'file_name', 'audio_data', 'audio_content_type', 'audio_size', 'audio_original_name')
ORDER BY column_name;

-- 4. Função para servir áudio por ID (será usada pela API)
CREATE OR REPLACE FUNCTION get_audio_by_call_id(call_id_param UUID)
RETURNS TABLE(
  audio_data BYTEA,
  content_type TEXT,
  file_size BIGINT,
  original_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.audio_data,
    c.audio_content_type,
    c.audio_size,
    c.audio_original_name
  FROM calls c
  WHERE c.id = call_id_param
    AND c.audio_data IS NOT NULL;
END;
$$;

-- 5. Função para converter áudio para Base64 (para uso no front-end)
CREATE OR REPLACE FUNCTION get_audio_as_base64(call_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audio_b64 TEXT;
  content_type TEXT;
BEGIN
  SELECT 
    encode(audio_data, 'base64'),
    audio_content_type
  INTO audio_b64, content_type
  FROM calls
  WHERE id = call_id_param
    AND audio_data IS NOT NULL;
    
  IF audio_b64 IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retornar no formato data URL
  RETURN 'data:' || content_type || ';base64,' || audio_b64;
END;
$$;

-- 6. Função para obter informações do áudio sem os dados
CREATE OR REPLACE FUNCTION get_audio_info(call_id_param UUID)
RETURNS TABLE(
  has_audio BOOLEAN,
  content_type TEXT,
  size_mb NUMERIC,
  original_name TEXT,
  data_url_preview TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (audio_data IS NOT NULL) as has_audio,
    audio_content_type,
    ROUND(audio_size::numeric / 1024 / 1024, 2) as size_mb,
    audio_original_name,
    CASE 
      WHEN audio_data IS NOT NULL THEN 
        'data:' || audio_content_type || ';base64,[' || LENGTH(encode(audio_data, 'base64'))::text || ' chars]'
      ELSE NULL
    END as data_url_preview
  FROM calls
  WHERE id = call_id_param;
END;
$$;

-- 7. Função para validar tamanho de arquivo antes de inserir
CREATE OR REPLACE FUNCTION validate_audio_size()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas processar se há dados de áudio
  IF NEW.audio_data IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Limite de 100MB (104,857,600 bytes)
  IF NEW.audio_size > 104857600 THEN
    RAISE EXCEPTION 'Arquivo de áudio muito grande. Máximo permitido: 100MB';
  END IF;
  
  -- Validar tipos de arquivo permitidos
  IF NEW.audio_content_type NOT IN ('audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a') THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido: %. Tipos aceitos: MP3, WAV, OGG, M4A', NEW.audio_content_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para validação
DROP TRIGGER IF EXISTS trigger_validate_audio_size ON calls;
CREATE TRIGGER trigger_validate_audio_size
  BEFORE INSERT OR UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION validate_audio_size();

-- 9. Configurar RLS (Row Level Security)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- 10. Criar política de segurança (removendo se existir)
DROP POLICY IF EXISTS "Usuarios podem ler audios da propria empresa" ON calls;
CREATE POLICY "Usuarios podem ler audios da propria empresa" ON calls
  FOR SELECT USING (
    auth.jwt() ->> 'company_id' = company_id::text
  );

-- ====================================================================
-- ESTATÍSTICAS E VERIFICAÇÃO
-- ====================================================================

-- 11. Mostrar estatísticas atuais
SELECT 
  COUNT(*) as total_calls,
  COUNT(file_name) as calls_with_filename,
  COUNT(audio_data) as calls_with_audio_stored,
  COUNT(CASE WHEN file_name IS NOT NULL AND audio_data IS NULL THEN 1 END) as pending_audio_storage,
  COALESCE(ROUND(AVG(audio_size)::numeric / 1024 / 1024, 2), 0) as avg_audio_size_mb,
  COALESCE(ROUND(SUM(audio_size)::numeric / 1024 / 1024, 2), 0) as total_audio_size_mb
FROM calls;

-- 12. Mostrar chamadas recentes
SELECT 
  id,
  file_name,
  audio_original_name,
  audio_content_type,
  COALESCE(ROUND(audio_size::numeric / 1024 / 1024, 2), 0) as size_mb,
  created_at,
  CASE 
    WHEN audio_data IS NOT NULL THEN '✅ Áudio armazenado'
    WHEN file_name IS NOT NULL THEN '⚠️ Pendente upload'
    ELSE '❌ Sem dados de arquivo'
  END as status_audio
FROM calls 
ORDER BY created_at DESC
LIMIT 5;

-- 13. Relatório final de configuração
SELECT 
  'Configuração' as item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_data') 
    THEN '✅ Colunas de áudio criadas'
    ELSE '❌ Colunas de áudio não encontradas'
  END as status

UNION ALL

SELECT 
  'Triggers',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_validate_audio_size')
    THEN '✅ Validação de áudio ativa'
    ELSE '❌ Trigger de validação não configurado'
  END

UNION ALL

SELECT 
  'Funções',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_audio_by_call_id')
    THEN '✅ Funções de áudio disponíveis'
    ELSE '❌ Funções de áudio não criadas'
  END

UNION ALL

SELECT 
  'RLS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calls' AND policyname = 'Usuarios podem ler audios da propria empresa')
    THEN '✅ Políticas de segurança configuradas'
    ELSE '⚠️ Configurar políticas de segurança'
  END

UNION ALL

SELECT 
  'Dados',
  COUNT(*)::text || ' chamadas no banco, ' || 
  COUNT(CASE WHEN audio_data IS NOT NULL THEN 1 END)::text || ' com áudio'
FROM calls;

-- ====================================================================
-- EXEMPLO DE TESTE
-- ====================================================================

-- 14. Teste das funções (descomente para testar)
/*
-- Exemplo de como seria usado:

-- Buscar informações de uma ligação específica
SELECT * FROM get_audio_info('your-call-id-here');

-- Verificar se uma ligação tem áudio
SELECT 
  id, 
  file_name,
  CASE 
    WHEN audio_data IS NOT NULL THEN 'Tem áudio'
    ELSE 'Sem áudio'
  END as status
FROM calls 
LIMIT 3;
*/

-- ====================================================================
-- FINALIZAÇÃO
-- ====================================================================

SELECT '🎵 Sistema de áudio no banco configurado com sucesso!' as resultado; 