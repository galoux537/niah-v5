-- Adiciona coluna criteria_id na tabela evaluation_lists (nullable)
-- Execute no Supabase SQL editor ou via psql

ALTER TABLE public.evaluation_lists
ADD COLUMN IF NOT EXISTS criteria_id uuid;

-- Opcional: criar FK se existir tabela criteria
-- ALTER TABLE public.evaluation_lists
--   ADD CONSTRAINT fk_evaluation_lists_criteria
--   FOREIGN KEY (criteria_id) REFERENCES public.criteria(id);

-- Verifica se coluna foi adicionada
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'evaluation_lists' AND column_name = 'criteria_id'; 