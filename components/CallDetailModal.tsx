import React, { useState, useEffect } from 'react';
import { X, Check, X as XIcon, FileText, Phone, Play, Pause, Volume2, MoreVertical, ChevronDown, ChevronUp, AlertTriangle, Copy, RefreshCw, Download, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useSupabaseAudio } from '../src/lib/useSupabaseAudio';

interface CallDetailModalProps {
  callId: string;  
  onClose: () => void;
}

interface CallData {
  id: string;
  // Campos da API v2.0
  file_name: string;
  overall_score: number;
  transcription_text: string;
  transcription_is_real: boolean;
  agent_name: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_company: string;
  client_department: string;
  priority: string;
  campaign_name: string;
  sentiment: string;
  call_outcome: string;
  batch_id: string;
  created_at: string;
  call_type: string;
  status: string;
  individual_criteria_scores: any;
  
  // Campos da análise da API
  summary?: string;
  highlights?: string[];
  improvements?: string[];
  
  // Metadados dinâmicos
  metadata?: Record<string, any>;
  
  // Campos antigos para compatibilidade
  phone_number?: string;
  duration_seconds?: number;
  call_date?: string;
  score?: number;
  transcript?: string;
  agent_id?: string;
  evaluation_list_id: string;
  department?: string; // Fallback para department
  
  // Relacionamentos
  agent?: {
    name: string;
    email: string;
    department: string;
  };
  evaluation_list?: {
    name: string;
    description: string;
  };
}

