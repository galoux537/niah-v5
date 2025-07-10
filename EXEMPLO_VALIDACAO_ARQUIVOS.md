# Sistema de Validação de Arquivos de Áudio

## ✅ Funcionalidade Implementada

A API agora valida todos os arquivos de áudio enviados e retorna erros específicos para cada tipo de problema, permitindo que a requisição seja aceita inicialmente mas mostrando os erros no retorno e nos webhooks.

## 🔍 Tipos de Validação

### 1. **Arquivo Vazio**
- **Tipo:** `EMPTY_FILE`
- **Descrição:** Arquivo com 0 bytes ou sem conteúdo
- **Ação:** Arquivo rejeitado, webhook de erro enviado

### 2. **Arquivo Muito Grande**
- **Tipo:** `FILE_TOO_LARGE`
- **Descrição:** Arquivo maior que 25MB
- **Limite:** 25MB máximo por arquivo
- **Ação:** Arquivo rejeitado, webhook de erro enviado

### 3. **Formato Inválido**
- **Tipo:** `INVALID_FORMAT`
- **Formatos aceitos:** `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`, `.aac`, `.mp4`, `.webm`
- **Ação:** Arquivo rejeitado, webhook de erro enviado

### 4. **MIME Type Suspeito**
- **Tipo:** `SUSPICIOUS_MIME_TYPE` (⚠️ Aviso)
- **Descrição:** MIME type não corresponde a áudio conhecido
- **Ação:** Arquivo processado com aviso

### 5. **Assinatura de Arquivo Suspeita**
- **Tipo:** `SUSPICIOUS_FILE_SIGNATURE` (⚠️ Aviso)
- **Descrição:** Arquivo pode estar corrompido (magic numbers inválidos)
- **Ação:** Arquivo processado com aviso

### 6. **Arquivo Muito Pequeno**
- **Tipo:** `FILE_TOO_SMALL` (⚠️ Aviso)
- **Descrição:** Arquivo menor que 1KB
- **Ação:** Arquivo processado com aviso

## 📋 Resposta da API

### Resposta de Sucesso com Validação
```json
{
  "success": true,
  "batch_id": "batch_1234567890",
  "message": "Análise em lote iniciada com 1 arquivo(s) com erro(s)",
  "files_count": 3,
  "files_valid": 2,
  "files_invalid": 1,
  "files_with_warnings": 1,
  "status": "processing",
  "validation_summary": {
    "total_files": 3,
    "valid_files": 2,
    "invalid_files": 1,
    "files_with_warnings": 1,
    "invalid_files_details": [
      {
        "index": 1,
        "file_name": "arquivo_vazio.mp3",
        "file_size": "0.00MB",
        "errors": [
          {
            "type": "EMPTY_FILE",
            "message": "Arquivo de áudio está vazio",
            "details": "O arquivo arquivo_vazio.mp3 não contém dados ou tem tamanho zero bytes"
          }
        ]
      }
    ],
    "warnings_details": [
      {
        "index": 2,
        "file_name": "arquivo_pequeno.wav",
        "file_size": "0.50MB",
        "warnings": [
          {
            "type": "FILE_TOO_SMALL",
            "message": "Arquivo muito pequeno",
            "details": "O arquivo arquivo_pequeno.wav tem apenas 512 bytes, pode não conter áudio suficiente para análise"
          }
        ]
      }
    ]
  }
}
```

## 🔗 Webhooks de Erro

### Webhook para Arquivo Inválido
```json
{
  "event": "call_failed",
  "batch_id": "batch_1234567890",
  "call_index": 2,
  "total_calls": 3,
  "file_name": "arquivo_grande.mp3",
  "file_size": 30000000,
  "status": "failed",
  "error_message": "Arquivo de áudio muito grande",
  "error_type": "VALIDATION_ERROR",
  "validation_errors": [
    {
      "type": "FILE_TOO_LARGE",
      "message": "Arquivo de áudio muito grande",
      "details": "O arquivo arquivo_grande.mp3 tem 28.61MB, máximo permitido: 25MB"
    }
  ],
  "file_details": {
    "name": "arquivo_grande.mp3",
    "size": 30000000,
    "sizeFormatted": "28.61MB",
    "mimetype": "audio/mpeg",
    "extension": ".mp3"
  },
  "metadata": {},
  "phone_number": "5511999999999",
  "failed_at": "2025-01-14T10:30:00Z"
}
```

### Webhook para Arquivo Válido com Avisos
```json
{
  "event": "call_completed",
  "batch_id": "batch_1234567890",
  "call_index": 1,
  "file_name": "ligacao_suspeita.mp3",
  "status": "success",
  "validation_info": {
    "file_size_mb": "5.20",
    "file_extension": ".mp3",
    "mime_type": "audio/mpeg",
    "warnings": [
      {
        "type": "SUSPICIOUS_FILE_SIGNATURE",
        "message": "Assinatura de arquivo suspeita",
        "details": "O arquivo ligacao_suspeita.mp3 pode estar corrompido ou não ser um áudio válido"
      }
    ],
    "validation_passed": true
  },
  "analysis": {
    "overall_score": 8.5
  }
}
```

## 🚀 Exemplo de Teste

### Requisição com Arquivos Mistos
```bash
curl -X POST "http://localhost:3001/api/v1/analyze-batch-proxy" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "criteria={\"criteria_name\": \"critério 4\"}" \
  -F "webhook=https://webhook.site/seu-id" \
  -F "audioFiles_0=@arquivo_valido.mp3" \
  -F "phone_number_0=5511999999999" \
  -F "audioFiles_1=@arquivo_vazio.mp3" \
  -F "phone_number_1=5511888888888" \
  -F "audioFiles_2=@arquivo_muito_grande.wav" \
  -F "phone_number_2=5511777777777"
```

### Logs de Exemplo
```
📋 Validando e organizando dados por ligação:
  Ligação 0:
    - Arquivo: arquivo_valido.mp3 (5242880 bytes)
    - Telefone: 5511999999999
    - Metadados: Não informados
    ✅ Arquivo válido
  Ligação 1:
    - Arquivo: arquivo_vazio.mp3 (0 bytes)
    - Telefone: 5511888888888
    - Metadados: Não informados
    ❌ ERROS (1):
      - EMPTY_FILE: Arquivo de áudio está vazio
  Ligação 2:
    - Arquivo: arquivo_muito_grande.wav (30000000 bytes)
    - Telefone: 5511777777777
    - Metadados: Não informados
    ❌ ERROS (1):
      - FILE_TOO_LARGE: Arquivo de áudio muito grande
```

## ✨ Vantagens

✅ **Validação Robusta**: Detecta múltiplos tipos de problemas em arquivos  
✅ **Erros Específicos**: Cada tipo de erro tem sua mensagem clara  
✅ **Aceita Requisição**: API não falha na requisição inicial  
✅ **Webhooks Detalhados**: Erros são comunicados via webhook  
✅ **Processamento Inteligente**: Arquivos válidos são processados normalmente  
✅ **Avisos Informativos**: Warnings para situações suspeitas mas não críticas

## 🔧 Configurações

- **Tamanho máximo aceito pela API**: 100MB (para upload inicial)
- **Tamanho máximo para processamento**: 25MB
- **Tamanho mínimo recomendado**: 1KB
- **Formatos suportados**: MP3, WAV, M4A, OGG, FLAC, AAC, MP4, WebM
- **Máximo de arquivos por lote**: 50 