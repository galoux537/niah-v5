# 🎯 Guia de Setup para Cursor IDE

Este guia ajuda você a configurar e executar o projeto NIAH! no **Cursor IDE** de forma rápida e eficiente.

## 🚀 Setup Rápido (5 minutos)

### 1. Preparação do Ambiente

```bash
# 1. Abrir o projeto no Cursor
# File > Open Folder > Selecionar pasta do projeto

# 2. Abrir terminal integrado (Ctrl+`)
# Terminal > New Terminal
```

### 2. Instalação das Dependências

```bash
# Instalar todas as dependências
npm install

# Se houver conflitos, use:
npm install --legacy-peer-deps
```

### 3. Configuração do Ambiente

```bash
# Verificar se existe o arquivo .env
ls -la | grep .env

# Se não existir, criar:
cp .env.example .env

# Editar .env (o arquivo já tem as credenciais configuradas)
# As credenciais já estão no arquivo .env commitado para desenvolvimento
```

### 4. Executar o Projeto

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O projeto abrirá automaticamente em: http://localhost:3000
```

## 🔧 Comandos Úteis no Cursor

### Terminal Integrado

```bash
# Desenvolvimento
npm run dev          # Inicia servidor (localhost:3000)
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar código

# Debugging
npm run dev -- --host    # Acessar de outros dispositivos
npm run dev -- --port 3001  # Mudar porta
```

### Extensões Recomendadas

Cursor irá sugerir automaticamente, mas você pode instalar manualmente:

```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

## 🗄️ Configuração do Banco de Dados

### Método 1: Supabase Dashboard (Recomendado)

1. **Acessar**: https://supabase.com/dashboard
2. **Login**: Use as credenciais do projeto
3. **Projeto**: `iyqrjgwqjmsnhtxbywme`
4. **SQL Editor** > **New Query**

```sql
-- Executar NESTA ORDEM:

-- 1. Estrutura básica (se ainda não executou)
-- Cole o conteúdo de: supabase-create-full-structure-with-mock-data.sql

-- 2. Subcritérios (funcionalidade nova)
-- Cole o conteúdo de: supabase-create-sub-criteria-table.sql
```

### Método 2: Via Terminal (Alternativo)

```bash
# Se tiver Supabase CLI instalada
supabase db reset
supabase db push
```

## 🎯 Login no Sistema

### Empresas Disponíveis

```typescript
// Para testar, use um destes emails:

// 1. Admin (NIAH! Sistemas)
Email: admin@niah.com.br
// Acesso total, pode ver todas as empresas

// 2. Cliente Exemplo 1
Email: admin@techcorp.com
// Empresa: TechCorp Solutions

// 3. Cliente Exemplo 2  
Email: contato@globalservices.com
// Empresa: Global Services Ltd
```

**Não há senha** - o login é baseado apenas no email da empresa.

## 📁 Estrutura do Projeto no Cursor

```
niah-call-evaluation/
├── 📂 components/           # Componentes React
│   ├── 📂 ui/              # shadcn/ui components
│   ├── 📄 DashboardPage.tsx # Dashboard principal
│   ├── 📄 CriteriaPage.tsx  # Lista de critérios
│   ├── 📄 CriteriaDetailPage.tsx # Detalhes + subcritérios
│   └── ...
├── 📂 contexts/            # Context API
├── 📂 lib/                 # Utilitários
├── 📂 styles/              # CSS/Tailwind
├── 📄 App.tsx              # Componente principal
├── 📄 main.tsx             # Entry point
├── 📄 .env                 # Credenciais (já configurado)
└── 📄 package.json         # Dependências
```

## 🐛 Debugging no Cursor

### DevTools do React

```bash
# Instalar React DevTools (se não tiver)
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

# No navegador (F12):
# - Components: Ver árvore de componentes
# - Profiler: Performance dos componentes
```

### Console Debugging

```typescript
// Logs já implementados no código:
console.log('🎯 Carregando critérios para empresa:', companyId)
console.log('✅ Critério carregado:', criteriaData)
console.log('❌ Erro ao carregar critérios:', error)

