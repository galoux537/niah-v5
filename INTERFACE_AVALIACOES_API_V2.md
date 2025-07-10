# Interface de Avaliações - Suporte API v2.0

## Problema Identificado

Quando o usuário acessa uma lista de avaliação criada pela API v2.0 na página "Avaliações", os dados das ligações não apareciam corretamente. Isso acontecia porque:

1. **Estrutura diferente**: A API v2.0 usa uma estrutura de dados diferente da v1.0
2. **Tabela `calls`**: As ligações são armazenadas diretamente na tabela `calls` vinculadas ao `evaluation_list_id`
3. **Campos novos**: A v2.0 tem campos como `batch_id`, `overall_score`, `transcription_is_real`, etc.
4. **Sem agentes**: A v2.0 não usa a tabela `agents`, focando nas ligações individuais

## Solução Implementada

### 1. Detecção Automática de API v2.0

Modificamos `ListDetailPage.tsx` para detectar automaticamente se uma lista é da API v2.0:

```typescript
// Verificar se é uma lista da API v2.0 (tem batch_id)
if (listInfo.batch_id) {
  console.log('🚀 Lista da API v2.0 detectada, buscando chamadas...');
  
  // Buscar chamadas diretamente da tabela calls
  const { data: callsData, error: callsError } = await supabase
    .from('calls')
    .select('*')
    .eq('evaluation_list_id', listId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}
```

### 2. Estrutura de Dados Atualizada

Atualizamos as interfaces TypeScript para suportar ambas as versões:

```typescript
interface Call {
  id: string;
  file_name: string;          // v2.0
  overall_score: number;      // v2.0
  created_at: string;
  transcription_text: string; // v2.0
  transcription_is_real: boolean; // v2.0
  agent_name: string;         // v2.0
  client_name: string;        // v2.0
  sentiment: string;          // v2.0
  call_outcome: string;       // v2.0
  batch_id: string;           // v2.0
  // Campos v1.0 para compatibilidade
  phone_number?: string;
  duration_seconds?: number;
  call_date?: string;
  score?: number;
}

interface ListData {
  // Campos v2.0
  batch_id: string;
  files_count: number;
  successful_analyses: number;
  failed_analyses: number;
  status: string;
  started_at: string;
  completed_at: string;
  calls: Call[];
  // Campos v1.0 para compatibilidade
  date_range_start?: string;
  date_range_end?: string;
  agents?: Agent[];
}
```

### 3. Mensagens Informativas

Implementamos mensagens específicas para orientar o usuário:

- **✅ Sucesso**: "Lista da API v2.0 carregada com sucesso! X chamadas encontradas"
- **📋 Vazia**: "Lista da API v2.0 criada, mas ainda não possui chamadas processadas"
- **❌ Erro**: "Esta é uma lista da API v2.0. Para visualizar os dados corretamente, a estrutura do banco precisa estar atualizada"

### 4. Compatibilidade com V1.0

Para listas antigas (v1.0), mostramos:
- "Esta é uma lista do sistema antigo. A funcionalidade para listas v1.0 não está implementada nesta versão."

## Fluxo de Funcionamento

### API v2.0 - Análise em Lote
1. ✅ Usuário faz análise na página "Análise em Lote"
2. ✅ API processa e cria `evaluation_list` com `batch_id`
3. ✅ Ligações são salvas na tabela `calls` com `evaluation_list_id`
4. ✅ Usuário acessa página "Avaliações"
5. ✅ Sistema detecta `batch_id` e busca ligações corretamente
6. ✅ Interface mostra status e quantidade de ligações

### V1.0 - Sistema Antigo
1. Lista não tem `batch_id`
2. Sistema detecta como v1.0
3. Mostra mensagem de funcionalidade não implementada

## Campos da API v2.0 Disponíveis

### Tabela `evaluation_lists`
- `batch_id`: ID único do lote
- `files_count`: Quantidade de arquivos enviados
- `successful_analyses`: Análises bem-sucedidas
- `failed_analyses`: Análises que falharam
- `status`: Status do lote (completed, processing, etc.)
- `started_at`: Início da análise
- `completed_at`: Fim da análise
- `criteria_group_name`: Nome do grupo de critérios
- `sub_criteria`: Critérios específicos (JSONB)

### Tabela `calls`
- `file_name`: Nome do arquivo de áudio
- `overall_score`: Nota geral (0-10)
- `individual_criteria_scores`: Notas por critério (JSONB)
- `transcription_text`: Texto da transcrição
- `transcription_is_real`: Se foi transcrição real (Whisper) ou simulada
- `agent_name`: Nome do agente
- `client_name`: Nome do cliente
- `client_phone`: Telefone do cliente
- `client_email`: Email do cliente
- `sentiment`: Sentimento da ligação (positive/negative/neutral)
- `call_outcome`: Resultado da ligação
- `campaign_name`: Nome da campanha
- `department`: Departamento

## Próximos Passos

### Melhorias Planejadas
1. **Interface Dedicada v2.0**: Criar `ListDetailPageV2.tsx` com interface otimizada
2. **Dashboard de Ligações**: Mostrar lista das ligações com detalhes
3. **Filtros e Busca**: Permitir filtrar por agente, sentimento, score
4. **Visualização de Transcrição**: Modal com texto completo da transcrição
5. **Gráficos Avançados**: Charts específicos para dados da v2.0

### Funcionalidades Avançadas
- **Comparação de Agentes**: Rankings e comparações
- **Análise de Tendências**: Evolução dos scores ao longo do tempo
- **Exportação de Dados**: CSV/Excel com dados das ligações
- **Integração com CRM**: Conectar dados dos clientes

## Status Atual

✅ **Funcionando**:
- Detecção automática de listas v2.0
- Busca de ligações na tabela `calls`
- Mensagens informativas adequadas
- Compatibilidade com estrutura antiga

🔄 **Em Desenvolvimento**:
- Interface visual otimizada para v2.0
- Exibição detalhada das ligações
- Dashboard com KPIs específicos da v2.0

📋 **Pendente**:
- Testes completos com dados reais
- Otimização de performance para muitas ligações
- Funcionalidades avançadas de análise

## Conclusão

A interface agora detecta corretamente as listas da API v2.0 e busca os dados nas tabelas corretas. O usuário recebe feedback claro sobre o status da lista e pode ver quantas ligações foram processadas, preparando o terreno para uma interface completa de visualização dos dados da API v2.0. 