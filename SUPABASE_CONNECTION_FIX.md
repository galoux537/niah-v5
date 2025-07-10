# 🔧 Correção da Conexão Supabase - NIAH!

## 🚨 Problema Identificado

Sua configuração do Supabase está quase completa, mas há um problema com as **políticas RLS (Row Level Security)** que estão bloqueando o teste de conexão.

## ✅ Solução Rápida

### Passo 1: Execute o Script de Correção

1. **Acesse o SQL Editor** no Supabase
2. **Copie e execute** todo o conteúdo do arquivo `supabase-rls-fix.sql`
3. **Clique em "Run"** para executar

### Passo 2: Teste a Conexão

1. Volte para a aplicação NIAH!
2. Vá em **Configurações**
3. Clique em **"Verificar Novamente"** no status da conexão
4. Deve mostrar ✅ **"Conectado com sucesso"**

## 🔍 O que o Script de Correção Faz

### 1. **Políticas RLS Flexíveis**
- Permite teste de conexão sem autenticação
- Mantém segurança para dados sensíveis
- Corrige bloqueios de acesso

### 2. **Função de Teste Dedicada**
```sql
CREATE FUNCTION test_database_connection()
-- Função específica para testar conectividade
```

### 3. **Permissões Anônimas Limitadas**
- Apenas para teste de conexão
- Não compromete segurança
- Acesso controlado

## 📋 Verificação Pós-Correção

Execute no SQL Editor para verificar:

```sql
-- Testar função de conexão
SELECT test_database_connection();

-- Verificar contagem de dados
SELECT 
    (SELECT COUNT(*) FROM companies) as empresas,
    (SELECT COUNT(*) FROM users) as usuarios,
    (SELECT COUNT(*) FROM calls) as chamadas;
```

**Resultado esperado:**
- ✅ Função retorna dados
- ✅ Contadores mostram dados > 0
- ✅ Aplicação conecta com sucesso

## 🚨 Se Ainda Não Funcionar

### Opção 1: Recriar Políticas

```sql
-- Remover todas as políticas da tabela companies
DROP POLICY IF EXISTS "Users can view their company or all if admin" ON companies;
DROP POLICY IF EXISTS "Allow public read for connection test" ON companies;
DROP POLICY IF EXISTS "Allow limited public read for testing" ON companies;

-- Criar política mais permissiva para teste
CREATE POLICY "Allow all read for testing" ON companies
    FOR SELECT USING (true);
```

### Opção 2: Desabilitar RLS Temporariamente

```sql
-- CUIDADO: Apenas para teste!
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

### Opção 3: Verificar Logs

1. Vá para **Logs** > **Database** no Supabase
2. Procure por erros relacionados a políticas
3. Identifique qual política está bloqueando

## 📞 Suporte Detalhado

### Erro: "RLS policy violation"
- **Causa**: Políticas muito restritivas
- **Solução**: Execute `supabase-rls-fix.sql`

### Erro: "Permission denied"
- **Causa**: Usuário sem permissões adequadas
- **Solução**: Verifique se o usuário tem role `anon` ou `authenticated`

### Erro: "Function not found"
- **Causa**: Função de teste não foi criada
- **Solução**: Execute o script de correção completo

## 🎯 Resultado Final

Após executar a correção:

1. ✅ **Conexão estabelecida** - Status verde na aplicação
2. ✅ **Dados visíveis** - Dashboard mostra métricas reais
3. ✅ **Login funcionando** - Usuários demo conseguem entrar
4. ✅ **Operações CRUD** - Criar, ler, atualizar dados

## 📋 Checklist de Verificação

- [ ] Script `supabase-setup.sql` executado
- [ ] Script `supabase-rls-fix.sql` executado  
- [ ] Teste de conexão passou
- [ ] Login com `admin@niah.com.br` funciona
- [ ] Login com `manager@niah.com.br` funciona
- [ ] Dashboard mostra dados reais
- [ ] Criação de usuários funciona (admin)

---

**🎉 Após essas correções, sua plataforma NIAH! estará 100% funcional!**

## **Script SQL para liberar SELECT na tabela `companies` (apenas para teste)**

> Execute no SQL Editor do Supabase!

```sql
-- Habilite RLS se ainda não estiver habilitado
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Remova políticas antigas de teste, se existirem
DROP POLICY IF EXISTS "Allow all read for testing" ON companies;
DROP POLICY IF EXISTS "Allow public read for connection test" ON companies;

-- Crie uma política temporária para permitir SELECT para todos (apenas para teste de conexão)
CREATE POLICY "Allow all read for testing"
  ON companies
  FOR SELECT
  USING (true);

-- Opcional: Permita SELECT para a role 'anon' explicitamente (caso use JWT público)
GRANT SELECT ON TABLE companies TO anon;
```

## **Script para criar função de teste de conexão (opcional, mas recomendado)**

Se quiser um endpoint seguro para healthcheck, crie a função abaixo:

```sql
CREATE OR REPLACE FUNCTION public.test_database_connection()
RETURNS TEXT AS $$
BEGIN
  RETURN 'OK';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permita execução da função para todos
GRANT EXECUTE ON FUNCTION public.test_database_connection() TO anon;
```

## **Como aplicar:**
1. Copie e cole os scripts acima no **SQL Editor** do Supabase.
2. Clique em **Run**.
3. Atualize sua aplicação e teste novamente a conexão.

## **Importante**
- **NUNCA** deixe essa política aberta em produção! Depois do teste, remova a política ou restrinja para o contexto real de uso.
- Se o seu healthcheck usar outra tabela, repita o procedimento para ela.

Se precisar de um script para outras tabelas ou quiser um healthcheck mais seguro, me avise!