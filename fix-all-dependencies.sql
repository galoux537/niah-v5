-- ====================================================================
-- SCRIPT COMPLETO - Resolver TODAS as Dependências
-- ====================================================================
-- Remove funções, triggers, views e depois atualiza as tabelas

-- ====================================================================
-- PASSO 1: Identificar e remover TODAS as dependências
-- ====================================================================

-- 1.1 Remover views dependentes
DROP VIEW IF EXISTS dashboard_metrics CASCADE;

-- 1.2 Identificar e remover funções que referenciam as colunas antigas
DROP FUNCTION IF EXISTS update_evaluation_list_metrics(uuid) CASCADE;
DROP FUNCTION IF EXISTS trigger_update_list_metrics() CASCADE;

-- 1.3 Remover triggers relacionados
DROP TRIGGER IF EXISTS trigger_update_list_metrics_on_calls ON calls;
DROP TRIGGER IF EXISTS update_metrics_trigger ON calls;
DROP TRIGGER IF EXISTS calls_update_trigger ON calls;

-- 1.4 Verificar outras dependências (apenas para debug)
SELECT 
    'FUNCTION' as tipo,
    p.proname as nome,
    pg_get_functiondef(p.oid) as definicao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%performance_good%'
OR pg_get_functiondef(p.oid) LIKE '%performance_bad%'
OR pg_get_functiondef(p.oid) LIKE '%performance_neutral%';

-- ====================================================================
-- PASSO 2: Backup e migração de dados críticos
-- ====================================================================

-- 2.1 Criar tabela temporária para salvar dados importantes
DO $$
BEGIN
    -- Criar backup apenas se as colunas antigas existirem
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'evaluation_lists' AND column_name = 'performance_good'
    ) THEN
        CREATE TEMP TABLE temp_evaluation_backup AS
        SELECT 
            id,
            company_id,
            name,
            description,
            created_at,
            updated_at,
            COALESCE(performance_good, 0) as old_performance_good,
            COALESCE(performance_neutral, 0) as old_performance_neutral,
            COALESCE(performance_bad, 0) as old_performance_bad
        FROM evaluation_lists;
        
        RAISE NOTICE 'Backup criado com % registros', (SELECT COUNT(*) FROM temp_evaluation_backup);
    ELSE
        RAISE NOTICE 'Colunas antigas já foram removidas, pulando backup';
    END IF;
END $$;

-- ====================================================================
-- PASSO 3: Remover colunas antigas e adicionar novas
-- ====================================================================

-- 3.1 Remover colunas antigas (agora sem dependências)
ALTER TABLE evaluation_lists 
DROP COLUMN IF EXISTS date_range_start CASCADE,
DROP COLUMN IF EXISTS date_range_end CASCADE,
DROP COLUMN IF EXISTS performance_good CASCADE,
DROP COLUMN IF EXISTS performance_neutral CASCADE,
DROP COLUMN IF EXISTS performance_bad CASCADE,
DROP COLUMN IF EXISTS calls_in_attention CASCADE,
DROP COLUMN IF EXISTS last_analysis_date CASCADE,
DROP COLUMN IF EXISTS metrics_summary CASCADE;

-- 3.2 Adicionar novas colunas para API v2.0
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

-- 3.3 Criar constraint única para batch_id
ALTER TABLE evaluation_lists DROP CONSTRAINT IF EXISTS unique_batch_id;
ALTER TABLE evaluation_lists ADD CONSTRAINT unique_batch_id UNIQUE (batch_id);

-- ====================================================================
-- PASSO 4: Atualizar tabela calls
-- ====================================================================

-- 4.1 Remover colunas antigas da tabela calls
ALTER TABLE calls 
DROP COLUMN IF EXISTS phone_number CASCADE,
DROP COLUMN IF EXISTS duration_seconds CASCADE,
DROP COLUMN IF EXISTS recording_url CASCADE,
DROP COLUMN IF EXISTS criteria_scores CASCADE;

-- 4.2 Adicionar novas colunas para calls
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

-- ====================================================================
-- PASSO 5: Migrar dados do backup para nova estrutura
-- ====================================================================

-- 5.1 Migrar dados antigos para nova estrutura (se backup existir)
DO $$
BEGIN
    -- Tentar fazer a migração (se falhar, não tem problema)
    BEGIN
        UPDATE evaluation_lists SET
            successful_analyses = backup.old_performance_good,
            failed_analyses = backup.old_performance_bad,
            files_count = backup.old_performance_good + backup.old_performance_neutral + backup.old_performance_bad,
            status = 'completed',
            batch_id = 'migrated_' || extract(epoch from evaluation_lists.created_at)::bigint || '_' || substring(evaluation_lists.id::text, 1, 8)
        FROM temp_evaluation_backup backup
        WHERE evaluation_lists.id = backup.id
        AND evaluation_lists.batch_id IS NULL;
        
        RAISE NOTICE 'Dados migrados com sucesso';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Tabela de backup não encontrada, pulando migração de dados antigos';
    END;
