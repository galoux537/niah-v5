# Exemplo de Metadados Corretos para API

## ❌ Problema Anterior
A API estava retornando valores fixos ("Cliente Não Informado", "Agente Não Informado", etc.) porque não estava processando corretamente os metadados enviados.

## ✅ Solução Implementada
Agora a API processa corretamente os metadados e os utiliza na resposta. Veja os exemplos abaixo:

## Formato dos Metadados (JSON String)

### Exemplo 1: Formato Simples (Recomendado)
```json
{
  "name": "gabriel",
  "email": "gabriel@gmail.com", 
  "phone": "41988745828",
  "company": "NIAel",
  "agent": "Ana Costa",
  "campaign": "Prospecção Q4",
  "department": "Vendas",
  "callType": "Consulta",
  "priority": "média"
}
```

### Exemplo 2: Formato Completo (Também Suportado)
```json
{
  "client_name": "gabriel",
  "client_email": "gabriel@gmail.com",
  "client_phone": "41988745828", 
  "client_company": "NIAel",
  "agent_name": "Ana Costa",
  "campaign_name": "Prospecção Q4",
  "department": "Vendas",
  "call_type": "Consulta",
  "priority": "média"
}
```

### Exemplo 3: Formato Português (Suportado)
```json
{
  "nome_cliente": "gabriel",
  "email_cliente": "gabriel@gmail.com",
  "telefone_cliente": "41988745828",
  "empresa_cliente": "NIAel", 
  "agente_responsavel": "Ana Costa",
  "campanha": "Prospecção Q4",
  "departamento": "Vendas",
  "tipo_ligacao": "Consulta",
  "prioridade": "média"
}
```

## Como Enviar na Requisição

### Usando FormData (JavaScript)
```javascript
const formData = new FormData();

// Arquivos de áudio
formData.append('audioFiles', audioFile1);
formData.append('audioFiles', audioFile2);

// Critérios
const criteria = {
  "critério 4": {
    "nomeDoGrupo": "critério 4",
    "criteriaId": "uuid-do-criterio"
  }
};
formData.append('criteria', JSON.stringify(criteria));

// METADADOS (JSON string) - FORMATO ATUAL
const metadata = {
  "name": "gabriel",
  "email": "gabriel@gmail.com",
  "phone": "41988745828",
  "company": "NIAel",
  "agent": "Ana Costa", 
  "campaign": "Prospecção Q4",
  "department": "Vendas",
  "callType": "Consulta",
  "priority": "média"
};
formData.append('metadata', JSON.stringify(metadata));

// Webhook (opcional)
formData.append('webhook', 'https://sua-url-webhook.com/callback');
```

### Usando cURL
```bash
curl -X POST http://localhost:3001/api/v1/analyze-batch-proxy \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -F "audioFiles=@audio1.mp3" \
  -F "audioFiles=@audio2.mp3" \
  -F 'criteria={"critério 4":{"nomeDoGrupo":"critério 4","criteriaId":"uuid"}}' \
  -F 'metadata={"name":"gabriel","email":"gabriel@gmail.com","phone":"41988745828","company":"NIAel","agent":"Ana Costa","campaign":"Prospecção Q4","department":"Vendas","callType":"Consulta","priority":"média"}' \
  -F "webhook=https://sua-url-webhook.com/callback"
```

## Resultado Esperado

Com os metadados corretos, a API agora retornará:

```json
{
  "event": "call_completed",
  "batch_id": "batch_1234567890",
  "metadata": {
    "agent_name": "Ana Costa",           // ✅ Valor real (usando "agent")
    "campaign_name": "Prospecção Q4",   // ✅ Valor real (usando "campaign")
    "client_name": "gabriel",           // ✅ Valor real (usando "name")
    "client_email": "gabriel@gmail.com", // ✅ Valor real (usando "email")
    "client_phone": "41988745828",      // ✅ Valor real (usando "phone")
    "call_type": "Consulta",            // ✅ Valor real (usando "callType")
    "department": "Vendas",             // ✅ Valor real
    "priority": "média",                // ✅ Valor real
    "client_company": "NIAel"           // ✅ Valor real (usando "company")
  },
  "transcription": {
    "text": "Atendente: Bom dia! Obrigado por entrar em contato conosco. Meu nome é Ana Costa, sou do departamento de Vendas. Como posso ajudá-lo hoje?\nCliente: Oi, meu nome é gabriel. Estou com um problema na minha conta e preciso de ajuda.\n..."
  }
}
```

## Campos Suportados

| Campo API | Formatos Aceitos | Descrição |
|-----------|------------------|-----------|
| `client_name` | `name`, `cliente`, `nome_cliente` | Nome do cliente |
| `client_email` | `email`, `email_cliente` | E-mail do cliente |
| `client_phone` | `phone`, `telefone`, `telefone_cliente` | Telefone do cliente |
| `client_company` | `company`, `empresa`, `empresa_cliente` | Empresa do cliente |
| `agent_name` | `agent`, `agente_responsavel` | Nome do agente |
| `campaign_name` | `campaign`, `campanha` | Nome da campanha |
| `department` | `departamento` | Departamento |
| `call_type` | `callType`, `tipo`, `tipo_ligacao` | Tipo da ligação |
| `priority` | `prioridade` | Prioridade |

## Observações Importantes

1. **Os metadados são opcionais** - se não fornecidos, será usado valor padrão
2. **Formato deve ser JSON string** - não envie objeto JavaScript diretamente
3. **API aceita múltiplos formatos** - use o que for mais conveniente
4. **Transcrição será personalizada** - incluirá os nomes e dados reais
5. **Fallback automático** - se um campo não for fornecido, usa valor padrão

## Exemplo de Teste Rápido

Para testar se está funcionando, use este comando:

```bash
# Teste com metadados mínimos (formato atual)
curl -X POST http://localhost:3001/api/v1/analyze-batch-proxy \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "audioFiles=@teste.mp3" \
  -F 'criteria={"teste":"valor"}' \
  -F 'metadata={"name":"Gabriel","agent":"Ana","email":"gabriel@teste.com"}'
```

Agora a API deve retornar os valores corretos ao invés de "Não Informado"! 🎉 