# Implementação da Lista de Ligações - Dashboard v2.0

## Resumo da Implementação

Implementação da nova seção "Ligações do Lote" na página de detalhes de avaliação, substituindo a antiga seção de agentes para melhor adequação aos dados da API CallAnalyzer v2.0.

## Funcionalidades Implementadas

### 1. Nova Seção "Ligações do Lote"
- **Localização**: `Avaliações` > `[Nome da Lista]` > `Ligações do Lote`
- **Substitui**: Antiga seção "Agentes da Lista"
- **Dados**: Ligações processadas pela API v2.0 armazenadas na tabela `calls`

### 2. Colunas da Lista de Ligações

#### Arquivo (3 colunas)
- **Nome do arquivo**: `file_name` da ligação processada
- **Tipo de ligação**: `call_type` (quando disponível)
- **Fallback**: "Ligação X" quando nome não disponível

#### Agente → Cliente (2 colunas)
- **Formato**: `agent_name → client_name`
- **Telefone**: `phone_number` (quando disponível)
- **Fallback**: "Agente → Cliente" quando dados não disponíveis

#### Sentimento (1 coluna)
- **Emoji visual**: 😊 Positivo, 😞 Negativo, 😐 Neutro
- **Texto**: Sentimento em português
- **Campo fonte**: `sentiment`

#### Transcrição (2 colunas)
- **Status**: ✓ Real (verde) ou ⚠ Simulada (amarelo)
- **Campo fonte**: `transcription_is_real`
- **Preview**: Primeiros 30 caracteres da transcrição

#### Score (1 coluna)
- **Valor**: Score da análise com 1 casa decimal
- **Cores**: Verde (8-10), Amarelo (6-8), Vermelho (0-6)
- **Fundo colorido**: Badge com cor correspondente

#### Data/Hora (3 colunas)
- **Formato**: DD/MM/AA HH:MM
- **Status**: `status` da ligação (quando disponível)
- **Campo fonte**: `created_at` ou `call_date`

### 3. Interatividade
- **Hover Effect**: Destacar linha ao passar mouse
- **Click Handler**: Abrir modal de detalhes da ligação
- **Scroll**: Lista limitada a altura máxima com scroll interno

### 4. KPI Atualizado
- **Antes**: "Agentes em atenção"
- **Depois**: "Ligações baixo score"
- **Critério**: Ligações com score < 6
- **Cálculo**: Baseado em `overall_score` ou `score`

## Estrutura Técnica

### Interface Call Atualizada
```typescript
interface Call {
  id: string;
  file_name: string;
  overall_score: number;
  created_at: string;
  call_type: string;
  status: string;
  transcription_text: string;
  transcription_is_real: boolean;
  agent_name: string;
  client_name: string;
  sentiment: string;
  call_outcome: string;
  batch_id: string;
  // Campos de compatibilidade
  phone_number?: string;
  duration_seconds?: number;
  call_date?: string;
  score?: number;
}
```

### Busca de Dados
```typescript
const { data: callsData, error: callsError } = await supabase
  .from('calls')
  .select('*')
  .eq('evaluation_list_id', listId)
  .eq('company_id', companyId)
  .order('created_at', { ascending: false });
```

### Funções Auxiliares

#### Emoji do Sentimento
```typescript
const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
    case 'positivo':
      return '😊';
    case 'negative':
    case 'negativo':
      return '😞';
    case 'neutral':
    case 'neutro':
      return '😐';
    default:
      return '😐';
  }
};
```

#### Formatação de Data/Hora
```typescript
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

## Estados de Interface

### 1. Lista com Dados
- Grid responsivo com 12 colunas
- Máximo 96 de altura com scroll
- Hover effects e interatividade

### 2. Lista Vazia
- Ícone de telefone centralizado
- Mensagem explicativa
- Botão de recarregar

### 3. Estado de Loading
- Spinner de carregamento
- Texto informativo

### 4. Estado de Erro
- Ícone de alerta
- Mensagem de erro detalhada
- Botão de retry

## Melhorias vs. Versão Anterior

### Removido
- ❌ Seção "Agentes da Lista" (inadequada para API v2.0)
- ❌ Dependência de tabela `agents`
- ❌ Dados agregados por agente

### Adicionado
- ✅ Lista detalhada de ligações processadas
- ✅ Informações completas por ligação
- ✅ Status de transcrição real vs simulada
- ✅ Sentimento visual com emojis
- ✅ Scores coloridos por faixa
- ✅ Preview da transcrição
- ✅ Data/hora formatada
- ✅ Compatibilidade total com API v2.0

## Fluxo de Navegação

1. **Dashboard Principal**: Página "Avaliações"
2. **Lista de Avaliações**: Click em uma lista específica
3. **Detalhes da Lista**: Dashboard com KPIs e gráficos
4. **Seção Ligações**: Lista de todas as ligações do lote
5. **Detalhes da Ligação**: Click em uma ligação específica

## Compatibilidade

### API v2.0 Completa
- ✅ Transcrição real via OpenAI Whisper
- ✅ Metadados completos (agente, cliente, sentimento)
- ✅ Armazenamento automático no banco
- ✅ IDs sequenciais mascarados
- ✅ Webhooks v2.0 com ordem garantida

### Fallbacks Implementados
- Nome do arquivo → "Ligação X"
- Agente/Cliente → "Agente/Cliente"
- Sentimento → "Neutro" com 😐
- Data → Data atual se não disponível
- Score → 0.0 se não disponível

## Resultado Final

Interface completamente funcional que:
1. **Mostra todas as ligações** processadas pela API v2.0
2. **Informações visuais claras** com cores e emojis
3. **Dados reais** da transcrição e análise
4. **Navegação intuitiva** com hover e click
5. **Performance otimizada** com scroll limitado
6. **Compatibilidade total** com armazenamento automático

A implementação garante que todas as ligações analisadas na página "Análise em Lote" apareçam automaticamente na seção "Ligações do Lote" da página "Avaliações", criando um fluxo completamente integrado no sistema NIAH!. 