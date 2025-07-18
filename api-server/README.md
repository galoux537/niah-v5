# NIAH Call Analysis API

API para análise automatizada de ligações usando IA - transcrição e avaliação por critérios específicos.

## 🚀 Configuração e Instalação

### 1. Instalar dependências
```bash
cd api-server
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Importante**: Configure sua chave da OpenAI no arquivo `.env`:
```
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

### 3. Iniciar o servidor
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📡 Endpoints Disponíveis

### 🎯 Análise de Ligação
**POST** `/api/v1/analyze-call`

Analisa uma ligação de áudio usando critérios específicos.

**Headers:**
- `x-company-id`: ID da empresa (obrigatório)
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
- `audio`: Arquivo de áudio (.mp3, .wav) - máximo 100MB
- `criteria`: JSON com critérios de avaliação
- `webhook_url`: URL para receber o resultado (opcional)

**Exemplo de critérios:**
```json
{
  "cordialidade": {
    "description": "Avaliar cordialidade no atendimento",
    "keywords": ["por favor", "obrigado", "com licença"],
    "weight": 30
  },
  "clareza": {
    "description": "Clareza na comunicação",
    "keywords": ["entendi", "compreendi", "pode repetir"],
    "weight": 25
  },
  "resolucao": {
    "description": "Capacidade de resolver problemas",
    "keywords": ["resolvido", "solucionado", "vou ajudar"],
    "weight": 45
  }
}
```

**Resposta:**
```json
{
  "status": "processing",
  "analysis_id": "analysis_1703123456789_abc123",
  "message": "Análise iniciada. O resultado será enviado via webhook quando concluído.",
  "estimated_time": "30-60 segundos"
}
```

### 🔗 Webhook de Resultado
**POST** `/api/v1/webhook/result`

Recebe resultados de análise concluída.

**Body:**
```json
{
  "status": "completed",
  "analysis_id": "analysis_1703123456789_abc123",
  "result": {
    "analysis_id": "analysis_1703123456789_abc123",
    "call_id": "uuid-da-ligacao",
    "transcription": "Transcrição completa da ligação...",
    "analysis": {
      "overall_score": 85,
      "criteria_scores": {
        "cordialidade": {
          "score": 90,
          "feedback": "Excelente cordialidade demonstrada...",
          "keywords_found": ["por favor", "obrigado"],
          "improvements": "Poderia usar mais expressões de cortesia"
        }
      },
      "summary": "Ligação com boa qualidade geral...",
      "strengths": ["Cordialidade", "Clareza na fala"],
      "areas_for_improvement": ["Tempo de resolução"]
    }
  }
}
```

### 🧪 Teste de Webhook
**POST** `/api/v1/webhook/test`

Endpoint para testar se webhooks estão funcionando.

### 📋 Documentação
**GET** `/api/v1/docs`

Retorna documentação completa da API.

### ❤️ Health Check
**GET** `/health`

Verifica se o servidor está funcionando.

## 🔧 Fluxo de Funcionamento

1. **Upload**: Cliente envia áudio + critérios via POST
2. **Transcrição**: Sistema usa OpenAI Whisper para transcrever
3. **Análise**: GPT-4o analisa transcrição segundo critérios
4. **Persistência**: Resultado salvo no Supabase
5. **Webhook**: Resultado enviado para URL fornecida (se informada)

## 🛠️ Tecnologias Utilizadas

- **Node.js + Express**: Servidor web
- **OpenAI Whisper**: Transcrição de áudio
- **OpenAI GPT-4o**: Análise inteligente
- **Supabase**: Banco de dados
- **Multer**: Upload de arquivos

## 🔒 Segurança

- Upload limitado a arquivos de áudio
- Tamanho máximo: 100MB
- Validação de empresa via header
- Timeouts configurados para APIs externas

## 📊 Multitenant

A API suporta múltiplas empresas:
- Header `x-company-id` identifica a empresa
- Dados salvos com isolamento por empresa
- Critérios podem ser específicos por empresa

## 🚨 Tratamento de Erros

A API retorna erros estruturados:
- `400`: Dados inválidos ou faltando
- `500`: Erro interno do servidor
- Webhooks de erro enviados quando falha processamento

## 📝 Logs

O servidor gera logs detalhados:
- ✅ Sucesso nas operações
- ❌ Erros com detalhes
- 🎯 Início de análises
- 🔗 Webhooks enviados

## 🔗 Integração com Frontend

Para integrar com o frontend React, use:

```javascript
const analyzeCall = async (audioFile, criteria, companyId) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('criteria', JSON.stringify(criteria));
  formData.append('webhook_url', 'https://sua-app.com/webhook');

  const response = await fetch('http://localhost:3001/api/v1/analyze-call', {
    method: 'POST',
    headers: {
      'x-company-id': companyId
    },
    body: formData
  });

  return response.json();
};
``` 