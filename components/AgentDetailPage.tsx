import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Search, Edit, Trash2, Plus, User, Building2, RefreshCw, AlertTriangle, Phone, BarChart3 } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface Agent {
  id: string;
  name: string;
  email?: string;
  department?: string;
  manager?: string;
  total_calls: number;
  average_score: number;
  company_id: string;
  created_at: string;
}

interface Call {
  id: string;
  phone_number: string;
  duration_seconds: number;
  call_date: string;
  score: number;
  call_type: string;
  status: string;
}

interface Feedback {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface AgentDetailPageProps {
  agentId: string;
  onBack: () => void;
}

export function AgentDetailPage({ agentId, onBack }: AgentDetailPageProps) {
  const { companyId, company } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentDepartment, setAgentDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (agentId && companyId) {
      loadAgentData();
    }
  }, [agentId, companyId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('👤 Carregando dados do agente:', agentId, 'para empresa:', companyId);

      const { data: agentData, error: agentError } = await supabase
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

      if (!agentData) {
        setError('Agente não encontrado');
        return;
      }

      if (agentData.company_id !== companyId) {
        console.error('🚨 VIOLAÇÃO MULTITENANT: Tentativa de acesso a agente de outra empresa:', agentData);
        setError('Acesso negado: Este agente não pertence à sua empresa');
        return;
      }

      setAgent(agentData);
      setAgentName(agentData.name);
      setAgentEmail(agentData.email || '');
      setAgentDepartment(agentData.department || '');

      console.log('✅ Dados do agente carregados:', agentData);

      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('agent_id', agentId)
        .eq('company_id', companyId)
        .order('call_date', { ascending: false })
        .limit(50);

      if (callsError) {
        console.error('⚠️ Erro ao buscar chamadas:', callsError);
        setCalls([]);
      } else {
        const invalidCalls = (callsData || []).filter(call => call.company_id !== companyId);
        if (invalidCalls.length > 0) {
          console.error('🚨 VIOLAÇÃO MULTITENANT: Chamadas de outras empresas detectadas:', invalidCalls);
          setCalls([]);
        } else {
          setCalls(callsData || []);
          console.log(`✅ ${callsData?.length || 0} chamadas carregadas`);
        }
      }

    } catch (err) {
      console.error('💥 Erro inesperado ao carregar agente:', err);
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgent = async () => {
    if (!agent || !agentName.trim()) {
      alert('Por favor, insira um nome para o agente.');
      return;
    }

    try {
      setSaving(true);

      console.log('💾 Salvando agente:', agentId);

      const { error: updateError } = await supabase
        .from('agents')
        .update({
          name: agentName.trim(),
          email: agentEmail.trim() || null,
          department: agentDepartment.trim() || null,
        })
        .eq('id', agentId)
        .eq('company_id', companyId);

      if (updateError) {
        console.error('❌ Erro ao salvar agente:', updateError);
        alert(`Erro ao salvar: ${updateError.message}`);
        return;
      }

      setAgent({
        ...agent,
        name: agentName.trim(),
        email: agentEmail.trim() || undefined,
        department: agentDepartment.trim() || undefined,
      });

      console.log('✅ Agente salvo com sucesso');
      alert('Agente salvo com sucesso!');

    } catch (err) {
      console.error('💥 Erro inesperado ao salvar:', err);
      alert('Erro inesperado ao salvar agente.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeedback = () => {
    setEditingFeedback(null);
    setIsModalOpen(true);
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setIsModalOpen(true);
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm('Tem certeza que deseja excluir este feedback?')) {
      const updatedFeedbacks = feedbacks.filter(f => f.id !== feedbackId);
      setFeedbacks(updatedFeedbacks);
    }
  };

  const handleSaveFeedback = (feedback: Omit<Feedback, 'id'>) => {
    if (editingFeedback) {
      const updatedFeedbacks = feedbacks.map(f =>
        f.id === editingFeedback.id
          ? { ...feedback, id: editingFeedback.id }
          : f
      );
      setFeedbacks(updatedFeedbacks);
    } else {
      const newFeedback: Feedback = {
        ...feedback,
        id: Date.now().toString()
      };
      setFeedbacks([...feedbacks, newFeedback]);
    }

    setIsModalOpen(false);
    setEditingFeedback(null);
  };

  const handleRetry = () => {
    loadAgentData();
  };

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const callStats = React.useMemo(() => {
    if (calls.length === 0) return null;

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
    const averageScore = calls.reduce((sum, call) => sum + (call.score || 0), 0) / totalCalls;
    const goodCalls = calls.filter(call => (call.score || 0) >= 8).length;
    const averageDuration = totalDuration / totalCalls;

    return {
      total: totalCalls,
      averageScore: averageScore.toFixed(1),
      averageDuration: Math.round(averageDuration / 60),
      goodPercentage: Math.round((goodCalls / totalCalls) * 100),
    };
  }, [calls]);

  if (loading) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-10 w-10 rounded-full p-0 border border-[#e1e9f4] bg-white hover:bg-[#f9fafc] shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </Button>
          <div>
            <p className="text-[#677c92] text-sm uppercase tracking-wide">
              Agentes
            </p>
            <h1 className="text-[#373753] text-2xl font-semibold">
              Carregando...
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-12 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-10 w-10 rounded-full p-0 border border-[#e1e9f4] bg-white hover:bg-[#f9fafc] shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </Button>
          <div>
            <p className="text-[#677c92] text-sm uppercase tracking-wide">
              Agentes
            </p>
            <h1 className="text-[#373753] text-2xl font-semibold">
              Erro
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar agente</h3>
          <p className="text-[#677c92] mb-4 text-sm">{error}</p>
          
          {error.includes('não pertence') && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3 mb-4 text-left">
              <p className="text-[#dc2f1c] text-xs">
                <strong>Violação de Multitenant:</strong> Este agente não pertence à empresa {company?.name}. 
                Cada empresa pode acessar apenas seus próprios agentes.
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
              onClick={onBack}
              className="w-full bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
            >
              Voltar aos Agentes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 w-10 rounded-full p-0 border border-[#e1e9f4] bg-white hover:bg-[#f9fafc] shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-[#373753]" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[#677c92] text-sm uppercase tracking-wide mb-1">
            <Building2 className="h-3 w-3" />
            <span>{company?.name} • Agentes</span>
          </div>
          <h1 className="text-[#373753] text-2xl font-semibold">
            {agent.name}
          </h1>
        </div>
      </div>

      {callStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 bg-[#e1f0ff] text-[#3057f2] p-2 rounded-lg" />
                <div>
                  <p className="text-xs text-[#677c92] uppercase tracking-wide">Total Chamadas</p>
                  <p className="text-xl font-semibold text-[#373753]">{callStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 bg-[#c9f2cd] text-[#008a35] p-2 rounded-lg" />
                <div>
                  <p className="text-xs text-[#677c92] uppercase tracking-wide">Score Médio</p>
                  <p className="text-xl font-semibold text-[#008a35]">{callStats.averageScore}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#fff6bf] text-[#b86309] p-2 rounded-lg flex items-center justify-center">
                  ⏱️
                </div>
                <div>
                  <p className="text-xs text-[#677c92] uppercase tracking-wide">Duração Média</p>
                  <p className="text-xl font-semibold text-[#373753]">{callStats.averageDuration}min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#e1f0ff] text-[#3057f2] p-2 rounded-lg flex items-center justify-center">
                  👍
                </div>
                <div>
                  <p className="text-xs text-[#677c92] uppercase tracking-wide">Bom Desempenho</p>
                  <p className="text-xl font-semibold text-[#008a35]">{callStats.goodPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#373753] text-lg">Informações Gerais</CardTitle>
          <CardDescription className="text-[#677c92] text-sm">
            Dados básicos do agente da empresa {company?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#373753] text-sm mb-2 block">
                Nome do agente<span className="text-[#e60b42] ml-1">*</span>
              </label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full"
                placeholder="Digite o nome do agente"
              />
            </div>
            <div>
              <label className="text-[#373753] text-sm mb-2 block">
                Email
              </label>
              <Input
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                className="w-full"
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>
            <div>
              <label className="text-[#373753] text-sm mb-2 block">
                Departamento
              </label>
              <Input
                value={agentDepartment}
                onChange={(e) => setAgentDepartment(e.target.value)}
                className="w-full"
                placeholder="Ex: Vendas, Suporte, Atendimento"
              />
            </div>
            <div>
              <label className="text-[#373753] text-sm mb-2 block">
                Empresa
              </label>
              <Input
                value={company?.name || ''}
                disabled
                className="w-full bg-[#f0f4fa] text-[#677c92]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-[#677c92]" />
              <Input
                placeholder="Pesquisar feedback"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm border-none shadow-none px-2"
              />
            </div>
            <Button
              onClick={handleAddFeedback}
              size="sm"
              variant="outline"
              className="bg-[#e1e9f4] border-[#e1e9f4] text-[#677c92] hover:bg-[#d1d9e4]"
            >
              Adicionar feedback
            </Button>
          </div>

          <div className="bg-[#f0f4fa] px-6 py-3 border-y border-[#e1e9f4]">
            <div className="flex items-center gap-4 text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-4">Cor</div>
              <div className="flex-1">Nome</div>
              <div className="w-72">Descrição</div>
              <div className="w-16"></div>
            </div>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-[#677c92] px-6">
              {feedbacks.length === 0 ? (
                <div className="space-y-2">
                  <p>Nenhum feedback adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar feedback" para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Nenhum feedback encontrado</p>
                  <p className="text-sm">Tente ajustar sua busca</p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#e1e9f4]">
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-[#f9fafc] transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: feedback.color }}
                  />
                  <div className="flex-1 font-medium text-[#373753]">
                    {feedback.name}
                  </div>
                  <div className="w-72 text-[#677c92] text-sm">
                    {feedback.description}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFeedback(feedback)}
                      className="h-6 w-6 p-0 text-[#677c92] hover:text-[#373753]"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      className="h-6 w-6 p-0 text-[#f23f2c] hover:text-[#dc2f1c]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <Button
          onClick={handleSaveAgent}
          disabled={saving}
          className="w-full bg-[#3057f2] hover:bg-[#2545d9] h-10"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </div>
          ) : (
            'Salvar Agente'
          )}
        </Button>
        <div className="flex gap-2 w-full">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex-1 text-[#677c92] hover:text-[#373753] h-8"
          >
            Voltar aos Agentes
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              // Primeiro, buscar o número de chamadas
              const { data: callsData, error: callsError } = await supabase
                .from('calls')
                .select('id')
                .eq('agent_id', agent.id)
                .eq('company_id', companyId);

              const callsCount = callsData?.length || 0;
              
              const confirmMessage = callsCount > 0 
                ? `Tem certeza que deseja excluir PERMANENTEMENTE o agente "${agent.name}"?\n\n⚠️ ATENÇÃO: Este agente possui ${callsCount} chamada${callsCount > 1 ? 's' : ''} registrada${callsCount > 1 ? 's' : ''}.\n\nTODAS essas chamadas também serão excluídas permanentemente.\n\nEsta ação não pode ser desfeita.`
                : `Tem certeza que deseja excluir o agente "${agent.name}"? Esta ação não pode ser desfeita.`;

              if (confirm(confirmMessage)) {
                try {
                  console.log('🗑️ [AgentDetail] Iniciando exclusão FORÇADA do agente:', agent.name, `com ${callsCount} chamadas`);

                  // Verificar se agente ainda existe
                  const { data: agentExists, error: checkError } = await supabase
                    .from('agents')
                    .select('id, name')
                    .eq('id', agent.id)
                    .eq('company_id', companyId)
                    .single();

                  if (checkError && checkError.code === 'PGRST116') {
                    alert(`Agente "${agent.name}" já foi excluído.`);
                    onBack();
                    return;
                  }

                  if (checkError) {
                    console.error('❌ Erro ao verificar agente:', checkError);
                    alert(`Erro ao verificar agente: ${checkError.message}`);
                    return;
                  }

                  // Buscar e excluir TODAS as chamadas primeiro
                  console.log('📞 Buscando TODAS as chamadas para exclusão...');
                  const { data: allCalls, error: allCallsError } = await supabase
                    .from('calls')
                    .select('id, phone_number')
                    .eq('agent_id', agent.id)
                    .eq('company_id', companyId);

                  if (allCallsError) {
                    console.error('❌ Erro ao buscar chamadas:', allCallsError);
                    alert(`Erro ao buscar chamadas: ${allCallsError.message}`);
                    return;
                  }

                  if (allCalls && allCalls.length > 0) {
                    console.log(`🗑️ Excluindo TODAS as ${allCalls.length} chamadas...`);
                    
                    const { error: deleteCallsError } = await supabase
                      .from('calls')
                      .delete()
                      .eq('agent_id', agent.id)
                      .eq('company_id', companyId);

                    if (deleteCallsError) {
                      console.error('❌ Erro ao excluir chamadas:', deleteCallsError);
                      alert(`Erro ao excluir chamadas: ${deleteCallsError.message}`);
                      return;
                    }

                    console.log(`✅ ${allCalls.length} chamadas excluídas com sucesso`);
                  }

                  // Excluir agente
                  console.log('🗑️ Executando exclusão do agente...');
                  const { error: deleteError } = await supabase
                    .from('agents')
                    .delete()
                    .eq('id', agent.id)
                    .eq('company_id', companyId);

                  if (deleteError) {
                    console.error('❌ Erro ao excluir agente:', deleteError);
                    alert(`Erro ao excluir agente: ${deleteError.message}`);
                    return;
                  }

                  // Verificar se foi realmente excluído
                  const { data: verifyDeleted, error: verifyError } = await supabase
                    .from('agents')
                    .select('id')
                    .eq('id', agent.id)
                    .eq('company_id', companyId)
                    .single();

                  if (verifyDeleted) {
                    console.error('❌ Agente ainda existe após exclusão');
                    alert('Erro: Agente não foi excluído corretamente. Tente novamente.');
                    return;
                  }

                  console.log('✅ EXCLUSÃO COMPLETA com sucesso:', {
                    agente: agent.name,
                    chamadas_removidas: allCalls?.length || 0
                  });
                  
                  const successMessage = allCalls && allCalls.length > 0
                    ? `Agente "${agent.name}" e suas ${allCalls.length} chamadas foram excluídos com sucesso!`
                    : `Agente "${agent.name}" excluído com sucesso!`;
                  
                  alert(successMessage);
                  onBack();
                  
                } catch (err) {
                  console.error('💥 Erro inesperado ao excluir agente:', err);
                  alert(`Erro inesperado ao excluir agente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                }
              }
            }}
            className="text-[#dc2f1c] hover:text-[#dc2f1c] hover:bg-[#fef2f2] h-8 px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 p-3 bg-[#e1f0ff] rounded-lg border border-[#b3d9ff]">
        <div className="flex items-center gap-2 text-xs text-[#1e40af]">
          <Building2 className="h-3 w-3" />
          <span>
            <strong>Multitenant:</strong> Este agente pertence exclusivamente à empresa {company?.name}. 
            Dados de outras empresas não são visíveis.
          </span>
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFeedback(null);
        }}
        onSave={handleSaveFeedback}
        feedback={editingFeedback}
      />
    </div>
  );
}
