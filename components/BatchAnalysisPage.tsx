import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  FileAudio, 
  Trash2, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Eye,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { authManager } from '../src/lib/auth';
// URL base da API (Render ou relativa em dev)
const API_BASE = (import.meta as any).env.VITE_API_URL || '';


interface BatchFile {
  file: File | null;
  audioUrl: string | null;
  metadata: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    department?: string;
    callType?: string;
    priority?: string;
  };
  campaign: string;
  agent: string;
}

interface CriteriaFromDB {
  id: string;
  name: string;
  evaluation_list_id: string;
  sub_criteria: SubCriteria[];
}

interface SubCriteria {
  id: string;
  name: string;
  description: string;
  keywords?: string[];
  ideal_phrase?: string;
}

interface BatchJob {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  progress: {
    percentage: number;
    current: number;
    total: number;
  };
  createdAt: string;
  completedAt?: string;
  metricsSummary?: any;
}

interface JobDetails {
  jobId: string;
  status: string;
  progress: {
    percentage: number;
    current: number;
    total: number;
  };
  estimatedTimeRemaining?: number;
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  partialMetrics?: any;
  metricsSummary?: any;
  calls: Array<{
    id: string;
    filename: string;
    status: string;
    metadata: any;
    analysis?: any;
    error?: string;
  }>;
}

interface BatchAnalysisPageProps {
  compact?: boolean;
}

