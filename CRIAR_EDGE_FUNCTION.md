# Criar Edge Function no Supabase

## 🎯 Para Fazer a Análise em Lote Funcionar Realmente

Atualmente a interface está funcionando em **modo simulação**. Para funcionar de verdade, você precisa criar a Edge Function no seu projeto Supabase.

## 📋 Passo a Passo

### 1. Instalar Supabase CLI

```bash
# Windows (via npm)
npm install supabase --save-dev

# Mac/Linux (via Homebrew)  
brew install supabase/tap/supabase
```

### 2. Fazer Login no Supabase

```bash
npx supabase login
```

### 3. Vincular ao Projeto

```bash
npx supabase link --project-ref iyqrjgwqjmsnhtxbywme
```

### 4. Criar a Edge Function

```bash
npx supabase functions new analyze-batch
```

### 5. Implementar a Função

Edite o arquivo `supabase/functions/analyze-batch/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Permitir CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    })
  }

  try {
    console.log('🚀 Recebendo requisição de análise em lote...')
    
    // Verificar se é POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obter FormData
    const formData = await req.formData()
    
    // Extrair dados
    const callbackUrl = formData.get('callbackUrl')
    const criteriaStr = formData.get('criteria')
    
    console.log('📋 Dados recebidos:')
    console.log('- Callback URL:', callbackUrl)
    console.log('- Critérios:', criteriaStr)
    
    // Processar arquivos
    const audioFiles: File[] = []
    let index = 0
    
    while (true) {
      const audioFile = formData.get(`audioFiles_${index}`)
      if (!audioFile) break
      
      audioFiles.push(audioFile as File)
      
      const agent = formData.get(`agent_${index}`)
      const campaign = formData.get(`campaign_${index}`)
      const metadata = formData.get(`metadata_${index}`)
      
      console.log(`📁 Arquivo ${index + 1}:`)
      console.log('  - Nome:', (audioFile as File).name)
      console.log('  - Tamanho:', (audioFile as File).size)
      console.log('  - Agente:', agent)
      console.log('  - Campanha:', campaign)
      console.log('  - Metadata:', metadata)
      
      index++
    }

    console.log(`✅ Total de ${audioFiles.length} arquivos processados`)

    // Aqui você implementaria a lógica real de análise
    // Por enquanto, apenas confirmamos o recebimento
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Recebidos ${audioFiles.length} arquivos para análise`,
        jobId: `job_${Date.now()}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

### 6. Fazer Deploy

```bash
npx supabase functions deploy analyze-batch
```

### 7. Testar

Agora teste na interface - deve funcionar sem simulação!

## ✅ Status Atual

- ✅ Interface pronta e funcionando
- ✅ Formato de dados correto  
- ✅ Autorização configurada
- ✅ Simulação funcionando
- ⚠️ Edge Function precisa ser criada (instruções acima)

## 🚀 Depois que Criar

1. A interface automaticamente detectará que a Edge Function existe
2. Parará de usar simulação
3. Enviará dados reais para processamento

---

**Próximo passo:** Execute os comandos acima para criar a Edge Function! 🎯
 