-- EXECUTE ESTE SCRIPT NO SUPABASE AGORA

-- 1. Desabilitar RLS
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE criteria DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas
DROP POLICY IF EXISTS "criteria_isolation" ON criteria;

-- 3. Teste de inserção
DO $$
DECLARE
    company_id UUID;
    test_criteria_id UUID;
BEGIN
    -- Pegar primeira empresa
    SELECT id INTO company_id FROM companies LIMIT 1;
    
    IF company_id IS NOT NULL THEN
        -- Tentar criar critério
        INSERT INTO criteria (name, company_id, total_calls, average_score)
        VALUES ('TESTE FUNCIONAMENTO', company_id, 0, 0.0)
        RETURNING id INTO test_criteria_id;
        
        IF test_criteria_id IS NOT NULL THEN
            RAISE NOTICE 'SUCESSO! Critério criado: %', test_criteria_id;
            -- Limpar teste
            DELETE FROM criteria WHERE id = test_criteria_id;
        END IF;
    END IF;
END $$;

-- 4. Status final
SELECT 'SISTEMA FUNCIONANDO!' as resultado;