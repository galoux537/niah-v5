# Sistema de ID Sequencial para Empresas (Display ID)

## 📋 Objetivo

Implementar um campo `display_id` na tabela `companies` que funcionará como uma máscara sequencial do `company_id` real (UUID) nos retornos da API. Isso permite:

- Manter a segurança do UUID interno
- Usar IDs simples e sequenciais nos webhooks e respostas da API
- Facilitar identificação das empresas pelos clientes

## 🔧 Implementação

### 1. **Executar Script SQL no Supabase**

Acesse o **SQL Editor** no painel do Supabase e execute o arquivo `add-display-id-field.sql`:

```sql
-- Copie e cole todo o conteúdo do arquivo add-display-id-field.sql aqui
```

Este script irá:
- ✅ Adicionar coluna `display_id` na tabela `companies`
- ✅ Criar índice para performance
- ✅ Configurar auto-incremento para novos registros
- ✅ Atribuir IDs sequenciais para empresas existentes

### 2. **Verificar Resultado**

Após executar o script, você verá algo como:

```
id                                   | name           | display_id | created_at
-------------------------------------|----------------|------------|------------
abc-123-uuid-empresa-1               | NIAH! Sistemas | 1          | 2024-12-17
def-456-uuid-empresa-2               | Empresa ABC    | 2          | 2024-12-18
ghi-789-uuid-empresa-3               | Empresa DEF    | 3          | 2024-12-19
```

## 📤 Como Funciona nos Webhooks

### Antes (UUID real):
```json
{
  "event": "batch_started",
  "batch_id": "batch_123",
  "company_id": "abc-123-uuid-empresa-1",
  "status": "processing"
}
```

### Agora (ID sequencial):
```json
{
  "event": "batch_started", 
  "batch_id": "batch_123",
  "company_id": 1,
  "status": "processing"
}
```

## 🎯 Endpoints Afetados

Os seguintes endpoints agora retornam `display_id` ao invés do UUID:

1. **Webhooks**:
   - `batch_started`
   - `call_completed` 
   - `call_failed`
   - `batch_completed`

2. **API Responses**:
   - `/api/v1/test-supabase-data/:companyId`
   - Outros endpoints que retornam `company_id`

## 🔒 Segurança

- ✅ O UUID real permanece protegido
- ✅ Autenticação ainda usa UUID interno
- ✅ Apenas as respostas públicas usam display_id
- ✅ Isolamento multitenant mantido

## 📝 Logs

O sistema registra logs detalhados:

```
🏢 Buscando display_id para company_id: abc-123-uuid-empresa-1
✅ Display_id encontrado: 1 para empresa abc-123-uuid-empresa-1
🎭 Company ID mascarado: abc-123-uuid-empresa-1 -> 1
```

## 🧪 Teste

Para testar:

1. Faça uma análise em lote
2. Verifique que os webhooks usam display_id (1, 2, 3...) ao invés de UUIDs
3. Confirme que a funcionalidade interna continua funcionando normalmente

## ⚠️ Importante

- Execute o script SQL **apenas uma vez**
- Faça backup antes de executar
- O display_id é atribuído automaticamente para novas empresas
- Não altere manualmente os display_ids após criação 