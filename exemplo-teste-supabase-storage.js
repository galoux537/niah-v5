// ====================================================================
// SCRIPT DE TESTE PARA SUPABASE STORAGE - NIAH!
// ====================================================================
// Execute: node exemplo-teste-supabase-storage.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarSupabaseStorage() {
  console.log('🧪 Testando Supabase Storage...\n');
  
  try {
    // 1. Verificar se bucket existe
    console.log('1. Verificando bucket call-audios...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }
    
    const audioBucket = buckets.find(bucket => bucket.id === 'call-audios');
    if (audioBucket) {
      console.log('✅ Bucket call-audios encontrado:', audioBucket);
    } else {
      console.log('❌ Bucket call-audios não encontrado');
      console.log('📋 Buckets disponíveis:', buckets.map(b => b.id));
      return;
    }
    
    // 2. Testar função SQL
    console.log('\n2. Testando função get_call_audio_info...');
    
    // Primeiro, buscar uma call existente
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('id, file_name')
      .limit(1);
    
    if (callsError) {
      console.error('❌ Erro ao buscar calls:', callsError);
      return;
    }
    
    if (!calls || calls.length === 0) {
      console.log('📭 Nenhuma call encontrada no banco');
      console.log('💡 Criando call de exemplo...');
      
      // Criar call de exemplo
      const { data: newCall, error: insertError } = await supabase
        .from('calls')
        .insert({
          company_id: 'company-123',
          evaluation_list_id: 'eval-123',
          file_name: 'teste-audio.mp3',
          overall_score: 8.5,
          status: 'completed',
          audio_file_name: 'teste-audio.mp3',
          audio_file_size: 1024000,
          audio_storage_path: 'company-123/batch-test/1703123456_teste-audio.mp3'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erro ao criar call de exemplo:', insertError);
        return;
      }
      
      console.log('✅ Call de exemplo criada:', newCall.id);
      
      // Testar função com a nova call
      const { data: audioInfo, error: funcError } = await supabase
        .rpc('get_call_audio_info', { call_id_param: newCall.id });
      
      if (funcError) {
        console.error('❌ Erro na função SQL:', funcError);
      } else {
        console.log('✅ Função SQL funcionando:', audioInfo);
      }
      
    } else {
      const testCallId = calls[0].id;
      console.log(`🔍 Testando com call existente: ${testCallId}`);
      
      const { data: audioInfo, error: funcError } = await supabase
        .rpc('get_call_audio_info', { call_id_param: testCallId });
      
      if (funcError) {
        console.error('❌ Erro na função SQL:', funcError);
      } else {
        console.log('✅ Função SQL funcionando:', audioInfo);
      }
    }
    
    // 3. Testar geração de URL pública
    console.log('\n3. Testando geração de URL pública...');
    
    const testPath = 'company-123/batch-test/1703123456_teste-audio.mp3';
    const { data: urlData } = supabase.storage
      .from('call-audios')
      .getPublicUrl(testPath);
    
    if (urlData?.publicUrl) {
      console.log('✅ URL pública gerada:', urlData.publicUrl);
    } else {
      console.log('❌ Falha ao gerar URL pública');
    }
    
    // 4. Verificar estrutura da tabela calls
    console.log('\n4. Verificando estrutura da tabela calls...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('calls')
      .select('audio_storage_url, audio_storage_path, audio_file_name, audio_file_size')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao verificar estrutura:', tableError);
    } else {
      console.log('✅ Colunas de áudio existem na tabela calls');
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o script SQL no Supabase (se ainda não executou)');
    console.log('2. Teste o front-end abrindo uma ligação no modal');
    console.log('3. Faça upload de áudios via API para testar o fluxo completo');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar teste
testarSupabaseStorage(); 