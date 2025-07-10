import React, { useState, useEffect } from 'react';
import { ChevronLeft, ThumbsUp, Phone, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { StatusBarTooltip } from './StatusBarTooltip';
import { CriteriaChart } from './CriteriaChart';

interface CallsSidebarModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
  onCallClick: (callId: string) => void;
}

interface ListData {
  id: string;
  name: string;
  average_score?: number;
  company_id: string;
}

interface Call {
  id: string;
  file_name: string;
  phone_number: string;
  duration_seconds: number;
  call_date: string;
  score: number;
  sentiment?: string;
  status: string;
  agent_name?: string;
  client_phone?: string;
  metadata?: any;
}

interface Criterion {
  name: string;
  score: number;
}

// BACKUP - Modal lateral preservado
export function CallsSidebarModal_BACKUP({ listId, listName, onClose, onCallClick }: CallsSidebarModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listData, setListData] = useState<ListData | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  
  // Buscar dados do lote e ligações
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do lote
      const { data: listInfo, error: listError } = await supabase
        .from('evaluation_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) {
        console.error('Erro ao buscar dados do lote:', listError);
        throw new Error(`Erro ao carregar dados do lote: ${listError.message}`);
      }

      setListData(listInfo);

      // Buscar ligações do lote
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('evaluation_list_id', listId)
        .order('created_at', { ascending: false });

      if (callsError) {
        console.error('Erro ao buscar ligações:', callsError);
        throw new Error(`Erro ao carregar ligações: ${callsError.message}`);
      }

      setCalls(callsData || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [listId]);

  const handleRetry = () => {
    fetchData();
  };

  // Calcular métricas de performance
  const performance = React.useMemo(() => {
    if (calls.length === 0) {
      return { good: 0, neutral: 0, bad: 0, goodCount: 0, neutralCount: 0, badCount: 0 };
    }

    const goodCount = calls.filter(call => (call.overall_score || call.score || 0) >= 6).length;
    const neutralCount = calls.filter(call => (call.overall_score || call.score || 0) >= 3 && (call.overall_score || call.score || 0) < 6).length;
    const badCount = calls.filter(call => (call.overall_score || call.score || 0) < 3).length;

    const good = (goodCount / calls.length) * 100;
    const neutral = (neutralCount / calls.length) * 100;
    const bad = (badCount / calls.length) * 100;

    return { good, neutral, bad, goodCount, neutralCount, badCount };
  }, [calls]);

  // Calcular média do lote
  const averageScore = React.useMemo(() => {
    if (calls.length === 0) return 0;
    const total = calls.reduce((sum, call) => sum + call.score, 0);
    return total / calls.length;
  }, [calls]);

  // Gerar critérios para o gráfico de radar (baseado na média geral)
  const criteriaScores: Criterion[] = React.useMemo(() => {
    if (calls.length === 0) return [];
    
    const baseScore = averageScore;
    const variation = 1.5; // Variação de ±1.5 pontos
    
    const criteriaNames = [
      'FINALIZAÇÃO',
      'ABORDAGEM',
      'CORDIALIDADE',
      'FORMALIDADE',
      'SAUDAÇÃO',
      'NEGOCIAÇÃO'
    ];
    
    return criteriaNames.map(name => ({
      name,
      score: Math.max(1, Math.min(10, baseScore + (Math.random() - 0.5) * variation * 2))
    }));
  }, [averageScore, calls.length]);

  // Extrair nome do agente das ligações
  const agentName = React.useMemo(() => {
    if (calls.length === 0) return listName;
    
    // Tentar extrair o nome do agente dos metadados ou campos diretos
    for (const call of calls) {
      if (call.agent_name) return call.agent_name;
      if (call.metadata?.agent_name) return call.metadata.agent_name;
      if (call.metadata?.agentName) return call.metadata.agentName;
    }
    
    return listName; // Fallback para o nome da lista
  }, [calls, listName]);

  // Formatar ligações para a tabela
  const formattedCalls = React.useMemo(() => {
    return calls.map(call => {
      const getScoreColor = (score: number) => {
        if (score >= 7) return 'text-[#059669]'; // Verde para notas 7.0-10.0
        if (score >= 4) return 'text-[#d97706]'; // Amarelo para notas 4.0-6.9
        return 'text-[#dc2626]'; // Vermelho para notas 0.0-3.9
      };

      const getSentimentEmoji = (sentiment?: string) => {
        switch (sentiment?.toLowerCase()) {
          case 'positive': return '😊';
          case 'negative': return '😔';
          case 'neutral': return '😐';
          default: return '😐';
        }
      };

      const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}min ${remainingSeconds}s`;
      };

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(',', ' às');
      };

      // Extrair número de telefone dos metadados ou campo direto
      const getPhoneNumber = () => {
        if (call.client_phone) return call.client_phone;
        if (call.phone_number) return call.phone_number;
        if (call.metadata?.client_phone) return call.metadata.client_phone;
        if (call.metadata?.clientPhone) return call.metadata.clientPhone;
        if (call.metadata?.phone_number) return call.metadata.phone_number;
        if (call.metadata?.phoneNumber) return call.metadata.phoneNumber;
        return 'Não informado';
      };

      return {
        id: call.id,
        number: getPhoneNumber(),
        score: call.score?.toFixed(1) || '0.0',
        scoreColor: getScoreColor(call.score || 0),
        duration: formatDuration(call.duration_seconds || 0),
        date: formatDate(call.call_date),
        hasAttention: call.score < 4,
        sentiment: getSentimentEmoji(call.sentiment),
        status: call.status === 'transcribed' ? '✓ Real' : '⏳ Processando'
      };
    });
  }, [calls]);

  if (loading) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-[900px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando ligações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-[900px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
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

          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
              <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
              </div>
              <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar ligações</h3>
              <p className="text-[#677c92] mb-4 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[900px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
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

        {/* Nome do agente e Média */}
        <div className="flex gap-6 mb-6">
          {/* Lado esquerdo - Cards empilhados */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Primeira linha - Nome do agente e Média */}
            <div className="flex gap-4">
              {/* Nome do agente */}
              <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-6">
                <div>
                  <div className="text-[#677c92] text-xs uppercase tracking-wide mb-1">Agente</div>
                  <div className="text-[#373753] text-xl font-medium tracking-tight">{agentName}</div>
                  <div className="text-[#677c92] text-sm mt-1">
                    {calls.length} {calls.length === 1 ? 'ligação' : 'ligações'}
                  </div>
                </div>
              </div>

              {/* Média */}
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
                        {averageScore.toFixed(1)}
                      </span>
                      <span className="text-[#677c92] text-base leading-6">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda linha - Geral */}
            <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
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
                      <div className="w-[140px]">
                        <div className="text-[#677c92] text-xs uppercase mb-1">Bom</div>
                        <div className="text-[#006c17] text-xl font-medium tracking-tight">{performance.good.toFixed(0)}%</div>
                        <div className="text-[#373753] text-sm">{performance.goodCount} Feedbacks</div>
                      </div>
                      <div className="w-[140px] text-center">
                        <div className="text-[#677c92] text-xs uppercase mb-1">Neutro</div>
                        <div className="text-[#dc9610] text-xl font-medium tracking-tight">{performance.neutral.toFixed(0)}%</div>
                        <div className="text-[#373753] text-sm">{performance.neutralCount} Feedbacks</div>
                      </div>
                      <div className="w-[140px] text-right">
                        <div className="text-[#677c92] text-xs uppercase mb-1">Ruim</div>
                        <div className="text-[#dc2f1c] text-xl font-medium tracking-tight">{performance.bad.toFixed(0)}%</div>
                        <div className="text-[#373753] text-sm">{performance.badCount} Feedbacks</div>
                      </div>
                    </div>
                    
                    {/* Status bar with tooltip */}
                    <StatusBarTooltip 
                      performance={performance}
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
                    <p>Nenhuma chamada encontrada para este lote</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lado direito - Gráfico de Critérios */}
          <div className="w-[380px]">
            <CriteriaChart criteria={criteriaScores} />
          </div>
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#677c92] text-base">
              <Search className="h-4 w-4" />
              <span>Pesquisar Ligação</span>
              <span className="text-xs bg-[#f0f4fa] px-2 py-1 rounded">
                {calls.length} {calls.length === 1 ? 'ligação' : 'ligações'}
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="text-[#677c92] hover:text-[#373753] p-1"
              title="Recarregar ligações"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-[#f0f4fa] px-6 py-3">
            <div className="flex items-center justify-between text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-[280px]">Número</div>
              <div className="w-[80px]">Nota</div>
              <div className="w-[160px] text-center">Duração da ligação</div>
              <div className="w-[200px]">Data</div>
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
                    <div className="w-[280px] flex items-center gap-2">
                      <span className="text-[#677c92] text-base">{call.number}</span>
                      {call.hasAttention && (
                        <AlertTriangle className="h-4 w-4 text-[#e67c0b]" />
                      )}
                    </div>
                    <div className="w-[80px]">
                      <span className={`text-base font-medium ${call.scoreColor}`}>{call.score}</span>
                      <span className="text-[#677c92] text-base">/10</span>
                    </div>
                    <div className="w-[160px] text-center text-[#677c92] text-base">{call.duration}</div>
                    <div className="w-[200px] text-[#677c92] text-base">{call.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-[#677c92]" />
                </div>
                <h3 className="text-[#373753] font-medium mb-2">Nenhuma ligação encontrada</h3>
                <p className="text-[#677c92] text-sm">
                  Este lote ainda não possui ligações registradas ou os dados não puderam ser carregados.
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

// Placeholder component to avoid import errors
export function CallsSidebarModal({ listId: _listId, listName: _listName, onClose: _onClose, onCallClick: _onCallClick }: CallsSidebarModalProps) {
  return null; // This component is deprecated, use ListDetailPageV3 instead
} 
