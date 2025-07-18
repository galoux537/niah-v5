# 🚀 CallAnalyzer API - Sistema de Análise em Lote

## Visão Geral

O CallAnalyzer API é um sistema inteligente integrado ao NIAH! que automatiza a análise de ligações telefônicas usando inteligência artificial. O sistema permite processar múltiplas ligações simultaneamente, organizadas por cliente, campanha ou agente.

## ✨ Funcionalidades Principais

### 🎯 Análise em Lote
- **Processamento Simultâneo**: Até 50 arquivos por lote
- **Formatos Suportados**: MP3, WAV (máx 25MB cada)
- **Análise Inteligente**: IA avalia cada ligação baseada em critérios personalizáveis
- **Notificações em Tempo Real**: Webhooks para acompanhar progresso

### 📊 Métricas Avançadas
- **Score Médio Geral**: Consolidação de todas as ligações
- **Médias por Critério**: Performance detalhada por aspecto avaliado
- **Distribuição de Scores**: Classificação (excelente, bom, médio, ruim)
- **Ranking de Performance**: Comparação entre clientes/agentes
- **Identificação de Oportunidades**: Áreas de melhoria automaticamente detectadas

### 🔄 Processamento Assíncrono
- **Resposta Imediata**: API retorna jobId para acompanhamento
- **Processamento Sequencial**: Garante qualidade na análise
- **Recuperação de Falhas**: Sistema robusto contra erros
- **Timeouts Inteligentes**: 5min transcrição, 3min análise

## 🛠️ Endpoints da API

### POST `/api/v1/analyze-batch`
Inicia análise em lote de múltiplas ligações

**Parâmetros:**
```javascript
// FormData
audioFiles: [File, File, ...] // Array de arquivos de áudio
criteria: JSON.stringify({
  "Cordialidade": "Avaliar tom amigável e profissional",
  "Clareza": "Verificar comunicação clara e objetiva"
})
callbackUrl: "https://webhook.site/your-url" // Opcional
metadata_0: JSON.stringify({ name: "Cliente 1", email: "cliente1@email.com" })
campaign_0: "Black Friday 2025"
agent_0: "Maria Santos"
// ... metadata_N, campaign_N, agent_N para cada arquivo
```

**Resposta:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "message": "Lote aceito para processamento",
  "totalCalls": 5,
  "estimatedTimeMinutes": 5,
  "timestamp": "2025-01-20T15:30:00.000Z"
}
```

### GET `/api/v1/analyze-batch?jobId={id}`
Consulta status e progresso de um lote específico

**Resposta:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing", // "processing" | "completed" | "failed"
  "progress": {
    "percentage": 60,
    "current": 3,
    "total": 5
  },
  "estimatedTimeRemaining": 2,
  "totalCalls": 5,
  "completedCalls": 3,
  "failedCalls": 0,
  "partialMetrics": {
    "averageOverallScore": 8.3,
    "criteriaAverages": {
      "Cordialidade": 8.5,
      "Clareza": 8.1
    }
  },
  "calls": [
    {
      "id": "call-uuid-1",
      "filename": "ligacao1.mp3",
      "status": "completed",
      "metadata": { "name": "Cliente 1" },
      "analysis": {
        "overall_score": 8.5,
        "criteria_scores": {
          "Cordialidade": 9.0,
          "Clareza": 8.0
        },
        "summary": "Excelente atendimento..."
      }
    }
  ]
}
```

### GET `/api/v1/batch-jobs`
Lista todos os lotes de análise ordenados por data

**Resposta:**
```json
{
  "jobs": [
    {
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "totalCalls": 5,
      "completedCalls": 5,
      "failedCalls": 0,
      "createdAt": "2025-01-20T15:30:00.000Z",
      "completedAt": "2025-01-20T15:35:00.000Z",
      "progress": {
        "percentage": 100,
        "current": 5,
        "total": 5
      }
    }
  ]
}
```

## 🎣 Sistema de Webhooks

O sistema envia notificações em tempo real sobre o progresso:

### Eventos Disponíveis

#### `job_started` - Lote Iniciado
```json
{
  "event": "job_started",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "totalCalls": 5,
  "timestamp": "2025-01-20T15:30:00.000Z"
}
```

