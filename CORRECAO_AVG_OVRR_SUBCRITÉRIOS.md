# 🔧 CORREÇÃO: avg_ovrr Fictício nos Subcritérios

## 🚨 **Problema Identificado**

O usuário reportou uma **inconsistência crítica** nos dados dos subcritérios:

### 📊 **Dados Corretos (call_completed):**
- Todas as notas individuais: **0** (ligação ruim com palavrões)
- Score geral: **0**

### 🔥 **Dados INCORRETOS (batch_completed):**
- Cordialidade: `avg_ovrr: 6` ❌ (deveria ser 0)
- Formalidade: `avg_ovrr: 6` ❌ (deveria ser 0)  
- Saudação: `avg_ovrr: 7` ❌ (deveria ser 0)
- Negociação: `avg_ovrr: 6` ❌ (deveria ser 0)
- Abordagem: `avg_ovrr: 8` ❌ (deveria ser 0)
- Finalização: `avg_ovrr: 6` ❌ (deveria ser 0)

## 🔍 **Causa Raiz**

O problema estava na função `generateBatchStatistics()` em `api-server/routes/batchAnalysis.js`:

### ❌ **Código Problemático:**
```javascript
// Linha 2268-2275 - GERANDO DADOS FICTÍCIOS!
const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, ou +1
const subcriteriaAverage = Math.max(1, Math.min(10, globalAverage + variation));

return {
  id: sub.id,
  name: sub.name,
  avg_ovrr: subcriteriaAverage  // ❌ VALOR FICTÍCIO!
};
```

### ❌ **Scores Fictícios:**
```javascript
// Linha 2258 - GERANDO SCORES ALEATÓRIOS!
const scores = Array.from({length: successfulAnalyses}, () => Math.floor(Math.random() * 4) + 7);
```

## ✅ **Solução Implementada**

### 1. **Coleta de Dados Reais**
```javascript
// Array para armazenar dados completos das ligações (para calcular subcritérios)
const processedCallsData = [];

// Armazenar dados completos da ligação para calcular subcritérios
processedCallsData.push({
  file_name: file.originalname,
  analysis: callResult.analysis,
  transcription: callResult.transcription,
  criteria_group_used: callResult.criteria_group_used
});
```

### 2. **Cálculo Real dos Subcritérios**
```javascript
// CALCULAR MÉDIAS REAIS DOS SUBCRITÉRIOS baseadas nas ligações processadas
if (subCriteriaData && processedCalls && processedCalls.length > 0) {
  subCriteriaList = subCriteriaData.map(sub => {
    // Calcular média real deste subcritério nas ligações processadas
    let subcriteriaScores = [];
    
    processedCalls.forEach(call => {
      if (call.analysis && call.analysis.individual_criteria_scores && 
          call.analysis.individual_criteria_scores[sub.id]) {
        const score = call.analysis.individual_criteria_scores[sub.id].score;
        if (typeof score === 'number') {
          subcriteriaScores.push(score);
        }
      }
    });
    
    // Calcular média real ou usar 0 se não há dados
    const realAverage = subcriteriaScores.length > 0 ? 
      Math.round((subcriteriaScores.reduce((a, b) => a + b, 0) / subcriteriaScores.length) * 100) / 100 : 0;
    
    console.log(`📊 DEBUG: Subcritério ${sub.name} - Scores: [${subcriteriaScores.join(', ')}] - Média: ${realAverage}`);
    
    return {
      id: sub.id,
      name: sub.name,
      avg_ovrr: realAverage // ✅ MÉDIA REAL calculada!
    };
  });
}
```

### 3. **Cálculo Real dos Scores Gerais**
```javascript
// Calcular estatísticas REAIS baseadas nas ligações processadas
if (processedCalls && processedCalls.length > 0) {
  // Usar dados reais das ligações processadas
  processedCalls.forEach(call => {
    if (call.analysis && typeof call.analysis.overall_score === 'number') {
      successfulAnalyses++;
      realScores.push(call.analysis.overall_score);
    } else {
      failedAnalyses++;
    }
  });
}

// Calcular médias reais
const averageScore = realScores.length > 0 ? 
  Math.round((realScores.reduce((a, b) => a + b, 0) / realScores.length) * 100) / 100 : 0;
```

### 4. **Atualização da Chamada da Função**
```javascript
// Gerar estatísticas finais do batch com dados reais
const batchStats = await generateBatchStatistics(
  files, 
  req.user.company_id, 
  JSON.parse(criteria || '{}'), 
  processedCallsData  // ✅ DADOS REAIS passados!
);
```

## 📋 **Arquivos Modificados**

### `api-server/routes/batchAnalysis.js`
- ✅ Função `generateBatchStatistics()` reformulada
- ✅ Coleta de dados reais das ligações processadas
- ✅ Cálculo real dos subcritérios baseado em dados reais
- ✅ Eliminação de valores fictícios/aleatórios

## 🧪 **Resultado Esperado**

### ✅ **Agora com Dados Reais:**
Para uma ligação com todas as notas 0:
```json
{
  "event": "batch_completed",
  "sub_criteria": [
    {"name": "Cordialidade", "avg_ovrr": 0},    // ✅ REAL
    {"name": "Formalidade", "avg_ovrr": 0},    // ✅ REAL
    {"name": "Saudação", "avg_ovrr": 0},       // ✅ REAL
    {"name": "Negociação", "avg_ovrr": 0},     // ✅ REAL
    {"name": "Abordagem", "avg_ovrr": 0},      // ✅ REAL
    {"name": "Finalização", "avg_ovrr": 0}     // ✅ REAL
  ]
}
```

## 🔄 **Próximos Passos**

1. **Testar** com ligações reais
2. **Verificar** se os dados do frontend são atualizados corretamente
3. **Confirmar** que o gráfico radar mostra dados reais

## 📝 **Logs de Debug**

A correção inclui logs detalhados para monitoramento:
```javascript
console.log(`📊 DEBUG: Subcritério ${sub.name} - Scores: [${subcriteriaScores.join(', ')}] - Média: ${realAverage}`);
console.log('📊 DEBUG: Usando dados reais - Success:', successfulAnalyses, 'Failed:', failedAnalyses);
console.log('📊 DEBUG: Scores reais:', realScores);
```

---

**Status:** ✅ **CORRIGIDO** - Os subcritérios agora usam dados reais das ligações processadas, não valores fictícios. 