// No Console do navegador (F12), você verá:
// 🎯 ✅ ❌ 💥 🔄 🚨 para diferentes tipos de log
```

### Atalhos Úteis no Cursor

```
Ctrl + `          # Abrir/fechar terminal
Ctrl + Shift + `  # Novo terminal
Ctrl + P          # Quick Open arquivos
Ctrl + Shift + P  # Command Palette
Ctrl + G          # Ir para linha
Ctrl + F          # Buscar no arquivo
Ctrl + Shift + F  # Buscar no projeto
F12               # Ir para definição
Alt + F12         # Peek definition
```

## 🔍 Verificação de Funcionamento

### 1. Teste de Conexão

```bash
# Abrir: http://localhost:3000
# Deve aparecer a tela de login

# Console do navegador deve mostrar:
# "🔌 Testando conexão com Supabase..."
# "✅ Conexão estabelecida com sucesso"
```

### 2. Teste de Login

```bash
# Usar: admin@niah.com.br
# Deve redirecionar para dashboard com:
# - Cards de métricas
# - Gráfico de radar
# - Lista de chamadas
```

### 3. Teste de Funcionalidades

```bash
# Navegação superior:
# Dashboard > Critérios > Listas > Configurações

# Em Critérios:
# - Ver lista de critérios
# - Clicar em um critério
# - Ver subcritérios na tabela
# - Clicar "Adicionar critério" (modal lateral)
```

## 🎨 Desenvolvimento com Tailwind

### IntelliSense

```typescript
// Cursor + Tailwind IntelliSense fornece:
className="bg-[#3057f2] text-white hover:bg-[#2545d9]"
//         ↑ Preview da cor    ↑ Autocomplete
```

### Classes Customizadas

```css
/* styles/globals.css - Classes já configuradas */
.modal-overlay { backdrop-filter: blur(2px); }
.radar-point:hover { r: 8; filter: drop-shadow(...); }
```

## 📦 Build e Deploy

### Build Local

```bash
# Gerar build de produção
npm run build

# Pasta dist/ será criada
ls dist/

# Testar build localmente
npm run preview
```

### Deploy (Exemplo - Vercel)

```bash
# Se quiser fazer deploy:
npm install -g vercel
vercel

# Configurar variáveis de ambiente:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

## 🛠️ Personalização

### Adicionar Nova Página

```typescript
// 1. Criar componente
// components/MinhaNovaPage.tsx

export function MinhaNovaPage() {
  return <div>Nova Página</div>
}

// 2. Adicionar rota
// App.tsx
export type Page = 'dashboard' | 'criteria' | 'minha-nova-page'

// 3. Adicionar no switch
case 'minha-nova-page':
  return <MinhaNovaPage />
```

### Adicionar Nova Funcionalidade

```typescript
// 1. Criar hook customizado
// lib/useMinhaFuncionalidade.ts

export function useMinhaFuncionalidade() {
  const [data, setData] = useState()
  // lógica...
  return { data }
}

// 2. Usar no componente
const { data } = useMinhaFuncionalidade()
```

## ❓ Problemas Comuns

### Erro: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Supabase connection failed"

```bash
# Verificar .env
cat .env
# Deve mostrar as URLs corretas

# Testar conexão manualmente
curl https://iyqrjgwqjmsnhtxbywme.supabase.co/rest/v1/
```

### Erro: "sub_criteria table doesn't exist"

```sql
-- No Supabase SQL Editor:
-- Executar: supabase-create-sub-criteria-table.sql
-- Depois recarregar a página: F5
```

### Build falha

```bash
# Verificar TypeScript
npm run lint

# Verificar tipos
npx tsc --noEmit
```

## 🎉 Pronto!

Seu ambiente está configurado! Agora você pode:

1. **Desenvolver**: Modificar componentes em tempo real
2. **Debuggar**: Usar console e DevTools
3. **Testar**: Navegar pelas funcionalidades
4. **Customizar**: Adicionar suas próprias features

### Links Úteis

- **App Local**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/iyqrjgwqjmsnhtxbywme
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

**Happy Coding!** 🚀

*Se encontrar problemas, verifique o console do navegador primeiro - os logs são bem descritivos!*