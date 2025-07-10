# 🚀 Configuração Completa do Supabase para NIAH!

Este guia contém todas as instruções necessárias para configurar completamente o banco de dados Supabase para a plataforma NIAH!.

## 📋 Pré-requisitos

1. **Conta no Supabase**: Acesse [supabase.com](https://supabase.com) e crie uma conta
2. **Projeto Criado**: Certifique-se de que o projeto `iyqrjgwqjmsnhtxbywme` está acessível
3. **Credenciais**: Tenha em mãos a URL e a API Key do projeto

## 🎯 Dados do Projeto

- **URL**: `https://iyqrjgwqjmsnhtxbywme.supabase.co`
- **Project Reference**: `iyqrjgwqjmsnhtxbywme`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Passo a Passo da Configuração

### 1. Acessar o SQL Editor

1. Faça login no [dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto `iyqrjgwqjmsnhtxbywme`
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"** para criar uma nova consulta

### 2. Limpar Dados Existentes (Se Necessário)

Se você já executou o script antes e teve erros, execute primeiro:

```sql
-- CUIDADO: Isso apaga todos os dados!
-- Execute apenas se necessário para limpar dados corrompidos

DROP VIEW IF EXISTS agent_performance CASCADE;
DROP VIEW IF EXISTS campaign_performance CASCADE;
DROP FUNCTION IF EXISTS generate_demo_calls() CASCADE;
DROP FUNCTION IF EXISTS get_agent_stats(UUID, DATE, DATE) CASCADE;
DROP TABLE IF EXISTS evaluation_list_items CASCADE;
DROP TABLE IF EXISTS evaluation_lists CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS evaluation_criteria CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TYPE IF EXISTS evaluation_status CASCADE;
DROP TYPE IF EXISTS call_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

### 3. Executar o Script SQL

1. **Copie todo o conteúdo** do arquivo `supabase-setup.sql` (CORRIGIDO)
2. **Cole no SQL Editor** do Supabase
3. **Execute o script** clicando em **"Run"** ou `Ctrl+Enter`

⚠️ **IMPORTANTE**: Execute o script inteiro de uma vez. Ele contém:
- Criação de todas as tabelas
- Configuração de índices
- Políticas RLS (Row Level Security)
- Dados iniciais de demonstração
- Funções auxiliares (COM CORREÇÃO DE TIPOS)

### 4. Verificar a Execução

Após executar o script, você deve ver:

```sql
-- Mensagens de sucesso como:
CREATE EXTENSION
CREATE TYPE
CREATE TABLE
CREATE INDEX
CREATE TRIGGER
INSERT 0 1
-- E no final:
generate_demo_calls
-----------------
(1 row)
```

### 5. Verificar as Tabelas Criadas

No painel **"Table Editor"**, você deve ver as seguintes tabelas:

- ✅ `companies` - Empresas
- ✅ `users` - Usuários  
- ✅ `agents` - Agentes/Vendedores
- ✅ `campaigns` - Campanhas
- ✅ `calls` - Chamadas
- ✅ `evaluations` - Avaliações
- ✅ `evaluation_criteria` - Critérios de Avaliação
- ✅ `evaluation_lists` - Listas de Avaliação
- ✅ `evaluation_list_items` - Itens das Listas

### 6. Verificar RLS (Row Level Security)

1. Vá para **"Authentication"** > **"Policies"**
2. Verifique se existem políticas para todas as tabelas
3. As políticas garantem que:
   - Admins veem todos os dados
   - Gestores veem apenas dados da sua empresa

## 🎭 Usuários de Demonstração

O script cria automaticamente os seguintes usuários:

### Admin
- **Email**: `admin@niah.com.br`
- **Senha**: `demo123`
- **Role**: `admin`
- **Acesso**: Painel administrativo completo

### Gestor
- **Email**: `manager@niah.com.br`
- **Senha**: `demo123`
- **Role**: `manager`
- **Acesso**: Dashboard com métricas da empresa

## 📊 Dados de Demonstração

O script também cria:

- **4 empresas** de demonstração
- **5 usuários** (1 admin + 4 gestores)
- **7 critérios** de avaliação padrão
- **4 agentes** de vendas
- **3 campanhas** ativas
- **Chamadas automáticas** (geradas pela função `generate_demo_calls()`)

## 🔍 Testando a Conexão

### Via Interface da Aplicação

1. Acesse a aplicação NIAH!
2. Vá para **"Configurações"**
3. Verifique o **"Status da Conexão Supabase"**
4. Deve mostrar ✅ **"Conectado com sucesso"**

### Via SQL Editor

Execute esta consulta para testar:

```sql
-- Testar conexão básica
SELECT 'Conexão OK' as status;

-- Verificar dados criados
SELECT 
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM agents) as agentes,
  (SELECT COUNT(*) FROM calls) as chamadas;
```

## 🔒 Configuração de Autenticação

### 1. Configurar Providers (Opcional)

Se quiser usar login social:

1. Vá para **"Authentication"** > **"Providers"**
2. Configure Google, GitHub, etc.

### 2. Configurar Email Templates (Opcional)

1. Vá para **"Authentication"** > **"Email Templates"**
2. Personalize os templates de confirmação

## 🛠️ Troubleshooting

### ❌ Problema: "column is of type call_status but expression is of type text"

**Causa**: Erro de tipo ao inserir dados em colunas enum.

**Solução**: 
1. Execute o script SQL CORRIGIDO fornecido
2. A função `generate_demo_calls()` foi corrigida para fazer cast correto dos tipos

### ❌ Problema: "Falha na conexão"

**Soluções**:

1. **Verificar credenciais**:
   - URL: `https://iyqrjgwqjmsnhtxbywme.supabase.co`
   - API Key correta no arquivo `/lib/supabase.ts`

2. **Verificar RLS**:
   ```sql
   -- Verificar se RLS está habilitado
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Verificar políticas**:
   ```sql
   -- Listar todas as políticas
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### ❌ Problema: "Tabela não encontrada"

**Solução**: 
1. Limpe o banco com o script de limpeza acima
2. Re-execute o script SQL completo corrigido

### ❌ Problema: "Acesso negado"

**Solução**: Verificar se as políticas RLS estão corretas

### ❌ Problema: "Função já existe"

**Solução**: Use `CREATE OR REPLACE FUNCTION` ao invés de `CREATE FUNCTION`

## 📚 Estrutura do Banco

### Relacionamentos Principais

```
companies (1) ←→ (N) users
companies (1) ←→ (N) agents  
companies (1) ←→ (N) campaigns
companies (1) ←→ (N) calls

agents (1) ←→ (N) calls
campaigns (1) ←→ (N) calls
calls (1) ←→ (1) evaluations
```

### Tipos Enum Criados

- `user_role`: 'admin', 'manager'
- `call_status`: 'completed', 'failed', 'busy', 'no_answer', 'in_progress'
- `evaluation_status`: 'pending', 'completed', 'failed'

### Views Disponíveis

- `agent_performance` - Estatísticas por agente
- `campaign_performance` - Estatísticas por campanha

### Funções Disponíveis

- `get_agent_stats()` - Estatísticas detalhadas de agente
- `generate_demo_calls()` - Gerar dados de demonstração (CORRIGIDA)

## 🎯 Verificação Final

Execute esta consulta para verificar se tudo está funcionando:

```sql
-- Verificar se as chamadas foram criadas corretamente
SELECT 
    calls.status,
    COUNT(*) as quantidade,
    AVG(calls.score) as media_score
FROM calls 
GROUP BY calls.status
ORDER BY quantidade DESC;

-- Deve retornar algo como:
-- completed | 45 | 78.5
-- no_answer | 12 | 45.2
-- busy      | 8  | 35.1
-- failed    | 3  | 28.0
```

## 🎉 Próximos Passos

Após a configuração:

1. ✅ Teste o login com os usuários demo
2. ✅ Verifique se os dados aparecem no dashboard
3. ✅ Teste a criação de novos usuários (como admin)
4. ✅ Explore as diferentes funcionalidades

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Confira os logs do Supabase em **"Logs"** > **"Database"**
3. Teste as consultas diretamente no SQL Editor

## 🔄 Changelog

### v2.0 - Correções de Tipos
- ✅ Corrigida função `generate_demo_calls()` com cast correto de enums
- ✅ Adicionadas instruções de limpeza de dados
- ✅ Melhorado tratamento de erros de tipo

---

**🚀 Configuração completa! Sua plataforma NIAH! está pronta para uso!**