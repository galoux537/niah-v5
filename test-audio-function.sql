-- ====================================================================
-- TESTE RÁPIDO: Função para buscar áudio - NIAH!
-- ====================================================================
-- Execute APENAS este script no SQL Editor do Supabase

-- 1. Adicionar colunas se não existirem
ALTER TABLE calls 
ADD COLUMN IF NOT EXISTS audio_storage_url TEXT,
ADD COLUMN IF NOT EXISTS audio_storage_path TEXT,
ADD COLUMN IF NOT EXISTS audio_file_name TEXT,
ADD COLUMN IF NOT EXISTS audio_file_size BIGINT,
ADD COLUMN IF NOT EXISTS audio_public_url TEXT,
ADD COLUMN IF NOT EXISTS has_audio BOOLEAN DEFAULT false;

-- 2. Criar função para buscar informações do áudio
CREATE OR REPLACE FUNCTION get_call_audio_info(call_id_param UUID)
RETURNS TABLE (
    call_id UUID,
    has_audio BOOLEAN,
    storage_url TEXT,
    storage_path TEXT,
    file_name TEXT,
    file_size BIGINT,
    public_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as call_id,
        COALESCE(c.has_audio, false) as has_audio,
        c.audio_storage_url as storage_url,
        c.audio_storage_path as storage_path,
        c.audio_file_name as file_name,
        c.audio_file_size as file_size,
        c.audio_public_url as public_url
    FROM calls c
    WHERE c.id = call_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar se funcionou
SELECT 'Função get_call_audio_info criada com sucesso!' as status; 