export function CallDetailModal({ callId, onClose }: CallDetailModalProps) {
  const { companyId } = useAuth();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEvaluationTab, setActiveEvaluationTab] = useState<'criteria' | 'general'>('criteria');
  const [expandedSections, setExpandedSections] = useState<{
    evaluation: boolean;
    transcript: boolean;
    callData: boolean;
  }>({
    evaluation: true,
    transcript: false,
    callData: false
  });
  const [transcriptCopied, setTranscriptCopied] = useState(false);
  const [audioOptionsOpen, setAudioOptionsOpen] = useState(false);

  // Se a chamada for falha, abrir automaticamente o accordion de dados
  useEffect(() => {
    if (callData?.status === 'failed') {
      setExpandedSections(prev => ({ ...prev, callData: true }));
    }
  }, [callData]);
  
  // Hook de áudio que consome diretamente do Supabase Storage
  const audio = useSupabaseAudio(callId);

  useEffect(() => {
    if (callId && companyId) {
      fetchCallData();
    }
  }, [callId, companyId]);

  // Fechar menu de opções de áudio ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (audioOptionsOpen) {
        const target = event.target as Element;
        if (!target.closest('.audio-options-menu')) {
          setAudioOptionsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [audioOptionsOpen]);

  const fetchCallData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📞 Carregando dados da chamada:', callId);

      // Buscar dados da chamada v2.0 (sem relacionamentos, dados diretos)
      const { data: call, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .eq('company_id', companyId)
        .single();

      if (callError) {
        console.error('❌ Erro ao buscar chamada:', callError);
        setError(`Erro ao carregar chamada: ${callError.message}`);
        return;
      }

      if (!call) {
        setError('Chamada não encontrada');
        return;
      }

      // Buscar dados da lista de avaliação
      const { data: evaluationList } = await supabase
        .from('evaluation_lists')
        .select('name, description')
        .eq('id', call.evaluation_list_id)
        .eq('company_id', companyId)
        .single();

      // Derivar nome do agente (db ou metadados)
      const derivedAgentName = call.agent_name || call.metadata?.agent || 'Agente';

      // Adaptar dados para compatibilidade
      const adaptedCall = {
        ...call,
        // Compatibilidade com campos antigos
        phone_number: call.client_phone || call.phone_number,
        call_date: call.created_at || call.call_date,
        score: call.overall_score || call.score || 0,
        transcript: call.transcription_text || call.transcript,
        agent_id: derivedAgentName, // Para compatibilidade
        // Dados da lista
        evaluation_list: evaluationList,
        // Dados do agente
        agent: {
          name: derivedAgentName,
          email: `${derivedAgentName.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
          department: call.client_department || 'Atendimento'
        }
      };

      setCallData(adaptedCall);
      console.log('✅ Dados da chamada v2.0 carregados:', adaptedCall);
      console.log('🔍 Departamento do cliente:', call.client_department);

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar chamada:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyTranscript = async () => {
    const textToCopy = callData?.transcription_text || callData?.transcript || 'Transcrição não disponível';
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or when Clipboard API is blocked
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Não foi possível copiar automaticamente. Por favor, selecione o texto manualmente.');
          return;
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      setTranscriptCopied(true);
      setTimeout(() => setTranscriptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Não foi possível copiar automaticamente. Por favor, selecione o texto manualmente.');
    }
  };

  const formatTranscript = (text: string) => {
    if (!text) {
      return [
        <div key="no-transcript" className="text-center py-8 text-[#677c92]">
          <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="h-6 w-6 text-[#677c92]" />
          </div>
          <p>Transcrição não disponível para esta chamada</p>
        </div>
      ];
    }

    return text.split('\n').map((line, index) => {
      const isAgent = line.startsWith('Agente:');
      const isClient = line.startsWith('Cliente:');
      
      return (
        <div key={index} className={`mb-2 ${line.trim() === '' ? 'mb-4' : ''}`}>
          {isAgent && (
            <span className="text-[#3057f2] font-medium">Agente: </span>
          )}
          {isClient && (
            <span className="text-[#677c92] font-medium">Cliente: </span>
          )}
          <span className="text-[#373753]">
            {line.replace(/^(Agente|Cliente):\s*/, '')}
          </span>
        </div>
      );
    });
  };

  const handleRetry = () => {
    fetchCallData();
  };

  // Funções para opções de áudio
  const handleSpeedChange = (speed: number) => {
    if (audio.audioRef?.current) {
      audio.audioRef.current.playbackRate = speed;
    }
    setAudioOptionsOpen(false);
  };

  const handleDownloadAudio = async () => {
    if (!audio.audioUrl) return;
    
    try {
      const response = await fetch(audio.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-ligacao-${callId}.ogg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setAudioOptionsOpen(false);
    } catch (error) {
      console.error('Erro ao baixar áudio:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_4px_18px_0px_rgba(34,54,77,0.12)] w-full max-w-2xl p-6 modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando detalhes da chamada...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_4px_18px_0px_rgba(34,54,77,0.12)] w-full max-w-2xl p-6 modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-[#373753]">Erro</h2>
            <button 
              onClick={onClose} 
              className="text-[#677c92] hover:text-[#373753] transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-[#dc2f1c]" />
            </div>
            <h3 className="text-lg font-medium text-[#373753] mb-2">
              Erro ao carregar chamada
            </h3>
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
    );
  }

  if (!callData) {
    return null;
  }

  // Formatação dos dados da chamada
  const formattedDate = new Date(callData.created_at || callData.call_date || new Date()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedDuration = () => {
    const totalSeconds = callData.duration_seconds || 300; // 5 minutos padrão
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentScore = callData.overall_score || callData.score || 0;
  const scoreColor = currentScore >= 7 ? '#059669' : currentScore >= 4 ? '#d97706' : '#dc2626';
  
  // Interface para critérios padronizados
  interface CriterionData {
    id?: string;
    name: string;
    score: string;
    color: string;
    description: string;
    keywords?: string[] | string;
    ideal_phrase?: string;
    feedback?: string;
    hasAttention: boolean;
  }

  // Gerar critérios fictícios baseados no score real
  const generateCriteria = (score: number): CriterionData[] => {
    const baseScore = score;
    const variation = 1.5; // Variação de ±1.5 pontos
    
    const criteria = [
      {
        id: 'mock-comunicacao',
        name: 'Comunicação',
        score: Math.max(0, Math.min(10, baseScore + (Math.random() * variation * 2 - variation))).toFixed(1),
        color: '',
        description: 'Avaliação da clareza e efetividade da comunicação durante a chamada.',
        keywords: [],
        ideal_phrase: '',
        feedback: '',
        hasAttention: false
      },
      {
        id: 'mock-resolucao',
        name: 'Resolução',
        score: Math.max(0, Math.min(10, baseScore + (Math.random() * variation * 2 - variation))).toFixed(1),
        color: '',
        description: 'Capacidade de resolver o problema ou necessidade do cliente.',
        keywords: [],
        ideal_phrase: '',
        feedback: '',
        hasAttention: false
      },
      {
        id: 'mock-cordialidade',
        name: 'Cordialidade',
        score: Math.max(0, Math.min(10, baseScore + (Math.random() * variation * 2 - variation))).toFixed(1),
        color: '',
        description: 'Avaliação da cortesia e profissionalismo no atendimento.',
        keywords: [],
        ideal_phrase: '',
        feedback: '',
        hasAttention: false
      },
    ];

         // Aplicar regra de atenção e cores: scores < 4 recebem ícone de atenção
     return criteria.map(criterion => {
       const score = parseFloat(criterion.score);
       let color = 'bg-[#dc2f1c]'; // Padrão vermelho
       if (score >= 7) {
         color = 'bg-[#5CB868]'; // Verde para scores de 7 a 10
       } else if (score >= 4) {
         color = 'bg-[#FFBD00]'; // Amarelo para scores de 4 a 6.9
       } else {
         color = 'bg-[#dc2f1c]'; // Vermelho para scores de 0 a 3.9
       }
       
       return {
         ...criterion,
         color,
         hasAttention: score < 4
       };
     }).concat([
       {
         id: 'mock-tempo',
         name: 'Tempo',
         score: Math.max(0, Math.min(10, baseScore + (Math.random() * variation * 2 - variation))).toFixed(1),
         color: currentScore >= 7 ? 'bg-[#5CB868]' : currentScore >= 4 ? 'bg-[#FFBD00]' : 'bg-[#dc2f1c]',
         description: 'Eficiência no tempo de atendimento e resolução.',
         keywords: [],
         ideal_phrase: '',
         feedback: '',
         hasAttention: currentScore < 4 // Ícone de atenção apenas para scores menores que 4
       }
     ]);
  };

  const mockCriteria = generateCriteria(currentScore);

  // Função para processar subcritérios reais do banco de dados
  const getRealSubCriteria = (): CriterionData[] => {
    if (!callData?.individual_criteria_scores) {
      console.log('📊 Nenhum individual_criteria_scores encontrado, usando critérios mockados');
      return generateCriteria(currentScore);
    }

    console.log('📊 individual_criteria_scores encontrado:', callData.individual_criteria_scores);
    
    // Converter o objeto individual_criteria_scores em array de critérios
    const realCriteria: CriterionData[] = Object.entries(callData.individual_criteria_scores).map(([subcriteriaId, data]: [string, any]) => {
      const score = data.score || 0;
      const hasAttention = score < 4; // Ícone de atenção apenas para scores menores que 4
      
      // Definir cor baseada no score (nova regra)
      let color = 'bg-[#dc2f1c]'; // Padrão vermelho
      if (score >= 7) {
        color = 'bg-[#5CB868]'; // Verde para scores de 7 a 10
      } else if (score >= 4) {
        color = 'bg-[#FFBD00]'; // Amarelo para scores de 4 a 6.9
      } else {
        color = 'bg-[#dc2f1c]'; // Vermelho para scores de 0 a 3.9
      }

      return {
        id: subcriteriaId,
        name: data.name || 'Subcritério',
        score: score.toFixed(1),
        color: data.color || color,
        description: data.description || '',
        keywords: data.keywords || [],
        ideal_phrase: data.ideal_phrase || '',
        feedback: data.feedback || '',
        hasAttention
      };
    });

    console.log('📊 Subcritérios processados:', realCriteria);
    
    // Se não há subcritérios reais, usar mockados como fallback
    if (realCriteria.length === 0) {
      console.log('📊 Nenhum subcritério real encontrado, usando critérios mockados como fallback');
      return generateCriteria(currentScore);
    }

    return realCriteria;
  };

  // Usar subcritérios reais em vez dos mockados
  const criteriaToShow = getRealSubCriteria();

  // Usar feedback real da API
  const getRealFeedback = () => {
    const highlights = callData?.highlights || [];
    const improvements = callData?.improvements || [];
    
    return {
      positive: {
        title: 'Pontos Positivos',
        description: highlights.length > 0 
          ? highlights.join(' ') 
          : 'Nenhum ponto positivo identificado nesta ligação.'
      },
      negative: {
        title: 'Atenção Necessária',
        description: improvements.length > 0 
          ? improvements.join(' ') 
          : 'Nenhuma melhoria específica identificada.'
      }
    };
  };

  const mockFeedback = getRealFeedback();
  
  // Usar resumo real da API
  const getRealSummary = () => {
    return callData?.summary || 'Resumo da ligação não disponível.';
  };

  const callSummary = getRealSummary();
  // Determina se a ligação falhou (call_failed) para simplificar a UI
  const isFailedCall = callData?.status === 'failed';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_4px_18px_0px_rgba(34,54,77,0.12)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-[#e1e9f4] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[#373753] text-lg font-medium tracking-tight">Detalhes da Ligação</div>
            <button 
              onClick={onClose} 
              className="text-[#677c92] hover:text-[#373753] transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Score and Title */}
            <div className="text-center space-y-6">
              {/* Score Circle */}
              {!isFailedCall && (
              <div className="flex justify-center">
                <div className="relative w-56 h-32 flex items-center justify-center score-circle">
                  {/* Semi-circle background */}
                  <svg viewBox="0 0 240 120" className="w-56 h-32" style={{ overflow: 'visible' }}>
                    {/* Background arc */}
                    <path
                      d="M 30 90 A 90 90 0 0 1 210 90"
                      fill="none"
                      stroke="#E1E9F4"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                      d="M 30 90 A 90 90 0 0 1 210 90"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset={`${283 - (currentScore / 10) * 283}`}
                      className="transition-all duration-1000 ease-out"
                      style={{ 
                        filter: `drop-shadow(0px 2px 4px ${scoreColor}30)`
                      }}
                    />
                  </svg>
                  {/* Score Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center mt-4">
                      <div className="text-3xl font-medium leading-none" style={{ color: scoreColor }}>
                        {currentScore.toFixed(1)}
                      </div>
                      <div className="text-[#677c92] text-xl">/10</div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Title */}
              <h1 className="text-[#373753] text-2xl font-semibold tracking-tight">
                Análise: {callData.agent?.name || 'Agente'}
              </h1>
            </div>

            {/* Summary and Audio */}
            <div className="space-y-6">
              {!isFailedCall && (
              <div className="text-center">
                <p className="text-[#677c92] text-base leading-6 max-w-4xl mx-auto">
                  {callSummary}
                </p>
              </div>
              )}

              {/* Player de Áudio do Banco de Dados */}
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-2xl p-4">
                {audio.error ? (
                  <div className="bg-white rounded-full px-4 py-2 flex items-center justify-center shadow-sm">
                    <span className="text-[#677c92] text-sm">{audio.error}</span>
                  </div>
                ) : (
                  <div className="bg-white rounded-full px-4 py-2 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={audio.togglePlayPause}
                        disabled={audio.isLoading || !audio.hasAudio}
                        className="text-[#677c92] hover:text-[#3057f2] transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                      >
                        {audio.isLoading ? (
                          <div className="w-4 h-4 border border-[#677c92] border-t-transparent rounded-full animate-spin" />
                        ) : audio.isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <span className="text-[#373753] text-base font-medium">
                        {audio.formatTime(audio.currentTime)}/{audio.formatTime(audio.duration)}
                      </span>
                    </div>
                    <div className="flex-1 mx-4 relative">
                      <div className="bg-[#e1e9f4] h-1.5 rounded-full">
                        <div 
                          className="bg-[#3057f2] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${audio.getProgressPercentage()}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audio.getProgressPercentage()}
                        onChange={audio.handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={!audio.duration}
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setAudioOptionsOpen(!audioOptionsOpen)}
                        className="text-[#677c92] hover:text-[#3057f2] transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {/* Menu de opções */}
                      {audioOptionsOpen && (
                        <div className="audio-options-menu absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-[#e1e9f4] z-50 py-2 min-w-[160px]">
                          {/* Opções de velocidade */}
                          <div className="px-3 py-1 text-xs font-medium text-[#677c92] border-b border-[#e1e9f4] mb-1">
                            Velocidade
                          </div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className="w-full px-3 py-2 text-left text-sm text-[#373753] hover:bg-[#f9fafc] transition-colors flex items-center gap-2"
                            >
                              <Zap className="h-3 w-3" />
                              {speed}x
                            </button>
                          ))}
                          
                          {/* Separador */}
                          <div className="border-t border-[#e1e9f4] my-1"></div>
                          
                          {/* Download */}
                          <button
                            onClick={handleDownloadAudio}
                            disabled={!audio.hasAudio}
                            className="w-full px-3 py-2 text-left text-sm text-[#373753] hover:bg-[#f9fafc] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Download className="h-3 w-3" />
                            Baixar áudio
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isFailedCall && (
            <>
              {/* Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Positive Feedback */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#5CB868] rounded-full flex items-center justify-center shadow-sm">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-[#373753] text-lg font-medium tracking-tight">
                      {mockFeedback.positive.title}
                    </h3>
                  </div>
                  <p className="text-[#677c92] text-base leading-relaxed">
                    {mockFeedback.positive.description}
                  </p>
                </div>

                {/* Negative Feedback */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#DC2F1C] rounded-full flex items-center justify-center shadow-sm">
                      <XIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-[#373753] text-lg font-medium tracking-tight">
                      {mockFeedback.negative.title}
                    </h3>
                  </div>
                  <p className="text-[#677c92] text-base leading-relaxed">
                    {mockFeedback.negative.description}
                  </p>
                </div>
              </div>
            </>) }

            {!isFailedCall && (
            <>
              {/* Evaluation Section - Accordion */}
              <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_2px_8px_0px_rgba(18,38,63,0.03)]">
                <div 
                  className="border-b border-[#e1e9f4] px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('evaluation')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#3057f2]" />
                    </div>
                    <span className="text-[#373753] text-base font-medium">Avaliação</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex gap-8">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvaluationTab('criteria');
                        }}
                        className="text-center"
                      >
                        <div className={`text-xs uppercase font-medium ${
                          activeEvaluationTab === 'criteria' 
                            ? 'text-[#3057F2] border-b-2 border-[#3057F2] pb-1' 
                            : 'text-[#677c92] hover:text-[#3057F2] transition-colors'
                        }`}>
                          Critérios
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvaluationTab('general');
                        }}
                        className="text-center"
                      >
                        <div className={`text-xs uppercase font-medium ${
                          activeEvaluationTab === 'general' 
                            ? 'text-[#3057F2] border-b-2 border-[#3057F2] pb-1' 
                            : 'text-[#677c92] hover:text-[#3057F2] transition-colors'
                        }`}>
                          Geral
                        </div>
                      </button>
                    </div>
                    <button className="text-[#677c92] hover:text-[#3057f2] transition-colors p-1 rounded-lg hover:bg-gray-100">
                      {expandedSections.evaluation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Evaluation Content */}
                {expandedSections.evaluation && (
                  <div className="bg-[#f9fbfd]">
                    {activeEvaluationTab === 'criteria' ? (
                      <div className="p-6">
                        <div className="space-y-3">
                          {criteriaToShow.map((criterion, index) => (
                            <div key={criterion.id || index} className="bg-white rounded-lg p-4 border border-[#e1e9f4] shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-[#373753] text-base font-medium">{criterion.name}</span>
                                  {criterion.hasAttention && (
                                    <AlertTriangle className="h-4 w-4 text-[#e67c0b]" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`${criterion.color} text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm`}>
                                    {criterion.score}
                                  </div>
                                  <span className="text-[#677c92] text-sm">/10</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {/* Exibir descrição apenas se disponível e diferente do nome */}
                                {criterion.description && criterion.description.trim() !== '' && (
                                  <p className="text-[#677c92] text-sm leading-relaxed">{criterion.description}</p>
                                )}
                                
                                {/* Exibir keywords se disponíveis */}
                                {criterion.keywords && criterion.keywords.length > 0 && (
                                  <div>
                                    <span className="text-[#373753] text-xs font-medium">Palavras-chave: </span>
                                    <span className="text-[#677c92] text-xs">
                                      {Array.isArray(criterion.keywords) 
                                        ? criterion.keywords.join(', ')
                                        : criterion.keywords
                                      }
                                    </span>
                                  </div>
                                )}
                                
                                {/* Exibir frase ideal se disponível */}
                                {criterion.ideal_phrase && (
                                  <div>
                                    <span className="text-[#373753] text-xs font-medium">Frase ideal: </span>
                                    <span className="text-[#677c92] text-xs italic">"{criterion.ideal_phrase}"</span>
                                  </div>
                                )}
                                
                                {/* Exibir feedback se disponível */}
                                {criterion.feedback && (
                                  <p className="text-[#677c92] text-xs leading-relaxed">{criterion.feedback}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="bg-white rounded-lg p-4 border border-[#e1e9f4] shadow-sm">
                          <p className="text-[#677c92] text-base leading-relaxed">
                            {callSummary} A avaliação geral considera todos os aspectos do atendimento, incluindo comunicação, resolução, cordialidade e eficiência no tempo.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>) }

            {!isFailedCall && (
            <>
              {/* Audio Transcript Accordion */}
              <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_2px_8px_0px_rgba(18,38,63,0.03)]">
                <div 
                  className="h-14 flex items-center justify-between px-6 hover:bg-gray-50 transition-colors cursor-pointer rounded-t-xl"
                  onClick={() => toggleSection('transcript')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                      <Volume2 className="h-4 w-4 text-[#3057f2]" />
                    </div>
                    <span className="text-[#373753] text-base font-medium">Transcrição do áudio</span>
                  </div>
                  <button className="text-[#677c92] hover:text-[#3057f2] transition-colors p-1 rounded-lg hover:bg-gray-100">
                    {expandedSections.transcript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                
                {expandedSections.transcript && (
                  <div className="border-t border-[#e1e9f4] p-6 bg-[#f9fbfd]">
                    <div className="bg-white rounded-lg p-4 border border-[#e1e9f4] max-h-96 overflow-y-auto">
                      <div className="text-sm leading-relaxed">
                        {formatTranscript(callData.transcription_text || callData.transcript || '')}
                      </div>
                    </div>
                    {(callData.transcription_text || callData.transcript) && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={copyTranscript}
                          className="bg-[#3057f2] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2545d9] transition-colors shadow-sm"
                        >
                          {transcriptCopied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copiar transcrição
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>) }

            {/* Call Data Accordion - Apenas metadados */}
            {callData?.metadata && Object.keys(callData.metadata).length > 0 && (
              <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_2px_8px_0px_rgba(18,38,63,0.03)]">
                <div 
                  className="h-14 flex items-center justify-between px-6 hover:bg-gray-50 transition-colors cursor-pointer rounded-t-xl"
                  onClick={() => toggleSection('callData')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-[#3057f2]" />
                    </div>
                    <span className="text-[#373753] text-base font-medium">Dados da ligação</span>
                  </div>
                  <button className="text-[#677c92] hover:text-[#3057f2] transition-colors p-1 rounded-lg hover:bg-gray-100">
                    {expandedSections.callData ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                {expandedSections.callData && (
                  <div className="border-t border-[#e1e9f4] p-6 bg-[#f9fbfd]">
                    <div className="bg-white rounded-lg p-6 border border-[#e1e9f4]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(callData.metadata)
                          .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                          .map(([key, value]) => (
                            <div key={key}>
                              <div className="text-[#677c92] text-sm mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                              <div className="text-[#373753] font-medium break-words">{String(value)}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
