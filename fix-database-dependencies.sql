-- ====================================================================
-- SCRIPT ALTERNATIVO - Resolver Dependências Passo a Passo
-- ====================================================================
-- Execute este script se o principal der erro de dependências

-- ====================================================================
-- PASSO 1: Remover todas as dependências
-- ====================================================================

-- Remover view que causa dependência
DROP VIEW IF EXISTS dashboard_metrics CASCADE;

-- Verificar se há outras views dependentes
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE definition LIKE '%evaluation_lists%' 
OR definition LIKE '%performance_good%';

-- ====================================================================
-- PASSO 2: Adicionar novas colunas ANTES de remover as antigas
-- ====================================================================

-- Adicionar colunas da API v2.0 (sem remover as antigas ainda)
ALTER TABLE evaluation_lists 
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255),
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

-- Criar índice único para batch_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluation_lists_batch_id_unique ON evaluation_lists(batch_id) WHERE batch_id IS NOT NULL;

-- ====================================================================
-- PASSO 3: Migrar dados existentes (se houver)
-- ====================================================================

-- Migrar performance_good/neutral/bad para os novos campos
UPDATE evaluation_lists SET
  successful_analyses = COALESCE(performance_good, 0),
  failed_analyses = COALESCE(performance_bad, 0),
  files_count = COALESCE(performance_good, 0) + COALESCE(performance_neutral, 0) + COALESCE(performance_bad, 0)
WHERE batch_id IS NULL; -- Apenas registros antigos

-- Definir status para registros existentes
UPDATE evaluation_lists SET
  status = 'completed'
WHERE status IS NULL OR status = '';

-- ====================================================================
-- PASSO 4: Atualizar tabela calls
-- ====================================================================

-- Adicionar colunas para calls
ALTER TABLE calls 
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS call_index INTEGER,
ADD COLUMN IF NOT EXISTS total_calls INTEGER,
ADD COLUMN IF NOT EXISTS file_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_duration INTEGER,
ADD COLUMN IF NOT EXISTS overall_score NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[],
ADD COLUMN IF NOT EXISTS improvements TEXT[],
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS call_outcome VARCHAR(100),
ADD COLUMN IF NOT EXISTS individual_criteria_scores JSONB,
ADD COLUMN IF NOT EXISTS transcription_text TEXT,
ADD COLUMN IF NOT EXISTS transcription_language VARCHAR(10),
ADD COLUMN IF NOT EXISTS transcription_confidence NUMERIC(4,3),
ADD COLUMN IF NOT EXISTS transcription_duration INTEGER,
ADD COLUMN IF NOT EXISTS transcription_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS transcription_is_real BOOLEAN,
ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS client_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS error_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS error_details TEXT,
ADD COLUMN IF NOT EXISTS analysis_id UUID;

-- Migrar dados existentes da tabela calls
UPDATE calls SET
  overall_score = score,
  transcription_text = transcript,
  transcription_is_real = false -- Dados antigos são simulados
WHERE overall_score IS NULL;

-- ====================================================================
-- PASSO 5: Recriar dashboard_metrics com nova estrutura
-- ====================================================================

CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
  COUNT(*) as total_evaluation_lists,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_lists,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_lists,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_lists,
  
  -- Compatibilidade com código antigo
  COALESCE(SUM(successful_analyses), 0) as performance_good,
  COALESCE(SUM(failed_analyses), 0) as performance_bad,
  COALESCE(SUM(files_count) - SUM(successful_analyses) - SUM(failed_analyses), 0) as performance_neutral,
  
  -- Novas métricas
  SUM(successful_analyses) as total_successful_calls,
  SUM(failed_analyses) as total_failed_calls,
  SUM(files_count) as total_files_processed,
  AVG(average_score) as overall_average_score,
  COUNT(DISTINCT company_id) as active_companies

FROM evaluation_lists
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ====================================================================
-- PASSO 6: Agora remover colunas antigas (OPCIONAL)
-- ====================================================================

-- DESCOMENTE as linhas abaixo APENAS se tiver certeza que não há outras dependências:

-- ALTER TABLE evaluation_lists 
-- DROP COLUMN IF EXISTS date_range_start CASCADE,
-- DROP COLUMN IF EXISTS date_range_end CASCADE,
-- DROP COLUMN IF EXISTS performance_good CASCADE,
-- DROP COLUMN IF EXISTS performance_neutral CASCADE,
-- DROP COLUMN IF EXISTS performance_bad CASCADE,
-- DROP COLUMN IF EXISTS calls_in_attention CASCADE,
-- DROP COLUMN IF EXISTS last_analysis_date CASCADE,
-- DROP COLUMN IF EXISTS metrics_summary CASCADE;

-- ====================================================================
-- PASSO 7: Criar índices
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_evaluation_lists_company_id ON evaluation_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_status ON evaluation_lists(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_created_at ON evaluation_lists(created_at);

CREATE INDEX IF NOT EXISTS idx_calls_batch_id ON calls(batch_id);
CREATE INDEX IF NOT EXISTS idx_calls_evaluation_list_id ON calls(evaluation_list_id);
CREATE INDEX IF NOT EXISTS idx_calls_company_id ON calls(company_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_overall_score ON calls(overall_score);

-- ====================================================================
-- PASSO 8: Inserir dados de teste
-- ====================================================================

INSERT INTO evaluation_lists (
  id, company_id, name, description, batch_id, status, files_count,
  successful_analyses, failed_analyses, total_calls, average_score,
  highest_score, lowest_score, criteria_compliance, criteria_group_name,
  total_subcriteria, created_at, started_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM companies WHERE name = 'NIAH! Sistemas' LIMIT 1),
  'Teste API v2.0 - Script Alternativo',
  'Lista de exemplo criada pelo script alternativo',
  'batch_alt_' || extract(epoch from now())::bigint,
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

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se tudo funcionou
SELECT 'evaluation_lists' as tabela, COUNT(*) as registros FROM evaluation_lists
UNION ALL
SELECT 'calls' as tabela, COUNT(*) as registros FROM calls
UNION ALL
SELECT 'dashboard_metrics' as tabela, COUNT(*) as registros FROM dashboard_metrics;

-- Mostrar estrutura das novas colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluation_lists' 
AND column_name IN ('batch_id', 'status', 'files_count', 'successful_analyses')
ORDER BY column_name;

-- ====================================================================
-- SUCESSO! Script alternativo executado
-- ==================================================================== 