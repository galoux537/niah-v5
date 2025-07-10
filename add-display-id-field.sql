-- Script para adicionar campo display_id na tabela companies
-- Este campo será um ID sequencial que funcionará como máscara do UUID real

-- 1. Adicionar coluna display_id
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS display_id INTEGER UNIQUE;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_companies_display_id ON companies(display_id);

-- 3. Criar sequence para auto-incremento
CREATE SEQUENCE IF NOT EXISTS companies_display_id_seq;

-- 4. Função para atribuir display_id automaticamente em novos registros
CREATE OR REPLACE FUNCTION assign_company_display_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_id IS NULL THEN
        NEW.display_id = nextval('companies_display_id_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para novos registros
DROP TRIGGER IF EXISTS trigger_assign_display_id ON companies;
CREATE TRIGGER trigger_assign_display_id
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION assign_company_display_id();

-- 6. Atualizar registros existentes que não têm display_id
-- (Executar apenas uma vez)
WITH numbered_companies AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY created_at) as seq_num
    FROM companies 
    WHERE display_id IS NULL
)
UPDATE companies 
SET display_id = numbered_companies.seq_num
FROM numbered_companies 
WHERE companies.id = numbered_companies.id;

-- 7. Atualizar a sequence para o próximo valor correto
SELECT setval('companies_display_id_seq', COALESCE(MAX(display_id), 0) + 1, false) 
FROM companies;

-- 8. Comentário da coluna
COMMENT ON COLUMN companies.display_id IS 'ID sequencial público para mascarar o UUID real da empresa';

-- Verificar resultados
SELECT id, name, display_id, created_at 
FROM companies 
ORDER BY display_id; 