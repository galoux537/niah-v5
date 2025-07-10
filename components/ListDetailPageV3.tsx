import React, { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, Phone, AlertTriangle, RefreshCw, Search, Pencil, XCircle, Download } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { StatusBarTooltip } from './StatusBarTooltip';
import { CriteriaChart } from './CriteriaChart';
import { CallDetailModal } from './CallDetailModal';

interface ListDetailPageV3Props {
  listId: string;
  listName: string;
  onBack: () => void;
}

interface ListData {
  id: string;
  name: string;
  average_score?: number;
  company_id: string;
  sub_criteria?: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    avg_score?: number;
  }>;
}

interface Call {
  id: string;
  file_name: string;
  phone_number: string;
  call_type?: string;
  duration_seconds: number;
  file_duration?: number;
  transcription_duration?: number;
  call_date: string;
  score: number;
  overall_score?: number;
  analysis_score?: number;
  final_score?: number;
  sentiment?: string;
  status: string;
  error_message?: string;
  agent_name?: string;
  client_phone?: string;
  metadata?: any;
  created_at?: string;
  error_code?: string;
  error_type?: string;
  error_details?: string;
  transcription_text?: string;
  call_outcome?: string;
  audio_size?: number;
}

interface Criterion {
  name: string;
  score: number;
}

// Função utilitária para traduzir códigos de erro para português (hoisting garantido)
function getErrorTextPt(code: string): string {
  const map: Record<string, string> = {
    'AUDIO_TOO_SHORT': 'Áudio muito curto para avaliação',
    'AUDIO_MUTE': 'Áudio mudo',
    'FILE_TOO_LARGE': 'Áudio muito grande',
    'EMPTY_FILE': 'Áudio vazio',
    'INVALID_FORMAT': 'Formato inválido',
    'MISSING_FILE': 'Arquivo ausente',
    'processing_error': 'Erro de processamento'
  };
  if (map[code]) return map[code];
  if (code && typeof code === 'string') {
    // Converte snake_case para frase legível
    const formatted = code
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted;
  }
  const lower = code.toLowerCase();
  if (lower.includes('15 segundos')) {
    return 'Duração do áudio menor que 15 segundos';
  }
  if (lower.includes('não foi enviado')) {
    return 'Arquivo de áudio não enviado';
  }
  return 'Erro';
}

