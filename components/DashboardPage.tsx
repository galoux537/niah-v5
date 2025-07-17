import React, { useState, useEffect } from 'react';
import { ThumbsUp, AlertTriangle, Search, ChevronLeft, ChevronRight, Building2, Trash2, MoreVertical, Phone } from 'lucide-react';
import { StatusBarTooltip } from './StatusBarTooltip';
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
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DashboardPageProps {
  onListClick: (listId: string, listName: string) => void;
}

interface EvaluationList {
  id: string;
  name: string;
  average_score: number | null;
  total_calls: number;
  created_at: string;
}

interface DashboardData {
  companyAverage: string;
  callsInAttention: number;
  totalCalls: number;
  performance: {
    good: number;
    neutral: number;
    bad: number;
  };
  lists: Array<{
    id: string;
    name: string;
    average: string;
    hasAttention: boolean;
    totalCalls: number;
    failedCalls: number;
    performance: {
      good: number;
      neutral: number;
      bad: number;
    };
  }>;
}

export function DashboardPage({ onListClick }: DashboardPageProps) {
  const { companyId, company } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Função para truncar texto com reticências
  const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Função para limpar o nome da lista removendo "Análise"
  const cleanListName = (name: string): string => {
    return name.replace(/^Análise\s+/i, '').trim();
  };

  // Função para determinar a cor da nota baseada nas regras
  const getScoreColor = (score: number): string => {
    if (score >= 7) {
      return 'text-[#059669]'; // Verde para notas 7.0-10.0
    } else if (score >= 4) {
      return 'text-[#d97706]'; // Amarelo para notas 4.0-6.9
    } else {
      return 'text-[#dc2626]'; // Vermelho para notas 0.0-3.9
    }
  };

  useEffect(() => {
    if (companyId) {
      loadDashboardData();
    }
  }, [companyId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Carregando dados do dashboard para empresa:', companyId);

      // Buscar listas de avaliação da empresa
      const { data: listsData, error: listsError } = await supabase
        .from('evaluation_lists')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (listsError) {
        console.error('❌ Erro ao carregar listas:', listsError);
        // Não vamos mostrar erro, apenas dados vazios
      }

      const lists = listsData || [];
      console.log('✅ Listas carregadas:', lists.length);

      // Se não há listas, mostrar dashboard vazio
      if (lists.length === 0) {
        setData({
          companyAverage: '0.0',
          callsInAttention: 0,
          totalCalls: 0,
          performance: {
            good: 0,
            neutral: 0,
            bad: 0
          },
          lists: []
        });
        setLoading(false);
        return;
      }

      // Buscar todas as chamadas das listas para calcular performance real
      const listIds = lists.map(list => list.id);
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('id, evaluation_list_id, overall_score')
        .in('evaluation_list_id', listIds)
        .eq('company_id', companyId);

      if (callsError) {
        console.error('❌ Erro ao carregar chamadas:', callsError);
      }

      const calls = callsData || [];
      console.log('✅ Chamadas carregadas:', calls.length);

      // Processar dados das listas com performance real
      const processedLists = lists.map(list => {
        // Buscar chamadas específicas desta lista (geralmente só sucessos)
        const listCalls = calls.filter(call => call.evaluation_list_id === list.id);

        // Falhas são ligações onde overall_score é nulo OU status=failed (registradas em outra tabela)
        const failedCalls = listCalls.filter(call => call.overall_score === null).length;

        // Sucessos registrados no campo total_calls da evaluation_list (ou quantidade de listCalls com score válido)
        const successfulCalls = list.total_calls || listCalls.filter(call => call.overall_score !== null).length;

        const totalCalls = successfulCalls + failedCalls;
        
        // Calcular média real das chamadas (igual à tela interna)
        let avgScore = 0;
        if (listCalls.length > 0) {
          const totalScore = listCalls.reduce((sum, call) => sum + (call.overall_score || 0), 0);
          avgScore = totalScore / listCalls.length;
        } else {
          // Se não há chamadas, usar o valor da tabela como fallback
          avgScore = list.average_score || 0;
        }
        
        // Calcular performance real baseada nos scores das chamadas
        let good = 0, neutral = 0, bad = 0;
        
        if (listCalls.length > 0) {
          listCalls.forEach(call => {
            const score = call.overall_score || 0;
            if (score >= 7) {
              good++;
            } else if (score >= 4) {
              neutral++;
            } else {
              bad++;
            }
          });
          
          // Converter para porcentagens
          const total = listCalls.length;
          good = Math.round((good / total) * 100);
          neutral = Math.round((neutral / total) * 100);
          bad = 100 - good - neutral; // Garantir que soma seja 100%
        } else {
          // Se não há chamadas, usar valores baseados na média da lista
          if (avgScore >= 7) {
            good = 75;
            neutral = 20;
            bad = 5;
          } else if (avgScore >= 4) {
            good = 50;
            neutral = 35;
            bad = 15;
          } else {
            good = 25;
            neutral = 35;
            bad = 40;
          }
        }

        return {
          id: list.id,
          name: list.name,
          average: avgScore.toFixed(1),
          hasAttention: avgScore < 4,
          totalCalls: totalCalls,
          failedCalls: failedCalls,
          performance: { good, neutral, bad }
        };
      });

      // Calcular métricas gerais
      const totalCalls = processedLists.reduce((sum, list) => sum + list.totalCalls, 0);
      const avgScores = processedLists.filter(list => parseFloat(list.average) > 0);
      const companyAverage = avgScores.length > 0 
        ? (avgScores.reduce((sum, list) => sum + parseFloat(list.average), 0) / avgScores.length).toFixed(1)
        : '0.0';
      
      // Calcular ligações em atenção (notas entre 4.0 e 6.9)
      const callsInAttention = calls.filter(call => {
        const score = call.overall_score || 0;
        return score >= 4 && score < 7;
      }).length;

      // Calcular performance geral baseada em dados reais
      let globalGood = 0, globalNeutral = 0, globalBad = 0;
      
      if (calls.length > 0) {
        calls.forEach(call => {
          const score = call.overall_score || 0;
          if (score >= 7) {
            globalGood++;
          } else if (score >= 4) {
            globalNeutral++;
          } else {
            globalBad++;
          }
        });
        
        // Converter para porcentagens
        const totalCallsWithScores = calls.length;
        globalGood = Math.round((globalGood / totalCallsWithScores) * 100);
        globalNeutral = Math.round((globalNeutral / totalCallsWithScores) * 100);
        globalBad = 100 - globalGood - globalNeutral; // Garantir que soma seja 100%
      } else {
        // Fallback se não há dados
        globalGood = 0;
        globalNeutral = 0;
        globalBad = 0;
      }

      setData({
        companyAverage,
        callsInAttention,
        totalCalls,
        performance: {
          good: globalGood,
          neutral: globalNeutral,
          bad: globalBad
        },
        lists: processedLists
      });

    } catch (err) {
      console.error('💥 Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      
      // Fallback para dados vazios
      setData({
        companyAverage: '0.0',
        callsInAttention: 0,
        totalCalls: 0,
        performance: {
          good: 0,
          neutral: 0,
          bad: 0
        },
        lists: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!listId || !companyId) {
      console.error('❌ Dados inválidos para exclusão da lista:', { listId, companyId });
      setError('Dados inválidos para exclusão da lista.');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      console.log('🗑️ Iniciando exclusão da lista:', { id: listId, name: listName, company: company?.name });

      // PASSO 1: Buscar todos os critérios desta lista
      console.log('🎯 Buscando critérios da lista...');
      const { data: criteria, error: criteriaError } = await supabase
        .from('criteria')
        .select('id, name')
        .eq('evaluation_list_id', listId)
        .eq('company_id', companyId);

      if (criteriaError) {
        console.error('❌ Erro ao buscar critérios da lista:', criteriaError);
        throw new Error(`Erro ao buscar critérios: ${criteriaError.message}`);
      }

      const criteriaList = criteria || [];
      console.log(`📊 Lista possui ${criteriaList.length} critérios que serão excluídos:`, criteriaList.map(c => c.name));

      // PASSO 2: Buscar e excluir todas as chamadas dos critérios desta lista
      if (criteriaList.length > 0) {
        const criteriaIds = criteriaList.map(c => c.id);
        
        console.log('📞 Buscando chamadas dos critérios da lista...');
        const { data: calls, error: callsSearchError } = await supabase
          .from('calls')
          .select('id')
          .in('criteria_id', criteriaIds)
          .eq('company_id', companyId);

        if (callsSearchError) {
          console.error('❌ Erro ao buscar chamadas:', callsSearchError);
          throw new Error(`Erro ao buscar chamadas: ${callsSearchError.message}`);
        }

        const callsCount = calls?.length || 0;
        console.log(`📞 Encontradas ${callsCount} chamadas para exclusão`);

        if (callsCount > 0) {
          console.log('🗑️ Excluindo todas as chamadas dos critérios...');
          const { error: deleteCallsError } = await supabase
            .from('calls')
            .delete()
            .in('criteria_id', criteriaIds)
            .eq('company_id', companyId);

          if (deleteCallsError) {
            console.error('❌ Erro ao excluir chamadas:', deleteCallsError);
            throw new Error(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
          }

          console.log(`✅ ${callsCount} chamadas excluídas com sucesso`);
        }

        // PASSO 3: Excluir todos os critérios da lista
        console.log('🎯 Excluindo critérios da lista...');
        const { error: deleteCriteriaError } = await supabase
          .from('criteria')
          .delete()
          .eq('evaluation_list_id', listId)
          .eq('company_id', companyId);

        if (deleteCriteriaError) {
          console.error('❌ Erro ao excluir critérios:', deleteCriteriaError);
          throw new Error(`Erro ao excluir critérios: ${deleteCriteriaError.message}`);
        }

        console.log(`✅ ${criteriaList.length} critérios excluídos com sucesso`);
      }

      // PASSO 4: Excluir a lista de avaliação
      console.log('📋 Excluindo lista de avaliação...');
      const { error: deleteListError } = await supabase
        .from('evaluation_lists')
        .delete()
        .eq('id', listId)
        .eq('company_id', companyId);

      if (deleteListError) {
        console.error('❌ Erro ao excluir lista:', deleteListError);
        throw new Error(`Erro ao excluir lista: ${deleteListError.message}`);
      }

      console.log('✅ Lista excluída com sucesso, recarregando dados...');
      
      // Recarregar dados do dashboard para garantir precisão
      await loadDashboardData();

      const deletionMessage = criteriaList.length > 0 
        ? `Lista "${listName}" e seus ${criteriaList.length} critérios foram excluídos com sucesso!`
        : `Lista "${listName}" excluída com sucesso!`;

      setSuccessMessage(deletionMessage);
      setDeleteDialogOpen(false);
      setListToDelete(null);

      console.log('🎉 EXCLUSÃO COMPLETA DA LISTA COM SUCESSO:', {
        lista: listName,
        criterios_removidos: criteriaList.length
      });

      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      console.error('💥 Erro na exclusão da lista:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na exclusão';
      setError(`Erro ao excluir lista: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (listId: string, listName: string) => {
    setListToDelete({ id: listId, name: listName });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setListToDelete(null);
    setError(null);
  };

  // Função para filtrar listas baseada no termo de pesquisa
  const filteredLists = data?.lists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Reset página quando muda o termo de pesquisa
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredLists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLists = filteredLists.slice(startIndex, endIndex);

  // Função para ir para página específica
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Função para página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Função para próxima página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Gerar números das páginas para mostrar
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#677c92]">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar dados</h3>
          <p className="text-[#677c92] mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-[#677c92]">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  // Estado vazio - empresa nova sem dados
  if (data.lists.length === 0) {
    return (
      <div className="px-6 pb-6 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[#16a34a] font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Section - Estado Vazio */}
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f0f4fa] rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-[#677c92]" />
              </div>
              <div>
                <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                  Média da empresa
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#677c92] text-lg leading-6 font-medium">0.0</span>
                  <span className="text-[#677c92] text-base leading-6">/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f0f4fa] rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#677c92]" />
              </div>
              <div>
                <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                  Ligações em atenção
                </div>
                <div className="text-[#677c92] text-lg leading-6 font-medium">0</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] py-4 px-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[#677c92] text-base font-semibold">0%</div>
                  <div className="text-[#677c92] text-xs uppercase">Bom</div>
                </div>
                <div className="text-center">
                  <div className="text-[#677c92] text-base font-semibold">0%</div>
                  <div className="text-[#677c92] text-xs uppercase">Neutro</div>
                </div>
                <div className="text-right">
                  <div className="text-[#677c92] text-base font-semibold">0%</div>
                  <div className="text-[#677c92] text-xs uppercase">Ruim</div>
                </div>
              </div>
              <div className="h-2 bg-[#f0f4fa] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Estado Vazio - Primeira utilização */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#f0f4fa] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-[#677c92]" />
            </div>
            <h3 className="text-xl font-semibold text-[#373753] mb-4">
              Bem-vindo à NIAH!
            </h3>
            <p className="text-[#677c92] mb-6 max-w-md mx-auto">
              Sua empresa foi criada com sucesso! As avaliações aparecerão aqui conforme forem processadas pela API.
            </p>
            
            <div className="mt-8 p-4 bg-[#f0f4fa] rounded-lg border border-[#e1e9f4] text-left max-w-md mx-auto">
              <h4 className="font-medium text-[#373753] mb-2">Próximos passos:</h4>
              <ul className="text-sm text-[#677c92] space-y-1">
                <li>• Configurar critérios de avaliação</li>
                <li>• Usar a API para processar áudios</li>
                <li>• Acompanhar resultados na dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard com dados reais
  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[#16a34a] font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Company Average */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#c9f2cd] rounded-lg flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-[#015901]" />
            </div>
            <div>
              <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                Média da empresa
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`${getScoreColor(parseFloat(data.companyAverage))} text-lg leading-6 font-medium`}>{data.companyAverage}</span>
                <span className="text-[#677c92] text-base leading-6">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calls in Attention */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#fff6bf] rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[#b86309]" />
            </div>
            <div>
              <div className="text-[#677c92] text-xs uppercase tracking-wide leading-4 mb-1">
                Ligações em atenção
              </div>
              <div className="text-[#373753] text-lg leading-6 font-medium">{data.callsInAttention}</div>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] py-4 px-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[#006c17] text-base font-semibold">{data.performance.good}%</div>
                <div className="text-[#677c92] text-xs uppercase">Bom</div>
              </div>
              <div className="text-center">
                <div className="text-[#e67c0b] text-base font-semibold">{data.performance.neutral}%</div>
                <div className="text-[#677c92] text-xs uppercase">Neutro</div>
              </div>
              <div className="text-right">
                <div className="text-[#dc2f1c] text-base font-semibold">{data.performance.bad}%</div>
                <div className="text-[#677c92] text-xs uppercase">Ruim</div>
              </div>
            </div>
            {/* Progress Bar with Tooltip */}
            <StatusBarTooltip
              performance={data.performance}
              totalCalls={data.totalCalls}
            >
              <div className="flex h-2 rounded-full overflow-hidden cursor-help">
                <div 
                  className="bg-[#5cb868] rounded-l-full" 
                  style={{ width: `${data.performance.good}%` }}
                ></div>
                <div 
                  className="bg-[#ffbd00]" 
                  style={{ width: `${data.performance.neutral}%` }}
                ></div>
                <div 
                  className="bg-[#dc2f1c] rounded-r-full" 
                  style={{ width: `${data.performance.bad}%` }}
                ></div>
              </div>
            </StatusBarTooltip>
          </div>
        </div>
      </div>

      {/* Lists Table */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] relative">
        {/* Search and Actions */}
        <div className="flex items-center justify-between py-4 px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="h-4 w-4 text-[#677c92]" />
            <Input
              type="text"
              placeholder="Pesquisar listas por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent px-0 text-[#373753] placeholder:text-[#677c92] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Tabela com scroll horizontal */}
        <div className="relative">
        {/* Table Header */}
          <div className="bg-[#f0f4fa] border-t border-[#e1e9f4] px-4 md:px-6 py-3 min-w-[800px] relative z-50">
          <div className="flex items-center justify-between text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-32 md:w-64 flex-shrink-0">Nome da lista</div>
              <div className="w-[108px] text-center flex-shrink-0">Média de notas</div>
              <div className="w-[280px] text-center flex-shrink-0">Performance</div>
              <div className="w-32 text-center flex-shrink-0">Ligações com falha</div>
              <div className="w-32 text-center flex-shrink-0">Total de ligações</div>
              <div className="w-12 flex-shrink-0"></div>
          </div>
        </div>

        {/* Table Rows */}
          <div className="min-w-[800px] overflow-x-auto">
          {paginatedLists.length > 0 ? (
            paginatedLists.map((list) => (
              <div 
                key={list.id}
                  className="border-b border-[#e1e9f4] px-4 md:px-6 py-2 hover:bg-gray-50 group relative cursor-pointer"
                onClick={() => onListClick(list.id, list.name)}
              >
                <div className="flex items-center justify-between relative z-5">
                    <div className="w-32 md:w-64 flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#373753] text-sm md:text-base whitespace-nowrap truncate" title={cleanListName(list.name)}>
                        {truncateText(cleanListName(list.name), window.innerWidth < 768 ? 24 : 48)}
                    </span>
                    {list.hasAttention && (
                      <div className="relative group/tooltip pointer-events-auto">
                        <AlertTriangle className="h-4 w-4 text-[#e67c0b] flex-shrink-0 cursor-help relative z-25" />
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-white border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.1)] rounded-lg text-sm text-[#373753] whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[99999]">
                          Contém ligação com nota inferior a 4.0
                        </div>
                      </div>
                    )}
                  </div>
                    <div className="w-[108px] text-center flex-shrink-0">
                    <span className={`${getScoreColor(parseFloat(list.average))} text-base font-medium`}>
                      {list.average}
                    </span>
                    <span className="text-[#677c92] text-base">/10</span>
                  </div>
                    <div className="w-[280px] px-1.5 relative z-15 pointer-events-auto flex-shrink-0">
                    <StatusBarTooltip
                      performance={list.performance}
                      totalCalls={list.totalCalls}
                    >
                      <div className="flex h-2 rounded-full overflow-hidden cursor-help">
                        <div 
                          className="bg-[#5cb868] rounded-l-full" 
                          style={{ width: `${list.performance.good}%` }}
                        ></div>
                        <div 
                          className="bg-[#ffbd00]" 
                          style={{ width: `${list.performance.neutral}%` }}
                        ></div>
                        <div 
                          className="bg-[#dc2f1c] rounded-r-full" 
                          style={{ width: `${list.performance.bad}%` }}
                        ></div>
                      </div>
                    </StatusBarTooltip>
                  </div>
                    <div className="w-32 text-center text-[#677c92] text-base flex-shrink-0">
                    {list.failedCalls}
                  </div>
                    <div className="w-32 text-center text-[#677c92] text-base flex-shrink-0">
                    {list.totalCalls}
                  </div>
                    <div className="w-12 flex justify-center relative z-25 pointer-events-auto flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0 text-[#677c92] hover:text-[#373753] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(list.id, list.name);
                          }}
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
            ))
          ) : (
              <div className="px-4 md:px-6 py-8 text-center">
              <div className="text-[#677c92] text-base">
                {searchTerm ? (
                  <>
                    Nenhuma lista encontrada para "{searchTerm}"
                    <br />
                    <span className="text-sm">Tente usar palavras diferentes ou remover filtros</span>
                  </>
                ) : filteredLists.length === 0 ? (
                  'Nenhuma lista encontrada'
                ) : (
                  'Nenhuma lista nesta página'
                )}
              </div>
            </div>
          )}
        </div>
              </div>

        {/* Pagination */}
        {filteredLists.length > 0 && (
          <div className="border-t border-[#e1e9f4] px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Botão Anterior - Lado Esquerdo */}
              <div className="flex-shrink-0">
                {totalPages > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                ) : (
                  <div className="w-[88px]"></div>
                )}
              </div>

              {/* Páginas Numeradas e Informações - Centro */}
              <div className="flex items-center gap-4">
                {/* Números das páginas */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {generatePageNumbers().map((page, index) => (
                      <React.Fragment key={index}>
                        {page === '...' ? (
                          <span className="px-2 py-1 text-[#677c92] text-sm">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className={`min-w-[32px] h-8 px-2 text-sm ${
                              currentPage === page
                                ? 'bg-[#3057f2] text-white hover:bg-[#2545d9] border-[#3057f2]'
                                : 'border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {page}
                          </Button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Informações da página */}
                <div className="text-[#677c92] text-sm whitespace-nowrap">
                  {Math.min(endIndex, filteredLists.length)} de {filteredLists.length} {filteredLists.length === 1 ? 'lista' : 'listas'}
                </div>
              </div>

              {/* Botão Próximo - Lado Direito */}
              <div className="flex-shrink-0">
                {totalPages > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-[88px]"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#dc2f1c]" />
              Excluir Lista de Avaliação
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem certeza que deseja excluir <strong>PERMANENTEMENTE</strong> a lista <strong>"{listToDelete?.name}"</strong>?
              </p>
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3">
                <p className="text-[#dc2f1c] text-sm">
                  <strong>⚠️ ATENÇÃO:</strong> Esta ação irá excluir:
                </p>
                <ul className="text-[#dc2f1c] text-sm mt-2 space-y-1">
                  <li>• A lista de avaliação</li>
                  <li>• <strong>TODOS os critérios</strong> desta lista</li>
                  <li>• <strong>TODAS as chamadas</strong> desses critérios</li>
                </ul>
              </div>
              <p className="text-sm text-[#dc2f1c]">
                <strong>Esta ação não pode ser desfeita.</strong> Todos os dados relacionados serão permanentemente removidos.
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
              onClick={() => listToDelete && handleDeleteList(listToDelete.id, listToDelete.name)}
              disabled={deleting}
              className="bg-[#dc2f1c] hover:bg-[#b91c1c]"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Excluindo...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Lista Completa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