#### `call_started` - Ligação Individual Iniciada
```json
{
  "event": "call_started",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "callId": "call-uuid-1",
  "callIndex": 1,
  "totalCalls": 5,
  "metadata": { "name": "Cliente 1" },
  "filename": "ligacao1.mp3",
  "timestamp": "2025-01-20T15:30:15.000Z"
}
```

#### `call_transcription_completed` - Transcrição Finalizada
```json
{
  "event": "call_transcription_completed",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "callId": "call-uuid-1",
  "transcript": "Transcrição da ligação...",
  "timestamp": "2025-01-20T15:31:00.000Z"
}
```

#### `call_completed` - Análise de Ligação Finalizada
```json
{
  "event": "call_completed",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "callId": "call-uuid-1",
  "analysis": {
    "overall_score": 8.5,
    "criteria_scores": {
      "Cordialidade": 9.0,
      "Clareza": 8.0
    },
    "summary": "Excelente atendimento com demonstração clara..."
  },
  "timestamp": "2025-01-20T15:32:00.000Z"
}
```

#### `call_error` - Erro em Ligação Específica
```json
{
  "event": "call_error",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "callId": "call-uuid-1",
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Erro na transcrição: arquivo corrompido"
  },
  "timestamp": "2025-01-20T15:31:30.000Z"
}
```

#### `job_completed` - Lote Finalizado com Métricas
```json
{
  "event": "job_completed",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "totalCalls": 5,
  "completedCalls": 4,
  "failedCalls": 1,
  "metricsSummary": {
    "averageOverallScore": 8.2,
    "criteriaAverages": {
      "Cordialidade": 8.5,
      "Clareza": 7.9
    },
    "scoreDistribution": {
      "excellent": 2,
      "good": 2,
      "average": 0,
      "poor": 0
    },
    "topPerformingCriteria": [
      { "criterion": "Cordialidade", "averageScore": 8.5 }
    ],
    "clientPerformance": [
      { "clientName": "Cliente 1", "overallScore": 8.5 },
      { "clientName": "Cliente 2", "overallScore": 8.1 }
    ]
  },
  "timestamp": "2025-01-20T15:35:00.000Z"
}
```

#### `job_failed` - Falha no Processamento do Lote
```json
{
  "event": "job_failed",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "error": {
    "code": "BATCH_PROCESSING_FAILED",
    "message": "Erro crítico no processamento do lote"
  },
  "timestamp": "2025-01-20T15:31:00.000Z"
}
```

## 💻 Interface Web

### Página de Análise em Lote
Acesse através do menu: **🚀 Análise em Lote**

**Funcionalidades:**
- ✅ Upload drag-and-drop de múltiplos arquivos
- ✅ Configuração de metadata por arquivo (nome, email, campanha, agente)
- ✅ Critérios de avaliação personalizáveis
- ✅ Configuração de webhook para notificações
- ✅ Monitoramento em tempo real do progresso
- ✅ Visualização detalhada de métricas
- ✅ Download de resultados

### Dashboard de Jobs
- **Lista de Jobs Ativos**: Acompanhe todos os lotes em processamento
- **Progresso Visual**: Barras de progresso em tempo real
- **Detalhes Expandidos**: Modal com informações completas
- **Métricas Consolidadas**: Visualização de performance

## 📈 Casos de Uso Ideais

### 🏢 Call Centers
- **Avaliação Diária**: Processar todas as ligações do dia
- **Monitoramento de Qualidade**: Identificar padrões de atendimento
- **Treinamento**: Detectar oportunidades de capacitação

### 🎯 Equipes de Vendas
- **Análise por Campanha**: Avaliar performance de campanhas específicas
- **Comparação de Agentes**: Ranking de performance
- **Otimização de Scripts**: Identificar abordagens mais eficazes

### 📚 Treinamento e Auditoria
- **Avaliação de Novos Atendentes**: Análise estruturada de performance
- **Auditoria de Conformidade**: Verificação de protocolos
- **Feedback Automatizado**: Relatórios detalhados para coaching

## ⚙️ Configuração e Instalação

### 1. Dependências
```bash
cd api-server
npm install uuid node-fetch
```

### 2. Configuração de Ambiente
```bash
# .env
OPENAI_API_KEY=sua-chave-openai-aqui  # Para produção
PORT=3001
```

### 3. Iniciar Serviços
```bash
# Terminal 1 - API Server
cd api-server
npm start

# Terminal 2 - Frontend
npm run dev
```

