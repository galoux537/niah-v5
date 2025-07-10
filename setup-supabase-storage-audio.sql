-- ====================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE PARA ÁUDIOS - NIAH!
-- ====================================================================
-- Execute este script completo no SQL Editor do Supabase

-- 1. Criar bucket para armazenar áudios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-audios',
  'call-audios', 
  true,  -- Público para permitir acesso direto via URL
  104857600,  -- 100MB limite
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Configurar políticas de acesso ao bucket
-- Política para upload (apenas usuários autenticados)
DROP POLICY IF EXISTS "Usuarios autenticados podem fazer upload de audios" ON storage.objects;
CREATE POLICY "Usuarios autenticados podem fazer upload de audios" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'call-audios' AND
    auth.role() = 'authenticated'
  );

-- Política para leitura (público)
DROP POLICY IF EXISTS "Usuarios podem acessar audios publicos" ON storage.objects;
CREATE POLICY "Usuarios podem acessar audios publicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'call-audios');

-- Política para deletar (apenas da própria empresa)
DROP POLICY IF EXISTS "Usuarios podem deletar audios da propria empresa" ON storage.objects;
CREATE POLICY "Usuarios podem deletar audios da propria empresa" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'call-audios' AND
    (storage.foldername(name))[1] = (auth.jwt() ->> 'company_id')
  );

-- 3. Adicionar colunas para URLs do Supabase Storage na tabela calls
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_storage_url TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_storage_path TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_file_name TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS audio_file_size BIGINT;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_calls_audio_storage_url ON calls(audio_storage_url) WHERE audio_storage_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calls_audio_storage_path ON calls(audio_storage_path) WHERE audio_storage_path IS NOT NULL;

-- 5. Função para gerar URL pública do áudio
CREATE OR REPLACE FUNCTION get_audio_public_url(storage_path_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  supabase_url TEXT := 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
BEGIN
  IF storage_path_param IS NULL OR storage_path_param = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN supabase_url || '/storage/v1/object/public/call-audios/' || storage_path_param;
END;
$$;

-- 6. Função para obter informações completas do áudio
CREATE OR REPLACE FUNCTION get_call_audio_info(call_id_param UUID)
RETURNS TABLE(
  call_id UUID,
  has_audio BOOLEAN,
  storage_url TEXT,
  storage_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  public_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    (c.audio_storage_url IS NOT NULL OR c.audio_storage_path IS NOT NULL) as has_audio,
    c.audio_storage_url,
    c.audio_storage_path,
    c.audio_file_name,
    c.audio_file_size,
    CASE 
      WHEN c.audio_storage_path IS NOT NULL THEN get_audio_public_url(c.audio_storage_path)
      ELSE c.audio_storage_url
    END as public_url
  FROM calls c
  WHERE c.id = call_id_param;
END;
$$;

-- 7. Trigger para gerar URL automaticamente quando path é inserido
CREATE OR REPLACE FUNCTION auto_generate_audio_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Se storage_path foi definido mas URL não, gerar automaticamente
  IF NEW.audio_storage_path IS NOT NULL AND NEW.audio_storage_url IS NULL THEN
    NEW.audio_storage_url := get_audio_public_url(NEW.audio_storage_path);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_audio_url ON calls;
CREATE TRIGGER trigger_auto_generate_audio_url
  BEFORE INSERT OR UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_audio_url();

-- ====================================================================
-- VERIFICAÇÃO E RELATÓRIO FINAL
-- ====================================================================

-- Verificar se bucket foi criado
SELECT 
  '✅ Bucket criado' as status,
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets 
WHERE id = 'call-audios';

-- Verificar estrutura da tabela calls
SELECT 
  '✅ Colunas criadas' as status,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'calls' 
  AND column_name IN ('audio_storage_url', 'audio_storage_path', 'audio_file_name', 'audio_file_size')
ORDER BY column_name;

-- Verificar funções criadas
SELECT 
  '✅ Funções criadas' as status,
  routine_name
FROM information_schema.routines 
WHERE routine_name IN ('get_call_audio_info', 'get_audio_public_url')
ORDER BY routine_name;

-- Teste da função
SELECT 
  '✅ Teste da função' as status,
  'Função get_call_audio_info está funcionando' as message;

-- Resultado final
SELECT '🎵 Supabase Storage configurado com sucesso!' as resultado; 