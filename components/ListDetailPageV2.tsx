import React, { useState, useEffect } from 'react';
import { AgentSidebarModal } from './AgentSidebarModal';
import { CallDetailModal } from './CallDetailModal';
import { CallsSidebarModal } from './CallsSidebarModal';
import { CriteriaChart } from './CriteriaChart';
import { ThumbsUp, AlertTriangle, Search, Calendar, ChevronLeft, Users, Phone, BarChart3, RefreshCw } from 'lucide-react';
import { StatusBarTooltip } from './StatusBarTooltip';
import { calculateCriteriaScores } from '../src/lib/calculations';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface ListDetailPageProps {
  listId: string | null;
  onBack: () => void;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  total_calls: number;
  average_score: number;
  calls?: Call[];
  hasAttention?: boolean;
  performance?: {
    good: number;
    neutral: number;
    bad: number;
  };
  totalFeedbacks: number;
  average: string;
}

interface Call {
  id: string;
  file_name: string;
  overall_score: number;
  created_at: string;
  call_type: string;
  status: string;
  transcription_text: string;
  transcription_is_real: boolean;
  agent_name: string;
  client_name: string;
  sentiment: string;
  call_outcome: string;
  batch_id: string;
  // Campos antigos para compatibilidade
  phone_number?: string;
  duration_seconds?: number;
  call_date?: string;
  score?: number;
}

interface ListData {
  id: string;
  name: string;
  description: string;
  total_calls: number;
  average_score: number;
  batch_id: string;
  files_count: number;
  successful_analyses: number;
  failed_analyses: number;
  status: string;
  started_at: string;
  completed_at: string;
  created_at: string;
  calls: Call[];
  // Campos antigos para compatibilidade
  date_range_start?: string;
  date_range_end?: string;
  agents?: Agent[];
}

