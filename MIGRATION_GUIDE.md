# 🔄 Guia de Migração - Nova Arquitetura

## 📁 Nova Estrutura de Pastas

```
src/
├── features/                     # Features organizadas por domínio
│   ├── auth/                     # 🔐 Autenticação
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── calls/                    # 📞 Ligações
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── criteria/                 # 📊 Critérios
│   ├── dashboard/                # 📈 Dashboard
│   ├── batch-analysis/           # 🚀 Análise em Lote
│   └── agents/                   # 👥 Agentes
├── shared/                       # 🤝 Código Compartilhado
│   ├── components/
│   │   ├── ui/                   # Design System
│   │   ├── layout/
│   │   └── common/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── constants/
└── lib/                          # ⚙️ Configurações
    ├── supabase.ts
    ├── auth.ts
    └── api-client.ts
```

## 🔄 Mudanças nos Imports

### ❌ Imports Antigos (a serem atualizados)
```typescript
// Imports antigos
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { authManager } from '../lib/auth';
import { Button } from '../components/ui/button';
```

### ✅ Novos Imports (nova arquitetura)
```typescript
// Novos imports organizados
import { useAuth, authService } from '@/features/auth';
import { callsService } from '@/features/calls';
import { Button } from '@/shared/components/ui';
import { formatFileSize, getScoreColor } from '@/shared/utils';
```

## 🎯 Features Implementadas

### 🔐 Feature: Auth
- **Localização**: `src/features/auth/`
- **Serviços**: `authService` - gerenciamento completo de autenticação
- **Hooks**: `useAuth` - hook principal para auth
- **Tipos**: Interfaces completas para User, Company, AuthState

```typescript
// Exemplo de uso
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

### 📞 Feature: Calls
- **Localização**: `src/features/calls/`
- **Serviços**: `callsService` - operações de ligações
- **Tipos**: Call, CallAnalysis, CallFilters

```typescript
// Exemplo de uso
import { callsService } from '@/features/calls';

const calls = await callsService.getCalls(companyId, filters);
```

## 🛠️ Próximos Passos

### ✅ Concluído
1. ✅ Estrutura de pastas criada
2. ✅ Feature de Auth implementada
3. ✅ Tipos para Calls definidos
4. ✅ Utilitários compartilhados criados

### 🔄 Em Progresso
1. 🔄 Migração dos componentes atuais
2. 🔄 Atualização dos imports
3. 🔄 Implementação completa das features

### 📋 A Fazer
1. ⏳ Migrar BatchAnalysisPage para feature
2. ⏳ Migrar CriteriaPage para feature
3. ⏳ Migrar DashboardPage para feature
4. ⏳ Migrar AgentsPage para feature
5. ⏳ Configurar path mapping no tsconfig.json
6. ⏳ Implementar testes unitários

## 🔧 Configuração do Path Mapping

Adicione no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

## 📚 Padrões de Código

### 🏗️ Estrutura de Features
Cada feature deve ter:
- `components/` - Componentes específicos da feature
- `hooks/` - Hooks customizados da feature
- `services/` - Lógica de negócio e API calls
- `types/` - Interfaces e tipos TypeScript
- `index.ts` - Barrel exports

### 🔄 Services Pattern
```typescript
export class FeatureService {
  async getData(): Promise<Data[]> {
    // Implementação
  }
}

export const featureService = new FeatureService();
```

### 🎣 Hooks Pattern
```typescript
export function useFeature() {
  const [data, setData] = useState();
  
  // Lógica do hook
  
  return { data, loading, refetch };
}
```

## 🎨 Benefícios da Nova Arquitetura

### 🔍 **Manutenibilidade**
- Código organizado por funcionalidade
- Fácil localização de arquivos relacionados
- Separação clara de responsabilidades

### 🚀 **Escalabilidade**
- Adicionar novas features sem afetar existentes
- Reutilização de código compartilhado
- Estrutura preparada para crescimento

### 👥 **Trabalho em Equipe**
- Times podem trabalhar em features independentes
- Menos conflitos de merge
- Onboarding mais fácil para novos desenvolvedores

### 🧪 **Testabilidade**
- Services isolados facilitam testes unitários
- Mocking mais simples
- Cobertura de testes por feature

## 🚨 Importante

⚠️ **Durante a migração**, os dois sistemas coexistem:
- Imports antigos continuam funcionando
- Novos componentes usam a nova estrutura
- Migração gradual para evitar quebras

✅ **Quando concluído**, teremos:
- Codebase mais organizado e maintível
- Melhor developer experience
- Base sólida para futuras funcionalidades 
 
 