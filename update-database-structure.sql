-- ====================================================================
-- SCRIPT DE ATUALIZAÇÃO DAS TABELAS PARA API v2.0
-- ====================================================================
-- Este script atualiza as tabelas evaluation_lists e calls para 
-- armazenar corretamente os dados dos webhooks da API v2.0

-- ====================================================================
-- 1. ATUALIZAÇÃO DA TABELA evaluation_lists
-- ====================================================================

-- Backup da estrutura atual (opcional)
-- CREATE TABLE evaluation_lists_backup AS SELECT * FROM evaluation_lists;

-- Verificar e remover dependências primeiro
DROP VIEW IF EXISTS dashboard_metrics CASCADE;

-- Remover colunas que não são mais necessárias
ALTER TABLE evaluation_lists 
DROP COLUMN IF EXISTS date_range_start CASCADE,
DROP COLUMN IF EXISTS date_range_end CASCADE,
DROP COLUMN IF EXISTS performance_good CASCADE,
DROP COLUMN IF EXISTS performance_neutral CASCADE,
DROP COLUMN IF EXISTS performance_bad CASCADE,
DROP COLUMN IF EXISTS calls_in_attention CASCADE,
DROP COLUMN IF EXISTS last_analysis_date CASCADE,
DROP COLUMN IF EXISTS metrics_summary CASCADE;

-- Adicionar novas colunas para dados da API v2.0
ALTER TABLE evaluation_lists 
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'processing',
ADD COLUMN IF NOT EXISTS files_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_analyses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_analyses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_score NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS lowest_score NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS criteria_compliance VARCHAR(10),
ADD COLUMN IF NOT EXISTS criteria_group_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_subcriteria INTEGER,
ADD COLUMN IF NOT EXISTS sub_criteria JSONB,
ADD COLUMN IF NOT EXISTS insights TEXT[],
ADD COLUMN IF NOT EXISTS recommendations TEXT[],
ADD COLUMN IF NOT EXISTS processing_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Atualizar campos existentes se necessário
ALTER TABLE evaluation_lists 
ALTER COLUMN description TYPE TEXT;

-- ====================================================================
-- 2. ATUALIZAÇÃO DA TABELA calls
-- ====================================================================

-- Backup da estrutura atual (opcional)
-- CREATE TABLE calls_backup AS SELECT * FROM calls;

-- Remover colunas obsoletas
ALTER TABLE calls 
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS duration_seconds,
DROP COLUMN IF EXISTS recording_url,
DROP COLUMN IF EXISTS criteria_scores,
DROP COLUMN IF EXISTS analysis_summary;

-- Adicionar novas colunas para dados da API v2.0
ALTER TABLE calls 
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS call_index INTEGER,
ADD COLUMN IF NOT EXISTS total_calls INTEGER,
ADD COLUMN IF NOT EXISTS file_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_duration INTEGER,

-- Dados da análise
ADD COLUMN IF NOT EXISTS overall_score NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[],
ADD COLUMN IF NOT EXISTS improvements TEXT[],
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS call_outcome VARCHAR(100),
ADD COLUMN IF NOT EXISTS individual_criteria_scores JSONB,

-- Dados da transcrição
ADD COLUMN IF NOT EXISTS transcription_text TEXT,
ADD COLUMN IF NOT EXISTS transcription_language VARCHAR(10),
ADD COLUMN IF NOT EXISTS transcription_confidence NUMERIC(4,3),
ADD COLUMN IF NOT EXISTS transcription_duration INTEGER,
ADD COLUMN IF NOT EXISTS transcription_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS transcription_is_real BOOLEAN,

-- Metadados
ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS client_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50),

-- Dados de processamento
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS error_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS error_details TEXT,
ADD COLUMN IF NOT EXISTS analysis_id UUID;

-- Atualizar campos existentes
ALTER TABLE calls 
ALTER COLUMN transcript TYPE TEXT,
ALTER COLUMN feedback TYPE JSONB,
ALTER COLUMN call_date TYPE TIMESTAMPTZ;

-- Renomear colunas se necessário
ALTER TABLE calls RENAME COLUMN transcript TO transcript_legacy;
ALTER TABLE calls RENAME COLUMN transcription_text TO transcript;

