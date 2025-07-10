-- ====================================================================
-- ADICIONAR CAMPO SUB_CRITERIA COM MÉDIAS DOS SUBCRITÉRIOS
-- ====================================================================
-- Este script adiciona o campo sub_criteria na tabela evaluation_lists
-- para armazenar as médias dos subcritérios do webhook batch_completed
-- ====================================================================

-- 1. Adicionar coluna sub_criteria se não existir
ALTER TABLE evaluation_lists 
ADD COLUMN IF NOT EXISTS sub_criteria JSONB DEFAULT '[]'::jsonb;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN evaluation_lists.sub_criteria IS 'Array JSON com subcritérios e suas médias: [{"id": "uuid", "name": "Cordialidade", "avg_score": 7.5}]';

-- 3. Criar índice para consultas rápidas nos subcritérios
CREATE INDEX IF NOT EXISTS idx_evaluation_lists_sub_criteria ON evaluation_lists USING GIN (sub_criteria);

-- 4. Verificar se a coluna foi criada corretamente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evaluation_lists'
AND column_name = 'sub_criteria'
AND table_schema = 'public';

-- 5. Exemplo de como os dados serão armazenados:
-- sub_criteria: [
--   {
--     "id": "a4b44752-6e30-4d22-be73-6dd53710e7a3",
--     "name": "Finalização",
--     "avg_score": 6.0
--   },
--   {
--     "id": "6c264fb9-b03c-4dcf-8c20-57ed75b1a504", 
--     "name": "Cordialidade",
--     "avg_score": 7.0
--   }
-- ]

-- ====================================================================
-- SUCESSO! Campo sub_criteria adicionado com sucesso
-- ==================================================================== 