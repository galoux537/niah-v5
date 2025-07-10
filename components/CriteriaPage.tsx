import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Plus, User, Building2, RefreshCw, AlertTriangle, Trash2, MoreVertical, CheckCircle, Database, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Criteria {
  id: string;
  name: string;
  total_calls: number;
  average_score: number;
  created_at: string;
  company_id: string;
}

interface CriteriaWithSubCount extends Criteria {
  subCriteriaCount: number;
}

interface CriteriaPageProps {
  onCriteriaClick: (criteriaId: string) => void;
  onCreateCriteria: () => void;
}

export function CriteriaPage({ onCriteriaClick, onCreateCriteria }: CriteriaPageProps) {
  const { companyId, company } = useAuth();
  
  // Verificação inicial de segurança
  if (!companyId || !company) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro de autenticação</h3>
          <p className="text-[#677c92] mb-4 text-sm">Dados da empresa não encontrados. Faça login novamente.</p>
        </div>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [criteria, setCriteria] = useState<CriteriaWithSubCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [criteriaToDelete, setCriteriaToDelete] = useState<CriteriaWithSubCount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [criteriaCallsCount, setCriteriaCallsCount] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (companyId) {
      loadCriteria();
    }
  }, [companyId]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Carregando critérios para empresa:', companyId, company?.name);

      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (criteriaError) {
        console.error('❌ Erro ao carregar critérios:', criteriaError);
        setError(`Erro ao carregar critérios: ${criteriaError.message}`);
        return;
      }

      const rawCriteriaList = criteriaData || [];
      
      // Validar e limpar dados do banco
      const criteriaList = rawCriteriaList.filter((criteria): criteria is Criteria => {
        if (!criteria) {
          console.warn('🚨 Critério nulo encontrado, ignorando');
          return false;
        }
        
        if (!criteria.id || typeof criteria.id !== 'string') {
          console.warn('🚨 Critério sem ID válido encontrado, ignorando:', criteria);
          return false;
        }
        
        if (!criteria.name || typeof criteria.name !== 'string') {
          console.warn('🚨 Critério sem nome válido encontrado, ignorando:', criteria);
          return false;
        }
        
        if (!criteria.company_id || typeof criteria.company_id !== 'string') {
          console.warn('🚨 Critério sem company_id válido encontrado, ignorando:', criteria);
          return false;
        }
        
        return true;
      });
      
      console.log(`✅ ${criteriaList.length} critérios válidos carregados para empresa ${company?.name}:`, criteriaList);

      const invalidCriteria = criteriaList.filter(criteria => criteria.company_id !== companyId);
      if (invalidCriteria.length > 0) {
        console.error('🚨 VIOLAÇÃO MULTITENANT CRÍTICA: Critérios de outras empresas retornados:', invalidCriteria);
        setError('ERRO DE SEGURANÇA: Dados de outras empresas detectados. Contate o administrador imediatamente.');
        return;
      }

      console.log('🛡️ Verificação multitenant OK - todos os critérios pertencem à empresa:', companyId);

      // Buscar subcritérios para cada critério
      const criteriaWithCounts: CriteriaWithSubCount[] = await Promise.all(
        criteriaList.map(async (crit) => {
          const { data: subData, error: subError } = await supabase
            .from('sub_criteria')
            .select('id')
            .eq('criteria_id', crit.id);
          return {
            ...crit,
            subCriteriaCount: subData ? subData.length : 0
          };
        })
      );
      setCriteria(criteriaWithCounts);

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar critérios:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriteria = async (criteria: CriteriaWithSubCount, retryCount = 0) => {
    if (!criteria || !companyId) {
      console.error('❌ Dados inválidos para exclusão:', { criteria, companyId });
      setError('Dados inválidos para exclusão do critério.');
      return;
    }

    if (criteria.company_id !== companyId) {
      console.error('🚨 TENTATIVA DE EXCLUSÃO CROSS-TENANT:', {
        criteriaCompany: criteria.company_id,
        userCompany: companyId,
        criteriaName: criteria.name
      });
      setError('ERRO DE SEGURANÇA: Tentativa de exclusão de critério de outra empresa.');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      console.log(`🗑️ [Tentativa ${retryCount + 1}] Iniciando exclusão FORÇADA do critério:`, {
        nome: criteria.name,
        id: criteria.id,
        empresa: company?.name,
        companyId: companyId,
        modo: 'FORÇA BRUTA - Remover tudo'
      });

      // PASSO 1: Verificar se o critério ainda existe
      console.log('🔍 Verificando se critério ainda existe...');
      const { data: criteriaExists, error: checkError } = await supabase
        .from('criteria')
        .select('id, name, company_id')
        .eq('id', criteria.id)
        .eq('company_id', companyId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('✅ Critério já foi excluído anteriormente:', criteria.name);
          setCriteria(prevCriteria => prevCriteria.filter(c => c.id !== criteria.id));
          setSuccessMessage(`Critério "${criteria.name}" já foi excluído.`);
          setDeleteDialogOpen(false);
          setCriteriaToDelete(null);
          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        } else {
          console.error('❌ Erro ao verificar existência do critério:', checkError);
          throw new Error(`Erro ao verificar critério: ${checkError.message}`);
        }
      }

      if (!criteriaExists) {
        console.log('✅ Critério não existe mais, removendo da lista local');
        setCriteria(prevCriteria => prevCriteria.filter(c => c.id !== criteria.id));
        setSuccessMessage(`Critério "${criteria.name}" já foi excluído.`);
        setDeleteDialogOpen(false);
        setCriteriaToDelete(null);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      console.log('✅ Critério existe, verificando e removendo TODAS as chamadas...');

      // PASSO 2: Buscar TODAS as chamadas do critério para excluir
      console.log('📞 Buscando TODAS as chamadas do critério para exclusão...');
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('id, phone_number, call_date, score')
        .eq('criteria_id', criteria.id)
        .eq('company_id', companyId);

      if (callsError) {
        console.error('❌ Erro ao buscar chamadas do critério:', callsError);
        throw new Error(`Erro ao buscar chamadas: ${callsError.message}`);
      }

      const callsCount = calls?.length || 0;
      console.log(`📊 Critério possui ${callsCount} chamadas que serão TODAS excluídas:`, calls);

      // PASSO 3: Excluir TODAS as chamadas primeiro (força bruta)
      if (calls && calls.length > 0) {
        console.log(`🗑️ EXCLUINDO TODAS as ${calls.length} chamadas do critério...`);
        
        const { error: deleteCallsError } = await supabase
          .from('calls')
          .delete()
          .eq('criteria_id', criteria.id)
          .eq('company_id', companyId);

        if (deleteCallsError) {
          console.error('❌ Erro ao excluir chamadas:', deleteCallsError);
          throw new Error(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
        }

        console.log(`✅ TODAS as ${calls.length} chamadas foram excluídas com sucesso`);
      } else {
        console.log('📞 Critério não possui chamadas para excluir');
      }

      // PASSO 4: Excluir o critério
      console.log('🗑️ Executando exclusão do critério...');
      const { error: deleteError, data: deleteResult } = await supabase
        .from('criteria')
        .delete()
        .eq('id', criteria.id)
        .eq('company_id', companyId)
        .select();

      if (deleteError) {
        console.error('❌ Erro ao excluir critério:', deleteError);
        
        if (deleteError.code === '23503') {
          console.log('🔍 Ainda há referências, investigando...');
          throw new Error('Erro de integridade: O critério ainda possui dados relacionados. Contate o suporte.');
        } else if (deleteError.code === '42501') {
          throw new Error('Erro de permissão: Não autorizado a excluir este critério.');
        } else {
          throw new Error(`Erro ao excluir critério: ${deleteError.message} (Código: ${deleteError.code})`);
        }
      }

      console.log('🎉 Exclusão do critério executada com sucesso:', deleteResult);

      // SUCESSO TOTAL
      const deletionMessage = callsCount > 0 
        ? `Critério "${criteria.name}" e suas ${callsCount} chamadas foram excluídos com sucesso!`
        : `Critério "${criteria.name}" excluído com sucesso!`;
      
      console.log('🎉 EXCLUSÃO COMPLETA COM SUCESSO:', {
        criterio: criteria.name,
        chamadas_removidas: callsCount,
        modo: 'FORÇA BRUTA'
      });
      
      setError(null);
      setSuccessMessage(deletionMessage);
      setCriteria(prevCriteria => prevCriteria.filter(c => c.id !== criteria.id));
      setDeleteDialogOpen(false);
      setCriteriaToDelete(null);
      setCriteriaCallsCount(0);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err) {
      console.error(`💥 Erro na tentativa ${retryCount + 1} de exclusão:`, err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na exclusão';
      
      // Retry automático em caso de erro de timeout ou conexão
      if (retryCount < 2 && (
        errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection')
      )) {
        console.log(`🔄 Tentando novamente em 2 segundos... (tentativa ${retryCount + 2}/3)`);
        setTimeout(() => {
          handleDeleteCriteria(criteria, retryCount + 1);
        }, 2000);
        return;
      }

      // Erro definitivo
      setError(`Erro ao excluir critério: ${errorMessage}`);
      
      if (retryCount >= 1) {
        setError(
          `Erro ao excluir critério: ${errorMessage}. ` +
          `Tente atualizar a página ou contate o suporte se o problema persistir.`
        );
      }
      
    } finally {
      setDeleting(false);
    }
  };

  const handleCleanupExampleData = async () => {
    if (!companyId || !company) {
      setError('Dados da empresa não encontrados');
      return;
    }

    try {
      setCleaningUp(true);
      setError(null);

      console.log('🧹 Iniciando limpeza de dados de exemplo para:', company.name);

      // Buscar todos os critérios de exemplo
      const exampleCriteria = criteria.filter((c) => c.name.toLowerCase().includes('exemplo'));
      console.log('🎭 Critérios de exemplo encontrados:', exampleCriteria.map(c => c.name));

      if (exampleCriteria.length === 0) {
        setSuccessMessage('Nenhum dado de exemplo encontrado para limpar.');
        setCleanupDialogOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Primeiro, excluir todas as chamadas dos critérios de exemplo
      const exampleCriteriaIds = exampleCriteria.map(c => c.id);
      
      console.log('📞 Excluindo chamadas dos critérios de exemplo...');
      const { error: deleteCallsError } = await supabase
        .from('calls')
        .delete()
        .in('criteria_id', exampleCriteriaIds)
        .eq('company_id', companyId);

      if (deleteCallsError) {
        console.error('❌ Erro ao excluir chamadas de exemplo:', deleteCallsError);
        throw new Error(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
      }

      // Depois, excluir os critérios de exemplo
      console.log('🎯 Excluindo critérios de exemplo...');
      const { error: deleteCriteriaError } = await supabase
        .from('criteria')
        .delete()
        .in('id', exampleCriteriaIds)
        .eq('company_id', companyId);

      if (deleteCriteriaError) {
        console.error('❌ Erro ao excluir critérios de exemplo:', deleteCriteriaError);
        throw new Error(`Erro ao excluir critérios: ${deleteCriteriaError.message}`);
      }

      console.log('✅ Limpeza concluída com sucesso');
      
      setSuccessMessage(`${exampleCriteria.length} critérios de exemplo e suas chamadas foram removidos com sucesso!`);
      setCleanupDialogOpen(false);
      
      // Recarregar a lista de critérios
      await loadCriteria();
      
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      console.error('💥 Erro na limpeza de dados de exemplo:', err);
      setError(`Erro ao limpar dados de exemplo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setCleaningUp(false);
    }
  };

  const openDeleteDialog = async (criteria: CriteriaWithSubCount) => {
    setError(null);
    setCriteriaToDelete(criteria);
    
    // Buscar número de chamadas para mostrar no diálogo
    try {
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('id')
        .eq('criteria_id', criteria.id)
        .eq('company_id', companyId);

      if (!callsError && calls) {
        setCriteriaCallsCount(calls.length);
      } else {
        setCriteriaCallsCount(0);
      }
    } catch (err) {
      console.error('Erro ao contar chamadas:', err);
      setCriteriaCallsCount(0);
    }
    
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCriteriaToDelete(null);
    setError(null);
    setCriteriaCallsCount(0);
  };

  const filteredCriteria = criteria.filter(criteria =>
    criteria && criteria.name && typeof criteria.name === 'string' && 
    criteria.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRetry = async () => {
    console.log('🔄 Tentando recarregar critérios...');
    await loadCriteria();
  };

  // Função para criar critério
  const handleCreateCriteria = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCriteriaName.trim()) {
      setCreateError('Nome do critério é obrigatório');
      return;
    }
    if (!companyId) {
      setCreateError('Dados da empresa não encontrados');
      return;
    }
    try {
      setCreateLoading(true);
      setCreateError(null);
      const { error } = await supabase
        .from('criteria')
        .insert([
          {
            name: newCriteriaName.trim(),
            company_id: companyId,
            total_calls: 0,
            average_score: 0.0
          }
        ]);
      if (error) {
        setCreateError(error.message);
        return;
      }
      setShowCreateModal(false);
      setNewCriteriaName('');
      await loadCriteria();
    } catch (err) {
      setCreateError('Erro inesperado ao criar critério.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Fechar modal ao clicar fora
  const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      setShowCreateModal(false);
      setCreateError(null);
      setNewCriteriaName('');
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando critérios da empresa {company?.name}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !criteria.length) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar critérios</h3>
          <p className="text-[#677c92] mb-4 text-sm">{error}</p>
          {error.includes('SEGURANÇA') && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3 mb-4 text-left">
              <p className="text-[#dc2f1c] text-xs">
                <strong>ALERTA CRÍTICO:</strong> Detectada violação de isolamento entre empresas. 
                Este é um problema grave de segurança que requer atenção imediata do administrador do sistema.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="w-full bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Tentar Novamente
            </button>
            <button
              onClick={onCreateCriteria}
              className="w-full bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Criar Primeiro Critério
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="px-6 space-y-6">
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-[#677c92] mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{company?.name}</span>
          </div>
          <p className="text-xs text-[#677c92]">Critérios de {company?.name}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#f0f4fa] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-[#677c92]" />
            </div>
            <h3 className="text-xl font-semibold text-[#373753] mb-4">
              Nenhum critério cadastrado
            </h3>
            <p className="text-[#677c92] mb-6 max-w-md mx-auto">
              Para começar a avaliar chamadas, você precisa adicionar critérios à sua empresa {company?.name}.
            </p>
            <Button
              onClick={onCreateCriteria}
              className="bg-[#3057f2] text-white px-6 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto hover:bg-[#2545d9] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar primeiro critério
            </Button>
            
            <div className="mt-8 p-4 bg-[#f0f4fa] rounded-lg border border-[#e1e9f4] text-left max-w-md mx-auto">
              <h4 className="font-medium text-[#373753] mb-2">O que são critérios?</h4>
              <p className="text-sm text-[#677c92]">
                Critérios são os parâmetros que serão utilizados para avaliar as chamadas da sua equipe na plataforma NIAH.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6">
      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#16a34a] flex-shrink-0" />
            <div>
              <p className="text-[#16a34a] font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && criteria.length > 0 && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#dc2f1c] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[#dc2f1c] font-medium mb-1">Erro na exclusão</p>
              <p className="text-[#dc2f1c] text-sm">{error}</p>
              {error.includes('atualizar a página') && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-[#3057f2] text-sm hover:underline"
                >
                  Atualizar página
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        <div className="flex items-center justify-between py-3 pl-6 pr-3 border-b border-[#e1e9f4]">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-[#677c92]" />
            <Input
              placeholder="Pesquisar critérios"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none shadow-none bg-transparent p-0 h-auto focus-visible:ring-0 text-[#677c92]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#e1e9f4] text-[#677c92] hover:bg-[#d1d9e4] border-none h-8 px-4 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Novo critério</span>
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={onCreateCriteria}
              className="bg-[#e1e9f4] h-[72px] rounded-lg shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] cursor-pointer hover:bg-[#d1d9e4] transition-colors"
            >
              <div className="flex items-center justify-between h-full px-4">
                <span className="text-[#3057f2] font-medium">
                  Adicionar novo critério
                </span>
                <Plus className="h-5 w-5 text-[#3057f2]" />
              </div>
            </div>

            {filteredCriteria.map((criteria) => (
              <div
                key={criteria.id}
                className="bg-white h-[72px] rounded-lg border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] hover:shadow-md transition-shadow group relative"
              >
                <div className="flex items-center justify-between h-full px-4">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => onCriteriaClick(criteria.id)}
                  >
                    <div className="w-8 h-8 bg-[#c9f2cd] rounded-md flex items-center justify-center">
                      <User className="h-5 w-5 text-[#015901]" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="text-[#373753] font-medium text-sm truncate">
                        {criteria.name}
                      </div>
                      <div className="text-[#677c92] text-xs truncate">
                        {criteria.subCriteriaCount === 1 ? '1 subcritério' : `${criteria.subCriteriaCount} subcritérios`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div 
                      className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onCriteriaClick(criteria.id)}
                    >
                      <svg className="h-5 w-5 text-[#677c92] hover:text-[#3057f2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#677c92] hover:text-[#373753] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onCriteriaClick(criteria.id)}
                          className="cursor-pointer"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(criteria)}
                          className="cursor-pointer text-[#dc2f1c] hover:text-[#dc2f1c] hover:bg-[#fef2f2]"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredCriteria.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-[#677c92]" />
              </div>
              <h3 className="text-lg font-medium text-[#373753] mb-2">
                Nenhum critério encontrado
              </h3>
              <p className="text-[#677c92] text-sm mb-4">
                Não encontramos critérios com "{searchQuery}" na empresa {company?.name}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#3057f2] text-sm hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}


        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#dc2f1c]" />
              Exclusão Completa do Critério
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem certeza que deseja excluir <strong>PERMANENTEMENTE</strong> o critério <strong>{criteriaToDelete?.name}</strong>?
              </p>
              
              {criteriaCallsCount > 0 && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3">
                  <p className="text-[#dc2f1c] text-sm">
                    <strong>⚠️ ATENÇÃO:</strong> Este critério possui <strong>{criteriaCallsCount} chamada{criteriaCallsCount > 1 ? 's' : ''}</strong> registrada{criteriaCallsCount > 1 ? 's' : ''}. 
                  </p>
                  <p className="text-[#dc2f1c] text-sm mt-1">
                    <strong>TODAS essas chamadas também serão excluídas permanentemente.</strong>
                  </p>
                </div>
              )}
              
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-3">
                <p className="text-[#677c92] text-sm">
                  <strong>🗑️ O que será removido:</strong>
                </p>
                <ul className="text-[#677c92] text-sm mt-1 space-y-1">
                  <li>• O critério {criteriaToDelete?.name}</li>
                  {criteriaCallsCount > 0 && <li>• {criteriaCallsCount} chamada{criteriaCallsCount > 1 ? 's' : ''} registrada{criteriaCallsCount > 1 ? 's' : ''}</li>}
                  <li>• Todos os dados relacionados</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#dc2f1c]">
                <strong>Esta ação não pode ser desfeita.</strong> O critério será permanentemente removido da empresa {company?.name}.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={closeDeleteDialog}
              disabled={deleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => criteriaToDelete && handleDeleteCriteria(criteriaToDelete)}
              disabled={deleting}
              className="bg-[#dc2f1c] hover:bg-[#b91c1c]"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {criteriaCallsCount > 0 ? 'Excluindo tudo...' : 'Excluindo...'}
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {criteriaCallsCount > 0 ? `Excluir Critério + ${criteriaCallsCount} Chamadas` : 'Excluir Critério'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de limpeza de dados de exemplo */}
      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#e67c0b]" />
              Limpar Todos os Dados de Exemplo
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Esta ação irá remover <strong>todos os {criteria.length} critérios</strong> e suas respectivas chamadas da empresa {company?.name}.
              </p>
              
              <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-3">
                <p className="text-[#b86309] text-sm">
                  <strong>📝 O que será removido:</strong>
                </p>
                <ul className="text-[#b86309] text-sm mt-2 space-y-1">
                  <li>• {criteria.length} critérios</li>
                  <li>• Todas as chamadas associadas a eles</li>
                  <li>• Estatísticas das listas serão zeradas</li>
                </ul>
              </div>
              
              <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-3">
                <p className="text-[#16a34a] text-sm">
                  <strong>✅ O que será mantido:</strong>
                </p>
                <ul className="text-[#16a34a] text-sm mt-2 space-y-1">
                  <li>• Critérios criados manualmente</li>
                  <li>• Listas de avaliação</li>
                  <li>• Configurações da empresa</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#dc2f1c]">
                <strong>Esta ação não pode ser desfeita.</strong> Após a limpeza, você poderá criar novos dados de exemplo criando uma nova lista.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setCleanupDialogOpen(false)}
              disabled={cleaningUp}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupExampleData}
              disabled={cleaningUp}
              className="bg-[#e67c0b] hover:bg-[#d97706]"
            >
              {cleaningUp ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Limpando...
                </div>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Limpar {criteria.length} Critérios
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de criação de critério */}
      {showCreateModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={handleModalOverlayClick}
        >
          <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-lg w-full max-w-md mx-auto p-8 relative">
            <button
              className="absolute top-4 right-4 text-[#677c92] hover:text-[#373753]"
              onClick={() => setShowCreateModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <div className="text-[#677c92] text-xs uppercase tracking-wide mb-1">CRITÉRIOS</div>
              <div className="text-[#373753] text-xl font-medium">Novo Critério</div>
            </div>
            <form onSubmit={handleCreateCriteria} className="space-y-6">
              <div>
                <label htmlFor="new-criteria-name" className="block text-sm font-medium text-[#373753] mb-2">
                  Nome do critério <span className="text-red-500">*</span>
                </label>
                <Input
                  id="new-criteria-name"
                  value={newCriteriaName}
                  onChange={e => setNewCriteriaName(e.target.value)}
                  placeholder="Ex: Cordialidade, Objetividade, Tempo de resposta..."
                  className="w-full"
                  required
                  disabled={createLoading}
                />
              </div>
              {createError && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3 text-[#dc2f1c] text-sm">
                  {createError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={createLoading || !newCriteriaName.trim()}
                  className="bg-[#3057f2] text-white hover:bg-[#2545d9] rounded-lg h-10 text-base font-medium shadow-none flex-1"
                >
                  {createLoading ? 'Salvando...' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#677c92] hover:text-[#373753] rounded-lg h-10 text-base flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
