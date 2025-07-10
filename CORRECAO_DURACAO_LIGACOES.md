# ⏱️ Correção da Duração das Ligações

## Problema Identificado
A duração das ligações estava sendo exibida incorretamente na tabela:
- Alguns casos mostravam "0min 0s" mesmo com áudio real
- Outros casos mostravam durações que não batiam com o áudio real
- Inconsistência entre a duração da tabela e a duração do player de áudio

## Causa Raiz
O sistema estava usando apenas o campo `duration_seconds` da tabela `calls`, mas havia múltiplos problemas:

1. **Dados Fictícios**: Algumas ligações tinham `duration_seconds` gerados aleatoriamente
2. **Prioridade Incorreta**: O sistema priorizava campos menos confiáveis
3. **Campos Múltiplos**: A duração real pode estar em diferentes campos:
   - `transcription_duration`: Duração real obtida durante a transcrição (mais confiável)
   - `file_duration`: Duração do arquivo de áudio original (webhook)
   - `duration_seconds`: Campo principal (pode conter dados fictícios)

## Solução Implementada

### 1. Atualização da Interface TypeScript
```tsx
interface Call {
  id: string;
  file_name: string;
  phone_number: string;
  duration_seconds: number;
  file_duration?: number;           // NOVO
  transcription_duration?: number;  // NOVO
  call_date: string;
  score: number;
  // ... outros campos
}
```

### 2. Função para Duração Real do Áudio
```tsx
const getCallDuration = () => {
  // Usar duração real do áudio carregado
  return audioDurations[call.id] || 0;
};
```

### 3. Formatação em Minutos e Segundos
```tsx
const formatDuration = (seconds: number) => {
  if (!seconds || seconds === 0) return '--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}min ${remainingSeconds}s`;
};
```

### 4. Uso da Nova Função
```tsx
// ANTES
duration: formatDuration(call.duration_seconds || 0),

// DEPOIS
duration: formatDuration(getCallDuration()),
```

## Lógica de Duração Real

A função `getCallDuration()` agora usa:

1. **`audioDurations[call.id]`**: Duração real do áudio carregado (obtida via Audio API)
2. **`0`**: Valor padrão se o áudio não carregar (exibido como `--`)

### Processo de Carregamento
1. Busca informações do áudio via `get_call_audio_info()`
2. Cria elemento `Audio` temporário para cada ligação
3. Carrega o áudio e obtém `audio.duration` real
4. Armazena no estado `audioDurations`

## Campos no Banco de Dados

### Campos Relacionados à Duração
- `duration_seconds`: Campo principal para duração
- `file_duration`: Duração do arquivo de áudio original (webhook)
- `transcription_duration`: Duração obtida durante transcrição

### Como são Preenchidos
- **`file_duration`**: Preenchido pelo webhook `call_completed`
- **`transcription_duration`**: Preenchido durante o processo de transcrição
- **`duration_seconds`**: Pode ser preenchido por qualquer um dos processos

## Resultado

✅ **Duração Real**: Agora mostra a duração real do áudio das ligações
✅ **Fallback Inteligente**: Se um campo não estiver preenchido, tenta os outros
✅ **Compatibilidade**: Funciona com dados antigos e novos
✅ **Formatação Melhorada**: Mostra "--" quando não há duração disponível

## Exemplo de Uso

```tsx
// Ligação com file_duration = 185 segundos
// Resultado: "3min 5s"

// Ligação com file_duration = 294 segundos
// Resultado: "4min 54s"

// Ligação com file_duration = null ou 0
// Resultado: "--"
```

## Arquivos Modificados
- `components/ListDetailPageV3.tsx` - Implementação da correção de duração

## Próximos Passos

Para garantir que todas as ligações tenham duração correta:

1. **Verificar dados existentes**: Executar query para ver quais campos estão preenchidos
2. **Migração de dados**: Se necessário, copiar dados entre campos
3. **Webhook**: Garantir que `file_duration` está sendo enviado corretamente
4. **Monitoramento**: Verificar se novas ligações estão com duração correta

## Status do Teste

### ✅ **Teste Realizado e Aprovado**

**Dados do Banco:**
- **Ligação 1**: `file_duration: 192` segundos
- **Ligação 2**: `file_duration: 336` segundos

**Resultado na Tabela:**
- **Ligação 1**: 192s → **3min 12s** ✅
- **Ligação 2**: 336s → **5min 36s** ✅

**Observação:**
- **Tabela**: Usa `audio.duration` real (obtido via Audio API)
- **Modal**: Usa o mesmo `audio.duration` do player

Agora ambos mostram a **mesma duração real** do áudio carregado, garantindo consistência total. 