### 4. Testar Webhooks
Recomendamos usar [webhook.site](https://webhook.site) para testar notificações em tempo real.

## 🔧 Configuração para Produção

### Substituir Simulação por IA Real

**Transcrição (OpenAI Whisper):**
```javascript
async function transcribeAudio(audioBuffer, filename) {
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  
  const transcription = await openai.audio.transcriptions.create({
    file: blob,
    model: 'whisper-1',
    language: 'pt'
  });
  
  return transcription.text;
}
```

**Análise (GPT-4o):**
```javascript
async function analyzeTranscription(transcript, criteria, metadata, campaign, agent) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000
  });
  
  return JSON.parse(completion.choices[0].message.content);
}
```

### Armazenamento Persistente
Substitua `Map()` por Redis ou banco de dados para jobs:

```javascript
// Redis example
import Redis from 'redis';
const redis = Redis.createClient();

// Salvar job
await redis.hset(`job:${jobId}`, job);

// Recuperar job
const job = await redis.hgetall(`job:${jobId}`);
```

## 📊 Métricas e Monitoramento

### KPIs Calculados
- **Taxa de Sucesso**: % de ligações processadas com sucesso
- **Tempo Médio de Processamento**: Duração média por ligação
- **Distribuição de Scores**: Classificação de qualidade
- **Performance por Critério**: Identificação de pontos fortes/fracos
- **Ranking de Agentes/Clientes**: Comparação de performance

### Alertas Recomendados
- Taxa de falhas > 10%
- Tempo de processamento > 5min por ligação
- Score médio < 6.0
- Erros críticos no sistema

## 🚨 Tratamento de Erros

### Códigos de Erro
- `MISSING_FILES`: Nenhum arquivo fornecido
- `TOO_MANY_FILES`: Mais de 50 arquivos
- `FILE_TOO_LARGE`: Arquivo > 25MB
- `FILE_TOO_SMALL`: Arquivo < 1KB
- `INVALID_CRITERIA`: JSON de critérios inválido
- `PROCESSING_FAILED`: Erro no processamento da ligação
- `BATCH_PROCESSING_FAILED`: Erro crítico no lote

### Recuperação Automática
- Timeout automático em transcrições/análises
- Continuação do processamento mesmo com falhas individuais
- Log detalhado de erros para debugging

## 📝 Exemplos de Uso

### Exemplo JavaScript - Frontend
```javascript
// Upload de lote
const formData = new FormData();
formData.append('criteria', JSON.stringify({
  'Cordialidade': 'Avaliar tom amigável',
  'Clareza': 'Verificar comunicação clara'
}));

files.forEach((file, index) => {
  formData.append('audioFiles', file);
  formData.append(`metadata_${index}`, JSON.stringify({
    name: 'Cliente ' + (index + 1),
    email: `cliente${index + 1}@email.com`
  }));
});

const response = await fetch('/api/v1/analyze-batch', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Job ID:', result.jobId);

// Monitorar progresso
const checkProgress = async () => {
  const response = await fetch(`/api/v1/analyze-batch?jobId=${result.jobId}`);
  const status = await response.json();
  console.log('Progresso:', status.progress.percentage + '%');
};
```

### Exemplo cURL
```bash
# Iniciar análise em lote
curl -X POST http://localhost:3001/api/v1/analyze-batch \
  -F "audioFiles=@ligacao1.mp3" \
  -F "audioFiles=@ligacao2.mp3" \
  -F 'criteria={"Cordialidade":"Avaliar tom amigável"}' \
  -F 'metadata_0={"name":"Cliente 1"}' \
  -F 'metadata_1={"name":"Cliente 2"}'

# Consultar status
curl "http://localhost:3001/api/v1/analyze-batch?jobId=550e8400-e29b-41d4-a716-446655440000"
```

## 🎉 Resultados

O sistema CallAnalyzer transforma o processo manual de avaliação de ligações em um pipeline automatizado e inteligente, fornecendo:

- **Insights Valiosos**: Métricas detalhadas sobre qualidade do atendimento
- **Eficiência Operacional**: Redução drástica no tempo de análise
- **Consistência**: Avaliação padronizada e imparcial
- **Escalabilidade**: Capacidade de processar grandes volumes
- **Visibilidade**: Dashboards e relatórios em tempo real

---

*Desenvolvido pela equipe NIAH! - Transformando atendimento com inteligência artificial* 🚀 