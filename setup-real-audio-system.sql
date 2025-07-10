-- ====================================================================
-- CONFIGURAÇÃO DO SISTEMA DE ÁUDIOS REAIS - NIAH!
-- ====================================================================
-- Este script configura o banco para armazenar URLs de áudios reais das ligações
-- Execute no SQL Editor do Supabase

-- 1. Verificar/Adicionar coluna audio_url na tabela calls
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_calls_audio_url ON calls(audio_url) WHERE audio_url IS NOT NULL;

-- 3. Verificar estrutura da tabela calls
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'calls' 
  AND column_name IN ('id', 'file_name', 'audio_url', 'batch_id')
ORDER BY column_name;

-- 4. Estatísticas atuais
SELECT 
  COUNT(*) as total_calls,
  COUNT(file_name) as calls_with_filename,
  COUNT(audio_url) as calls_with_audio_url,
  COUNT(CASE WHEN file_name IS NOT NULL AND audio_url IS NULL THEN 1 END) as pending_audio_setup
FROM calls;

-- 5. Mostrar chamadas que precisam de configuração de áudio
SELECT 
  id,
  file_name,
  batch_id,
  created_at,
  CASE 
    WHEN audio_url IS NOT NULL THEN '✅ Áudio configurado'
    WHEN file_name IS NOT NULL THEN '⚠️ Pendente configuração'
    ELSE '❌ Sem dados de arquivo'
  END as status_audio
FROM calls 
ORDER BY created_at DESC
LIMIT 10;

-- ====================================================================
-- CONFIGURAÇÃO PARA SEU SISTEMA DE ARMAZENAMENTO
-- ====================================================================

-- OPÇÃO 1: Se você tem uma URL base fixa para todos os áudios
-- Descomente e modifique as linhas abaixo com sua URL real:

-- UPDATE calls 
-- SET audio_url = 'https://your-domain.com/call-recordings/' || file_name
-- WHERE file_name IS NOT NULL AND audio_url IS NULL;

-- OPÇÃO 2: Se os áudios estão organizados por batch_id
-- Descomente e modifique as linhas abaixo:

-- UPDATE calls 
-- SET audio_url = 'https://your-domain.com/recordings/' || batch_id || '/' || file_name
-- WHERE batch_id IS NOT NULL AND file_name IS NOT NULL AND audio_url IS NULL;

-- OPÇÃO 3: Se você usa AWS S3 ou similar
-- Descomente e modifique as linhas abaixo:

-- UPDATE calls 
-- SET audio_url = 'https://your-bucket.s3.region.amazonaws.com/call-recordings/' || file_name || '.mp3'
-- WHERE file_name IS NOT NULL AND audio_url IS NULL;

-- ====================================================================
-- FUNÇÃO PARA GERAR URLs AUTOMATICAMENTE (OPCIONAL)
-- ====================================================================

-- Criar função para gerar audio_url automaticamente quando inserir nova call
CREATE OR REPLACE FUNCTION generate_audio_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Se file_name foi preenchido mas audio_url não, gerar automaticamente
  IF NEW.file_name IS NOT NULL AND NEW.audio_url IS NULL THEN
    -- Modifique esta linha com sua URL base real:
    NEW.audio_url := 'https://your-domain.com/call-recordings/' || NEW.file_name || '.mp3';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função automaticamente
DROP TRIGGER IF EXISTS trigger_generate_audio_url ON calls;
CREATE TRIGGER trigger_generate_audio_url
  BEFORE INSERT OR UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION generate_audio_url();

-- ====================================================================
-- VALIDAÇÃO E LOGS
-- ====================================================================

-- Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_generate_audio_url';

-- Relatório final
SELECT 
  'Configuração' as item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'audio_url') 
    THEN '✅ Coluna audio_url existe'
    ELSE '❌ Coluna audio_url não encontrada'
  END as status

UNION ALL

SELECT 
  'Trigger',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_generate_audio_url')
    THEN '✅ Trigger ativo para URLs automáticas'
    ELSE '❌ Trigger não configurado'
  END

UNION ALL

SELECT 
  'Dados',
  COUNT(*)::text || ' chamadas no banco'
FROM calls;

-- ====================================================================
-- EXEMPLO DE INSERÇÃO COM ÁUDIO AUTOMÁTICO
-- ====================================================================

