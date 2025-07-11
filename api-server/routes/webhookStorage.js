// ====================================================================
// WEBHOOK STORAGE - Armazenamento dos dados da API v2.0 no Supabase
// ====================================================================

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuração do Supabase
const supabaseUrl = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====================================================================
// ENDPOINT PARA RECEBER WEBHOOKS E ARMAZENAR NO BANCO
// ====================================================================

router.post('/store-webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log(`📥 Webhook recebido: ${webhookData.event}`);
    
    // Processar diferentes tipos de webhook
    switch (webhookData.event) {
      case 'batch_started':
        await handleBatchStarted(webhookData);
        break;
        
      case 'call_completed':
        await handleCallCompleted(webhookData);
        break;
        
      case 'call_failed':
        await handleCallFailed(webhookData);
        break;
        
      case 'batch_completed':
        await handleBatchCompleted(webhookData);
        break;
        
      default:
        console.log(`⚠️ Tipo de webhook não reconhecido: ${webhookData.event}`);
    }
    
    res.json({ 
      success: true, 
      message: `Webhook ${webhookData.event} processado com sucesso`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ====================================================================
// HANDLERS PARA CADA TIPO DE WEBHOOK
// ====================================================================

async function handleBatchStarted(data) {
  console.log(`🚀 Processando batch_started: ${data.batch_id}`);
  
  try {
    // Buscar company_id real baseado no display_id
    const realCompanyId = await getRealCompanyId(data.company_id);
    if (!realCompanyId) {
      throw new Error(`Company não encontrada para display_id: ${data.company_id}`);
    }
    
    // Inserir nova evaluation_list
    const { data: insertData, error } = await supabase
      .from('evaluation_lists')
      .insert({
        company_id: realCompanyId,
        name: `Análise ${data.criteria_group_applied?.name || 'Automática'}`,
        description: `Lote iniciado em ${new Date().toLocaleString('pt-BR')} - ${data.files_count} arquivo(s)`,
        batch_id: data.batch_id,
        status: data.status || 'processing',
        files_count: data.files_count || 0,
        successful_analyses: 0,
        failed_analyses: 0,
        total_calls: data.files_count || 0,
        criteria_group_name: data.criteria_group_applied?.name,
        total_subcriteria: data.criteria_group_applied?.total_criteria || 0,
        criteria_id: data.criteria_id || null,
        sub_criteria: data.criteria_group_applied?.sub_criteria || [],
        started_at: data.started_at ? new Date(data.started_at) : new Date(),
        created_at: new Date()
      });
    
    if (error) {
      throw new Error(`Erro ao inserir evaluation_list: ${error.message}`);
    }
    
    console.log(`✅ Evaluation list criada para batch: ${data.batch_id}`);
    
  } catch (error) {
    console.error(`❌ Erro em handleBatchStarted:`, error);
    throw error;
  }
}

async function handleCallCompleted(data) {
  console.log(`✅ Processando call_completed: ${data.file_name}`);
  
  try {
    // Buscar company_id real e evaluation_list_id
    const realCompanyId = await getRealCompanyId(data.company_id);
    const evaluationList = await getEvaluationListByBatchId(data.batch_id);
    
    if (!realCompanyId || !evaluationList) {
      throw new Error(`Dados não encontrados para call_completed`);
    }
    
    // Extrair telefone dos metadados ou campo direto
    const phoneFromMetadata = data.metadata?.phone || data.metadata?.phone_number || null;
    const phoneFromField = data.phone_number || null;
    const finalPhoneNumber = phoneFromField || phoneFromMetadata;
    
    // Preparar dados com campos que sabemos que existem na tabela
    const callData = {
      company_id: realCompanyId,
      evaluation_list_id: evaluationList.id,
      batch_id: data.batch_id,
      call_index: data.call_index,
      total_calls: data.total_calls,
      file_id: data.file_id || null,
      file_name: data.file_name,
      file_size: data.file_size,
      file_duration: data.file_duration || null,
      status: data.status || 'completed',
      criteria_id: data.criteria_id || null,
      
      // Dados do áudio (apenas campos que existem)
      audio_size: data.audio_size || null,
      
      // Dados do Supabase Storage
      audio_storage_url: data.audio_storage?.storage_url || null,
      audio_storage_path: data.audio_storage?.storage_path || null,
      audio_file_name: data.audio_storage?.file_name || data.file_name,
      audio_file_size: data.audio_storage?.file_size || data.file_size,
      audio_public_url: data.audio_storage?.public_url || null,
      has_audio: data.audio_storage?.has_audio || false,
      
      // Análise
      overall_score: data.analysis?.overall_score || null,
      score: data.analysis?.overall_score || null,
      summary: data.analysis?.summary || null,
      highlights: data.analysis?.highlights || [],
      improvements: data.analysis?.improvements || [],
      sentiment: data.analysis?.sentiment || null,
      call_outcome: data.analysis?.call_outcome || null,
      individual_criteria_scores: data.analysis?.individual_criteria_scores || {},
      feedback: data.analysis?.individual_criteria_scores || {},

      // ===========================
      // Campos de TRANSCRIÇÃO
      // ===========================
      // O front-end (CallDetailModal) espera que o texto da transcrição esteja
      // em `transcription_text` e uma flag indicando se é real. Incluir também
      // idioma para possíveis filtros futuros.
      transcription_text: data.transcription?.text || null,
      transcription_is_real: data.transcription?.is_real || false,
      transcription_language: data.transcription?.language || null,
      
      // Metadados dinâmicos e telefone
      metadata: data.metadata || {},
      phone_number: finalPhoneNumber,
      
      // Processamento
      processed_at: data.processed_at ? new Date(data.processed_at) : new Date(),
      processing_duration: data.processing_duration || null,
      call_date: new Date(),
      created_at: new Date()
    };
    
    // TENTATIVA 1: Inserção normal
    console.log(`🔄 Tentativa 1: Inserção normal...`);
    let { data: insertData, error } = await supabase
      .from('calls')
      .insert(callData);

    // =========================
    // Fallback: coluna ausente
    // =========================
    if (error && error.message && error.message.includes('transcription_text')) {
      console.warn('⚠️  Coluna transcription_text não encontrada. Removendo campos de transcrição e tentando novamente...');

      // Ajustar dados: mover texto para campo legacy "transcript" se existir
      const fallbackCallData = { ...callData };
      if (fallbackCallData.transcription_text) {
        fallbackCallData.transcript = fallbackCallData.transcription_text;
      }
      delete fallbackCallData.transcription_text;
      delete fallbackCallData.transcription_is_real;
      delete fallbackCallData.transcription_language;

      const { data: insertFallback, error: errorFallback } = await supabase
        .from('calls')
        .insert(fallbackCallData);

      if (!errorFallback) {
        console.log('✅ Call inserida usando fallback (sem transcription_text)');
        error = null; // Limpa erro para evitar tratamento abaixo
      } else {
        console.error('❌ Fallback também falhou:', errorFallback.message);
        error = errorFallback; // Continua fluxo de erros normal
      }
    }
    
    if (error && error.message.includes('audio_data')) {
      console.log(`⚠️  Trigger problemático detectado. Tentativa 2: Upsert...`);
      
      // TENTATIVA 2: Usar upsert com conflict resolution
      const uniqueKey = `${data.batch_id}_${data.call_index}_${Date.now()}`;
      const upsertData = {
        ...callData,
        file_id: data.file_id || uniqueKey // Usar como chave única
      };
      
      const { data: upsertResult, error: upsertError } = await supabase
        .from('calls')
        .upsert(upsertData, { onConflict: 'file_id' });
      
      if (upsertError && upsertError.message.includes('audio_data')) {
        console.log(`⚠️  Upsert também falhou. Tentativa 3: RPC...`);
        
        // TENTATIVA 3: Usar RPC para inserção direta (contorna triggers)
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('manual_insert_call', {
            p_company_id: realCompanyId,
            p_evaluation_list_id: evaluationList.id,
            p_batch_id: data.batch_id,
            p_file_name: data.file_name,
            p_criteria_id: data.criteria_id,
            p_overall_score: data.analysis?.overall_score,
            p_phone_number: finalPhoneNumber,
            p_status: data.status || 'completed'
          });
          
          if (rpcError) {
            throw new Error(`RPC também falhou: ${rpcError.message}`);
          }
          
          console.log(`✅ Call inserida via RPC: ${data.file_name}`);
        } catch (rpcError) {
          // TENTATIVA 4: Log do erro e continuar (para não quebrar o webhook)
          console.error(`❌ Todas as tentativas falharam para ${data.file_name}:`, rpcError.message);
          console.error(`📋 Dados que tentamos inserir:`, JSON.stringify(callData, null, 2));
          
          // Registrar erro mas não falhar o webhook
          console.log(`🔄 Webhook continuará processando outros arquivos...`);
          return; // Não lançar erro para não interromper o lote
        }
      } else if (upsertError) {
        throw new Error(`Erro no upsert: ${upsertError.message}`);
      } else {
        console.log(`✅ Call inserida via upsert: ${data.file_name}`);
      }
    } else if (error) {
      throw new Error(`Erro na inserção normal: ${error.message}`);
    } else {
      console.log(`✅ Call inserida normalmente: ${data.file_name}`);
    }
    
  } catch (error) {
    console.error(`❌ Erro em handleCallCompleted:`, error);
    // Log detalhado mas não quebrar o webhook
    console.error(`📋 File: ${data.file_name}, Batch: ${data.batch_id}`);
    console.error(`📋 Webhook continuará processando...`);
  }
}

async function handleCallFailed(data) {
  console.log(`❌ Processando call_failed: ${data.file_name}`);
  
  try {
    // Buscar company_id real e evaluation_list_id
    const realCompanyId = await getRealCompanyId(data.company_id);
    const evaluationList = await getEvaluationListByBatchId(data.batch_id);
    
    if (!realCompanyId || !evaluationList) {
      throw new Error(`Dados não encontrados para call_failed`);
    }
    
    // Extrair telefone (mesmo para calls que falharam)
    const phoneFromMetadata = data.metadata?.phone || data.metadata?.phone_number || null;
    const phoneFromField = data.phone_number || null;
    const finalPhoneNumber = phoneFromField || phoneFromMetadata;
    
    // Inserir ligação com erro
    const callData = {
      company_id: realCompanyId,
      evaluation_list_id: evaluationList.id,
      batch_id: data.batch_id,
      call_index: data.call_index,
      total_calls: data.total_calls,
      file_name: data.file_name,
      file_size: data.file_size,
      status: 'failed',
      error_code: data.error_type || 'processing_error',
      error_details: data.error_message,
      // Critério associado (mesmo para falhas)
      criteria_id: data.criteria_id || null,
      
      // Metadados dinâmicos e telefone (mesmo para calls que falharam)
      metadata: data.metadata || {},
      phone_number: finalPhoneNumber,
      
      call_date: data.failed_at ? new Date(data.failed_at) : new Date(),
      created_at: new Date()
    };
    
    const { data: insertData, error } = await supabase
      .from('calls')
      .insert(callData);
    
    if (error) {
      throw new Error(`Erro ao inserir call_failed: ${error.message}`);
    }
    
    console.log(`✅ Call failed inserida: ${data.file_name}`);
    
  } catch (error) {
    console.error(`❌ Erro em handleCallFailed:`, error);
    throw error;
  }
}

async function handleBatchCompleted(data) {
  console.log(`🏁 Processando batch_completed: ${data.batch_id}`);
  
  try {
    // Buscar evaluation_list existente
    const evaluationList = await getEvaluationListByBatchId(data.batch_id);
    if (!evaluationList) {
      throw new Error(`Evaluation list não encontrada para batch: ${data.batch_id}`);
    }
    
    // Processar subcritérios do webhook para armazenar no banco
    let subCriteriaData = [];
    if (data.sub_criteria && Array.isArray(data.sub_criteria)) {
      subCriteriaData = data.sub_criteria.map(subCriterion => ({
        id: subCriterion.id,
        name: subCriterion.name,
        avg_score: subCriterion.avg_ovrr || 0
      }));
      
      console.log(`📊 Processando ${subCriteriaData.length} subcritérios:`, subCriteriaData);
    }
    
    // Atualizar evaluation_list com dados finais
    const updateData = {
      status: data.status || 'completed',
      successful_analyses: data.summary?.successful_analyses || 0,
      failed_analyses: data.summary?.failed_analyses || 0,
      average_score: data.summary?.average_score,
      highest_score: data.summary?.highest_score,
      lowest_score: data.summary?.lowest_score,
      criteria_compliance: data.summary?.criteria_compliance,
      criteria_group_name: data.criteria_group_name,
      total_subcriteria: data.total_subcriteria || 0,
      sub_criteria: subCriteriaData, // Armazenar subcritérios com médias
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      processing_duration: data.processing_duration,
      completed_at: data.completed_at ? new Date(data.completed_at) : new Date(),
      updated_at: new Date()
    };
    
    console.log(`💾 Dados que serão salvos na evaluation_list:`, updateData);
    
    const { data: updateResult, error } = await supabase
      .from('evaluation_lists')
      .update(updateData)
      .eq('id', evaluationList.id);
    
    if (error) {
      throw new Error(`Erro ao atualizar evaluation_list: ${error.message}`);
    }
    
    console.log(`✅ Evaluation list atualizada com ${subCriteriaData.length} subcritérios: ${data.batch_id}`);
    
    // Atualizar estatísticas na tabela
    await updateEvaluationListStats(evaluationList.id);
    
  } catch (error) {
    console.error(`❌ Erro em handleBatchCompleted:`, error);
    throw error;
  }
}

// ====================================================================
// FUNÇÕES AUXILIARES
// ====================================================================

async function getRealCompanyId(displayId) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('display_id', displayId)
      .single();
    
    if (error || !data) {
      console.error(`❌ Company não encontrada para display_id: ${displayId}`);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error(`❌ Erro ao buscar company:`, error);
    return null;
  }
}

async function getEvaluationListByBatchId(batchId) {
  try {
    const { data, error } = await supabase
      .from('evaluation_lists')
      .select('*')
      .eq('batch_id', batchId)
      .single();
    
    if (error || !data) {
      console.error(`❌ Evaluation list não encontrada para batch: ${batchId}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar evaluation list:`, error);
    return null;
  }
}

async function updateEvaluationListStats(evaluationListId) {
  try {
    // Recalcular estatísticas baseadas nas calls
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('overall_score, status')
      .eq('evaluation_list_id', evaluationListId);
    
    if (callsError) {
      throw new Error(`Erro ao buscar calls: ${callsError.message}`);
    }
    
    const completedCalls = calls.filter(c => c.status === 'completed' && c.overall_score);
    const failedCalls = calls.filter(c => c.status === 'failed');
    
    if (completedCalls.length > 0) {
      const scores = completedCalls.map(c => c.overall_score);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      
      // Atualizar com estatísticas reais
      const { error: updateError } = await supabase
        .from('evaluation_lists')
        .update({
          total_calls: calls.length,
          successful_analyses: completedCalls.length,
          failed_analyses: failedCalls.length,
          average_score: Math.round(averageScore * 100) / 100,
          highest_score: highestScore,
          lowest_score: lowestScore,
          updated_at: new Date()
        })
        .eq('id', evaluationListId);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar stats: ${updateError.message}`);
      }
      
      console.log(`✅ Estatísticas atualizadas para evaluation_list: ${evaluationListId}`);
    }
    
  } catch (error) {
    console.error(`❌ Erro ao atualizar estatísticas:`, error);
  }
}

// ====================================================================
// ENDPOINT PARA TESTE
// ====================================================================

router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    
    // Testar conexão com Supabase
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, display_id')
      .limit(5);
    
    if (companiesError) {
      throw new Error(`Erro na conexão com companies: ${companiesError.message}`);
    }
    
    // Testar estrutura da tabela evaluation_lists
    const { data: evaluationLists, error: evalError } = await supabase
      .from('evaluation_lists')
      .select('id, name, batch_id, status')
      .limit(5);
    
    if (evalError) {
      console.warn(`⚠️ Erro ao acessar evaluation_lists: ${evalError.message}`);
    }
    
    // Testar estrutura da tabela calls
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('id, file_name, batch_id, status')
      .limit(5);
    
    if (callsError) {
      console.warn(`⚠️ Erro ao acessar calls: ${callsError.message}`);
    }
    
    // Testar inserção de dados de exemplo
    const testBatchId = `test_${Date.now()}`;
    const testCompanyId = companies[0]?.id;
    
    if (testCompanyId) {
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('evaluation_lists')
          .insert({
            company_id: testCompanyId,
            name: 'Teste de Conexão',
            description: 'Teste automático do sistema',
            batch_id: testBatchId,
            status: 'test',
            files_count: 1,
            created_at: new Date()
          });
        
        if (insertError) {
          console.warn(`⚠️ Erro ao inserir teste: ${insertError.message}`);
        } else {
          console.log('✅ Inserção de teste bem-sucedida');
          
          // Limpar dados de teste
          await supabase
            .from('evaluation_lists')
            .delete()
            .eq('batch_id', testBatchId);
        }
      } catch (testError) {
        console.warn(`⚠️ Erro no teste de inserção: ${testError.message}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Webhook storage funcionando!',
      companies: companies,
      evaluation_lists_count: evaluationLists?.length || 0,
      calls_count: calls?.length || 0,
      test_company_id: testCompanyId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ====================================================================
// ENDPOINT PARA BUSCAR DADOS
// ====================================================================

router.get('/evaluation-lists/:companyDisplayId', async (req, res) => {
  try {
    const { companyDisplayId } = req.params;
    
    // Buscar company_id real
    const realCompanyId = await getRealCompanyId(parseInt(companyDisplayId));
    if (!realCompanyId) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    // Buscar evaluation_lists da empresa
    const { data: evaluationLists, error } = await supabase
      .from('evaluation_lists')
      .select(`
        *,
        calls:calls(count)
      `)
      .eq('company_id', realCompanyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Erro ao buscar listas: ${error.message}`);
    }
    
    res.json({
      success: true,
      evaluation_lists: evaluationLists,
      company_display_id: companyDisplayId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 