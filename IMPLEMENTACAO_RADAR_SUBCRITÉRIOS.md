# 📊 Implementação do Gráfico Radar com Subcritérios

## 🎯 Objetivo
Implementar o armazenamento e exibição das médias dos subcritérios no gráfico radar, utilizando os dados reais do webhook `batch_completed`.

## 🔄 Fluxo de Implementação

### 1. 📨 Webhook `batch_completed`
O webhook recebe os dados dos subcritérios com suas médias:

```json
{
  "event": "batch_completed",
  "batch_id": "batch_1751634901207",
  "sub_criteria": [
    {
      "id": "a4b44752-6e30-4d22-be73-6dd53710e7a3",
      "name": "Finalização",
      "avg_ovrr": 6
    },
    {
      "id": "6c264fb9-b03c-4dcf-8c20-57ed75b1a504",
      "name": "Cordialidade", 
      "avg_ovrr": 7
    }
  ]
}
```

### 2. 🗄️ Estrutura do Banco de Dados

#### Campo Adicionado: `sub_criteria`
```sql
ALTER TABLE evaluation_lists 
ADD COLUMN IF NOT EXISTS sub_criteria JSONB DEFAULT '[]'::jsonb;
```

#### Formato dos Dados Armazenados:
```json
[
  {
    "id": "a4b44752-6e30-4d22-be73-6dd53710e7a3",
    "name": "Finalização",
    "avg_score": 6.0
  },
  {
    "id": "6c264fb9-b03c-4dcf-8c20-57ed75b1a504",
    "name": "Cordialidade",
    "avg_score": 7.0
  }
]
```

### 3. 🔧 Processamento da API

#### `handleBatchCompleted()` - Atualizado
```javascript
// Processar subcritérios do webhook
let subCriteriaData = [];
if (data.sub_criteria && Array.isArray(data.sub_criteria)) {
  subCriteriaData = data.sub_criteria.map(subCriterion => ({
    id: subCriterion.id,
    name: subCriterion.name,
    avg_score: subCriterion.avg_ovrr || 0  // Mapear avg_ovrr → avg_score
  }));
}

// Salvar no banco
const updateData = {
  // ... outros campos
  sub_criteria: subCriteriaData,
  criteria_group_name: data.criteria_group_name,
  total_subcriteria: data.total_subcriteria || 0
};
```

### 4. 🎨 Frontend - Gráfico Radar

#### `ListDetailPageV3.tsx` - Atualizado
```typescript
// Gerar critérios para o radar baseado nos dados do banco
const criteriaScores: Criterion[] = React.useMemo(() => {
  if (!listData?.sub_criteria || !Array.isArray(listData.sub_criteria)) {
    return [];
  }

  // Converter subcritérios do banco para o formato do radar
  return listData.sub_criteria.map(subCriterion => ({
    name: subCriterion.name.toUpperCase(),
    score: Math.round(subCriterion.avg_score * 10) / 10
  }));
}, [listData]);
```

## 🎯 Benefícios da Implementação

### ✅ **Dados Reais**
- O gráfico radar agora exibe as médias reais dos subcritérios
- Não mais dados simulados ou calculados no frontend

### ✅ **Performance**
- Dados já processados e armazenados no banco
- Consultas mais rápidas sem necessidade de cálculos complexos

### ✅ **Flexibilidade**
- Suporta qualquer quantidade de subcritérios
- Nomes e IDs dinâmicos baseados na configuração do usuário

### ✅ **Consistência**
- Dados idênticos aos enviados pela API
- Sincronização perfeita entre webhook e interface

## 📋 Arquivos Modificados

### 🗄️ **SQL**
- `add-subcriteria-averages.sql` - Adiciona campo `sub_criteria`

### 🔧 **Backend**
- `api-server/routes/webhookStorage.js` - Processa e armazena subcritérios

### 🎨 **Frontend**
- `components/ListDetailPageV3.tsx` - Consome dados reais do banco

## 🧪 Exemplo de Uso

### Dados do Webhook:
```json
{
  "sub_criteria": [
    {"id": "uuid1", "name": "Finalização", "avg_ovrr": 6},
    {"id": "uuid2", "name": "Cordialidade", "avg_ovrr": 7},
    {"id": "uuid3", "name": "Saudação", "avg_ovrr": 8}
  ]
}
```

### Dados no Banco:
```json
[
  {"id": "uuid1", "name": "Finalização", "avg_score": 6.0},
  {"id": "uuid2", "name": "Cordialidade", "avg_score": 7.0},
  {"id": "uuid3", "name": "Saudação", "avg_score": 8.0}
]
```

### Gráfico Radar:
```
FINALIZAÇÃO: 6.0
CORDIALIDADE: 7.0
SAUDAÇÃO: 8.0
```

## 🚀 Próximos Passos

1. **Executar o SQL** no Supabase para adicionar o campo
2. **Reiniciar a API** para aplicar as mudanças no webhook
3. **Testar** com um novo lote de análises
4. **Verificar** se o gráfico radar está exibindo os dados corretos

## ✅ Conclusão

A implementação garante que o gráfico radar seja alimentado com dados reais e precisos, melhorando significativamente a experiência do usuário e a confiabilidade das análises apresentadas. 