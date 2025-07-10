# Teste da Nova API de Análise em Lote

## 🚀 Implementação Concluída

A página "Análise em Lote" foi atualizada para usar a nova API do Supabase Edge Function com o formato expandido de metadados.

## ✨ Principais Alterações

### 1. Nova URL da API
- **Antes:** `http://localhost:3001/api/v1/analyze-batch`
- **Agora:** `https://gbytmkzbcjstpwqitnjg.supabase.co/functions/v1/analyze-batch` ✅ **API REAL**

### 2. Autorização Configurada
- **Header:** `Authorization: Bearer [token-correto]`
- **Status:** ✅ **Funcionando com API real**

### 3. Formato de Critérios Atualizado
- **Antes:** Enviava `evaluation_list_id`
- **Agora:** Envia `criteria` com `nomeDoGrupo`

```json
{
  "nomeDoGrupo": "Nome do Critério Selecionado"
}
```

### 4. Interface de Metadados Melhorada
- ✅ **Todos os campos são digitáveis** (removidos dropdowns fixos)
- ✅ **Títulos claros** para cada campo de input
- ✅ **Placeholders explicativos** com exemplos
- ✅ **Organização visual** por categorias:
  - 📝 **Informações do Cliente:** Nome, Email, Telefone
  - 🏢 **Empresa do Cliente:** Empresa, Departamento  
  - 📞 **Detalhes da Ligação:** Tipo, Prioridade
  - 👤 **Informações Operacionais:** Agente, Campanha

### 5. Debug Aprimorado
- ✅ **Logs detalhados** no console
- ✅ **Visualização do FormData** completo
- ✅ **Status da resposta** da API
- ✅ **Headers da resposta** para debug

### 6. Metadados Expandidos
Agora cada arquivo de áudio inclui metadados completos:

```json
{
  "name": "João Silva",
  "email": "joao@email.com", 
  "phone": "(11) 99999-9999",
  "company": "Empresa LTDA",
  "department": "Suporte",
  "callType": "Reclamação", 
  "priority": "alta"
}
```

### 7. Formato de Envio (FormData)
```
callbackUrl=https://webhook.site/xxx
criteria={"nomeDoGrupo":"Nome do Critério"}
audioFiles_0=@arquivo1.mp3
agent_0=Ana Costa
campaign_0=Prospecção Q4
metadata_0={"name":"João","email":"joao@email.com",...}
audioFiles_1=@arquivo2.mp3
agent_1=Ana Costa
campaign_1=Prospecção Q4
metadata_1={"name":"Maria","email":"maria@email.com",...}
```

## 🧪 Como Testar

### 1. Acesse a Página
- Vá para "Análise em Lote" no menu
- Você verá o novo aviso sobre o sistema atualizado

### 2. Selecione Critérios
- Escolha um critério de avaliação da sua empresa
- Verifique se os subcritérios são exibidos corretamente

### 3. Upload de Arquivos
- Selecione um ou mais arquivos MP3/WAV
- Preencha os campos expandidos para cada arquivo:
  - **Cliente:** Nome, email, telefone
  - **Empresa:** Empresa do cliente, departamento
  - **Ligação:** Tipo (digitável: Consulta, Reclamação, Suporte, etc.)
  - **Prioridade:** Digitável (baixa, média, alta, crítica, etc.)
  - **Operação:** Agente, campanha

### 4. URL de Webhook
- Por padrão: `https://webhook.site/d26c97da-307d-4b72-b577-06d9073c81b3`
- Você pode alterar para sua própria URL

### 5. Enviar Análise
- Clique em "Iniciar Análise em Lote"
- O sistema enviará para a nova API do Supabase Edge Function com autorização

## 📊 Campos de Interface Disponíveis

### Metadados do Cliente
- **Nome:** Campo de texto livre (Ex: João Silva)
- **Email:** Campo de email com validação (Ex: joao@email.com)
- **Telefone:** Campo de texto livre (Ex: (11) 99999-9999)

### Informações da Empresa
- **Empresa:** Empresa do cliente - campo de texto (Ex: Empresa LTDA)
- **Departamento:** Departamento do cliente - campo de texto (Ex: Suporte, Vendas, Financeiro)

### Detalhes da Ligação
- **Tipo de Ligação:** Campo de texto livre (Ex: Consulta, Reclamação, Suporte, Vendas, Cobrança)
- **Prioridade:** Campo de texto livre (Ex: baixa, média, alta, crítica)

### Informações Operacionais
- **Agente:** Nome do atendente - campo de texto (Ex: Ana Costa)
- **Campanha:** Nome da campanha - campo de texto (Ex: Prospecção Q4)

> 📝 **Nota:** Todos os campos são agora completamente digitáveis, permitindo máxima flexibilidade na entrada de dados.

## 🔍 Monitoramento

### Logs do Console
O sistema registra informações detalhadas:
```
🚀 Enviando X arquivos para análise em lote
📊 Critério selecionado: Nome do Critério
🏢 Empresa: Nome da Empresa (ID)
✅ Lote enviado com sucesso: resposta da API
```

### Jobs Ativos
- A seção "Jobs Ativos" continua funcionando
- Monitoramento em tempo real do progresso
- Detalhes completos de cada job

## ⚠️ Observações Importantes

1. **Webhook URL:** Certifique-se de que a URL do webhook está acessível
2. **Critérios:** É obrigatório selecionar um critério antes do envio
3. **Arquivos:** Suporte para MP3 e WAV, máximo 25MB por arquivo
4. **API:** Agora usa a Supabase Edge Function diretamente

## 🚧 Limitações Atuais

### API Status
- ✅ **Interface atualizada** com novo formato
- ✅ **Autorização configurada** corretamente  
- ✅ **API real funcionando** (não simulação)
- ✅ **Debug detalhado** implementado

### Como Funciona Agora
1. **Envio real:** Usa a API Supabase Edge Function real
2. **Logs detalhados:** Console mostra FormData completo enviado
3. **Feedback claro:** Status e headers da resposta
4. **Webhook:** Resultados enviados para seu webhook configurado

### Monitoramento de Jobs
- O monitoramento de "Jobs Ativos" ainda usa o servidor local (http://localhost:3001)
- Como agora usa a API real do Supabase, recomenda-se usar o webhook para monitorar
- O carregamento automático de jobs foi temporariamente desabilitado

### Progresso da Análise
- ✅ **Webhook configurado:** `https://webhook.site/d26c97da-307d-4b72-b577-06d9073c81b3`
- ✅ **API real:** Processamento acontece de verdade
- ✅ **Resultados reais:** Enviados via webhook quando concluídos

## 🐛 Troubleshooting

### Erro de Envio
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se a URL do webhook é válida
- Verifique o console do navegador para logs detalhados

### Critérios Não Carregam
- Verifique se há critérios criados para sua empresa
- Confirme se você está logado corretamente
- Recarregue a página se necessário

---

**Data da Atualização:** $(date)
**Versão:** Nova API Supabase Edge Function 