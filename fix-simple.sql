-- ====================================================================
-- SCRIPT SIMPLIFICADO - Resolver Dependências Passo a Passo
-- ====================================================================
-- Versão simplificada sem complexidades que podem causar erros

-- ====================================================================
-- PASSO 1: Remover TODAS as dependências
-- ====================================================================

-- 1.1 Remover views, funções e triggers que causam dependências
DROP VIEW IF EXISTS dashboard_metrics CASCADE;
DROP FUNCTION IF EXISTS update_evaluation_list_metrics(uuid) CASCADE;
DROP FUNCTION IF EXISTS trigger_update_list_metrics() CASCADE;
DROP TRIGGER IF EXISTS trigger_update_list_metrics_on_calls ON calls CASCADE;
DROP TRIGGER IF EXISTS update_metrics_trigger ON calls CASCADE;
DROP TRIGGER IF EXISTS calls_update_trigger ON calls CASCADE;

-- ====================================================================
-- PASSO 2: Remover colunas antigas
-- ====================================================================

-- 2.1 Remover colunas antigas (agora sem dependências)
ALTER TABLE evaluation_lists 
DROP COLUMN IF EXISTS date_range_start CASCADE,
DROP COLUMN IF EXISTS date_range_end CASCADE,
DROP COLUMN IF EXISTS performance_good CASCADE,
DROP COLUMN IF EXISTS performance_neutral CASCADE,
DROP COLUMN IF EXISTS performance_bad CASCADE,
DROP COLUMN IF EXISTS calls_in_attention CASCADE,
DROP COLUMN IF EXISTS last_analysis_date CASCADE,
DROP COLUMN IF EXISTS metrics_summary CASCADE;

-- 2.2 Remover colunas antigas da tabela calls
ALTER TABLE calls 
DROP COLUMN IF EXISTS phone_number CASCADE,
DROP COLUMN IF EXISTS duration_seconds CASCADE,
DROP COLUMN IF EXISTS recording_url CASCADE,
DROP COLUMN IF EXISTS criteria_scores CASCADE;

-- ====================================================================
-- PASSO 3: Adicionar novas colunas
-- ====================================================================

-- 3.1 Adicionar novas colunas para evaluation_lists
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
ADD COLUMN IF NOT EXISTS insights JSONB,
ADD COLUMN IF NOT EXISTS recommendations JSONB,
ADD COLUMN IF NOT EXISTS processing_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 3.2 Adicionar novas colunas para calls
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
ADD COLUMN IF NOT EXISTS highlights JSONB,
ADD COLUMN IF NOT EXISTS improvements JSONB,
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

-- ====================================================================
-- PASSO 4: Criar constraint única e índices
-- ====================================================================

-- 4.1 Criar constraint única para batch_id
ALTER TABLE evaluation_lists DROP CONSTRAINT IF EXISTS unique_batch_id;
ALTER TABLE evaluation_lists ADD CONSTRAINT unique_batch_id UNIQUE (batch_id);