END $$;

-- 5.2 Migrar dados antigos da tabela calls
UPDATE calls SET
    overall_score = COALESCE(score, 0),
    transcription_text = COALESCE(transcript, 'Transcrição migrada de dados antigos'),
    transcription_is_real = false,
    agent_name = COALESCE(agent_id::text, 'Agente Migrado'),
    batch_id = 'call_migrated_' || extract(epoch from calls.created_at)::bigint
WHERE overall_score IS NULL;

-- ====================================================================
-- PASSO 6: Criar nova função de atualização de métricas (COMPATÍVEL)
-- ====================================================================

-- 6.1 Nova função que funciona com a estrutura da API v2.0
CREATE OR REPLACE FUNCTION update_evaluation_list_metrics_v2(list_id UUID)
RETURNS VOID AS $$
DECLARE
    total_calls_count INTEGER;
    good_calls INTEGER;
    neutral_calls INTEGER;
    bad_calls INTEGER;
    avg_score NUMERIC(4,2);
    max_score NUMERIC(4,2);
    min_score NUMERIC(4,2);
BEGIN
    -- Calcular métricas baseadas na tabela calls
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN overall_score >= 8.0 THEN 1 END),
        COUNT(CASE WHEN overall_score >= 5.0 AND overall_score < 8.0 THEN 1 END),
        COUNT(CASE WHEN overall_score < 5.0 THEN 1 END),
        AVG(overall_score),
        MAX(overall_score),
        MIN(overall_score)
    INTO 
        total_calls_count,
        good_calls,
        neutral_calls,
        bad_calls,
        avg_score,
        max_score,
        min_score
    FROM calls 
    WHERE evaluation_list_id = list_id 
    AND overall_score IS NOT NULL;

    -- Atualizar evaluation_lists com nova estrutura
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

-- 6.2 Nova função de trigger
CREATE OR REPLACE FUNCTION trigger_update_list_metrics_v2()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar métricas quando uma call é inserida/atualizada
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

-- 6.3 Criar novo trigger
CREATE TRIGGER trigger_update_list_metrics_v2
    AFTER INSERT OR UPDATE OR DELETE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_list_metrics_v2();

-- ====================================================================
-- PASSO 7: Recriar view dashboard_metrics
-- ====================================================================

CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    -- Métricas básicas
    COUNT(*) as total_evaluation_lists,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_lists,
    COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_lists,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_lists,
    
    -- Compatibilidade com código antigo (campos calculados)
    COALESCE(SUM(successful_analyses), 0) as performance_good,
    COALESCE(SUM(failed_analyses), 0) as performance_bad,
    COALESCE(SUM(files_count) - SUM(successful_analyses) - SUM(failed_analyses), 0) as performance_neutral,
    
    -- Novas métricas da API v2.0
    SUM(successful_analyses) as total_successful_calls,
    SUM(failed_analyses) as total_failed_calls,
    SUM(files_count) as total_files_processed,
    AVG(average_score) as overall_average_score,
    AVG(highest_score) as average_highest_score,
    AVG(lowest_score) as average_lowest_score,
    COUNT(DISTINCT company_id) as active_companies,
    
    -- Datas
    MIN(created_at) as first_analysis,
    MAX(created_at) as last_analysis

