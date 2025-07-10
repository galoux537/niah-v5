-- ============================================================================
-- CORREÇÃO DA ESTRUTURA DA TABELA CALLS - METADADOS DINÂMICOS
-- ============================================================================
-- Este script remove as colunas fixas de metadados e adiciona uma coluna 
-- metadata do tipo JSON para armazenar metadados dinâmicos enviados pelo usuário

-- 1. REMOVER COLUNAS FIXAS DE METADADOS (que estavam sempre NULL)
ALTER TABLE calls DROP COLUMN IF EXISTS agent_name;
ALTER TABLE calls DROP COLUMN IF EXISTS campaign_name;
ALTER TABLE calls DROP COLUMN IF EXISTS client_name;
ALTER TABLE calls DROP COLUMN IF EXISTS client_email;
ALTER TABLE calls DROP COLUMN IF EXISTS client_phone;
ALTER TABLE calls DROP COLUMN IF EXISTS client_company;
ALTER TABLE calls DROP COLUMN IF EXISTS department;
ALTER TABLE calls DROP COLUMN IF EXISTS priority;

-- 2. ADICIONAR COLUNA METADATA DO TIPO JSON (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE calls ADD COLUMN metadata JSONB DEFAULT '{}';
        RAISE NOTICE 'Coluna metadata adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna metadata já existe!';
    END IF;
END $$;

-- 3. VERIFICAR SE A COLUNA phone_number EXISTE (deve ter sido criada anteriormente)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE calls ADD COLUMN phone_number VARCHAR(20);
        RAISE NOTICE 'Coluna phone_number adicionada!';
    ELSE
        RAISE NOTICE 'Coluna phone_number já existe!';
    END IF;
END $$;

-- 4. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN calls.metadata IS 'Metadados dinâmicos enviados pelo usuário (JSON)';
COMMENT ON COLUMN calls.phone_number IS 'Telefone extraído do campo phone_number_X da requisição';

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'calls' 
AND column_name IN ('metadata', 'phone_number', 'agent_name', 'client_name')
ORDER BY column_name;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Colunas fixas removidas: agent_name, campaign_name, client_name, etc.
-- - Nova coluna: metadata (JSONB)
-- - Coluna existente: phone_number (VARCHAR)
-- ============================================================================ 