-- Teste a função automática inserindo uma chamada de exemplo:
-- INSERT INTO calls (
--   company_id, 
--   evaluation_list_id, 
--   file_name, 
--   overall_score,
--   status
-- ) VALUES (
--   'sua-company-id',
--   'sua-evaluation-list-id',
--   'exemplo-audio-123',
--   8.5,
--   'completed'
-- );

-- Verificar se a URL foi gerada automaticamente:
-- SELECT id, file_name, audio_url FROM calls WHERE file_name = 'exemplo-audio-123';

-- ====================================================================\n-- SISTEMA COMPLETO DE ÁUDIO REAL - NIAH!\n-- ====================================================================\n-- Execute este script completo no SQL Editor do Supabase\n\n-- 1. ATUALIZAR ESTRUTURA DA TABELA CALLS\nALTER TABLE calls \nADD COLUMN IF NOT EXISTS audio_storage_url TEXT,\nADD COLUMN IF NOT EXISTS audio_storage_path TEXT,\nADD COLUMN IF NOT EXISTS audio_file_name TEXT,\nADD COLUMN IF NOT EXISTS audio_file_size BIGINT,\nADD COLUMN IF NOT EXISTS audio_public_url TEXT,\nADD COLUMN IF NOT EXISTS has_audio BOOLEAN DEFAULT false;\n\n-- 2. FUNÇÃO PARA BUSCAR INFORMAÇÕES DO ÁUDIO\nCREATE OR REPLACE FUNCTION get_call_audio_info(call_id_param UUID)\nRETURNS TABLE (\n    call_id UUID,\n    has_audio BOOLEAN,\n    storage_url TEXT,\n    storage_path TEXT,\n    file_name TEXT,\n    file_size BIGINT,\n    public_url TEXT\n) AS $$\nBEGIN\n    RETURN QUERY\n    SELECT \n        c.id as call_id,\n        COALESCE(c.has_audio, false) as has_audio,\n        c.audio_storage_url as storage_url,\n        c.audio_storage_path as storage_path,\n        c.audio_file_name as file_name,\n        c.audio_file_size as file_size,\n        c.audio_public_url as public_url\n    FROM calls c\n    WHERE c.id = call_id_param;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;\n\n-- 3. POLÍTICAS RLS PARA ACESSO SEGURO\nALTER TABLE calls ENABLE ROW LEVEL SECURITY;\n\n-- Política para leitura\nDROP POLICY IF EXISTS \"Users can view calls from their company\" ON calls;\nCREATE POLICY \"Users can view calls from their company\" ON calls\n  FOR SELECT USING (\n    company_id IN (\n      SELECT company_id FROM auth.users WHERE id = auth.uid()\n    )\n  );\n\n-- Política para inserção  \nDROP POLICY IF EXISTS \"Users can insert calls to their company\" ON calls;\nCREATE POLICY \"Users can insert calls to their company\" ON calls\n  FOR INSERT WITH CHECK (\n    company_id IN (\n      SELECT company_id FROM auth.users WHERE id = auth.uid()\n    )\n  );\n\n-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO\nCOMMENT ON COLUMN calls.audio_storage_url IS 'URL interna do Supabase Storage';\nCOMMENT ON COLUMN calls.audio_storage_path IS 'Caminho do arquivo no bucket';\nCOMMENT ON COLUMN calls.audio_file_name IS 'Nome original do arquivo';\nCOMMENT ON COLUMN calls.audio_file_size IS 'Tamanho do arquivo em bytes';\nCOMMENT ON COLUMN calls.audio_public_url IS 'URL pública para acesso direto';\nCOMMENT ON COLUMN calls.has_audio IS 'Indica se a ligação possui áudio';\n\nCOMMENT ON FUNCTION get_call_audio_info(UUID) IS 'Busca informações do áudio de uma ligação específica';\n\n-- 5. ÍNDICES PARA PERFORMANCE\nCREATE INDEX IF NOT EXISTS idx_calls_has_audio ON calls(has_audio) WHERE has_audio = true;\nCREATE INDEX IF NOT EXISTS idx_calls_audio_storage_path ON calls(audio_storage_path) WHERE audio_storage_path IS NOT NULL;\n\n-- ====================================================================\n-- VERIFICAÇÃO FINAL\n-- ====================================================================\n\n-- Testar função\nSELECT 'Função get_call_audio_info criada com sucesso' as status;