# 🔧 Guia de Restauração - Versão 58 NIAH!

## 📋 O que este script faz

Restaura completamente o sistema NIAH! para o estado da **versão 58**, onde:

✅ **Admin pode criar empresas** no painel administrativo  
✅ **Empresas aparecem na tabela** companies do Supabase  
✅ **Login funciona perfeitamente** para admin e empresas  
✅ **RLS configurado corretamente** (multi-tenant seguro)  
✅ **Estrutura completa** de tabelas (companies, agents, calls)  

## 🚀 Como executar

### Passo 1: Restauração Completa
1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Cole e execute o arquivo `supabase-version-58-restore.sql`
4. Aguarde a mensagem "🎉 RESTAURAÇÃO CONCLUÍDA!"

### Passo 2: Teste (Opcional)
1. Execute o arquivo `supabase-test-version-58.sql`
2. Verifique se todos os testes passaram
3. Confirme a mensagem "✅ TESTES CONCLUÍDOS"

## 🎯 Resultado Esperado

### No Painel Admin:
- Login: `admin@niah.com` / `admin2024`
- Pode criar, editar e excluir empresas
- Empresas criadas aparecem imediatamente na lista

### No Supabase:
- Tabela `companies` com empresas criadas
- Políticas RLS funcionando
- Estrutura completa de tabelas

### Para Empresas:
- Login com email/senha da empresa
- Acesso apenas aos próprios dados
- Podem gerenciar seus agentes

## 📊 Estrutura Criada

```sql
companies:
├── id (UUID, PK)
├── name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR)  
├── slug (VARCHAR, UNIQUE)
├── phone (VARCHAR)
├── address (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

agents:
├── id (UUID, PK)
├── company_id (UUID, FK → companies)
├── name (VARCHAR)
├── email (VARCHAR)
├── department (VARCHAR)
├── phone (VARCHAR)
├── hire_date (DATE)
├── status (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

calls:
├── id (UUID, PK)
├── company_id (UUID, FK → companies)
├── agent_id (UUID, FK → agents)
├── customer_name (VARCHAR)
├── customer_phone (VARCHAR)
├── duration (INTEGER)
├── date_time (TIMESTAMP)
├── status (VARCHAR)
└── created_at (TIMESTAMP)
```

## 🔐 Políticas RLS

### Companies:
- ✅ Empresas veem apenas próprios dados
- ✅ Admin vê todas as empresas
- ✅ Apenas admin pode criar/editar/excluir

### Agents:
- ✅ Empresas veem apenas próprios agentes
- ✅ Admin vê todos os agentes
- ✅ Multi-tenant seguro

### Calls:
- ✅ Empresas veem apenas próprias chamadas
- ✅ Admin vê todas as chamadas
- ✅ Vinculação correta com agentes

## 🧪 Dados de Exemplo Criados

```
NIAH! Sistemas (admin@niah.com) - ADMIN
Empresa ABC (contato@empresaabc.com) - Empresa
Empresa DEF (contato@empresadef.com) - Empresa
```

## ⚡ Funcionalidades Restauradas

### ✅ Login System:
- Admin: `admin@niah.com` / `admin2024`
- Empresas: seus emails/senhas

### ✅ Admin Panel:
- Criar empresas → Aparecem na tabela
- Editar empresas → Atualiza no banco
- Excluir empresas → Remove do banco
- Listar todas as empresas

### ✅ Company Dashboard:
- Login seguro
- Acesso apenas aos próprios dados
- Gerenciamento de agentes
- Dashboard com métricas

### ✅ Database Security:
- RLS ativo e configurado
- Multi-tenant isolado
- Políticas granulares
- Índices otimizados

## 🚨 Importante

- **Execute apenas uma vez** o script de restauração
- **Backup**: O script recria as tabelas (DROP/CREATE)
- **Dados existentes**: Serão perdidos (exceto os de exemplo)
- **RLS**: Temporariamente desabilitado durante inserção inicial

## 🎉 Pronto!

Após executar o script, seu sistema NIAH! estará **100% funcional** como na versão 58:

1. Faça login como admin
2. Crie uma empresa no painel
3. Veja ela aparecer na tabela companies
4. Faça login com a empresa criada
5. Use o sistema normalmente

**O sistema está restaurado e funcionando! 🚀**