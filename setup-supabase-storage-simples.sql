-- ====================================================================
-- CONFIGURAÇÃO RÁPIDA: SUPABASE STORAGE + BANCO - NIAH!
-- ====================================================================
-- COPIE E COLE NO SQL EDITOR DO SUPABASE

-- 1. CRIAR BUCKET call-audios
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('call-audios', 'call-audios', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE ACESSO (PERMISSÃO TOTAL PARA TESTE)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'call-audios');

CREATE POLICY "Allow public downloads" ON storage.objects 
FOR SELECT USING (bucket_id = 'call-audios');

-- 3. ADICIONAR COLUNAS NA TABELA calls
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_storage_url TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_storage_path TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_file_name TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_file_size BIGINT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_public_url TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS has_audio BOOLEAN DEFAULT false;

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_calls_audio_storage_path ON calls(audio_storage_path);
CREATE INDEX IF NOT EXISTS idx_calls_has_audio ON calls(has_audio);

-- ✅ CONFIGURAÇÃO CONCLUÍDA!
-- Agora você pode usar o Supabase Storage normalmente. 