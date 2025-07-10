import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Search, Edit, Trash2, Plus, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface Feedback {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface AgentCreatePageProps {
  onBack: () => void;
}

export function AgentCreatePage({ onBack }: AgentCreatePageProps) {
  const { companyId, company } = useAuth();
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentDepartment, setAgentDepartment] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveAgent = async () => {
    if (!agentName.trim()) {
      setError('Por favor, insira um nome para o agente.');
      return;
    }

    if (!companyId) {
      setError('Erro: Empresa não identificada. Faça login novamente.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      console.log('👤 Criando novo agente para empresa:', companyId, company?.name);

      // Criar agente com APENAS os campos obrigatórios e opcionais válidos
      const agentData = {
        company_id: companyId, // FILTRO MULTITENANT CRÍTICO
        name: agentName.trim(),
        total_calls: 0,
        average_score: 0.00,
      };

      // Adicionar campos opcionais apenas se não estiverem vazios
      if (agentEmail.trim()) {
        agentData.email = agentEmail.trim();
      }

      if (agentDepartment.trim()) {
        agentData.department = agentDepartment.trim();
      }

      console.log('📝 Dados do agente a serem inseridos:', agentData);

      const { data: newAgent, error: createError } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar agente:', createError);
        
        if (createError.code === '42501') {
          setError('Erro de permissão: Não foi possível criar o agente. Verifique as configurações do banco.');
        } else if (createError.code === '23505') {
          setError('Já existe um agente com esse nome na sua empresa.');
        } else if (createError.code === '23502') {
          setError(`Campo obrigatório faltando: ${createError.message}`);
        } else {
          setError(`Erro ao criar agente: ${createError.message}`);
        }
        return;
      }

      if (!newAgent) {
        setError('Agente criado, mas não foi possível recuperar os dados.');
        return;
      }

      // VERIFICAÇÃO DE SEGURANÇA: Garantir que o agente foi criado para a empresa correta
      if (newAgent.company_id !== companyId) {
        console.error('🚨 VIOLAÇÃO MULTITENANT: Agente criado para empresa incorreta:', newAgent);
        setError('Erro de segurança: Agente criado para empresa incorreta');
        return;
      }

      console.log('✅ Agente criado com sucesso:', newAgent);
      setSuccess(`Agente "${agentName}" criado com sucesso para ${company?.name}!`);
      
      // Aguardar um pouco para mostrar a mensagem
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err) {
      console.error('💥 Erro inesperado ao criar agente:', err);
      setError('Erro inesperado ao criar agente. Verifique sua conexão e tente novamente.');
    } finally {
      setCreating(false);
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

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancel = () => {
    if (creating) return;
    onBack();
  };

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={creating}
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
            Novo Agente
          </h1>
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#dc2f1c] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-[#dc2f1c] mb-1">Erro ao criar agente</h3>
              <p className="text-[#dc2f1c] text-sm">{error}</p>
              {error.includes('Campo obrigatório') && (
                <div className="mt-2 p-2 bg-[#dc2f1c]/10 rounded text-xs text-[#dc2f1c]">
                  <strong>Dica:</strong> Execute o script SQL para corrigir a estrutura da tabela agents:
                  <code className="block mt-1 bg-[#dc2f1c]/20 p-1 rounded">
                    ALTER TABLE agents ALTER COLUMN evaluation_list_id DROP NOT NULL;
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-[#f0f9f4] border border-[#86efac] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#16a34a] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-[#16a34a] mb-1">Sucesso!</h3>
              <p className="text-[#16a34a] text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info sobre multitenant */}
      <div className="bg-[#e1f0ff] border border-[#b3d9ff] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-[#1e40af] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-[#1e40af] mb-1">Criando agente para {company?.name}</h3>
            <p className="text-[#1e40af] text-sm">
              Este agente será criado exclusivamente para sua empresa e não será visível para outras empresas na plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Card Geral */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#373753] text-lg">Informações Gerais</CardTitle>
          <CardDescription className="text-[#677c92] text-sm">
            Dados básicos do novo agente para {company?.name}
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
                disabled={creating}
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
                placeholder="email@exemplo.com (opcional)"
                type="email"
                disabled={creating}
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
                placeholder="Ex: Vendas, Suporte, Atendimento (opcional)"
                disabled={creating}
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

          {/* Informação sobre campos obrigatórios */}
          <div className="mt-4 p-3 bg-[#f0f4fa] rounded-lg border border-[#e1e9f4]">
            <p className="text-xs text-[#677c92]">
              <strong>Campos obrigatórios:</strong> Apenas o nome é obrigatório. 
              Email e departamento são opcionais e podem ser adicionados depois.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card Feedbacks */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#373753] text-lg">Critérios de Avaliação</CardTitle>
          <CardDescription className="text-[#677c92] text-sm">
            Configure os critérios que serão usados para avaliar este agente (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Header com busca e botão adicionar */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-[#677c92]" />
              <Input
                placeholder="Pesquisar feedback"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm border-none shadow-none px-2"
                disabled={creating}
              />
            </div>
            <Button
              onClick={handleAddFeedback}
              size="sm"
              variant="outline"
              disabled={creating}
              className="bg-[#e1e9f4] border-[#e1e9f4] text-[#677c92] hover:bg-[#d1d9e4]"
            >
              Adicionar critério
            </Button>
          </div>

          {/* Cabeçalho da tabela */}
          <div className="bg-[#f0f4fa] px-6 py-3 border-y border-[#e1e9f4]">
            <div className="flex items-center gap-4 text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-4">Cor</div>
              <div className="flex-1">Nome</div>
              <div className="w-72">Descrição</div>
              <div className="w-16"></div>
            </div>
          </div>

          {/* Lista de feedbacks */}
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-[#677c92] px-6">
              {feedbacks.length === 0 ? (
                <div className="space-y-2">
                  <p>Nenhum critério adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar critério" para começar</p>
                  <p className="text-xs text-[#a3a3a3] mt-4">
                    Você pode criar o agente sem critérios e adicioná-los depois
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Nenhum critério encontrado</p>
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
                      disabled={creating}
                      className="h-6 w-6 p-0 text-[#677c92] hover:text-[#373753]"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      disabled={creating}
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

      {/* Botões de ação */}
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <Button
          onClick={handleSaveAgent}
          disabled={creating || !agentName.trim()}
          className="w-full bg-[#3057f2] hover:bg-[#2545d9] h-10"
        >
          {creating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Criando Agente...
            </div>
          ) : (
            'Criar Agente'
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={creating}
          className="w-full text-[#677c92] hover:text-[#373753] h-8"
        >
          Cancelar
        </Button>
      </div>

      {/* Footer com info de multitenant */}
      <div className="mt-8 p-3 bg-[#f0f4fa] rounded-lg border border-[#e1e9f4]">
        <div className="text-xs text-[#677c92] text-center">
          <strong>Segurança Multitenant:</strong> Este agente será associado exclusivamente à empresa {company?.name} 
          (ID: {companyId?.slice(0, 8)}...) e não será visível para outras empresas.
        </div>
      </div>

      {/* Modal de Feedback */}
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