export function BatchAnalysisPage({ compact = false }: BatchAnalysisPageProps) {
  const { company } = useAuth();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [availableCriteria, setAvailableCriteria] = useState<CriteriaFromDB[]>([]);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState('https://webhook.site/d26c97da-307d-4b72-b577-06d9073c81b3');
  const [isUploading, setIsUploading] = useState(false);
  const [activeJobs, setActiveJobs] = useState<BatchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batchName, setBatchName] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // Carregar critérios da empresa
  useEffect(() => {
    if (company) {
      loadCriteria();
    }
  }, [company]);

  // Carregar jobs ativos
  useEffect(() => {
    if (company?.id) {
      // loadActiveJobs(); // Temporariamente desabilitado para a nova API Supabase
      // const interval = setInterval(loadActiveJobs, 5000); // Atualizar a cada 5 segundos
      // return () => clearInterval(interval);
    }
  }, [company?.id]);

  const loadCriteria = async () => {
    if (!company) {
      console.log('🔍 Company não encontrada, não carregando critérios');
      return;
    }
    
    console.log('🔍 Carregando critérios para empresa:', company.id, company.name);
    setIsLoadingCriteria(true);

    // Debug do JWT
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieXRta3piY2pzdHB3cWl0bmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MDQxMzMsImV4cCI6MjA1MDI4MDEzM30.9JtHJnlKVPEj6L4vRwG4AUl4-6lPc1TfMJLG7YiP8lw';
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      console.log('🔐 JWT Debug:', {
        projeto: payload.ref,
        role: payload.role,
        issued: new Date(payload.iat * 1000).toLocaleString(),
        expires: new Date(payload.exp * 1000).toLocaleString(),
        isExpired,
        secondsToExpiry: payload.exp - now
      });
      
      if (isExpired) {
        console.error('❌ JWT EXPIRADO! Precisa de um novo token.');
      }
    } catch (error) {
      console.error('❌ Erro ao decodificar JWT:', error);
    }
    
    try {
      // Buscar critérios da empresa
      console.log('📊 Fazendo query para critérios...');
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('id, name, evaluation_list_id')
        .eq('company_id', company.id);

      console.log('📊 Resultado da query de critérios:', { criteriaData, criteriaError });

      if (criteriaError) {
        console.error('❌ Erro ao carregar critérios:', criteriaError);
        alert(`Erro ao carregar critérios: ${criteriaError.message}`);
        return;
      }

      if (criteriaData && criteriaData.length > 0) {
        console.log(`✅ Encontrados ${criteriaData.length} critérios`);
        
        // Para cada critério, buscar seus subcritérios
        const criteriaWithSubCriteria: CriteriaFromDB[] = await Promise.all(
          criteriaData.map(async (criterion) => {
            console.log(`🔍 Buscando subcritérios para critério: ${criterion.name} (ID: ${criterion.id})`);
            
            const { data: subCriteriaData, error: subCriteriaError } = await supabase
              .from('sub_criteria')
              .select('id, name, description, keywords, ideal_phrase')
              .eq('criteria_id', criterion.id);

            console.log(`📋 Subcritérios para ${criterion.name}:`, { subCriteriaData, subCriteriaError });

            if (subCriteriaError) {
              console.error(`❌ Erro ao carregar subcritérios para ${criterion.name}:`, subCriteriaError);
              return { ...criterion, sub_criteria: [] };
            }

            return {
              ...criterion,
              sub_criteria: subCriteriaData || []
            };
          })
        );

        console.log('✅ Critérios com subcritérios carregados:', criteriaWithSubCriteria);
        setAvailableCriteria(criteriaWithSubCriteria);
        
        // Selecionar o primeiro critério automaticamente se houver
        if (criteriaWithSubCriteria.length > 0) {
          setSelectedCriteriaId(criteriaWithSubCriteria[0].id);
          console.log('✅ Critério selecionado automaticamente:', criteriaWithSubCriteria[0].name);
        }
      } else {
        console.log('⚠️ Nenhum critério encontrado para a empresa');
        setAvailableCriteria([]);
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar critérios:', error);
      alert(`Erro ao carregar critérios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoadingCriteria(false);
    }
  };

  const loadActiveJobs = async () => {
    if (!company?.id) {
      console.warn('⚠️ Company ID não disponível, não carregando jobs');
      return;
    }

    try {
      console.log(`🏢 Carregando jobs ativos para empresa: ${company.name} (${company.id})`);
      
      const response = await fetch(`${API_BASE}/api/v1/batch-jobs?company_id=${encodeURIComponent(company.id)}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.jobs?.length || 0} jobs carregados para empresa ${company.name}`);
        setActiveJobs(data.jobs || []);
      } else {
        const error = await response.json();
        console.error('❌ Erro ao carregar jobs:', error);
        if (error.error === 'ACCESS_DENIED') {
          alert('Acesso negado: Dados de outra empresa detectados');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar jobs:', error);
    }
  };

  const loadJobDetails = async (jobId: string) => {
    if (!company?.id) {
      alert('Erro: Empresa não identificada');
      return;
    }

    try {
      console.log(`🔍 Carregando detalhes do job ${jobId} para empresa ${company.name}`);
      
      const response = await fetch(`${API_BASE}/api/v1/analyze-batch?jobId=${jobId}&company_id=${encodeURIComponent(company.id)}`);
      if (response.ok) {
        const jobDetails = await response.json();
        setSelectedJob(jobDetails);
        setShowJobDetails(true);
      } else {
        const error = await response.json();
        console.error('❌ Erro ao carregar detalhes do job:', error);
        if (error.error === 'ACCESS_DENIED') {
          alert('Acesso negado: Este job não pertence à sua empresa');
        } else {
          alert(`Erro: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do job:', error);
      alert('Erro ao carregar detalhes do job');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      audioUrl: null,
      metadata: {
        name: '',
        email: '',
        phone: '',
        company: '',
        department: '',
        callType: '',
        priority: ''
      },
      campaign: '',
      agent: ''
    }));
    setFiles(prev => [...prev, ...newFiles]);
    
    // Reset input para permitir seleção múltipla repetida
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAddAudioUrl = () => {
    if (!newAudioUrl.trim()) {
      alert('Por favor, insira uma URL válida');
      return;
    }

    // Validar se é uma URL válida
    try {
      new URL(newAudioUrl);
    } catch {
      alert('Por favor, insira uma URL válida');
      return;
    }

    const newFile: BatchFile = {
      file: null,
      audioUrl: newAudioUrl.trim(),
      metadata: {
        name: '',
        email: '',
        phone: '',
        company: '',
        department: '',
        callType: '',
        priority: ''
      },
      campaign: '',
      agent: ''
    };

    setFiles(prev => [...prev, newFile]);
    setNewAudioUrl('');
    setIsAddingUrl(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileData = (index: number, field: string, value: string) => {
    setFiles(prev => prev.map((file, i) => {
      if (i !== index) return file;
      
      if (field.startsWith('metadata.')) {
        const metadataField = field.split('.')[1];
        return {
          ...file,
          metadata: {
            ...file.metadata,
            [metadataField]: value
          }
        };
      }
      
      return { ...file, [field]: value };
    }));
  };

  const startBatchAnalysis = async () => {
    if (files.length === 0) {
      alert('Adicione pelo menos um arquivo de áudio ou URL');
      return;
    }

    if (!selectedCriteriaId) {
      alert('Selecione um critério de avaliação');
      return;
    }

    if (!company?.id) {
      alert('Erro: Empresa não identificada. Faça login novamente.');
      return;
    }

    // Verificar se há autenticação JWT
    if (!authManager.isAuthenticated()) {
      // Tentar fazer login automático com as credenciais da sessão atual
      try {
        const user = authManager.getUser();
        if (!user?.email) {
          alert('❌ Erro de autenticação: Faça login novamente');
          return;
        }
        
        console.log('🔐 Verificando autenticação JWT...');
        const isValid = await authManager.verifyToken();
        if (!isValid) {
          alert('❌ Sessão expirada: Faça login novamente');
          return;
        }
        
        console.log('✅ Token JWT válido');
      } catch (error) {
        console.error('❌ Erro na verificação JWT:', error);
        alert('❌ Erro de autenticação: Faça login novamente');
        return;
      }
    }

    // Buscar o nome do critério selecionado
    const selectedCriteria = availableCriteria.find(c => c.id === selectedCriteriaId);
    if (!selectedCriteria) {
      alert('Critério selecionado não encontrado');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Webhook URL
      if (callbackUrl) {
        formData.append('webhook', callbackUrl);
      }
      
      // Critérios no formato esperado pela nova API
      const criteriaData = {
        nomeDoGrupo: selectedCriteria.name,
        criteriaId: selectedCriteria.id
      };
      formData.append('criteria', JSON.stringify(criteriaData));

      // Adicionar arquivos e metadados individuais
      files.forEach((batchFile, index) => {
        // Arquivo de áudio ou URL
        if (batchFile.file) {
          formData.append(`audioFiles_${index}`, batchFile.file);
        } else if (batchFile.audioUrl) {
          formData.append(`audioUrls_${index}`, batchFile.audioUrl);
        }
        
        // Telefone específico do arquivo
        formData.append(`phone_number_${index}`, batchFile.metadata.phone || '');
        
        // Metadados únicos para cada arquivo com índice
        const metadata = {
          name: batchFile.metadata.name || '',
          email: batchFile.metadata.email || '',
          phone: batchFile.metadata.phone || '',
          company: batchFile.metadata.company || '',
          department: batchFile.metadata.department || '',
          callType: batchFile.metadata.callType || '',
          priority: batchFile.metadata.priority || '',
          campaign: batchFile.campaign || '',
          agent: batchFile.agent || ''
        };
        formData.append(`metadata_${index}`, JSON.stringify(metadata));
      });

      // Metadados padrão para compatibilidade (primeiro arquivo)
      if (files.length > 0) {
        const firstFile = files[0];
        const metadata = {
          name: firstFile.metadata.name || '',
          email: firstFile.metadata.email || '',
          phone: firstFile.metadata.phone || '',
          company: firstFile.metadata.company || '',
          department: firstFile.metadata.department || '',
          callType: firstFile.metadata.callType || '',
          priority: firstFile.metadata.priority || '',
          campaign: firstFile.campaign || '',
          agent: firstFile.agent || ''
        };
        formData.append('metadata', JSON.stringify(metadata));
      }

      // For brevity, append batch_name to FormData.
      formData.append('batch_name', batchName.trim());

      console.log(`🚀 Enviando ${files.length} arquivos/URLs para análise em lote`);
      console.log(`📊 Critério selecionado: ${selectedCriteria.name}`);
      console.log(`🏢 Empresa: ${company.name} (${company.id})`);
      console.log(`👤 Usuário JWT: ${authManager.getUser()?.name} (${authManager.getUser()?.email})`);

      // Verificar se o servidor local está rodando
      try {
        const healthCheck = await fetch(`${API_BASE}/health`);
        if (!healthCheck.ok) {
          throw new Error('Servidor API não está respondendo');
        }
        console.log('✅ Servidor API local está rodando');
      } catch (healthError) {
        console.error('❌ Servidor API local não está disponível:', healthError);
        alert('❌ Erro: Servidor API local não está rodando!\n\nPara iniciar:\n1. Abra um terminal\n2. Execute: npm run start:api\n3. Aguarde o servidor iniciar na porta 3001\n4. Tente novamente\n\nOu use: npm run start (inicia tudo)');
        return;
      }
      
      // NOVA SOLUÇÃO: Usar proxy local com autenticação JWT
      console.log('🔐 Enviando com autenticação JWT...');
      const response = await authManager.authenticatedFetch(`${API_BASE}/api/v1/analyze-batch-proxy`, {
        method: 'POST',
        body: formData
      });

      console.log(`📡 Resposta da API: Status ${response.status} ${response.statusText}`);
      console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Lote enviado com sucesso:', result);
        
        alert(`✅ Análise em lote iniciada com sucesso!\n\n` +
              `👤 Usuário: ${result.user?.name || 'N/A'}\n` +
              `🏢 Empresa: ${result.user?.company || 'N/A'}\n` +
              `📁 Arquivos processados: ${result.files_processed || files.length}\n` +
              `🔗 Webhook: ${callbackUrl}\n\n` +
              `Os resultados serão enviados para o webhook configurado.`);
        
        setFiles([]);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          alert('❌ Erro de autenticação: Faça login novamente');
          return;
        }
        
        try {
          const errorData = JSON.parse(errorText);
          alert(`❌ Erro na análise em lote:\n\n${errorData.message || errorData.error || 'Erro desconhecido'}`);
        } catch {
          alert(`❌ Erro na análise em lote:\n\n${errorText}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar lote:', error);
      alert(`❌ Erro ao enviar lote:\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileName = (batchFile: BatchFile) => {
    if (batchFile.file) {
      return batchFile.file.name;
    } else if (batchFile.audioUrl) {
      // Extrair nome do arquivo da URL
      try {
        const url = new URL(batchFile.audioUrl);
        const pathname = url.pathname;
        const filename = pathname.split('/').pop();
        return filename || 'Áudio da URL';
      } catch {
        return 'Áudio da URL';
      }
    }
    return 'Arquivo desconhecido';
  };

  const getFileSize = (batchFile: BatchFile) => {
    if (batchFile.file) {
      return formatFileSize(batchFile.file.size);
    } else if (batchFile.audioUrl) {
      return 'URL de áudio';
    }
    return 'N/A';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className={compact ? 'min-h-screen bg-[#f8fafc] p-0' : 'min-h-screen bg-[#f8fafc] p-6'}>
      <div className={compact ? 'w-full' : 'max-w-7xl mx-auto'}>
        {/* Header (somente se NÃO compacto) */}
        {!compact && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#373753] mb-2">
            🚀 Análise em Lote - CallAnalyzer
          </h1>
          <p className="text-[#677c92]">
            Processe múltiplas ligações simultaneamente com análise inteligente por IA usando a API Supabase Edge Function
          </p>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-1">API Real Funcionando</h3>
                <p className="text-green-700 text-sm">
                  Conectado à API Supabase Edge Function real. Seus arquivos serão processados e os resultados enviados para o webhook configurado.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className={compact ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 xl:grid-cols-3 gap-6'}>
          {/* Configuração do Lote */}
          <div className="xl:col-span-2 space-y-6">
            {/* Upload de Arquivos */}
            <div className="bg-white rounded-xl border border-[#e1e9f4] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#373753] mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#3057f2]" />
                Upload de Arquivos de Áudio
              </h2>

              <div className="space-y-4">
                {/* Upload de Arquivos */}
                <div 
                  className="border-2 border-dashed border-[#e1e9f4] rounded-lg p-8 text-center hover:border-[#3057f2] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileAudio className="w-12 h-12 text-[#677c92] mx-auto mb-4" />
                  <p className="text-[#373753] font-medium mb-2">
                    Clique para selecionar arquivos de áudio
                  </p>
                  <p className="text-[#677c92] text-sm">
                    Formatos suportados: MP3, WAV | Máx: 25MB por arquivo | Sem limite de quantidade
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Separador */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-[#e1e9f4]"></div>
                  <span className="px-4 text-[#677c92] text-sm">ou</span>
                  <div className="flex-1 border-t border-[#e1e9f4]"></div>
                </div>

                {/* Adicionar URL de Áudio */}
                <div className="space-y-3">
                  {!isAddingUrl ? (
                    <button
                      onClick={() => setIsAddingUrl(true)}
                      className="w-full border-2 border-dashed border-[#e1e9f4] rounded-lg p-4 text-center hover:border-[#3057f2] transition-colors text-[#373753] font-medium"
                    >
                      + Adicionar URL de Áudio
                    </button>
                  ) : (
                    <div className="border border-[#e1e9f4] rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#373753] mb-1">
                          URL do Áudio
                        </label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/audio.mp3"
                          value={newAudioUrl}
                          onChange={(e) => setNewAudioUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddAudioUrl}
                          className="px-4 py-2 bg-[#3057f2] text-white rounded-lg text-sm font-medium hover:bg-[#2a4fd8] transition-colors"
                        >
                          Adicionar
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingUrl(false);
                            setNewAudioUrl('');
                          }}
                          className="px-4 py-2 border border-[#e1e9f4] text-[#373753] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nome do Lote */}
              <div className="mt-6">
                <label className="block text-xs font-medium text-[#373753] mb-1">Nome do Lote (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Lote Julho/2025"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                />
              </div>

              {/* Lista de Arquivos */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-[#373753] mb-3">
                    Arquivos Selecionados ({files.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {files.map((batchFile, index) => (
                      <div key={index} className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FileAudio className="w-5 h-5 text-[#3057f2]" />
                            <div>
                              <p className="font-medium text-[#373753] text-sm">
                                {getFileName(batchFile)}
                              </p>
                              <p className="text-[#677c92] text-xs">
                                {getFileSize(batchFile)}
                              </p>
                              {batchFile.audioUrl && (
                                <p className="text-[#3057f2] text-xs truncate max-w-xs">
                                  {batchFile.audioUrl}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Informações do Cliente */}
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Nome do Cliente</label>
                            <input
                              type="text"
                              placeholder="Ex: João Silva"
                              value={batchFile.metadata.name || ''}
                              onChange={(e) => updateFileData(index, 'metadata.name', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Email do Cliente</label>
                            <input
                              type="email"
                              placeholder="Ex: joao@email.com"
                              value={batchFile.metadata.email || ''}
                              onChange={(e) => updateFileData(index, 'metadata.email', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Telefone do Cliente</label>
                            <input
                              type="text"
                              placeholder="Ex: (11) 99999-9999"
                              value={batchFile.metadata.phone || ''}
                              onChange={(e) => updateFileData(index, 'metadata.phone', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          {/* Informações da Empresa do Cliente */}
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Empresa do Cliente</label>
                            <input
                              type="text"
                              placeholder="Ex: Empresa LTDA"
                              value={batchFile.metadata.company || ''}
                              onChange={(e) => updateFileData(index, 'metadata.company', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Departamento</label>
                            <input
                              type="text"
                              placeholder="Ex: Suporte, Vendas, Financeiro"
                              value={batchFile.metadata.department || ''}
                              onChange={(e) => updateFileData(index, 'metadata.department', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          {/* Detalhes da Ligação */}
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Tipo de Ligação</label>
                            <input
                              type="text"
                              placeholder="Ex: Consulta, Reclamação, Suporte"
                              value={batchFile.metadata.callType || ''}
                              onChange={(e) => updateFileData(index, 'metadata.callType', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Prioridade</label>
                            <input
                              type="text"
                              placeholder="Ex: baixa, média, alta, crítica"
                              value={batchFile.metadata.priority || ''}
                              onChange={(e) => updateFileData(index, 'metadata.priority', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          {/* Informações Operacionais */}
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Campanha</label>
                            <input
                              type="text"
                              placeholder="Ex: Prospecção Q4"
                              value={batchFile.campaign}
                              onChange={(e) => updateFileData(index, 'campaign', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-[#373753] mb-1">Agente Responsável</label>
                            <input
                              type="text"
                              placeholder="Ex: Ana Costa"
                              value={batchFile.agent}
                              onChange={(e) => updateFileData(index, 'agent', e.target.value)}
                              className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Critérios de Avaliação */}
            <div className="bg-white rounded-xl border border-[#e1e9f4] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#373753] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#3057f2]" />
                Critérios de Avaliação
              </h2>

              {isLoadingCriteria ? (
                <div className="flex items-center gap-2 text-[#677c92]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Carregando critérios...
                </div>
              ) : availableCriteria.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#373753] mb-2">
                      Selecionar Critério de Avaliação *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCriteriaId}
                        onChange={(e) => setSelectedCriteriaId(e.target.value)}
                        className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3057f2] appearance-none bg-white"
                      >
                        <option value="">Selecione um critério...</option>
                        {availableCriteria.map((criterion) => (
                          <option key={criterion.id} value={criterion.id}>
                            {criterion.name} ({criterion.sub_criteria.length} subcritérios)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#677c92] pointer-events-none" />
                    </div>
                  </div>

                  {selectedCriteriaId && (
                    <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                      <h3 className="font-medium text-[#373753] mb-2">
                        Subcritérios que serão avaliados:
                      </h3>
                      <div className="space-y-2">
                        {availableCriteria
                          .find(c => c.id === selectedCriteriaId)?.sub_criteria
                          .map((subCriterion) => (
                            <div key={subCriterion.id} className="text-sm">
                              <span className="font-medium text-[#373753]">{subCriterion.name}:</span>
                              <span className="text-[#677c92] ml-1">{subCriterion.description}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[#677c92] mx-auto mb-4 opacity-50" />
                  <p className="text-[#677c92] mb-2">Nenhum critério encontrado</p>
                  <p className="text-[#677c92] text-sm">
                    Crie critérios de avaliação na aba "Critérios" primeiro
                  </p>
                </div>
              )}
            </div>

            {/* Configurações Avançadas */}
            <div className="bg-white rounded-xl border border-[#e1e9f4] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#373753] mb-4">
                Configurações Avançadas
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#373753] mb-2">
                  URL de Webhook (opcional)
                </label>
                <input
                  type="url"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  placeholder="https://webhook.site/your-unique-url"
                  className="w-full px-3 py-2 border border-[#e1e9f4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3057f2]"
                />
                <p className="text-[#677c92] text-xs mt-1">
                  Receba notificações em tempo real sobre o progresso da análise
                </p>
              </div>
            </div>

            {/* Botão de Iniciar */}
            <button
              onClick={startBatchAnalysis}
              disabled={files.length === 0 || isUploading}
              className="w-full bg-[#3057f2] text-white py-4 rounded-xl font-semibold hover:bg-[#2545d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Enviando Lote...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar Análise em Lote
                </>
              )}
            </button>
          </div>

          {/* Jobs Ativos */}
          {!compact && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e1e9f4] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#373753] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#3057f2]" />
                  Jobs Ativos
                </h2>
                <button
                  onClick={loadActiveJobs}
                  className="text-[#3057f2] hover:text-[#2545d9] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 text-sm">
                      <strong>Aviso:</strong> O monitoramento de jobs ainda usa o servidor local. 
                      Com a nova API Supabase Edge Function, o status pode não ser exibido corretamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeJobs.length === 0 ? (
                  <p className="text-[#677c92] text-center py-8">
                    Nenhum job ativo no momento
                  </p>
                ) : (
                  activeJobs.map((job) => (
                    <div key={job.jobId} className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium text-[#373753] text-sm">
                            {job.jobId.substring(0, 8)}...
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#677c92]">Progresso:</span>
                          <span className="text-[#373753]">{job.progress.current}/{job.progress.total}</span>
                        </div>
                        
                        <div className="w-full bg-[#e1e9f4] rounded-full h-2">
                          <div 
                            className="bg-[#3057f2] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress.percentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-[#677c92]">
                          <span>
                            {new Date(job.createdAt).toLocaleString('pt-BR')}
                          </span>
                          <button
                            onClick={() => loadJobDetails(job.jobId)}
                            className="text-[#3057f2] hover:text-[#2545d9] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Modal de Detalhes do Job */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-[#e1e9f4] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowJobDetails(false)}
                      className="text-[#677c92] hover:text-[#373753] transition-colors"
                    >
                      Voltar
                    </button>
                    <span className="text-xl font-semibold text-[#373753]">
                      {selectedJob?.metricsSummary?.criteriaGroupName || 'Análise'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Status e Progresso */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(selectedJob.status)}
                      <span className="font-medium text-[#373753]">Status</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                  </div>

                  <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#3057f2]" />
                      <span className="font-medium text-[#373753]">Progresso</span>
                    </div>
                    <div className="text-2xl font-bold text-[#373753]">
                      {selectedJob.progress.percentage}%
                    </div>
                    <div className="text-sm text-[#677c92]">
                      {selectedJob.progress.current} de {selectedJob.progress.total}
                    </div>
                  </div>

                  <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#3057f2]" />
                      <span className="font-medium text-[#373753]">Tempo Restante</span>
                    </div>
                    <div className="text-2xl font-bold text-[#373753]">
                      {selectedJob.estimatedTimeRemaining ? `${selectedJob.estimatedTimeRemaining}min` : '-'}
                    </div>
                  </div>
                </div>

                {/* Métricas (se disponível) */}
                {selectedJob.metricsSummary && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[#373753] mb-4">Métricas Finais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedJob.metricsSummary.averageOverallScore}
                        </div>
                        <div className="text-sm text-green-700">Score Médio Geral</div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedJob.metricsSummary.scoreDistribution.excellent}
                        </div>
                        <div className="text-sm text-blue-700">Excelentes (8.5+)</div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedJob.metricsSummary.scoreDistribution.good}
                        </div>
                        <div className="text-sm text-yellow-700">Bons (7.0-8.4)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Ligações */}
                <div>
                  <h4 className="text-lg font-semibold text-[#373753] mb-4">
                    Ligações ({selectedJob.calls.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedJob.calls.map((call) => (
                      <div key={call.id} className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileAudio className="w-4 h-4 text-[#3057f2]" />
                            <span className="font-medium text-[#373753] text-sm">
                              {call.filename}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(call.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                              {call.status}
                            </span>
                          </div>
                        </div>

                        {call.analysis && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            <div className="text-center">
                              <div className="text-lg font-bold text-[#3057f2]">
                                {call.analysis.overall_score}
                              </div>
                              <div className="text-xs text-[#677c92]">Score Geral</div>
                            </div>
                            {Object.entries(call.analysis.criteria_scores || {}).map(([criterion, score]) => (
                              <div key={criterion} className="text-center">
                                <div className="text-sm font-semibold text-[#373753]">
                                  {score as number}
                                </div>
                                <div className="text-xs text-[#677c92]">{criterion}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {call.error && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            {call.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
