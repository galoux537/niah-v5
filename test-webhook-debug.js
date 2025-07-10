// Teste específico para debugar webhooks
const axios = require('axios');
import { createClient } from '@supabase/supabase-js';

async function testWebhook() {
  const webhookUrl = 'https://little-nest-13.webhook.cool';
  
  console.log('🧪 Testando webhook diretamente...');
  
  try {
    const testData = {
      event: 'test_webhook',
      message: 'Teste direto do Node.js',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        node_version: process.version
      }
    };
    
    console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(webhookUrl, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook enviado com sucesso!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Simular a função exatamente como no código
async function sendWebhook(url, data) {
  if (!url) {
    console.log('⚠️ Webhook URL não fornecida, pulando webhook');
    return;
  }
  
  try {
    console.log(`📤 Enviando webhook para: ${url}`);
    console.log(`📋 Evento: ${data.event}`);
    console.log(`📄 Dados: ${JSON.stringify(data, null, 2)}`);
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 segundos timeout
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Webhook enviado: ${data.event} - Status: ${response.status}`);
    } else {
      console.warn(`❌ Webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

async function testBatchWebhooks() {
  const webhookUrl = 'https://little-nest-13.webhook.cool';
  const batchId = `batch_test_${Date.now()}`;
  
  console.log('\n🚀 Testando webhooks de análise em lote...');
  
  // Webhook inicial
  console.log('\n1️⃣ Enviando webhook inicial...');
  await sendWebhook(webhookUrl, {
    event: 'batch_started',
    batch_id: batchId,
    status: 'processing',
    files_count: 1,
    message: 'Análise em lote iniciada - processamento em andamento',
    timestamp: new Date().toISOString()
  });
  
  // Aguardar 3 segundos e enviar webhook de conclusão
  setTimeout(async () => {
    console.log('\n2️⃣ Enviando webhook de conclusão...');
    await sendWebhook(webhookUrl, {
      event: 'batch_completed',
      batch_id: batchId,
      status: 'completed',
      files_count: 1,
      results: [{
        file_name: 'teste.mp3',
        file_size: 1024,
        analysis_score: 85,
        criteria_met: true,
        transcription: 'Transcrição de teste',
        agent_name: 'Agente Teste',
        campaign_name: 'Campanha Teste'
      }],
      summary: {
        total_files: 1,
        successful_analyses: 1,
        average_score: 85,
        criteria_compliance: '90%'
      },
      message: 'Análise em lote concluída com sucesso',
      timestamp: new Date().toISOString()
    });
    console.log('\n✅ Teste de webhooks concluído!');
  }, 3000);
}

// Executar testes
async function runAllTests() {
  await testWebhook();
  await testBatchWebhooks();
}

runAllTests(); 

// ====================================================================
// TESTE DEBUG: Hook useSupabaseAudio - NIAH!
// ====================================================================
// Execute: node test-webhook-debug.js

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