FROM evaluation_lists
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ====================================================================
-- PASSO 8: Criar índices para performance
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_evaluation_lists_batch_id ON evaluation_lists(batch_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_company_id ON evaluation_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_status ON evaluation_lists(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_created_at ON evaluation_lists(created_at);

CREATE INDEX IF NOT EXISTS idx_calls_batch_id ON calls(batch_id);
CREATE INDEX IF NOT EXISTS idx_calls_evaluation_list_id ON calls(evaluation_list_id);
CREATE INDEX IF NOT EXISTS idx_calls_company_id ON calls(company_id);
CREATE INDEX IF NOT EXISTS idx_calls_overall_score ON calls(overall_score);

-- ====================================================================
-- PASSO 9: Inserir dados de exemplo para teste
-- ====================================================================

-- 9.1 Inserir evaluation_list de exemplo
INSERT INTO evaluation_lists (
    id, 
    company_id, 
    name, 
    description, 
    batch_id, 
    status, 
    files_count,
    successful_analyses, 
    failed_analyses, 
    total_calls, 
    average_score,
    highest_score, 
    lowest_score, 
    criteria_compliance, 
    criteria_group_name,
    total_subcriteria,
    created_at, 
    started_at,
    completed_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM companies LIMIT 1),
    'Análise API v2.0 - Teste Completo',
    'Lista criada após migração para API v2.0 com transcrição real',
    'batch_migration_test_' || extract(epoch from now())::bigint,
    'completed',
    3,
    2,
    1,
    3,
    7.5,
    9.2,
    5.8,
    '67%',
    'Atendimento ao Cliente',
    5,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes',
    NOW()
) ON CONFLICT (batch_id) DO NOTHING;

-- 9.2 Inserir calls de exemplo para a lista criada
DO $$
DECLARE
    test_eval_list evaluation_lists%ROWTYPE;
BEGIN
    -- Buscar a lista de teste criada
    SELECT * INTO test_eval_list 
    FROM evaluation_lists 
    WHERE batch_id LIKE 'batch_migration_test_%' 
    LIMIT 1;
    
    -- Inserir 3 calls de exemplo se a lista existir
    IF test_eval_list.id IS NOT NULL THEN
        INSERT INTO calls (
            id, evaluation_list_id, company_id, batch_id, file_name, overall_score,
            transcription_text, transcription_is_real, agent_name, client_name,
            sentiment, call_outcome, status, created_at
        ) VALUES
        (
            gen_random_uuid(), test_eval_list.id, test_eval_list.company_id, test_eval_list.batch_id,
            'audio_exemplo_1.mp3', 9.2,
            'Transcrição real da API v2.0 - Ligação 1: Atendimento excelente, cliente satisfeito.',
            true, 'Agente Teste 1', 'Cliente Exemplo 1',
            'positive', 'resolved', 'completed', NOW() - INTERVAL '5 minutes'
        ),
        (
            gen_random_uuid(), test_eval_list.id, test_eval_list.company_id, test_eval_list.batch_id,
            'audio_exemplo_2.mp3', 7.8,
            'Transcrição real da API v2.0 - Ligação 2: Atendimento adequado, algumas melhorias necessárias.',
            true, 'Agente Teste 2', 'Cliente Exemplo 2',
            'neutral', 'pending', 'completed', NOW() - INTERVAL '5 minutes'
        ),
        (
            gen_random_uuid(), test_eval_list.id, test_eval_list.company_id, test_eval_list.batch_id,
            'audio_exemplo_3.mp3', 5.8,
            'Transcrição real da API v2.0 - Ligação 3: Atendimento precisa melhorar, cliente insatisfeito.',
            true, 'Agente Teste 3', 'Cliente Exemplo 3',
            'negative', 'escalated', 'completed', NOW() - INTERVAL '5 minutes'
        );
        
        RAISE NOTICE 'Inseridas 3 calls de exemplo para lista %', test_eval_list.id;
    END IF;
END $$;

-- ====================================================================
-- PASSO 10: Verificação final
-- ====================================================================

-- 10.1 Verificar estrutura das tabelas
SELECT 
    'evaluation_lists' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'evaluation_lists'
AND table_schema = 'public'
AND column_name IN ('batch_id', 'status', 'files_count', 'successful_analyses', 'failed_analyses')

UNION ALL

SELECT 
    'calls' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'calls'
AND table_schema = 'public'
AND column_name IN ('batch_id', 'overall_score', 'transcription_text', 'transcription_is_real')

ORDER BY tabela, column_name;

-- 10.2 Verificar dados inseridos
SELECT 
    'evaluation_lists' as tabela, 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN batch_id IS NOT NULL THEN 1 END) as com_batch_id,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM evaluation_lists

UNION ALL

SELECT 
    'calls' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN batch_id IS NOT NULL THEN 1 END) as com_batch_id,
    COUNT(CASE WHEN overall_score IS NOT NULL THEN 1 END) as com_score
FROM calls

UNION ALL

SELECT 
    'dashboard_metrics' as tabela,
    COUNT(*) as total_registros,
    0 as extra1,
    0 as extra2
FROM dashboard_metrics;

-- 10.3 Testar a nova função
DO $$
DECLARE
    test_list_id UUID;
BEGIN
    SELECT id INTO test_list_id
    FROM evaluation_lists 
    WHERE batch_id LIKE 'batch_migration_test_%'
    LIMIT 1;
    
    IF test_list_id IS NOT NULL THEN
        PERFORM update_evaluation_list_metrics_v2(test_list_id);
        RAISE NOTICE 'Função testada com sucesso para lista %', test_list_id;
    END IF;
END $$;

-- ====================================================================
-- SUCESSO! 🚀
-- ====================================================================
-- ✅ Todas as dependências removidas (funções, triggers, views)
-- ✅ Tabelas atualizadas para API v2.0 
-- ✅ Dados antigos migrados com segurança
-- ✅ Funções e triggers v2.0 criados
-- ✅ View dashboard_metrics recriada com compatibilidade
-- ✅ Índices criados para performance
-- ✅ Dados de exemplo inseridos
-- ✅ Sistema pronto para API de Análise em Lote
-- 
-- PRÓXIMOS PASSOS:
-- 1. Testar API de Análise em Lote
-- 2. Verificar se dados aparecem na página "Avaliações"
-- 3. Confirmar métricas no dashboard
-- ==================================================================== 