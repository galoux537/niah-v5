# 🗄️ Implementação do Armazenamento Automático no Banco de Dados

## 📋 Objetivo

Implementar sistema automático que armazena todos os dados dos webhooks da API v2.0 diretamente nas tabelas `evaluation_lists` e `calls` do Supabase, permitindo que a página "Avaliações" mostre os resultados das análises automaticamente.

## 🔧 Passos para Implementação

### 1. **Executar Script SQL no Supabase**

1. Acesse o **SQL Editor** no painel do Supabase
2. Copie todo o conteúdo do arquivo `update-database-structure.sql`
3. Execute o script completo
4. Verifique se não há erros na execução

**O que o script faz:**
- ✅ Atualiza estrutura das tabelas `evaluation_lists` e `calls`
- ✅ Remove colunas obsoletas e adiciona novas colunas para API v2.0
- ✅ Cria índices para performance
- ✅ Insere dados de exemplo para teste
- ✅ Adiciona comentários na documentação das tabelas

### 2. **Verificar Execução do Script**

Após executar o script, você deve ver:

```sql
-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluation_lists' 
AND column_name IN ('batch_id', 'status', 'files_count');

-- Verificar dados de exemplo
SELECT name, batch_id, status, files_count 
FROM evaluation_lists 
WHERE batch_id LIKE 'batch_test_%';
```

### 3. **Reiniciar a API**

Reinicie o servidor da API para carregar as novas rotas:

```bash
# No diretório api-server/
npm install  # Se necessário
npm start

# OU usar os scripts de inicialização
cd ..
./start-all.bat  # Windows
```

### 4. **Testar Funcionamento**

#### Teste 1: Verificar Endpoint de Armazenamento
```bash
curl http://localhost:3001/api/v1/storage/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook storage funcionando!",
  "companies": [...],
  "timestamp": "2024-12-17T..."
}
```

#### Teste 2: Fazer Análise em Lote Real
1. Acesse `http://localhost:5173`
2. Vá para "Análise em Lote"
3. Selecione um critério
4. Faça upload de 1-2 arquivos MP3/WAV
5. **NÃO** configure webhook (deixe vazio)
6. Execute a análise

#### Teste 3: Verificar Dados no Banco
```sql
-- Verificar se evaluation_list foi criada
SELECT * FROM evaluation_lists 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar se calls foram inseridas
SELECT el.name, c.file_name, c.status, c.overall_score 
FROM evaluation_lists el 
JOIN calls c ON c.evaluation_list_id = el.id 
ORDER BY c.created_at DESC 
LIMIT 10;
```

#### Teste 4: Verificar Interface
1. Acesse a página "Avaliações"
2. Você deve ver a nova lista criada pela API
3. Clique na lista para ver as ligações individuais

## 📊 Estrutura Final das Tabelas

### Tabela `evaluation_lists` (Listas de Avaliação)

**Novos campos principais:**
- `batch_id`: ID único do lote da API (ex: batch_1234567890)
- `status`: processing | completed | failed
- `files_count`: Número total de arquivos
- `successful_analyses`: Arquivos processados com sucesso
- `failed_analyses`: Arquivos que falharam
- `criteria_group_name`: Nome do critério utilizado
- `sub_criteria`: JSON com subcritérios (JSONB)
- `insights`: Array de insights gerados (TEXT[])
- `recommendations`: Array de recomendações (TEXT[])
- `started_at` / `completed_at`: Timestamps do processamento

### Tabela `calls` (Ligações Individuais)

**Novos campos principais:**
- `batch_id`: Relaciona com evaluation_list
- `file_id`: ID único do arquivo (ex: file_0_1234567890)
- `file_name`: Nome original do arquivo
- `overall_score`: Score geral da análise (0-10)
- `individual_criteria_scores`: JSON com scores por subcritério
- `transcript`: Transcrição real do áudio
- `transcription_is_real`: TRUE se foi OpenAI Whisper
- `agent_name`, `campaign_name`, `client_name`: Metadados
- `sentiment`: positivo | neutro | negativo
- `call_outcome`: resolvido | parcialmente_resolvido | etc.

## 🔄 Fluxo Automático

### Como Funciona:

1. **Usuário inicia análise** na página "Análise em Lote"
2. **API processa** arquivos e gera webhooks
3. **Sistema armazena automaticamente** os dados:
   - `batch_started` → Cria `evaluation_list`
   - `call_completed` → Cria `call` individual
   - `call_failed` → Cria `call` com erro
   - `batch_completed` → Atualiza `evaluation_list` com estatísticas finais
4. **Página "Avaliações"** mostra os dados automaticamente
5. **Usuário vê resultados** em tempo real

### Vantagens:

- ✅ **Armazenamento automático**: Não precisa configurar webhook
- ✅ **Interface integrada**: Dados aparecem na página "Avaliações"
- ✅ **Histórico completo**: Todas as análises ficam salvas
- ✅ **Estatísticas precisas**: Cálculos baseados em dados reais
- ✅ **Compatibilidade**: Funciona com estrutura existente

## 🛠️ Troubleshooting

### Problema: Script SQL falha
**Solução:** Execute as seções do script uma por vez, verificando erros

### Problema: Endpoint de storage não funciona
**Solução:** 
```bash
# Verificar se a rota foi registrada
curl http://localhost:3001/api/v1/storage/test

# Verificar logs do servidor
# Deve mostrar: "📥 Webhook recebido: ..."
```

### Problema: Dados não aparecem na interface
**Solução:**
1. Verificar se `company_id` está correto
2. Verificar se `display_id` foi configurado corretamente
3. Consultar tabelas diretamente no Supabase

### Problema: Análise não cria registros
**Solução:**
1. Verificar logs da API para erros de banco
2. Verificar se tabelas têm as colunas necessárias
3. Testar endpoint de storage manualmente

## 🎯 Próximos Passos (Opcional)

1. **Dashboard em tempo real**: Adicionar refresh automático na página "Avaliações"
2. **Notificações**: Mostrar toast quando análise for concluída
3. **Filtros avançados**: Filtrar por campanha, agente, período
4. **Exportação**: Permitir download dos resultados em Excel/PDF
5. **Métricas visuais**: Gráficos de performance por período

## ✅ Verificação Final

Execute esta checklist para confirmar que tudo está funcionando:

- [ ] Script SQL executado sem erros
- [ ] Endpoint `/api/v1/storage/test` retorna sucesso
- [ ] Análise em lote cria registros nas tabelas
- [ ] Página "Avaliações" mostra novas listas
- [ ] Ligações individuais aparecem dentro das listas
- [ ] Transcrições e scores estão corretos
- [ ] Metadados (cliente, agente) estão sendo salvos

---

## 🎉 Resultado Final

Com esta implementação, o NIAH! agora tem:

- **Armazenamento automático** de todas as análises
- **Interface integrada** mostrando resultados da API
- **Histórico completo** de análises por empresa
- **Estrutura escalável** para futuras funcionalidades
- **Performance otimizada** com índices adequados

A API v2.0 agora está **100% integrada** com a interface do usuário! 🚀 