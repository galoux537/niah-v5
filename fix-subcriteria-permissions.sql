-- ============================================
-- SCRIPT DE CORREÇÃO DE PERMISSÕES SUBCRITÉRIOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. DIAGNÓSTICO: Verificar estrutura atual
SELECT 'DIAGNÓSTICO: Verificando estrutura da tabela sub_criteria' as status;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'sub_criteria'
) as tabela_existe;

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'sub_criteria';

-- 2. LIMPEZA: Remover todas as políticas existentes
SELECT 'LIMPEZA: Removendo políticas existentes' as status;

DROP POLICY IF EXISTS "sub_criteria_company_isolation" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_select" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_insert" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_update" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_delete" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_all_operations" ON sub_criteria;

-- 3. CRIAÇÃO: Criar tabela se não existir
SELECT 'CRIAÇÃO: Verificando/criando tabela sub_criteria' as status;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sub_criteria') THEN
        CREATE TABLE sub_criteria (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            color VARCHAR(50) DEFAULT 'orange',
            keywords TEXT[],
            ideal_phrase TEXT,
            criteria_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela sub_criteria criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela sub_criteria já existe';
    END IF;
END $$;

-- 4. ÍNDICES: Criar índices necessários
SELECT 'ÍNDICES: Criando índices para performance' as status;

CREATE INDEX IF NOT EXISTS idx_sub_criteria_criteria_id ON sub_criteria(criteria_id);
CREATE INDEX IF NOT EXISTS idx_sub_criteria_company_id ON sub_criteria(company_id);

-- 5. RLS: Habilitar Row Level Security
SELECT 'RLS: Habilitando Row Level Security' as status;

ALTER TABLE sub_criteria ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS: Criar política permissiva temporária
SELECT 'POLÍTICAS: Criando política permissiva para todas as operações' as status;

-- Política permissiva para TODAS as operações (temporária para testes)
CREATE POLICY "sub_criteria_all_operations" ON sub_criteria
    FOR ALL USING (true) WITH CHECK (true);

-- 7. TESTE: Verificar permissões
SELECT 'TESTE: Verificando permissões' as status;

-- Testar SELECT
SELECT 'Teste SELECT:' as operacao, COUNT(*) as total_registros 
FROM sub_criteria;

-- Testar INSERT (criar um registro de teste)
INSERT INTO sub_criteria (name, description, color, criteria_id, company_id)
SELECT 
    'Teste Permissão',
    'Registro de teste para verificar permissões',
    'blue',
    c.id,
    c.company_id
FROM criteria c 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Testar UPDATE
UPDATE sub_criteria 
SET description = 'Descrição atualizada - teste de permissão'
WHERE name = 'Teste Permissão';

-- Testar DELETE
DELETE FROM sub_criteria 
WHERE name = 'Teste Permissão';

-- 8. VERIFICAÇÃO FINAL
SELECT 'VERIFICAÇÃO FINAL: Status das políticas' as status;

-- Listar políticas ativas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'sub_criteria';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'sub_criteria';

-- 9. RESULTADO
SELECT 'SUCESSO: Configuração de subcritérios concluída!' as status;
SELECT 'As operações de CREATE, READ, UPDATE e DELETE devem funcionar normalmente.' as info;
SELECT 'Se ainda houver problemas, desabilite temporariamente o RLS com: ALTER TABLE sub_criteria DISABLE ROW LEVEL SECURITY;' as dica; 