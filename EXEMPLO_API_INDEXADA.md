# Exemplo de uso da API com campos indexados

## Nova funcionalidade implementada

A API de análise em lote agora aceita campos indexados para áudio, metadados e números de telefone, permitindo associar cada áudio com seus respectivos dados específicos.

## Formato da requisição

### Campos obrigatórios:
- `criteria`: Critérios de análise
- `audioFiles_0`, `audioFiles_1`, etc.: Arquivos de áudio indexados
- `metadata_0`, `metadata_1`, etc.: Metadados específicos para cada áudio
- `phone_number_0`, `phone_number_1`, etc.: Números de telefone específicos

### Campos opcionais:
- `webhook`: URL para receber callbacks
- `batch_name`: Nome do lote

## Exemplo de uso com curl

```bash
curl -X POST "http://localhost:3001/api/v1/analyze-batch-proxy" \
  -H "Authorization: Bearer SEU_JWT_TOKEN_AQUI" \
  -F "criteria={
    \"criteria_name\": \"critério 4\",
    \"criteriaId\": \"e270f185-0e87-48a5-8c12-e2cd526fe041\"
  }" \
  -F "webhook=https://webhook.site/seu-id-unico" \
  -F "batch_name=NOME_DO_LOTE_AQUI" \
  -F "audioFiles_0=@ligacao1.mp3" \
  -F "phone_number_0=5511999999999" \
  -F "metadata_0={
    \"name\": \"Ana Oliveira\",
    \"email\": \"ana.oliveira@empresaabc.com\",
    \"phone\": \"11987654321\",
    \"company\": \"Empresa ABC\",
    \"department\": \"suporte\",
    \"callType\": \"reclamação\",
    \"priority\": \"média\",
    \"campaign\": \"Campanha Inverno 2025\",
    \"agent\": \"Lucas Martins\",
    \"language\": \"pt-BR\",
    \"app_version\": \"5.3.0\",
    \"timezone\": \"America/Sao_Paulo\",
    \"status\": \"ativo\",
    \"last_contact\": \"2025-06-29T11:20:00Z\",
    \"ticket_id\": \"TCK-11223\"
  }" \
  -F "audioFiles_1=@ligacao2.wav" \
  -F "phone_number_1=5511988888888" \
  -F "metadata_1={
    \"name\": \"Carlos Batista\",
    \"email\": \"carlos@empresa.com\",
    \"phone\": \"11999887766\",
    \"company\": \"Empresa XPTO\",
    \"department\": \"atendimento\",
    \"callType\": \"pós-venda\",
    \"priority\": \"alta\",
    \"campaign\": \"Outubro Rosa\",
    \"agent\": \"Fernanda Lemos\",
    \"language\": \"pt-BR\",
    \"app_version\": \"5.1.2\",
    \"timezone\": \"America/Sao_Paulo\",
    \"status\": \"ativo\",
    \"last_contact\": \"2025-07-01T16:45:00Z\",
    \"ticket_id\": \"TCK-29384\"
  }"
```

## Como funciona

1. **Organização dos dados**: A API identifica automaticamente campos com padrão `audioFiles_X`, `metadata_X` e `phone_number_X`
2. **Associação por índice**: Cada áudio é associado aos seus metadados e número de telefone correspondente através do índice
3. **Processamento**: Cada ligação é processada com seus dados específicos
4. **Webhooks**: Os callbacks incluem os dados corretos para cada ligação

## Logs de exemplo

```
📋 Dados organizados por ligação:
  Ligação 0:
    - Arquivo: ligacao1.mp3 (1024000 bytes)
    - Telefone: 5511999999999
    - Metadados: Presentes
    - Cliente: Ana Oliveira
    - Empresa: Empresa ABC
  Ligação 1:
    - Arquivo: ligacao2.wav (2048000 bytes)
    - Telefone: 5511988888888
    - Metadados: Presentes
    - Cliente: Carlos Batista
    - Empresa: Empresa XPTO
```

## Vantagens

✅ **Indexação correta**: Cada áudio fica associado aos seus próprios metadados
✅ **Compatibilidade**: Funciona perfeitamente com Postman e outras ferramentas
✅ **Flexibilidade**: Suporta qualquer quantidade de arquivos (limitado pela configuração do servidor)
✅ **Logs detalhados**: Facilita o debug e acompanhamento do processamento

## Notas importantes

- Os índices devem ser sequenciais começando do 0
- É obrigatório ter pelo menos um arquivo (`audioFiles_0`)
- Metadados e números de telefone são opcionais para cada índice
- A API mantém compatibilidade com formatos anteriores para fallback 