export function ListDetailPageV3({ listId, listName, onBack }: ListDetailPageV3Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listData, setListData] = useState<ListData | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});
  const stripPrefix = (name: string) => name.replace(/^Análise\s+/i, '').trim();
  const [currentName, setCurrentName] = React.useState(stripPrefix(listName));
  const [isEditingName, setIsEditingName] = React.useState(false);
  
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
      
      // Carregar durações reais dos áudios
      if (callsData && callsData.length > 0) {
        loadAudioDurations(callsData);
      }
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

  const loadAudioDurations = async (callsData: Call[]) => {
    const durations: Record<string, number> = {};
    
    for (const call of callsData) {
      try {
        // Buscar informações do áudio via função SQL
        const { data, error } = await supabase
          .rpc('get_call_audio_info', { call_id_param: call.id });
        
        if (error || !data || data.length === 0) {
          console.log(`⚠️ Áudio não encontrado para call ${call.id}`);
          durations[call.id] = 0;
          continue;
        }
        
        const audioInfo = data[0];
        
        if (audioInfo.has_audio && audioInfo.public_url) {
          // Criar elemento de áudio temporário para obter duração real
          const audio = new Audio();
          
          const duration = await new Promise<number>((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              resolve(audio.duration || 0);
            });
            
            audio.addEventListener('error', () => {
              console.log(`❌ Erro ao carregar áudio para call ${call.id}`);
              resolve(0);
            });
            
            // Timeout de 5 segundos
            setTimeout(() => {
              resolve(0);
            }, 5000);
            
            audio.src = audioInfo.public_url;
          });
          
          durations[call.id] = duration;
          console.log(`🎵 Duração carregada para call ${call.id}: ${duration}s`);
        } else {
          durations[call.id] = 0;
        }
      } catch (err) {
        console.error(`❌ Erro ao carregar duração para call ${call.id}:`, err);
        durations[call.id] = 0;
      }
    }
    
    setAudioDurations(durations);
  };

  const handleRetry = () => {
    fetchData();
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (calls.length === 0) return;

    const headers = [
      'Calltype',
      'status',
      'transcription',
      'error details',
      'feedback highlights',
      'improvements',
      'sentiments',
      'call_outcome',
      'file name',
      'audio size',
      'fone number',
      'metadados'
    ];

    const escapeCsv = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value).replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${str}"`;
    };

    const rows = calls.map(call => [
      (call as any).call_type || '',
      call.status,
      (call as any).transcription_text || '',
      call.error_details || call.error_message || '',
      (call as any).feedback_highlights || '',
      (call as any).improvements || '',
      call.sentiment || '',
      (call as any).call_outcome || '',
      call.file_name,
      call.audio_size || '',
      call.phone_number,
      JSON.stringify(call.metadata || {}).replace(/"/g, '""')
    ].map(escapeCsv).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${currentName.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calcular métricas de performance
  const performance = React.useMemo(() => {
    const successfulCalls = calls.filter(call => {
      const hasFailed = (call.status && call.status.toLowerCase() === 'failed') || 
                       (call.overall_score === null && call.analysis_score === null && call.final_score === null && call.score === null) ||
                       (call.error_message || call.error_code || call.error_details);
      return !hasFailed;
    });
    if (successfulCalls.length === 0) {
      return { good: 0, neutral: 0, bad: 0, goodCount: 0, neutralCount: 0, badCount: 0 };
    }

    const goodCount = successfulCalls.filter(call => {
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      return score >= 7;
    }).length;
    const neutralCount = successfulCalls.filter(call => {
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      return score >= 4 && score < 7;
    }).length;
    const badCount = successfulCalls.filter(call => {
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      return score < 4;
    }).length;

    const good = (goodCount / successfulCalls.length) * 100;
    const neutral = (neutralCount / successfulCalls.length) * 100;
    const bad = (badCount / successfulCalls.length) * 100;

    return { good, neutral, bad, goodCount, neutralCount, badCount };
  }, [calls]);

  // Calcular média do lote
  const averageScore = React.useMemo(() => {
    const successfulCalls = calls.filter(call => {
      const hasFailed = (call.status && call.status.toLowerCase() === 'failed') || 
                       (call.overall_score === null && call.analysis_score === null && call.final_score === null && call.score === null) ||
                       (call.error_message || call.error_code || call.error_details);
      return !hasFailed;
    });
    if (successfulCalls.length === 0) return 0;
    const total = successfulCalls.reduce((sum, call) => {
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      return sum + score;
    }, 0);
    return total / successfulCalls.length;
  }, [calls]);

  // Gerar critérios para o gráfico de radar baseado nos subcritérios da evaluation_list
  const criteriaScores: Criterion[] = React.useMemo(() => {
    console.log('🔍 Gerando critérios - listData completa:', JSON.stringify(listData, null, 2));
    
    // APENAS usar dados reais dos subcritérios - NUNCA gerar dados fictícios
    if (!listData?.sub_criteria || !Array.isArray(listData.sub_criteria) || listData.sub_criteria.length === 0) {
      console.log('⚠️ Nenhum subcritério com médias encontrado na listData - retornando array vazio');
      console.log('⚠️ listData.sub_criteria:', listData?.sub_criteria);
      console.log('⚠️ É array?', Array.isArray(listData?.sub_criteria));
      console.log('⚠️ Comprimento:', listData?.sub_criteria?.length);
      
      // IMPORTANTE: Retornar array vazio para forçar mostrar "Nenhum critério disponível"
      return [];
    }

    console.log('📊 Usando subcritérios com médias da evaluation_list:', listData.sub_criteria);
    
    // Verificar se todos os subcritérios têm avg_score válido
    const validSubcriteria = listData.sub_criteria.filter(sub => 
      sub && typeof sub.avg_score === 'number' && !isNaN(sub.avg_score)
    );
        
    if (validSubcriteria.length === 0) {
      console.log('⚠️ Nenhum subcritério tem avg_score válido - retornando array vazio');
      return [];
    }
    
    // Converter subcritérios do banco para o formato do radar
    const criteriaArray: Criterion[] = validSubcriteria.map(subCriterion => {
      const score = subCriterion.avg_score || 0;
      console.log(`📊 Subcritério: ${subCriterion.name} - Média: ${score}`);
      
      return {
        name: subCriterion.name.toUpperCase(),
        score: Math.round(score * 10) / 10 // Arredondar para 1 casa decimal
      };
    });
    
    console.log('📊 Critérios finais para o radar (baseados no banco):', criteriaArray);
    console.log('📊 Total de critérios válidos:', criteriaArray.length);
    
    return criteriaArray;
  }, [listData]);

  // Calcular ligações em atenção
  const callsInAttention = React.useMemo(() => {
    return calls.filter(call => {
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      const hasFailed = (call.status && call.status.toLowerCase() === 'failed') || 
                       (call.overall_score === null && call.analysis_score === null && call.final_score === null && call.score === null) ||
                       (call.error_message || call.error_code || call.error_details);
      return !hasFailed && score < 4;
    }).length;
  }, [calls]);

  // Calcular ligações com falha
  const callsFailed = React.useMemo(() => {
    return calls.filter(call => {
      return (call.status && call.status.toLowerCase() === 'failed') || 
             (call.overall_score === null && call.analysis_score === null && call.final_score === null && call.score === null) ||
             (call.error_message || call.error_code || call.error_details);
    }).length;
  }, [calls]);

  // Extrair nome do critério das ligações (em vez do agente)
  const criteriumName = React.useMemo(() => {
    // Para agora, vamos usar o nome da lista como critério
    // Futuramente pode ser extraído dos metadados se disponível
    return listName;
  }, [listName]);

  // Formatar ligações para a tabela
  const formattedCalls = React.useMemo(() => {
    // Filtrar calls baseado no termo de pesquisa
    const filteredCalls = calls.filter(call => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const phoneNumber = call.client_phone || call.phone_number || call.file_name || '';
      const fileName = call.file_name || '';
      
      return phoneNumber.toLowerCase().includes(searchLower) || 
             fileName.toLowerCase().includes(searchLower);
    });

    return filteredCalls.map(call => {
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
        if (!seconds || seconds === 0) return '--';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}min ${remainingSeconds}s`;
      };

      const getCallDuration = () => {
        // Usar duração real do áudio carregado
        return audioDurations[call.id] || 0;
      };

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      const getPhoneNumber = () => {
        // Prioridade: client_phone -> phone_number -> file_name -> "Não informado"
        if (call.client_phone) return call.client_phone;
        if (call.phone_number) return call.phone_number;
        
        // Tentar extrair do nome do arquivo
        const phoneMatch = call.file_name?.match(/(\d{10,})/);
        if (phoneMatch) return phoneMatch[1];
        
        return 'Não informado';
      };

      const rawError = call.error_details || call.error_message || call.error_code || call.error_type || 'Falha';
      const errorText = getErrorTextPt(rawError);

      // Prioridade para obter o score: overall_score > analysis_score > final_score > score
      const score = call.overall_score ?? call.analysis_score ?? call.final_score ?? call.score ?? 0;
      
      const hasFailed = (call.status && call.status.toLowerCase() === 'failed') || 
                       (call.overall_score === null && call.analysis_score === null && call.final_score === null && call.score === null) ||
                       (call.error_message || call.error_code || call.error_details);
      const hasAttention = !hasFailed && score < 4; // Ícone de atenção apenas para scores baixos quando não falhou

      return {
        id: call.id,
        number: getPhoneNumber(),
        score: hasFailed ? undefined : score.toFixed(1),
        error: hasFailed ? errorText : undefined,
        scoreColor: getScoreColor(score),
        hasAttention,
        hasFailed,
        sentiment: getSentimentEmoji(call.sentiment),
        duration: formatDuration(getCallDuration()),
        date: formatDate(call.call_date || call.created_at || new Date().toISOString())
      };
    });
  }, [calls, searchTerm, audioDurations]);

  const handleCallClick = (callId: string) => {
    setSelectedCallId(callId);
  };

  const handleCallModalClose = () => {
    setSelectedCallId(null);
  };

  const handleNameSave = async () => {
    const trimmed = currentName.trim();
    if (!trimmed || trimmed === listName) {
      setIsEditingName(false);
      return;
    }
    try {
      const { error } = await supabase
        .from('evaluation_lists')
        .update({ name: trimmed })
        .eq('id', listId);
      if (!error) {
        setListData(prev => prev ? { ...prev, name: trimmed } : prev);
      } else {
        console.error('Erro ao salvar nome do lote:', error);
      }
    } catch (err) {
      console.error('Erro inesperado ao salvar nome do lote:', err);
    }
    setIsEditingName(false);
  };

  if (loading) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando dados da análise...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div className="text-[#373753] text-base">Voltar</div>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar análise</h3>
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
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header com informações do critério */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
        >
          <ArrowLeft className="h-4 w-4 text-[#373753]" />
        </button>
        <div className="flex-1">
          <div className="text-[#677c92] text-xs uppercase tracking-wide">Lote</div>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNameSave();
                  }
                }}
                className="text-[#373753] text-lg font-medium tracking-tight border border-[#e1e9f4] rounded px-2 py-1 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
              />
            ) : (
              <>
                <div className="text-[#373753] text-lg font-medium tracking-tight">{currentName}</div>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[#677c92] hover:text-[#373753]"
                  title="Editar nome do lote"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-[#3057f2] text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2545d9] transition-colors"
          title="Exportar CSV do lote"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Média, Ligações em Atenção e Geral + Gráfico */}
      <div className="grid grid-cols-12 gap-6 items-start mb-6">
        {/* Lado esquerdo - Cards empilhados (7 colunas) */}
        <div className="col-span-7 flex flex-col gap-6">
          {/* Primeira linha - Média, Ligações em Atenção e Ligações com Falha */}
          <div className="flex gap-6">
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

            {/* Ligações em Atenção */}
            <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#fff6bf] rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-[#b86309]" />
                </div>
                <div>
                  <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                    Ligações em atenção
                  </div>
                  <div className="text-[#373753] text-xl leading-8 font-medium">{callsInAttention}</div>
                </div>
              </div>
            </div>

            {/* Ligações com Falha */}
            <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#fef2f2] rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-[#dc2f1c]" />
                </div>
                <div>
                  <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                    Ligações com falha
                  </div>
                  <div className="text-[#dc2f1c] text-xl leading-8 font-medium">{callsFailed}</div>
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

        {/* Lado direito - Gráfico de Critérios (5 colunas) */}
        <div className="col-span-5">
          <CriteriaChart criteria={criteriaScores} />
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#677c92]" />
            <input
              type="text"
              placeholder="Pesquisar ligação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-0 rounded-lg focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#f0f4fa] px-2 py-1 rounded whitespace-nowrap">
              {formattedCalls.length} {formattedCalls.length === 1 ? 'ligação' : 'ligações'}
              {searchTerm && calls.length !== formattedCalls.length && (
                <span className="text-[#677c92]"> de {calls.length}</span>
              )}
            </span>
          <button
            onClick={handleRetry}
            className="text-[#677c92] hover:text-[#373753] p-1"
            title="Recarregar ligações"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          </div>
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
                onClick={() => handleCallClick(call.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="w-[280px] flex items-center gap-2">
                    <span className="text-[#677c92] text-base">{call.number}</span>
                    {call.hasFailed ? (
                      <XCircle className="h-4 w-4 text-[#dc2f1c]" />
                    ) : call.hasAttention ? (
                      <AlertTriangle className="h-4 w-4 text-[#e67c0b]" />
                    ) : null}
                  </div>
                  <div className="w-[80px]">
                    {call.hasFailed ? (
                      <span className="text-[#677c92] text-sm whitespace-nowrap" title="Falha na ligação">
                        {call.error}
                      </span>
                    ) : (
                      <>
                        <span className={`text-base font-medium ${call.scoreColor}`}>{call.score}</span>
                        <span className="text-[#677c92] text-base">/10</span>
                      </>
                    )}
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
