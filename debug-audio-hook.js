// ====================================================================
// TESTE DEBUG: Hook useSupabaseAudio - NIAH!
// ====================================================================
// Execute: node debug-audio-hook.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugAudioHook() {
  console.log('🧪 TESTE: useSupabaseAudio Debug');
  console.log('');
  
  try {
    // 1. Listar todas as ligações da empresa
    console.log('1️⃣ Buscando ligações da empresa...');
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('id, file_name, audio_storage_url, audio_public_url, has_audio')
      .eq('company_id', '0c2ce39e-0907-475a-b40d-bd3ca27384cf')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (callsError) {
      console.error('❌ Erro ao buscar ligações:', callsError);
      return;
    }
    
    console.log('✅ Ligações encontradas:', calls?.length || 0);
    calls?.forEach((call, index) => {
      console.log(`   ${index + 1}. ${call.file_name}`);
      console.log(`      ID: ${call.id}`);
      console.log(`      Audio URL: ${call.audio_storage_url || 'NULL'}`);
      console.log(`      Public URL: ${call.audio_public_url || 'NULL'}`);
      console.log(`      Has Audio: ${call.has_audio || 'NULL'}`);
      console.log('');
    });
    
    if (!calls || calls.length === 0) {
      console.log('❌ Nenhuma ligação encontrada!');
      return;
    }
    
    // 2. Testar função get_call_audio_info com primeira ligação
    const testCallId = calls[0].id;
    console.log(`2️⃣ Testando função get_call_audio_info para call ID: ${testCallId}`);
    
    const { data: audioInfo, error: audioError } = await supabase
      .rpc('get_call_audio_info', { call_id_param: testCallId });
    
    if (audioError) {
      console.error('❌ Erro na função get_call_audio_info:', audioError);
      return;
    }
    
    console.log('✅ Resultado da função:');
    console.log('   Dados retornados:', audioInfo?.length || 0);
    if (audioInfo && audioInfo.length > 0) {
      const info = audioInfo[0];
      console.log('   Call ID:', info.call_id);
      console.log('   Has Audio:', info.has_audio);
      console.log('   Storage URL:', info.storage_url || 'NULL');
      console.log('   Storage Path:', info.storage_path || 'NULL');
      console.log('   File Name:', info.file_name || 'NULL');
      console.log('   File Size:', info.file_size || 'NULL');
      console.log('   Public URL:', info.public_url || 'NULL');
    } else {
      console.log('❌ Função retornou dados vazios');
    }
    
    // 3. Testar URL pública se disponível
    if (audioInfo && audioInfo[0]?.public_url) {
      console.log('');
      console.log('3️⃣ Testando URL pública...');
      const publicUrl = audioInfo[0].public_url;
      console.log('   URL:', publicUrl);
      
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        console.log('   Content-Length:', response.headers.get('content-length'));
        
        if (response.status === 200) {
          console.log('✅ URL pública funcionando!');
        } else {
          console.log('❌ URL pública com problema');
        }
      } catch (fetchError) {
        console.error('❌ Erro ao testar URL:', fetchError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugAudioHook(); 