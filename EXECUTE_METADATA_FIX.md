# 🔧 CORREÇÃO DA ESTRUTURA DE METADADOS - TABELA CALLS

## 📋 **O que este script faz:**

1. **Remove colunas fixas** que ficavam sempre `NULL`:
   - `agent_name`
   - `campaign_name` 
   - `client_name`
   - `client_email`
   - `client_phone`
   - `client_company`
   - `department`
   - `priority`

2. **Adiciona coluna dinâmica**:
   - `metadata` (JSONB) - para armazenar qualquer metadado enviado pelo usuário

3. **Mantém coluna essencial**:
   - `phone_number` (VARCHAR) - para telefone específico

## 🚀 **Como executar:**

### **Opção 1: Via Supabase Dashboard (Recomendado)**
1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `fix-metadata-columns.sql`
4. Clique em **Run**

### **Opção 2: Via psql (Terminal)**
```bash
psql -h your-host -U postgres -d your-database -f fix-metadata-columns.sql
```

## ✅ **Resultado esperado:**

```
NOTICE:  Coluna metadata adicionada com sucesso!
NOTICE:  Coluna phone_number já existe!

 column_name  | data_type | is_nullable | column_default 
--------------+-----------+-------------+----------------
 metadata     | jsonb     | YES         | '{}'::jsonb
 phone_number | varchar   | YES         | 
```

## 🧪 **Teste após execução:**

Faça uma nova requisição para testar:

```bash
curl -X POST "http://localhost:3001/api/v1/analyze-batch-proxy" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -F "criteria={\"nomeDoGrupo\":\"critério 4\",\"criteriaId\":\"e270f185-0e87-48a5-8c12-e2cd526fe041\"}" \
  -F "webhook=https://webhook.site/seu-id" \
  -F "audioFiles=@teste.mp3" \
  -F "phone_number_0=5511999888777" \
  -F "metadata_0={\"name\":\"João Silva\",\"email\":\"joao@empresa.com\",\"priority\":\"alta\"}"
```

### **No banco deve aparecer:**
- `phone_number`: "5511999888777"
- `metadata`: `{"name":"João Silva","email":"joao@empresa.com","priority":"alta"}`

## 🎯 **Benefícios:**

✅ **Flexibilidade total** - usuário pode enviar qualquer metadado  
✅ **Sem campos fixos NULL** - banco mais limpo  
✅ **Performance melhor** - menos colunas, mais eficiência  
✅ **Fácil evolução** - novos metadados não precisam de ALTER TABLE  

---

**💡 Após executar o script, reinicie a API para garantir que tudo funcione perfeitamente!** 