export function ListDetailPageV2({ listId, onBack }: ListDetailPageProps) {
  const { companyId } = useAuth();
  const [listData, setListData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [showCallsSidebar, setShowCallsSidebar] = useState(false);

  useEffect(() => {
    if (listId && companyId) {
      fetchListData();
    }
  }, [listId, companyId]);

  const fetchListData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Carregando dados da lista:', listId);

      // Buscar dados da lista (API v2.0)
      const { data: listInfo, error: listError } = await supabase
        .from('evaluation_lists')
        .select('*')
        .eq('id', listId)
        .eq('company_id', companyId)
        .single();

      if (listError) {
        console.error('❌ Erro ao buscar lista:', listError);
        setError(`Erro ao carregar lista: ${listError.message}`);
        return;
      }

      if (!listInfo) {
        setError('Lista não encontrada');
        return;
      }

      console.log('✅ Lista encontrada:', listInfo);

            // Na v2.0, sempre buscar chamadas diretamente
      console.log('🚀 Lista v2.0 detectada, buscando chamadas...');
      
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('evaluation_list_id', listId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (callsError) {
        console.error('❌ Erro ao buscar chamadas:', callsError);
        setError(`Erro ao carregar chamadas: ${callsError.message}`);
        return;
      }

      const calls = callsData || [];
      console.log(`✅ ${calls.length} chamadas encontradas`);

      // Adaptar campos para compatibilidade
      const adaptedCalls = calls.map(call => ({
        ...call,
        score: call.overall_score || 0,
        call_date: call.created_at,
        phone_number: call.client_phone || 'N/A'
      }));

             const completeListData: ListData = {
         ...listInfo,
         calls: adaptedCalls,
         // Manter compatibilidade com campos antigos
         date_range_start: listInfo.started_at || listInfo.created_at,
         date_range_end: listInfo.completed_at || listInfo.created_at,
         agents: [] // Array vazio para compatibilidade
       };

       setListData(completeListData);
       console.log('✅ Dados da lista v2.0 carregados:', completeListData);

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar lista:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleAgentModalClose = () => {
    setSelectedAgentId(null);
    setSelectedCallId(null);
  };

  const handleCallClick = (callId: string) => {
    setSelectedCallId(callId);
  };

  const handleCallModalClose = () => {
    setSelectedCallId(null);
  };

  const handleCallsSidebarOpen = () => {
    setShowCallsSidebar(true);
  };

  const handleCallsSidebarClose = () => {
    setShowCallsSidebar(false);
  };

  const handleRetry = () => {
    fetchListData();
  };

  // Calculate criteria scores for the list
  const criteriaScores = React.useMemo(() => {
    if (listData?.calls && listData.calls.length > 0) {
      // Adaptar calls para o formato esperado pelo calculateCriteriaScores
      const adaptedCalls = listData.calls.map(call => ({
        id: call.id,
        score: call.overall_score || call.score || 0,
        duration: 300, // Valor padrão
        date: call.created_at || call.call_date || '',
        agentId: call.agent_name || '',
        hasIssues: (call.overall_score || call.score || 0) < 7
      }));
      return calculateCriteriaScores(adaptedCalls);
    }
    return [];
  }, [listData?.calls]);

  // Calculate performance stats
  const performanceStats = React.useMemo(() => {
    if (!listData?.calls) return null;

    const totalCalls = listData.calls.length;
    
    if (totalCalls === 0) return null;

    const goodCalls = listData.calls.filter(call => (call.overall_score || call.score || 0) >= 8).length;
    const neutralCalls = listData.calls.filter(call => {
      const score = call.overall_score || call.score || 0;
      return score >= 6 && score < 8;
    }).length;
    const badCalls = listData.calls.filter(call => (call.overall_score || call.score || 0) < 6).length;

    return {
      good: {
        percentage: Math.round((goodCalls / totalCalls) * 100),
        feedbacks: goodCalls
      },
      neutral: {
        percentage: Math.round((neutralCalls / totalCalls) * 100),
        feedbacks: neutralCalls
      },
      bad: {
        percentage: Math.round((badCalls / totalCalls) * 100),
        feedbacks: badCalls
      }
    };
  }, [listData?.calls]);

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) {
      return 'Período não definido';
    }
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `A partir de ${formatDate(startDate)}`;
    } else {
      return `Até ${formatDate(endDate!)}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ChevronLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div>
            <div className="text-[#677c92] text-xs uppercase tracking-wide">Avaliações</div>
            <h1 className="text-[#373753] text-2xl font-semibold tracking-tight">Carregando...</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando dados da lista...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (mas ainda mostra dados se tiver)
  if (error && !listData) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ChevronLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div>
            <div className="text-[#677c92] text-xs uppercase tracking-wide">Avaliações</div>
            <h1 className="text-[#373753] text-2xl font-semibold tracking-tight">Erro</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-lg">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-[#dc2f1c]" />
            </div>
            <h2 className="text-lg font-medium text-[#373753] mb-2">
              Erro ao carregar lista
            </h2>
            <p className="text-[#677c92] text-sm mb-4">
              {error}
            </p>
            {error.includes('tabela agents') && (
              <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-4 mb-4 text-left">
                <h3 className="font-medium text-[#b86309] mb-2">Correção necessária:</h3>
                <p className="text-[#b86309] text-sm">
                  Execute o script <code className="bg-white px-1 rounded">supabase-fix-agents-table-structure.sql</code> no Supabase SQL Editor para corrigir a estrutura das tabelas.
                </p>
              </div>
            )}
            <div className="space-x-2">
              <button
                onClick={handleRetry}
                className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Tentar Novamente
              </button>
              <button
                onClick={onBack}
                className="bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state ou dados básicos  
  if (!listData || !listData.calls || listData.calls.length === 0) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4 text-[#373753]" />
            </button>
            <div>
              <div className="text-[#677c92] text-xs uppercase tracking-wide">Avaliações</div>
              <h1 className="text-[#373753] text-2xl font-semibold tracking-tight">
                {listData?.name || 'Lista de Avaliação'}
              </h1>
            </div>
          </div>
          {listData && (
            <div className="bg-white border border-[#e1e9f4] rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-[#677c92] text-base">
                <Calendar className="h-4 w-4" />
                <span>{formatDateRange(listData.date_range_start ?? null, listData.date_range_end ?? null)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mostrar erro se houver, mas continuar */}
        {error && (
          <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#b86309] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-[#b86309] mb-1">Aviso:</h3>
                <p className="text-[#b86309] text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-[#677c92]" />
            </div>
            <h2 className="text-lg font-medium text-[#373753] mb-2">
              Lista sem chamadas
            </h2>
            <p className="text-[#677c92] text-sm mb-4">
              Esta lista ainda não possui chamadas ou os dados não puderam ser carregados.
              {listData && (
                <span> Estatísticas da lista: {listData.total_calls || listData.files_count || 0} chamadas, média {listData.average_score?.toFixed(1) || '0.0'}/10.</span>
              )}
            </p>
            <div className="space-x-2">
              <button
                onClick={handleRetry}
                className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Recarregar
              </button>
              <button
                onClick={onBack}
                className="bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const callsInAttention = listData.calls?.filter(call => (call.overall_score || call.score || 0) < 6).length || 0;

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ChevronLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div>
            <div className="text-[#677c92] text-xs uppercase tracking-wide">Avaliações</div>
            <h1 className="text-[#373753] text-2xl font-semibold tracking-tight">{listData.name}</h1>
            {listData.description && (
              <p className="text-[#677c92] text-sm mt-1">{listData.description}</p>
            )}
          </div>
        </div>
        <div className="bg-white border border-[#e1e9f4] rounded-xl px-4 py-2.5 shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="flex items-center gap-2 text-[#677c92] text-base w-52">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange(listData.date_range_start ?? null, listData.date_range_end ?? null)}</span>
          </div>
        </div>
      </div>

      {/* Aviso se houver erro mas dados foram carregados */}
      {error && listData.calls && listData.calls.length > 0 && (
        <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[#b86309] text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Alguns dados podem estar inconsistentes: {error}</span>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Column */}
        <div className="w-[648px] space-y-6">
          {/* KPIs */}
          <div className="flex gap-6">
            <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#c9f2cd] rounded-lg flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-[#015901]" />
                </div>
                <div>
                  <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                    Média da lista
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#008a35] text-xl leading-8 font-medium">
                      {listData.average_score?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-[#677c92] text-base leading-6">/10</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#fff6bf] rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-[#b86309]" />
                  </div>
                  <div>
                    <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                      Ligações baixo score
                    </div>
                    <div className="text-[#373753] text-xl leading-8 font-medium">{callsInAttention}</div>
                  </div>
              </div>
            </div>
          </div>

          {/* General Performance */}
          <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
            <div className="border-b border-[#e1e9f4] px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[#373753] text-lg font-medium tracking-tight">Geral</div>
                <div className="text-[#373753] text-lg">
                  <span className="text-[#677c92] text-xs uppercase">Total</span>
                  <span className="ml-2 font-medium tracking-tight">{listData.total_calls}</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {performanceStats ? (
                <>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-[#677c92] text-xs uppercase mb-1">Bom</div>
                      <div className="text-[#006c17] text-xl font-medium tracking-tight">
                        {performanceStats.good.percentage}%
                      </div>
                      <div className="text-[#373753] text-sm">
                        {performanceStats.good.feedbacks} Feedbacks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#677c92] text-xs uppercase mb-1">Neutro</div>
                      <div className="text-[#dc9610] text-xl font-medium tracking-tight">
                        {performanceStats.neutral.percentage}%
                      </div>
                      <div className="text-[#373753] text-sm">
                        {performanceStats.neutral.feedbacks} Feedbacks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#677c92] text-xs uppercase mb-1">Ruim</div>
                      <div className="text-[#dc2f1c] text-xl font-medium tracking-tight">
                        {performanceStats.bad.percentage}%
                      </div>
                      <div className="text-[#373753] text-sm">
                        {performanceStats.bad.feedbacks} Feedbacks
                      </div>
                    </div>
                  </div>
                  <StatusBarTooltip
                    performance={{
                      good: performanceStats.good.percentage,
                      neutral: performanceStats.neutral.percentage,
                      bad: performanceStats.bad.percentage,
                      goodCount: performanceStats.good.feedbacks,
                      neutralCount: performanceStats.neutral.feedbacks,
                      badCount: performanceStats.bad.feedbacks
                    }}
                    totalCalls={listData.total_calls}
                  >
                    <div className="flex h-2 rounded-full overflow-hidden cursor-help">
                      <div 
                        className="bg-[#5cb868] rounded-l-full" 
                        style={{ width: `${performanceStats.good.percentage}%` }}
                      ></div>
                      <div 
                        className="bg-[#ffbd00]" 
                        style={{ width: `${performanceStats.neutral.percentage}%` }}
                      ></div>
                      <div 
                        className="bg-[#dc2f1c] rounded-r-full" 
                        style={{ width: `${performanceStats.bad.percentage}%` }}
                      ></div>
                    </div>
                  </StatusBarTooltip>
                </>
              ) : (
                <div className="text-center py-4 text-[#677c92]">
                  Nenhuma chamada encontrada para análise
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Criteria Chart */}
        <div className="flex-1">
          <CriteriaChart criteria={criteriaScores} />
        </div>
      </div>

      {/* Calls Summary Card - Botão para abrir modal lateral */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E1E9F4] rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#3057f2]" />
              </div>
              <div>
                <h3 className="text-[#373753] text-lg font-medium">Ligações do Lote</h3>
                <p className="text-[#677c92] text-sm">
                  {listData.calls?.length || 0} {(listData.calls?.length || 0) === 1 ? 'ligação processada' : 'ligações processadas'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#677c92] text-xs uppercase mb-1">Média do Lote</div>
              <div className="text-[#008a35] text-xl font-medium">
                {listData.average_score?.toFixed(1) || '0.0'}<span className="text-[#677c92] text-base">/10</span>
              </div>
            </div>
          </div>
          
          {listData.calls && listData.calls.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#c9f2cd] rounded-lg p-3">
                  <div className="text-[#006c17] text-lg font-medium">
                    {listData.calls.filter(call => (call.overall_score || call.score || 0) >= 8).length}
                  </div>
                  <div className="text-[#677c92] text-xs">Excelentes</div>
                </div>
                <div className="bg-[#fff6bf] rounded-lg p-3">
                  <div className="text-[#dc9610] text-lg font-medium">
                    {listData.calls.filter(call => {
                      const score = call.overall_score || call.score || 0;
                      return score >= 6 && score < 8;
                    }).length}
                  </div>
                  <div className="text-[#677c92] text-xs">Boas</div>
                </div>
                <div className="bg-[#fef2f2] rounded-lg p-3">
                  <div className="text-[#dc2f1c] text-lg font-medium">
                    {listData.calls.filter(call => (call.overall_score || call.score || 0) < 6).length}
                  </div>
                  <div className="text-[#677c92] text-xs">Atenção</div>
                </div>
              </div>
              
              <button
                onClick={handleCallsSidebarOpen}
                className="w-full bg-[#3057f2] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#2545d9] transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Ver Todas as Ligações
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-[#677c92]" />
              </div>
              <h3 className="text-lg font-medium text-[#373753] mb-2">
                Nenhuma ligação encontrada
              </h3>
              <p className="text-[#677c92] text-sm mb-4">
                Este lote ainda não possui ligações analisadas ou os dados não puderam ser carregados.
              </p>
              <button
                onClick={handleRetry}
                className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Recarregar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Agent Sidebar Modal */}
      {selectedAgentId && (
        <AgentSidebarModal
          agentId={selectedAgentId}
          onClose={handleAgentModalClose}
          onCallClick={handleCallClick}
        />
      )}

      {/* Calls Sidebar Modal */}
      {showCallsSidebar && listId && (
        <CallsSidebarModal
          listId={listId}
          listName={listData?.name || 'Lista de Avaliação'}
          onClose={handleCallsSidebarClose}
          onCallClick={handleCallClick}
        />
      )}

      {/* Call Detail Modal */}
      {selectedCallId && (
        <CallDetailModal
          callId={selectedCallId}
          onClose={handleCallModalClose}
        />
      )}
    </div>
  );
}