-- 4.2 Criar índices
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_batch_id ON evaluation_lists(batch_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_company_id ON evaluation_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_status ON evaluation_lists(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_created_at ON evaluation_lists(created_at);

CREATE INDEX IF NOT EXISTS idx_calls_batch_id ON calls(batch_id);
CREATE INDEX IF NOT EXISTS idx_calls_evaluation_list_id ON calls(evaluation_list_id);
CREATE INDEX IF NOT EXISTS idx_calls_company_id ON calls(company_id);
CREATE INDEX IF NOT EXISTS idx_calls_overall_score ON calls(overall_score);

-- ====================================================================
-- PASSO 5: Criar novas funções e triggers
-- ====================================================================

-- 5.1 Nova função de atualização de métricas
CREATE OR REPLACE FUNCTION update_evaluation_list_metrics_v2(list_id UUID)
RETURNS VOID AS $$
DECLARE
    total_calls_count INTEGER;
    good_calls INTEGER;
    bad_calls INTEGER;
    avg_score NUMERIC(4,2);
    max_score NUMERIC(4,2);
    min_score NUMERIC(4,2);
BEGIN
    -- Calcular métricas baseadas na tabela calls
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN overall_score >= 8.0 THEN 1 END),
        COUNT(CASE WHEN overall_score < 5.0 THEN 1 END),
        AVG(overall_score),
        MAX(overall_score),
        MIN(overall_score)
    INTO 
        total_calls_count,
        good_calls,
        bad_calls,
        avg_score,
        max_score,
        min_score
    FROM calls 
    WHERE evaluation_list_id = list_id 
    AND overall_score IS NOT NULL;

    -- Atualizar evaluation_lists
    UPDATE evaluation_lists 
    SET 
        total_calls = COALESCE(total_calls_count, 0),
        average_score = COALESCE(avg_score, 0),
        highest_score = COALESCE(max_score, 0),
        lowest_score = COALESCE(min_score, 0),
        successful_analyses = COALESCE(good_calls, 0),
        failed_analyses = COALESCE(bad_calls, 0),
        files_count = COALESCE(total_calls_count, 0),
        status = CASE 
            WHEN total_calls_count > 0 THEN 'completed' 
            ELSE 'processing' 
        END,
        completed_at = CASE 
            WHEN total_calls_count > 0 THEN NOW() 
            ELSE completed_at 
        END,
        updated_at = NOW()
    WHERE id = list_id;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Nova função de trigger
CREATE OR REPLACE FUNCTION trigger_update_list_metrics_v2()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_evaluation_list_metrics_v2(NEW.evaluation_list_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_evaluation_list_metrics_v2(OLD.evaluation_list_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5.3 Criar novo trigger
CREATE TRIGGER trigger_update_list_metrics_v2
    AFTER INSERT OR UPDATE OR DELETE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_list_metrics_v2();

-- ====================================================================
-- PASSO 6: Recriar view dashboard_metrics
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
-- PASSO 7: Migrar dados antigos se existirem
-- ====================================================================

-- 7.1 Migrar dados da tabela calls
UPDATE calls SET
    overall_score = COALESCE(score, 0),
    transcription_text = COALESCE(transcript, 'Transcrição migrada'),
    transcription_is_real = false,
    agent_name = 'Agente Migrado',
    batch_id = 'migrated_' || id::text
WHERE overall_score IS NULL;

-- ====================================================================
-- PASSO 8: Inserir dados de exemplo
-- ====================================================================

-- 8.1 Inserir lista de exemplo
INSERT INTO evaluation_lists (
    id, company_id, name, description, batch_id, status, files_count,
    successful_analyses, failed_analyses, total_calls, average_score,
    highest_score, lowest_score, criteria_compliance, criteria_group_name,
    total_subcriteria, created_at, started_at, completed_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM companies LIMIT 1),
    'Teste API v2.0 - Migração Simplificada',
    'Lista de exemplo criada após migração',
    'batch_simple_test_' || extract(epoch from now())::bigint,
    'completed', 3, 2, 1, 3, 7.5, 9.2, 5.8, '67%', 
    'Atendimento ao Cliente', 5, NOW(), NOW(), NOW()
) ON CONFLICT (batch_id) DO NOTHING;

-- 8.2 Inserir calls de exemplo
INSERT INTO calls (
    id, evaluation_list_id, company_id, batch_id, file_name, 
    overall_score, transcription_text, transcription_is_real,
    agent_name, client_name, sentiment, call_outcome, status, created_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT batch_id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    'audio_teste_1.mp3', 9.2, 'Transcrição teste 1', true,
    'Agente 1', 'Cliente 1', 'positive', 'resolved', 'completed', NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT batch_id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    'audio_teste_2.mp3', 7.8, 'Transcrição teste 2', true,
    'Agente 2', 'Cliente 2', 'neutral', 'pending', 'completed', NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT batch_id FROM evaluation_lists WHERE batch_id LIKE 'batch_simple_test_%' LIMIT 1),
    'audio_teste_3.mp3', 5.8, 'Transcrição teste 3', true,
    'Agente 3', 'Cliente 3', 'negative', 'escalated', 'completed', NOW()
);

-- ====================================================================
-- PASSO 9: Verificação final
-- ====================================================================

-- Mostrar resultados
SELECT 'evaluation_lists' as tabela, COUNT(*) as registros FROM evaluation_lists
UNION ALL
SELECT 'calls' as tabela, COUNT(*) as registros FROM calls
UNION ALL  
SELECT 'dashboard_metrics' as tabela, COUNT(*) as registros FROM dashboard_metrics;

-- ====================================================================
-- SUCESSO! ✅
-- ====================================================================
-- Sistema migrado com sucesso para API v2.0
-- Pronto para receber dados da API de Análise em Lote
-- ==================================================================== 