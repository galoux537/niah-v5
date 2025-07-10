# 🚀 Como Executar o Script no Supabase

## 📋 **PASSO 1: Abrir Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Clique no projeto **NIAH!**

## 📋 **PASSO 2: Abrir SQL Editor**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** ou use uma query existente

## 📋 **PASSO 3: Copiar e Colar o Script**

1. Abra o arquivo `setup-supabase-storage-simples.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)

## 📋 **PASSO 4: Executar o Script**

1. Clique no botão **"Run"** (▶️) no SQL Editor
2. Aguarde a execução (deve levar alguns segundos)
3. Verifique se não há erros na resposta

## ✅ **Verificar se Funcionou**

Depois de executar, você deve ver:

### 🗄️ **Storage**
- Vá em **Storage** no menu lateral
- Deve aparecer o bucket **"call-audios"** 
- Status: **Public** ✅

### 🗃️ **Database**
- As colunas de áudio foram adicionadas na tabela `calls`

## 🧪 **Testar**

Volte para o terminal e execute:
```bash
node exemplo-teste-supabase-storage.js
```

Deve mostrar: **✅ Bucket call-audios encontrado**

## ❗ **Se der erro:**

1. **"permission denied"**: Execute o script novamente
2. **"bucket already exists"**: Normal, pode continuar
3. **"column already exists"**: Normal, pode continuar

---

**Depois de executar o script, tente enviar uma ligação novamente pela API!** 🎵 