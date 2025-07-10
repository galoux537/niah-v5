import React, { useState, useEffect } from 'react';
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

interface Agent {
  id: string;
  name: string;
  email?: string;
  department?: string;
  total_calls: number;
  average_score: number;
  created_at: string;
  manager?: string;
  company_id: string;
}

interface AgentsPageProps {
  onAgentClick: (agentId: string) => void;
  onCreateAgent: () => void;
}

export function AgentsPage({ onAgentClick, onCreateAgent }: AgentsPageProps) {
  const { companyId, company } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [agentCallsCount, setAgentCallsCount] = useState<number>(0);

  useEffect(() => {
    if (companyId) {
      loadAgents();
    }
  }, [companyId]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('👥 Carregando agentes para empresa:', companyId, company?.name);

      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('❌ Erro ao carregar agentes:', agentsError);
        setError(`Erro ao carregar agentes: ${agentsError.message}`);
        return;
      }

      const agentsList = agentsData || [];
      console.log(`✅ ${agentsList.length} agentes carregados para empresa ${company?.name}:`, agentsList);

      const invalidAgents = agentsList.filter(agent => agent.company_id !== companyId);
      if (invalidAgents.length > 0) {
        console.error('🚨 VIOLAÇÃO MULTITENANT CRÍTICA: Agentes de outras empresas retornados:', invalidAgents);
        setError('ERRO DE SEGURANÇA: Dados de outras empresas detectados. Contate o administrador imediatamente.');
        return;
      }

      console.log('🛡️ Verificação multitenant OK - todos os agentes pertencem à empresa:', companyId);
      setAgents(agentsList);

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar agentes:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Detectar se é um agente de exemplo baseado no email
  const isExampleAgent = (agent: Agent): boolean => {
    if (!agent.email) return false;
    
    // Agentes de exemplo têm emails com domínios gerados automaticamente
    const exampleDomains = [
      'empresa.com', 'company.com', 'corp.com', 'techsolutions.com', 'abc.com', 'xyz.com'
    ];
    
    const emailDomain = agent.email.split('@')[1]?.toLowerCase();
    return exampleDomains.some(domain => emailDomain?.includes(domain?.split('.')[0]));
  };

  const handleDeleteAgent = async (agent: Agent, retryCount = 0) => {
    if (!agent || !companyId) {
      console.error('❌ Dados inválidos para exclusão:', { agent, companyId });
      setError('Dados inválidos para exclusão do agente.');
      return;
    }

    if (agent.company_id !== companyId) {
      console.error('🚨 TENTATIVA DE EXCLUSÃO CROSS-TENANT:', {
        agentCompany: agent.company_id,
        userCompany: companyId,
        agentName: agent.name
      });
      setError('ERRO DE SEGURANÇA: Tentativa de exclusão de agente de outra empresa.');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      console.log(`🗑️ [Tentativa ${retryCount + 1}] Iniciando exclusão FORÇADA do agente:`, {
        nome: agent.name,
        id: agent.id,
        empresa: company?.name,
        companyId: companyId,
        isExample: isExampleAgent(agent),
        modo: 'FORÇA BRUTA - Remover tudo'
      });

      // PASSO 1: Verificar se o agente ainda existe
      console.log('🔍 Verificando se agente ainda existe...');
      const { data: agentExists, error: checkError } = await supabase
        .from('agents')
        .select('id, name, company_id')
        .eq('id', agent.id)
        .eq('company_id', companyId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('✅ Agente já foi excluído anteriormente:', agent.name);
          setAgents(prevAgents => prevAgents.filter(a => a.id !== agent.id));
          setSuccessMessage(`Agente "${agent.name}" já foi excluído.`);
          setDeleteDialogOpen(false);
          setAgentToDelete(null);
          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        } else {
          console.error('❌ Erro ao verificar existência do agente:', checkError);
          throw new Error(`Erro ao verificar agente: ${checkError.message}`);
        }
      }

      if (!agentExists) {
        console.log('✅ Agente não existe mais, removendo da lista local');
        setAgents(prevAgents => prevAgents.filter(a => a.id !== agent.id));
        setSuccessMessage(`Agente "${agent.name}" já foi excluído.`);
        setDeleteDialogOpen(false);
        setAgentToDelete(null);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      console.log('✅ Agente existe, verificando e removendo TODAS as chamadas...');

      // PASSO 2: Buscar TODAS as chamadas do agente para excluir
      console.log('📞 Buscando TODAS as chamadas do agente para exclusão...');
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('id, phone_number, call_date, score')
        .eq('agent_id', agent.id)
        .eq('company_id', companyId);

      if (callsError) {
        console.error('❌ Erro ao buscar chamadas do agente:', callsError);
        throw new Error(`Erro ao buscar chamadas: ${callsError.message}`);
      }

      const callsCount = calls?.length || 0;
      console.log(`📊 Agente possui ${callsCount} chamadas que serão TODAS excluídas:`, calls);

      // PASSO 3: Excluir TODAS as chamadas primeiro (força bruta)
      if (calls && calls.length > 0) {
        console.log(`🗑️ EXCLUINDO TODAS as ${calls.length} chamadas do agente...`);
        
        const { error: deleteCallsError } = await supabase
          .from('calls')
          .delete()
          .eq('agent_id', agent.id)
          .eq('company_id', companyId);

        if (deleteCallsError) {
          console.error('❌ Erro ao excluir chamadas:', deleteCallsError);
          throw new Error(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
        }

        console.log(`✅ TODAS as ${calls.length} chamadas foram excluídas com sucesso`);
      } else {
        console.log('📞 Agente não possui chamadas para excluir');
      }

      // PASSO 4: Excluir dados relacionados adicionais (se houver)
      console.log('🧹 Verificando outros dados relacionados...');
      
      // Excluir feedbacks específicos do agente (se houver tabela)
      // Excluir avaliações específicas do agente (se houver tabela)
      // Adicionar outras tabelas relacionadas conforme necessário

      // PASSO 5: Excluir o agente
      console.log('🗑️ Executando exclusão do agente...');
      const { error: deleteError, data: deleteResult } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id)
        .eq('company_id', companyId)
        .select();

      if (deleteError) {
        console.error('❌ Erro ao excluir agente:', deleteError);
        
        if (deleteError.code === '23503') {
          // Se ainda há referências, tentar encontrar e remover
          console.log('🔍 Ainda há referências, investigando...');
          throw new Error('Erro de integridade: O agente ainda possui dados relacionados. Contate o suporte.');
        } else if (deleteError.code === '42501') {
          throw new Error('Erro de permissão: Não autorizado a excluir este agente.');
        } else {
          throw new Error(`Erro ao excluir agente: ${deleteError.message} (Código: ${deleteError.code})`);
        }
      }

      console.log('🎉 Exclusão do agente executada com sucesso:', deleteResult);

      // PASSO 6: Verificar se realmente foi excluído
      const { data: verifyDeleted, error: verifyError } = await supabase
        .from('agents')
        .select('id')
        .eq('id', agent.id)
        .eq('company_id', companyId)
        .single();

      if (verifyError && verifyError.code === 'PGRST116') {
        console.log('✅ Confirmado: Agente foi excluído com sucesso');
      } else if (verifyDeleted) {
        console.error('❌ Agente ainda existe após tentativa de exclusão:', verifyDeleted);
        throw new Error('Falha na exclusão: Agente ainda existe no banco de dados.');
      }

      // SUCESSO TOTAL
      const deletionMessage = callsCount > 0 
        ? `Agente "${agent.name}" e suas ${callsCount} chamadas foram excluídos com sucesso!`
        : `Agente "${agent.name}" excluído com sucesso!`;
      
      console.log('🎉 EXCLUSÃO COMPLETA COM SUCESSO:', {
        agente: agent.name,
        chamadas_removidas: callsCount,
        modo: 'FORÇA BRUTA'
      });
      
      setError(null);
      setSuccessMessage(deletionMessage);
      setAgents(prevAgents => prevAgents.filter(a => a.id !== agent.id));
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      setAgentCallsCount(0);

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
          handleDeleteAgent(agent, retryCount + 1);
        }, 2000);
        return;
      }

      // Erro definitivo
      setError(`Erro ao excluir agente: ${errorMessage}`);
      
      if (retryCount >= 1) {
        setError(
          `Erro ao excluir agente: ${errorMessage}. ` +
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

      // Buscar todos os agentes de exemplo
      const exampleAgents = agents.filter(isExampleAgent);
      console.log('🎭 Agentes de exemplo encontrados:', exampleAgents.map(a => a.name));

      if (exampleAgents.length === 0) {
        setSuccessMessage('Nenhum dado de exemplo encontrado para limpar.');
        setCleanupDialogOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // Primeiro, excluir todas as chamadas dos agentes de exemplo
      const exampleAgentIds = exampleAgents.map(a => a.id);
      
      console.log('📞 Excluindo chamadas dos agentes de exemplo...');
      const { error: deleteCallsError } = await supabase
        .from('calls')
        .delete()
        .in('agent_id', exampleAgentIds)
        .eq('company_id', companyId);

      if (deleteCallsError) {
        console.error('❌ Erro ao excluir chamadas de exemplo:', deleteCallsError);
        throw new Error(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
      }

      // Depois, excluir os agentes de exemplo
      console.log('👥 Excluindo agentes de exemplo...');
      const { error: deleteAgentsError } = await supabase
        .from('agents')
        .delete()
        .in('id', exampleAgentIds)
        .eq('company_id', companyId);

      if (deleteAgentsError) {
        console.error('❌ Erro ao excluir agentes de exemplo:', deleteAgentsError);
        throw new Error(`Erro ao excluir agentes: ${deleteAgentsError.message}`);
      }

      // Atualizar estatísticas das listas de avaliação
      console.log('📊 Atualizando estatísticas das listas...');
      const { error: updateListsError } = await supabase
        .from('evaluation_lists')
        .update({
          total_calls: 0,
          average_score: 0
        })
        .eq('company_id', companyId);

      if (updateListsError) {
        console.warn('⚠️ Erro ao atualizar estatísticas das listas:', updateListsError);
        // Não é crítico, continua
      }

      console.log('✅ Limpeza concluída com sucesso');
      
      setSuccessMessage(`${exampleAgents.length} agentes de exemplo e suas chamadas foram removidos com sucesso!`);
      setCleanupDialogOpen(false);
      
      // Recarregar a lista de agentes
      await loadAgents();
      
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      console.error('💥 Erro na limpeza de dados de exemplo:', err);
      setError(`Erro ao limpar dados de exemplo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setCleaningUp(false);
    }
  };

  const openDeleteDialog = async (agent: Agent) => {
    setError(null);
    setAgentToDelete(agent);
    
    // Buscar número de chamadas para mostrar no diálogo
    try {
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('id')
        .eq('agent_id', agent.id)
        .eq('company_id', companyId);

      if (!callsError && calls) {
        setAgentCallsCount(calls.length);
      } else {
        setAgentCallsCount(0);
      }
    } catch (err) {
      console.error('Erro ao contar chamadas:', err);
      setAgentCallsCount(0);
    }
    
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
    setError(null);
    setAgentCallsCount(0);
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (agent.department && agent.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRetry = async () => {
    console.log('🔄 Tentando recarregar agentes...');
    await loadAgents();
  };

  // Contar agentes de exemplo
  const exampleAgentsCount = agents.filter(isExampleAgent).length;

  if (loading) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando agentes da empresa {company?.name}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !agents.length) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar agentes</h3>
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
              onClick={onCreateAgent}
              className="w-full bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Criar Primeiro Agente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="px-6 space-y-6">
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-[#677c92] mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{company?.name}</span>
          </div>
          <p className="text-xs text-[#677c92]">Agentes de {company?.name}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#f0f4fa] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-[#677c92]" />
            </div>
            <h3 className="text-xl font-semibold text-[#373753] mb-4">
              Nenhum agente cadastrado
            </h3>
            <p className="text-[#677c92] mb-6 max-w-md mx-auto">
              Para começar a avaliar chamadas, você precisa adicionar agentes à sua equipe de {company?.name}.
            </p>
            <Button
              onClick={onCreateAgent}
              className="bg-[#3057f2] text-white px-6 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto hover:bg-[#2545d9] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar primeiro agente
            </Button>
            
            <div className="mt-8 p-4 bg-[#f0f4fa] rounded-lg border border-[#e1e9f4] text-left max-w-md mx-auto">
              <h4 className="font-medium text-[#373753] mb-2">O que são agentes?</h4>
              <p className="text-sm text-[#677c92]">
                Agentes são os membros da sua equipe que fazem atendimentos telefônicos e terão suas chamadas avaliadas pela plataforma NIAH.
              </p>
            </div>

            <div className="mt-4 p-3 bg-[#e1f0ff] rounded-lg border border-[#b3d9ff]">
              <p className="text-xs text-[#1e40af]">
                <strong>Multitenant:</strong> Os agentes criados aqui serão exclusivos da empresa {company?.name} e não serão visíveis para outras empresas.
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
      {error && agents.length > 0 && (
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

      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 text-[#677c92] mb-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm">{company?.name}</span>
        </div>
        <p className="text-xs text-[#677c92]">
          {agents.length} {agents.length === 1 ? 'agente cadastrado' : 'agentes cadastrados'}
          {exampleAgentsCount > 0 && (
            <span className="ml-2 text-[#e67c0b]">({exampleAgentsCount} de exemplo)</span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        <div className="flex items-center justify-between p-6 border-b border-[#e1e9f4]">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-[#677c92]" />
            <Input
              placeholder="Pesquisar agentes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none shadow-none bg-transparent p-0 h-auto focus-visible:ring-0 text-[#677c92]"
            />
          </div>

          <div className="flex items-center gap-2">
            {exampleAgentsCount > 0 && (
              <Button
                onClick={() => setCleanupDialogOpen(true)}
                variant="outline"
                className="bg-[#fff6bf] border-[#e67c0b] text-[#b86309] hover:bg-[#fef3cd] h-8 px-3 rounded-lg text-xs"
              >
                <Database className="h-4 w-4 mr-1" />
                Limpar Exemplos ({exampleAgentsCount})
              </Button>
            )}
            <Button
              onClick={onCreateAgent}
              className="bg-[#e1e9f4] text-[#677c92] hover:bg-[#d1d9e4] border-none h-8 px-4 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Novo agente</span>
            </Button>
          </div>
        </div>

        <div className="h-px bg-[#e1e9f4]"></div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={onCreateAgent}
              className="bg-[#e1e9f4] h-[72px] rounded-lg shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] cursor-pointer hover:bg-[#d1d9e4] transition-colors"
            >
              <div className="flex items-center justify-between h-full px-4">
                <span className="text-[#3057f2] font-medium">
                  Adicionar novo agente
                </span>
                <Plus className="h-5 w-5 text-[#3057f2]" />
              </div>
            </div>

            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white h-[72px] rounded-lg border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] hover:shadow-md transition-shadow group relative"
              >
                {isExampleAgent(agent) && (
                  <div className="absolute -top-1 -right-1 bg-[#e67c0b] text-white text-xs px-1.5 py-0.5 rounded-full">
                    📝
                  </div>
                )}
                
                <div className="flex items-center justify-between h-full px-4">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => onAgentClick(agent.id)}
                  >
                    <div className={`w-6 h-6 ${isExampleAgent(agent) ? 'bg-[#fff6bf]' : 'bg-[#c9f2cd]'} rounded-full flex items-center justify-center`}>
                      <User className={`h-4 w-4 ${isExampleAgent(agent) ? 'text-[#b86309]' : 'text-[#015901]'}`} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="text-[#373753] font-medium text-sm truncate">
                        {agent.name}
                      </div>
                      <div className="text-[#677c92] text-xs truncate">
                        {agent.email || agent.department || 'Sem informações'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div 
                      className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onAgentClick(agent.id)}
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
                          onClick={() => onAgentClick(agent.id)}
                          className="cursor-pointer"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(agent)}
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

          {searchQuery && filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#f0f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-[#677c92]" />
              </div>
              <h3 className="text-lg font-medium text-[#373753] mb-2">
                Nenhum agente encontrado
              </h3>
              <p className="text-[#677c92] text-sm mb-4">
                Não encontramos agentes com "{searchQuery}" na empresa {company?.name}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#3057f2] text-sm hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#e1e9f4]">
            <div className="flex items-center justify-between text-xs text-[#677c92]">
              <div className="flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                <span>Empresa: {company?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{agents.length} agente{agents.length !== 1 ? 's' : ''} total</span>
                </div>
                {exampleAgentsCount > 0 && (
                  <div className="flex items-center gap-2 text-[#e67c0b]">
                    <Database className="h-3 w-3" />
                    <span>{exampleAgentsCount} exemplo{exampleAgentsCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#dc2f1c]" />
              Exclusão Completa do Agente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem certeza que deseja excluir <strong>PERMANENTEMENTE</strong> o agente <strong>{agentToDelete?.name}</strong>?
              </p>
              
              {agentCallsCount > 0 && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3">
                  <p className="text-[#dc2f1c] text-sm">
                    <strong>⚠️ ATENÇÃO:</strong> Este agente possui <strong>{agentCallsCount} chamada{agentCallsCount > 1 ? 's' : ''}</strong> registrada{agentCallsCount > 1 ? 's' : ''}. 
                  </p>
                  <p className="text-[#dc2f1c] text-sm mt-1">
                    <strong>TODAS essas chamadas também serão excluídas permanentemente.</strong>
                  </p>
                </div>
              )}

              {isExampleAgent(agentToDelete || {} as Agent) && (
                <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-3">
                  <p className="text-[#b86309] text-sm">
                    <strong>📝 Agente de Exemplo:</strong> Este agente foi criado automaticamente como dados de demonstração.
                  </p>
                </div>
              )}
              
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-3">
                <p className="text-[#677c92] text-sm">
                  <strong>🗑️ O que será removido:</strong>
                </p>
                <ul className="text-[#677c92] text-sm mt-1 space-y-1">
                  <li>• O agente {agentToDelete?.name}</li>
                  {agentCallsCount > 0 && <li>• {agentCallsCount} chamada{agentCallsCount > 1 ? 's' : ''} registrada{agentCallsCount > 1 ? 's' : ''}</li>}
                  <li>• Todos os dados relacionados</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#dc2f1c]">
                <strong>Esta ação não pode ser desfeita.</strong> O agente será permanentemente removido da empresa {company?.name}.
              </p>
              
              {agentToDelete?.email && (
                <p className="text-xs text-[#677c92]">
                  Email: {agentToDelete.email}
                </p>
              )}
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
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              disabled={deleting}
              className="bg-[#dc2f1c] hover:bg-[#b91c1c]"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {agentCallsCount > 0 ? 'Excluindo tudo...' : 'Excluindo...'}
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {agentCallsCount > 0 ? `Excluir Agente + ${agentCallsCount} Chamadas` : 'Excluir Agente'}
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
                Esta ação irá remover <strong>todos os {exampleAgentsCount} agentes de exemplo</strong> e suas respectivas chamadas da empresa {company?.name}.
              </p>
              
              <div className="bg-[#fff6bf] border border-[#e67c0b] rounded-lg p-3">
                <p className="text-[#b86309] text-sm">
                  <strong>📝 O que será removido:</strong>
                </p>
                <ul className="text-[#b86309] text-sm mt-2 space-y-1">
                  <li>• {exampleAgentsCount} agentes de exemplo</li>
                  <li>• Todas as chamadas associadas a eles</li>
                  <li>• Estatísticas das listas serão zeradas</li>
                </ul>
              </div>
              
              <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-3">
                <p className="text-[#16a34a] text-sm">
                  <strong>✅ O que será mantido:</strong>
                </p>
                <ul className="text-[#16a34a] text-sm mt-2 space-y-1">
                  <li>• Agentes criados manualmente</li>
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
                  Limpar {exampleAgentsCount} Agentes de Exemplo
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
