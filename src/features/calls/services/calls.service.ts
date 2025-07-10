import { supabase } from '@/lib/supabase';
import type { 
  Call, 
  CallFilters, 
  CallListResponse, 
  CallUpload,
  BatchAnalysisJob 
} from '../types/call.types';

export class CallsService {
  // Buscar ligações com filtros e paginação
  async getCalls(
    companyId: string, 
    filters: CallFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<CallListResponse> {
    try {
      let query = supabase
        .from('calls')
        .select(`
          *,
          analysis:call_analysis(*)
        `, { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`filename.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.phone_number) {
        query = query.eq('phone_number', filters.phone_number);
      }

      if (filters.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }

      // Paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao buscar ligações: ${error.message}`);
      }

      const calls: Call[] = (data || []).map(row => ({
        ...row,
        analysis: row.analysis?.[0] || undefined
      }));

      // Filtrar por score se especificado
      let filteredCalls = calls;
      if (filters.minScore !== undefined || filters.maxScore !== undefined) {
        filteredCalls = calls.filter(call => {
          const score = call.analysis?.overall_score;
          if (score === undefined) return false;
          
          if (filters.minScore !== undefined && score < filters.minScore) return false;
          if (filters.maxScore !== undefined && score > filters.maxScore) return false;
          
          return true;
        });
      }

      return {
        calls: filteredCalls,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      };
    } catch (error) {
      console.error('Erro no serviço getCalls:', error);
      throw error;
    }
  }

  // Buscar detalhes de uma ligação específica
  async getCallById(callId: string, companyId: string): Promise<Call | null> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          analysis:call_analysis(*)
        `)
        .eq('id', callId)
        .eq('company_id', companyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        throw new Error(`Erro ao buscar ligação: ${error.message}`);
      }

      return {
        ...data,
        analysis: data.analysis?.[0] || undefined
      };
    } catch (error) {
      console.error('Erro no serviço getCallById:', error);
      throw error;
    }
  }

  // Upload de arquivo de áudio
  async uploadAudio(file: File, callId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${callId}.${fileExt}`;
      const filePath = `calls/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload de áudio:', error);
      throw error;
    }
  }

  // Criar nova ligação
  async createCall(
    companyId: string, 
    callData: Omit<Call, 'id' | 'created_at' | 'updated_at' | 'company_id'>
  ): Promise<Call> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          ...callData,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar ligação: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço createCall:', error);
      throw error;
    }
  }

  // Atualizar ligação
  async updateCall(
    callId: string, 
    companyId: string, 
    updates: Partial<Call>
  ): Promise<Call> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', callId)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar ligação: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço updateCall:', error);
      throw error;
    }
  }

  // Deletar ligação
  async deleteCall(callId: string, companyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId)
        .eq('company_id', companyId);

      if (error) {
        throw new Error(`Erro ao deletar ligação: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço deleteCall:', error);
      throw error;
    }
  }

  // Iniciar análise em lote
  async startBatchAnalysis(
    uploads: CallUpload[],
    criteriaId: string,
    companyId: string,
    webhookUrl?: string
  ): Promise<BatchAnalysisJob> {
    try {
      // Aqui você integraria com sua API de análise em lote
      // Por enquanto, vou simular a criação de um job
      const jobId = `batch_${Date.now()}`;
      
      // Implementar lógica real de acordo com sua API
      const job: BatchAnalysisJob = {
        id: jobId,
        status: 'pending',
        total_calls: uploads.length,
        processed_calls: 0,
        failed_calls: 0,
        progress: 0,
        created_at: new Date().toISOString(),
        webhook_url: webhookUrl,
        criteria_id: criteriaId,
        company_id: companyId,
      };

      return job;
    } catch (error) {
      console.error('Erro no serviço startBatchAnalysis:', error);
      throw error;
    }
  }

  // Buscar estatísticas das ligações
  async getCallsStats(companyId: string, dateFrom?: string, dateTo?: string) {
    try {
      let query = supabase
        .from('calls')
        .select(`
          status,
          analysis:call_analysis(overall_score)
        `)
        .eq('company_id', companyId);

      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats = {
        total: data?.length || 0,
        completed: data?.filter(call => call.status === 'completed').length || 0,
        processing: data?.filter(call => call.status === 'processing').length || 0,
        failed: data?.filter(call => call.status === 'failed').length || 0,
        pending: data?.filter(call => call.status === 'pending').length || 0,
        averageScore: 0,
        scoreDistribution: {
          excellent: 0, // 8.5+
          good: 0,      // 7.0-8.4
          average: 0,   // 5.0-6.9
          poor: 0,      // <5.0
        }
      };

      // Calcular estatísticas de score
      const scoresWithAnalysis = data?.filter(call => call.analysis?.[0]?.overall_score) || [];
      const scores = scoresWithAnalysis.map(call => call.analysis[0].overall_score);

      if (scores.length > 0) {
        stats.averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        scores.forEach(score => {
          if (score >= 8.5) stats.scoreDistribution.excellent++;
          else if (score >= 7.0) stats.scoreDistribution.good++;
          else if (score >= 5.0) stats.scoreDistribution.average++;
          else stats.scoreDistribution.poor++;
        });
      }

      return stats;
    } catch (error) {
      console.error('Erro no serviço getCallsStats:', error);
      throw error;
    }
  }
}

// Instância única do serviço de calls
export const callsService = new CallsService();

 
 