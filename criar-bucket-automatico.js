// ====================================================================
// SCRIPT PARA CRIAR BUCKET AUTOMATICAMENTE - NIAH!
// ====================================================================
// Execute: node criar-bucket-automatico.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE4MzQ0NiwiZXhwIjoyMDY1NzU5NDQ2fQ.cEP-7cJKSFSUOgr3RhkNGMNzf9KpQE6aVCNNZCJXqWQ'; // Service key para operações administrativas

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function criarBucketAutomatico() {
  console.log('🚀 Configurando Supabase Storage automaticamente...\n');
  
  try {
    // 1. Verificar se bucket já existe
    console.log('1️⃣ Verificando bucket existente...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'call-audios');
    
    if (bucketExists) {
      console.log('✅ Bucket call-audios já existe!');
    } else {
      // 2. Criar bucket
      console.log('2️⃣ Criando bucket call-audios...');
      const { data: bucketData, error: createError } = await supabaseAdmin.storage.createBucket('call-audios', {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket criado com sucesso!');
    }
    
    // 3. Testar upload
    console.log('3️⃣ Testando upload...');
    const testContent = 'teste';
    const testFileName = 'teste-upload.txt';
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('call-audios')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Erro no upload de teste:', uploadError);
      console.log('⚠️ Provavelmente precisa configurar políticas RLS manualmente');
    } else {
      console.log('✅ Upload de teste funcionando!');
      
      // 4. Limpar arquivo de teste
      await supabaseAdmin.storage
        .from('call-audios')
        .remove([testFileName]);
      
      console.log('🧹 Arquivo de teste removido');
    }
    
    // 5. Obter URL de exemplo
    console.log('4️⃣ Testando geração de URL...');
    const { data: urlData } = supabaseAdmin.storage
      .from('call-audios')
      .getPublicUrl('exemplo-arquivo.mp3');
    
    console.log('✅ URL pública de exemplo:', urlData.publicUrl);
    
    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Execute o script SQL para criar colunas no banco');
    console.log('   2. Teste enviando uma ligação pela API');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
criarBucketAutomatico(); 