# 🔧 CORREÇÃO: Rate Limiting e Arquivos Ausentes

## 🚨 **Problemas Identificados**

### 1. **Rate Limiting de Webhooks (HTTP 429)**
```
❌ Erro ao enviar webhook: Request failed with status code 429
❌ Webhook de ligação falhada (validação) enviado: missing_audio_72
```

### 2. **Arquivos Ausentes (missing_audio)**
```
❌ Arquivo inválido, pulando processamento: missing_audio_72
❌ Arquivo inválido, pulando processamento: missing_audio_73
```

## ✅ **Correções Implementadas**

### 1. **Sistema de Rate Limiting Inteligente**

#### **Implementação:**
```javascript
// Cache para controlar rate limiting por URL
const webhookRateLimit = new Map();

async function sendWebhook(url, data) {
  // Rate limiting: máximo 10 webhooks por minuto por URL
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  if (!webhookRateLimit.has(url)) {
    webhookRateLimit.set(url, []);
  }
  
  const webhookHistory = webhookRateLimit.get(url);
  
  // Remover webhooks antigos (mais de 1 minuto)
  const recentWebhooks = webhookHistory.filter(timestamp => now - timestamp < oneMinute);
  webhookRateLimit.set(url, recentWebhooks);
  
  // Verificar se excedeu o limite
  if (recentWebhooks.length >= 10) {
    console.warn(`⚠️ Rate limit atingido para ${url}. Aguardando 1 minuto...`);
    await new Promise(resolve => setTimeout(resolve, oneMinute));
  }
  
  // ... envio do webhook ...
  
  // Se for erro 429, aguardar mais tempo e tentar novamente
  if (error.response && error.response.status === 429) {
    console.warn(`🔄 Rate limit detectado (429). Aguardando 2 minutos...`);
    await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
    
    // Tentar novamente uma vez
    // ...
  }
}
```

#### **Benefícios:**
- ✅ **Prevenção**: Evita atingir rate limits antes de acontecer
- ✅ **Retry Automático**: Tenta novamente em caso de erro 429
- ✅ **Por URL**: Cada webhook tem seu próprio controle
- ✅ **Limpeza Automática**: Remove timestamps antigos

### 2. **Delays Entre Processamentos**

#### **Implementação:**
```javascript
// Delay entre processamento de ligações para evitar sobrecarga
if (index > 0) {
  console.log(`⏳ Aguardando 2 segundos antes de processar próxima ligação...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Aguardar um pouco antes de enviar webhook para evitar rate limiting
await new Promise(resolve => setTimeout(resolve, 1000));
```

#### **Benefícios:**
- ✅ **Reduz Sobrecarga**: Evita processar muitas ligações simultaneamente
- ✅ **Webhooks Estáveis**: Espaça o envio de webhooks
- ✅ **Melhor Performance**: Sistema mais responsivo

### 3. **Melhor Tratamento de Arquivos Ausentes**

#### **Problema Original:**
- Arquivos com nome `missing_audio_X` indicavam falha na validação
- Sistema não diferenciava entre arquivo ausente e arquivo inválido

#### **Solução Implementada:**
```javascript
const fileNameSafe = file ? file.originalname : `missing_audio_${callData.index}`;

// Verificar se o arquivo é válido
if (!validation || !validation.isValid) {
  console.log(`❌ Arquivo inválido, pulando processamento: ${fileNameSafe}`);
  
  // Registrar como falha com detalhes específicos
  const validationErrors = validation?.errors || [{ 
    type: 'UNKNOWN_ERROR', 
    message: 'Erro de validação desconhecido' 
  }];
  
  // Webhook com informações completas
  const callFailedPayload = {
    event: 'call_failed',
    error_type: 'VALIDATION_ERROR',
    validation_errors: validationErrors,
    // ... outros campos
  };
}
```

## 📊 **Resultados Esperados**

### **Antes das Correções:**
```
❌ Erro ao enviar webhook: Request failed with status code 429
❌ Arquivo inválido, pulando processamento: missing_audio_72
❌ Arquivo inválido, pulando processamento: missing_audio_73
```

### **Depois das Correções:**
```
⏳ Aguardando 2 segundos antes de processar próxima ligação...
📤 Enviando webhook para: https://webhook.site/...
✅ Webhook enviado: call_failed - Status: 200
📞 Processando ligação 73/100: ligacao_73.mp3
```

## 🎯 **Configurações de Rate Limiting**

### **Limites Implementados:**
- **Webhooks por minuto**: 10 por URL
- **Delay entre ligações**: 2 segundos
- **Delay entre webhooks**: 1 segundo
- **Retry em caso de 429**: 2 minutos de espera

### **Monitoramento:**
```javascript
console.warn(`⚠️ Rate limit atingido para ${url}. Aguardando 1 minuto...`);
console.warn(`🔄 Rate limit detectado (429). Aguardando 2 minutos...`);
console.log(`✅ Webhook retry enviado: ${data.event} - Status: ${retryResponse.status}`);
```

## 🔍 **Como Testar**

### **1. Teste de Rate Limiting:**
```bash
# Enviar lote com 100 ligações
# Verificar se não há erros 429
# Confirmar que webhooks são enviados com delays
```

### **2. Teste de Arquivos Ausentes:**
```bash
# Enviar lote com alguns arquivos ausentes
# Verificar se são tratados corretamente
# Confirmar webhooks de erro são enviados
```

### **3. Monitoramento:**
```bash
# Verificar logs do servidor
# Confirmar delays entre processamentos
# Verificar rate limiting funcionando
```

## 📋 **Arquivos Modificados**

- ✅ `api-server/routes/batchAnalysis.js`
  - Função `sendWebhook()` com rate limiting
  - Delays entre processamentos
  - Melhor tratamento de arquivos ausentes

## 🚀 **Próximos Passos**

1. **Testar em Produção**: Verificar se os problemas foram resolvidos
2. **Monitorar Logs**: Acompanhar comportamento do rate limiting
3. **Ajustar Configurações**: Se necessário, ajustar delays e limites
4. **Documentar**: Atualizar documentação da API

---

**✅ Sistema agora está preparado para processar lotes grandes sem problemas de rate limiting!** 