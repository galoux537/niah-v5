import React, { useState, useEffect } from 'react';
import { StatusBarTooltip } from './StatusBarTooltip';
import { CriteriaChart } from './CriteriaChart';
import { ChevronLeft, ThumbsUp, Search, AlertTriangle, RefreshCw, Users, Phone } from 'lucide-react';
import { calculateCriteriaScores } from '../src/lib/calculations';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface AgentSidebarModalProps {
  agentId: string;
  onClose: () => void;
  onCallClick: (callId: string) => void;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  total_calls: number;
  average_score: number;
  manager?: string;
}

interface Call {
  id: string;
  phone_number: string;
  duration_seconds: number;
  call_date: string;
  call_type: string;
  status: string;
  score: number;
}

export function AgentSidebarModal({ agentId, onClose, onCallClick }: AgentSidebarModalProps) {
  const { companyId } = useAuth();
  const [agentData, setAgentData] = useState<Agent | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId && companyId) {
      fetchAgentData();
    }
  }, [agentId, companyId]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Carregando dados do agente:', agentId);

      // Buscar dados do agente
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('company_id', companyId)
        .single();

      if (agentError) {
        console.error('❌ Erro ao buscar agente:', agentError);
        setError(`Erro ao carregar agente: ${agentError.message}`);
        return;
      }

      if (!agent) {
        setError('Agente não encontrado');
        return;
      }

      setAgentData(agent);
      console.log('✅ Dados do agente carregados:', agent);

      // Buscar chamadas do agente
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('agent_id', agentId)
        .eq('company_id', companyId)
        .order('call_date', { ascending: false })
        .limit(50); // Limitar para performance

      if (callsError) {
        console.error('❌ Erro ao buscar chamadas:', callsError);
        // Não parar por erro nas chamadas, mostrar agente sem chamadas
        setCalls([]);
      } else {
        setCalls(callsData || []);
        console.log(`✅ ${callsData?.length || 0} chamadas carregadas`);
      }

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar agente:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Calcular performance do agente
  const performance = React.useMemo(() => {
    if (!calls || calls.length === 0) {
      return { good: 0, neutral: 0, bad: 0, goodCount: 0, neutralCount: 0, badCount: 0 };
    }

    const totalCalls = calls.length;
    const goodCalls = calls.filter(call => call.score >= 8).length;
    const neutralCalls = calls.filter(call => call.score >= 4 && call.score < 7).length;
    const badCalls = calls.filter(call => call.score < 6).length;

    return {
      good: Math.round((goodCalls / totalCalls) * 100),
      neutral: Math.round((neutralCalls / totalCalls) * 100),
      bad: Math.round((badCalls / totalCalls) * 100),
      goodCount: goodCalls,
      neutralCount: neutralCalls,
      badCount: badCalls
    };
  }, [calls]);

  // Calculate criteria scores for the agent
  const criteriaScores = React.useMemo(() => {
    if (calls && calls.length > 0) {
      return calculateCriteriaScores(calls);
    }
    return [];
  }, [calls]);

  // Formatar dados das chamadas para exibição
  const formattedCalls = React.useMemo(() => {
    return calls.map(call => {
      const score = call.score || 0;
      const scoreColor = score >= 7 ? 'text-[#059669]' : score >= 4 ? 'text-[#d97706]' : 'text-[#dc2626]';
      const hasAttention = score < 4;
      
      // Formatar duração
      const minutes = Math.floor((call.duration_seconds || 0) / 60);
      const seconds = (call.duration_seconds || 0) % 60;
      const duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Formatar data
      const callDate = new Date(call.call_date);
      const formattedDate = callDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        id: call.id,
        number: call.phone_number || 'Não informado',
        score: score.toFixed(1),
        scoreColor,
        duration: duration,
        date: formattedDate,
        hasAttention,
        type: call.call_type || 'inbound',
        status: call.status || 'completed'
      };
    });
  }, [calls]);

  const handleRetry = () => {
    fetchAgentData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-[700px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-[700px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
            >
              <ChevronLeft className="h-4 w-4 text-[#373753]" />
            </button>
            <div className="text-[#373753] text-base">Voltar</div>
          </div>
          
          {/* Error Message */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-[#dc2f1c]" />
              </div>
              <h2 className="text-lg font-medium text-[#373753] mb-2">
                Erro ao carregar agente
              </h2>
              <p className="text-[#677c92] text-sm mb-4">
                {error}
              </p>
              <div className="space-x-2">
                <button
                  onClick={handleRetry}
                  className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Tentar Novamente
                </button>
                <button
                  onClick={onClose}
                  className="bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Não deveria acontecer, mas por segurança
  if (!agentData) {
    return null;
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[700px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ChevronLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div className="text-[#373753] text-base">Voltar</div>
        </div>

        {/* Agent Info and Metrics */}
        <div className="flex gap-6 mb-6">
          {/* Agent Info */}
          <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-6">
            <div>
              <div className="text-[#677c92] text-xs uppercase tracking-wide mb-1">Agente</div>
              <div className="text-[#373753] text-xl font-medium tracking-tight">{agentData.name}</div>
              <div className="text-[#677c92] text-sm mt-1">
                {agentData.department && (
                  <span>{agentData.department} • </span>
                )}
                <span>{agentData.email}</span>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#c9f2cd] rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-[#015901]" />
              </div>
              <div>
                <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                  Média
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#008a35] text-xl leading-8 font-medium">
                    {agentData.average_score?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-[#677c92] text-base leading-6">/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] mb-6">
          <div className="border-b border-[#e1e9f4] px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-[#373753] text-lg font-medium tracking-tight">Geral</div>
              <div className="text-[#373753] text-lg">
                <span className="text-[#677c92] text-xs uppercase">Total</span>
                <span className="ml-2 font-medium tracking-tight">{calls.length}</span>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {calls.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <div className="w-[188px]">
                    <div className="text-[#677c92] text-xs uppercase mb-1">Bom</div>
                    <div className="text-[#006c17] text-xl font-medium tracking-tight">{performance.good}%</div>
                    <div className="text-[#373753] text-sm">{performance.goodCount} Feedbacks</div>
                  </div>
                  <div className="w-[188px] text-center">
                    <div className="text-[#677c92] text-xs uppercase mb-1">Neutro</div>
                    <div className="text-[#dc9610] text-xl font-medium tracking-tight">{performance.neutral}%</div>
                    <div className="text-[#373753] text-sm">{performance.neutralCount} Feedbacks</div>
                  </div>
                  <div className="w-[188px] text-right">
                    <div className="text-[#677c92] text-xs uppercase mb-1">Ruim</div>
                    <div className="text-[#dc2f1c] text-xl font-medium tracking-tight">{performance.bad}%</div>
                    <div className="text-[#373753] text-sm">{performance.badCount} Feedbacks</div>
                  </div>
                </div>
                
                {/* Status bar with tooltip */}
                <StatusBarTooltip 
                  performance={{
                    good: performance.good,
                    neutral: performance.neutral,
                    bad: performance.bad,
                    goodCount: performance.goodCount,
                    neutralCount: performance.neutralCount,
                    badCount: performance.badCount
                  }}
                  totalCalls={calls.length}
                >
                  <div className="flex h-2 rounded-full overflow-hidden cursor-help">
                    <div 
                      className="bg-[#5cb868] rounded-l-full" 
                      style={{ width: `${performance.good}%` }}
                    ></div>
                    <div 
                      className="bg-[#ffbd00]" 
                      style={{ width: `${performance.neutral}%` }}
                    ></div>
                    <div 
                      className="bg-[#dc2f1c] rounded-r-full" 
                      style={{ width: `${performance.bad}%` }}
                    ></div>
                  </div>
                </StatusBarTooltip>
              </>
            ) : (
              <div className="text-center py-4 text-[#677c92]">
                <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-6 w-6 text-[#677c92]" />
                </div>
                <p>Nenhuma chamada encontrada para este agente</p>
              </div>
            )}
          </div>
        </div>

        {/* Criteria Chart */}
        <div className="mb-6">
          <CriteriaChart criteria={criteriaScores} />
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#677c92] text-base">
              <Search className="h-4 w-4" />
              <span>Pesquisar Ligação</span>
              <span className="text-xs bg-[#f0f4fa] px-2 py-1 rounded">
                {calls.length} {calls.length === 1 ? 'chamada' : 'chamadas'}
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="text-[#677c92] hover:text-[#373753] p-1"
              title="Recarregar chamadas"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-[#f0f4fa] px-6 py-3">
            <div className="flex items-center justify-between text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-[242px]">Número</div>
              <div className="w-[51px]">Nota</div>
              <div className="w-[137px] text-center">Duração da ligação</div>
              <div className="w-[184px]">Data</div>
            </div>
          </div>

          <div>
            {formattedCalls.length > 0 ? (
              formattedCalls.map((call) => (
                <div 
                  key={call.id} 
                  className="border-b border-[#e1e9f4] px-6 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onCallClick(call.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-[242px] flex items-center gap-2">
                      <span className="text-[#677c92] text-base">{call.number}</span>
                      {call.hasAttention && (
                        <AlertTriangle className="h-4 w-4 text-[#e67c0b]" />
                      )}
                    </div>
                    <div className="w-[51px]">
                      <span className={`text-base font-medium ${call.scoreColor}`}>{call.score}</span>
                      <span className="text-[#677c92] text-base">/10</span>
                    </div>
                    <div className="w-[137px] text-center text-[#677c92] text-base">{call.duration}</div>
                    <div className="w-[184px] text-[#677c92] text-base">{call.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-[#677c92]" />
                </div>
                <h3 className="text-[#373753] font-medium mb-2">Nenhuma chamada encontrada</h3>
                <p className="text-[#677c92] text-sm">
                  Este agente ainda não possui chamadas registradas ou os dados não puderam ser carregados.
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-4 bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Recarregar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
