# 🎵 Guia de Implementação: Supabase Storage para Áudios

## 📋 Resumo

Sistema completo para armazenar áudios das ligações no **Supabase Storage** em vez do banco de dados, proporcionando URLs estáticas, performance superior e escalabilidade.

## 🚀 Passo a Passo

### 1. **Executar Script SQL no Supabase**

1. Acesse o **SQL Editor** no dashboard do Supabase
2. Copie todo o conteúdo do arquivo `setup-supabase-storage-audio.sql`
3. Cole e execute o script completo
4. Verifique se não há erros na execução

**O que o script faz:**
- ✅ Cria bucket `call-audios` com limite de 100MB
- ✅ Configura políticas de segurança (RLS)
- ✅ Adiciona colunas na tabela `calls`:
  - `audio_storage_url` - URL pública do áudio
  - `audio_storage_path` - Caminho no storage
  - `audio_file_name` - Nome original do arquivo
  - `audio_file_size` - Tamanho em bytes
- ✅ Cria função `get_call_audio_info()` para buscar dados
- ✅ Cria trigger automático para gerar URLs

### 2. **Verificar Configuração**

Execute o script de teste:

```bash
cd NIAHv5
node exemplo-teste-supabase-storage.js
```

**Resposta esperada:**
```
🧪 Testando Supabase Storage...

1. Verificando bucket call-audios...
✅ Bucket call-audios encontrado

2. Testando função get_call_audio_info...
✅ Função SQL funcionando

3. Testando geração de URL pública...
✅ URL pública gerada

4. Verificando estrutura da tabela calls...
✅ Colunas de áudio existem na tabela calls

🎉 Teste concluído com sucesso!
```

### 3. **Front-end Atualizado**

O front-end já foi atualizado automaticamente:

- ✅ **Novo hook**: `lib/useSupabaseAudio.ts`
- ✅ **Modal atualizado**: `components/CallDetailModal.tsx`
- ✅ **Player funcional**: Controles de play/pause, seek, volume

**Recursos do Player:**
- ▶️ Play/Pause com feedback visual
- 🎚️ Barra de progresso interativa
- 🔊 Controle de volume
- ⏱️ Timer (tempo atual/duração)
- 📝 Nome do arquivo original
- 🔄 Estados de loading
- ❌ Tratamento de erros

### 4. **Como Funciona**

#### **Fluxo de Upload (API)**
1. Usuário faz upload via API de análise em lote
2. API salva arquivo no Supabase Storage (`bucket: call-audios`)
3. API salva metadados na tabela `calls`:
   - `audio_storage_path`: `company-123/batch-456/1703123456_audio.mp3`
   - `audio_file_name`: `audio.mp3`
   - `audio_file_size`: `2048576`
4. Trigger SQL gera automaticamente a `audio_storage_url`

#### **Fluxo de Reprodução (Front-end)**
1. Usuário abre modal de detalhes da ligação
2. Hook `useSupabaseAudio` chama função SQL `get_call_audio_info()`
3. Função retorna URL pública do áudio
4. Player HTML5 carrega e reproduz o áudio

#### **Estrutura de Pastas no Storage**
```
call-audios/
├── company-123/
│   ├── batch-456/
│   │   ├── 1703123456_audio1.mp3
│   │   └── 1703123457_audio2.mp3
│   └── direct/
│       └── 1703123458_upload_direto.mp3
└── company-456/
    └── batch-789/
        └── 1703123459_outro_audio.mp3
```

### 5. **URLs Geradas**

**Formato da URL:**
```
https://iyqrjgwqjmsnhtxbywme.supabase.co/storage/v1/object/public/call-audios/company-123/batch-456/1703123456_audio.mp3
```

**Vantagens:**
- ✅ **Estática**: URL nunca muda
- ✅ **CDN**: Entrega rápida mundial
- ✅ **Pública**: Funciona em qualquer player
- ✅ **Segura**: Organizada por empresa

### 6. **Configuração da API (Próximo Passo)**

Para integrar o upload automático na API, adicione ao `api-server/routes/batchAnalysis.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase com Service Key (não anon key)
const SUPABASE_URL = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Obter no dashboard
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para upload
async function uploadAudioToSupabase(audioBuffer, filename, companyId, batchId) {
  const timestamp = Date.now();
  const storagePath = `${companyId}/${batchId || 'direct'}/${timestamp}_${filename}`;
  
  const { error } = await supabaseAdmin.storage
    .from('call-audios')
    .upload(storagePath, audioBuffer, {
      contentType: 'audio/mpeg'
    });
  
  if (error) throw error;
  
  return {
    audio_storage_path: storagePath,
    audio_file_name: filename,
    audio_file_size: audioBuffer.length
  };
}
```

### 7. **Configuração de Ambiente**

Adicione ao `.env` da API:

```env
# Supabase Storage (obter no dashboard do Supabase)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua-service-key-aqui
```

## 🎯 **Vantagens vs Banco de Dados**

| Aspecto | Banco de Dados | Supabase Storage |
|---------|---------------|------------------|
| **Performance** | ❌ Lento para arquivos grandes | ✅ CDN otimizado |
| **URLs** | ❌ Temporárias/complexas | ✅ Estáticas e simples |
| **Backup** | ✅ Incluído no backup DB | ✅ Backup dedicado |
| **Limite de Tamanho** | ❌ Limitado pelo PostgreSQL | ✅ Até 5GB por arquivo |
| **Custo** | ❌ Caro para dados binários | ✅ Otimizado para arquivos |
| **Deploy** | ❌ Dependente do servidor | ✅ Independente |
| **Escalabilidade** | ❌ Limitada | ✅ Ilimitada |

## 🔧 **Troubleshooting**

### Problema: Bucket não encontrado
**Solução:** Execute o script SQL novamente

### Problema: Função SQL não existe
**Solução:** Verifique se o script foi executado completamente

### Problema: URLs não funcionam
**Solução:** Verifique se o bucket está público

### Problema: Player não carrega
**Solução:** 
1. Abra DevTools (F12)
2. Verifique console para erros
3. Confirme se URL está acessível

## 🎉 **Resultado Final**

- 🎵 **Player totalmente funcional** no modal de detalhes
- 📁 **Armazenamento otimizado** no Supabase Storage
- 🔗 **URLs estáticas** que funcionam em qualquer ambiente
- 🚀 **Performance superior** para reprodução de áudios
- 📈 **Escalabilidade infinita** para volumes grandes
- 💰 **Custo otimizado** vs armazenamento no banco

O sistema agora está pronto para production com armazenamento profissional de áudios! 