-- ====================================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índices para evaluation_lists
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_batch_id ON evaluation_lists(batch_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_company_id ON evaluation_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_status ON evaluation_lists(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_created_at ON evaluation_lists(created_at);

-- Índices para calls
CREATE INDEX IF NOT EXISTS idx_calls_batch_id ON calls(batch_id);
CREATE INDEX IF NOT EXISTS idx_calls_evaluation_list_id ON calls(evaluation_list_id);
CREATE INDEX IF NOT EXISTS idx_calls_company_id ON calls(company_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_call_date ON calls(call_date);
CREATE INDEX IF NOT EXISTS idx_calls_overall_score ON calls(overall_score);

-- ====================================================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON TABLE evaluation_lists IS 'Listas de avaliação que armazenam dados dos lotes da API v2.0';
COMMENT ON COLUMN evaluation_lists.batch_id IS 'ID único do lote da API (batch_1234567890)';
COMMENT ON COLUMN evaluation_lists.status IS 'Status do lote: processing, completed, failed';
COMMENT ON COLUMN evaluation_lists.files_count IS 'Número total de arquivos no lote';
COMMENT ON COLUMN evaluation_lists.sub_criteria IS 'JSON com subcritérios utilizados na análise';

COMMENT ON TABLE calls IS 'Ligações individuais processadas pela API v2.0';
COMMENT ON COLUMN calls.batch_id IS 'ID do lote ao qual esta ligação pertence';
COMMENT ON COLUMN calls.file_id IS 'ID único do arquivo (file_0_1234567890)';
COMMENT ON COLUMN calls.individual_criteria_scores IS 'JSON com scores individuais por subcritério';
COMMENT ON COLUMN calls.transcription_is_real IS 'TRUE se transcrição foi feita pelo OpenAI Whisper';

-- ====================================================================
-- 5. DADOS DE EXEMPLO PARA TESTE
-- ====================================================================

-- Inserir uma lista de exemplo
INSERT INTO evaluation_lists (
  id, company_id, name, description, batch_id, status, files_count,
  successful_analyses, failed_analyses, total_calls, average_score,
  highest_score, lowest_score, criteria_compliance, criteria_group_name,
  total_subcriteria, created_at, started_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM companies WHERE name = 'NIAH! Sistemas' LIMIT 1),
  'Teste API v2.0',
  'Lista de exemplo para testar integração com API v2.0',
  'batch_test_' || extract(epoch from now())::bigint,
  'completed',
  2,
  2,
  0,
  2,
  8.5,
  9.0,
  8.0,
  '85%',
  'Critério de Teste',
  4,
  NOW(),
  NOW() - INTERVAL '5 minutes'
) ON CONFLICT (batch_id) DO NOTHING;

-- Inserir ligações de exemplo
INSERT INTO calls (
  id, company_id, evaluation_list_id, batch_id, call_index, total_calls,
  file_id, file_name, file_size, status, overall_score, transcript,
  client_name, client_email, agent_name, campaign_name, call_type,
  sentiment, call_outcome, transcription_is_real, created_at, processed_at
) 
SELECT 
  gen_random_uuid(),
  el.company_id,
  el.id,
  el.batch_id,
  1,
  2,
  'file_0_' || extract(epoch from now())::bigint,
  'ligacao_teste_1.mp3',
  2048576,
  'completed',
  8.5,
  'Atendente: Bom dia! Empresa ABC, como posso ajudá-lo? Cliente: Olá, gostaria de tirar uma dúvida...',
  'João Silva',
  'joao@email.com',
  'Ana Costa',
  'Black Friday',
  'vendas',
  'positivo',
  'resolvido',
  true,
  NOW(),
  NOW()
FROM evaluation_lists el 
WHERE el.batch_id LIKE 'batch_test_%' 
AND NOT EXISTS (SELECT 1 FROM calls WHERE batch_id = el.batch_id)
LIMIT 1;

-- ====================================================================
-- 6. VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('evaluation_lists', 'calls')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verificar dados de exemplo
SELECT 
  el.name,
  el.batch_id,
  el.status,
  el.files_count,
  COUNT(c.id) as actual_calls
FROM evaluation_lists el
LEFT JOIN calls c ON c.evaluation_list_id = el.id
WHERE el.batch_id LIKE 'batch_test_%'
GROUP BY el.id, el.name, el.batch_id, el.status, el.files_count;

-- ====================================================================
-- 7. RECRIAR VIEW DASHBOARD_METRICS COM NOVA ESTRUTURA
-- ====================================================================

-- Criar nova view dashboard_metrics compatível com API v2.0
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
  -- Métricas básicas
  COUNT(*) as total_evaluation_lists,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_lists,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_lists,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_lists,
  
  -- Métricas de performance (baseadas nos novos campos)
  SUM(successful_analyses) as total_successful_calls,
  SUM(failed_analyses) as total_failed_calls,
  SUM(files_count) as total_files_processed,
  
  -- Scores médios
  AVG(average_score) as overall_average_score,
  AVG(highest_score) as average_highest_score,
  AVG(lowest_score) as average_lowest_score,
  
  -- Métricas por empresa
  COUNT(DISTINCT company_id) as active_companies,
  
  -- Período
  MIN(created_at) as first_analysis,
  MAX(created_at) as last_analysis,
  
  -- Performance distribution (calculada dinamicamente)
  COUNT(CASE WHEN average_score >= 8.0 THEN 1 END) as performance_excellent,
  COUNT(CASE WHEN average_score >= 6.0 AND average_score < 8.0 THEN 1 END) as performance_good,
  COUNT(CASE WHEN average_score >= 4.0 AND average_score < 6.0 THEN 1 END) as performance_average,
  COUNT(CASE WHEN average_score < 4.0 THEN 1 END) as performance_poor

FROM evaluation_lists
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'; -- Últimos 30 dias

COMMENT ON VIEW dashboard_metrics IS 'Métricas consolidadas do dashboard - compatível com API v2.0';

-- ====================================================================
-- 8. VERIFICAR ESTRUTURA FINAL
-- ====================================================================

-- Listar todas as colunas das tabelas atualizadas
SELECT 
  'evaluation_lists' as tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evaluation_lists'
AND table_schema = 'public'

UNION ALL

SELECT 
  'calls' as tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'calls'
AND table_schema = 'public'

ORDER BY tabela, ordinal_position;

-- ====================================================================
-- SUCESSO! 
-- ====================================================================
-- As tabelas foram atualizadas para suportar os dados da API v2.0
-- - evaluation_lists: armazena dados do webhook batch_completed
-- - calls: armazena dados do webhook call_completed
-- - dashboard_metrics: view recriada com nova estrutura
-- ==================================================================== 