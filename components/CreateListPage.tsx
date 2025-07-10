import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Plus, CheckCircle, AlertCircle, Calendar, FileText, Target, Users, Phone, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface CreateListPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateListPage({ onBack, onSuccess }: CreateListPageProps) {
  const { companyId, company } = useAuth();
  const [loading, setLoading] = useState(false);
  const [populatingData, setPopulatingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateRangeStart: '',
    dateRangeEnd: '',
    objective: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome da lista é obrigatório');
      return false;
    }
    
    if (formData.name.trim().length < 3) {
      setError('Nome da lista deve ter pelo menos 3 caracteres');
      return false;
    }
    
    if (formData.dateRangeStart && formData.dateRangeEnd) {
      const startDate = new Date(formData.dateRangeStart);
      const endDate = new Date(formData.dateRangeEnd);
      
      if (startDate > endDate) {
        setError('Data de início deve ser anterior à data de fim');
        return false;
      }
    }
    
    return true;
  };

  const limitScore = (score: number): number => {
    return Math.max(0, Math.min(9.5, Number(score.toFixed(2))));
  };

  // Função para gerar agentes únicos por empresa
  const generateUniqueAgentsForCompany = (companyName: string): Array<{
    name: string;
    email: string;
    department: string;
    calls: number;
    score: number;
  }> => {
    // Criar hash simples do nome da empresa para garantir consistência
    const companyHash = companyName.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Arrays de nomes, sobrenomes e departamentos
    const firstNames = [
      'Ana', 'Carlos', 'Mariana', 'João', 'Fernanda', 'Ricardo', 'Beatriz', 'Rafael', 'Camila', 'Diego',
      'Larissa', 'Bruno', 'Patrícia', 'Thiago', 'Juliana', 'Rodrigo', 'Amanda', 'Felipe', 'Gabriela', 'Lucas'
    ];
    
    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
      'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
    ];
    
    const departments = ['Vendas', 'Suporte', 'Atendimento', 'Comercial', 'SAC', 'Técnico'];
    
    const agents = [];
    
    // Gerar 6 agentes únicos baseados no hash da empresa
    for (let i = 0; i < 6; i++) {
      // Usar hash da empresa + índice para criar seleção consistente mas única
      const seed = companyHash + i;
      
      const firstName = firstNames[seed % firstNames.length];
      const lastName = lastNames[(seed * 7) % lastNames.length];
      const department = departments[seed % departments.length];
      
      // Gerar email baseado na empresa
      const companyDomain = companyName.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 10) + '.com';
      
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`;
      
      // Gerar número de chamadas e score baseados no seed
      const calls = 20 + (seed % 35); // Entre 20 e 54 chamadas
      const scoreBase = 7.0 + ((seed % 25) / 10); // Entre 7.0 e 9.4
      const score = limitScore(scoreBase);
      
      agents.push({
        name: `${firstName} ${lastName}`,
        email,
        department,
        calls,
        score
      });
    }
    
    return agents;
  };

  const populateMockDataForCompany = async (listId: string, companyId: string) => {
    console.log('📊 Populando dados específicos para empresa:', company?.name);
    
    if (!company?.name) {
      throw new Error('Nome da empresa não encontrado');
    }
    
    // 1. Gerar e inserir agentes únicos para esta empresa e lista
    const agentsToCreate = generateUniqueAgentsForCompany(company.name);
    console.log('👥 Agentes a serem criados:', agentsToCreate.map(a => a.name));
    
    const { data: createdAgents, error: agentError } = await supabase
        .from('agents')
      .insert(
        agentsToCreate.map(agent => ({
              company_id: companyId,
              evaluation_list_id: listId,
              name: agent.name,
              email: agent.email,
              department: agent.department,
              total_calls: agent.calls,
          average_score: agent.score,
        }))
      )
      .select();

          if (agentError) {
      console.error('❌ Erro ao criar agentes:', agentError);
            throw agentError;
          }

    if (!createdAgents || createdAgents.length === 0) {
      console.error('❌ Nenhum agente foi criado. Verifique as políticas RLS da tabela "agents".');
      return;
    }

    console.log(`✅ ${createdAgents.length} agentes criados com sucesso.`);

    // 2. Para cada agente criado, inserir chamadas simuladas
      let totalCallsCreated = 0;
      for (const agent of createdAgents) {
      const callsToCreate = [];
      const numberOfCalls = Math.floor(20 + Math.random() * 30); // 20 a 50 chamadas por agente
      for (let i = 0; i < numberOfCalls; i++) {
        callsToCreate.push({
              company_id: companyId,
              evaluation_list_id: listId,
              agent_id: agent.id,
          phone_number: `+55 11 9${Math.floor(10000000 + Math.random() * 90000000)}`,
          duration_seconds: Math.floor(60 + Math.random() * 1800),
          call_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          score: parseFloat((6 + Math.random() * 3.9).toFixed(1)),
        });
      }

      const { error: callError } = await supabase.from('calls').insert(callsToCreate);

          if (callError) {
        console.error(`❌ Erro ao criar chamadas para o agente ${agent.name}:`, callError);
        // Continua para o próximo agente em vez de parar tudo
      } else {
        totalCallsCreated += callsToCreate.length;
      }
    }

    console.log(`✅ ${totalCallsCreated} chamadas totais criadas para a lista.`);

    // 3. Atualizar a lista com os totais
    const { error: updateError } = await supabase
          .from('evaluation_lists')
          .update({
        total_calls: totalCallsCreated,
        average_score: parseFloat((7 + Math.random() * 2.5).toFixed(1)),
          })
          .eq('id', listId);

    if (updateError) {
      console.error('❌ Erro ao atualizar totais da lista:', updateError);
    }
  };

  const populateMockData = async (listId: string) => {
    try {
      setPopulatingData(true);
      console.log('🎭 Populando dados específicos para empresa:', company?.name);

      await populateMockDataForCompany(listId, companyId);

    } catch (error) {
      console.error('💥 Erro ao popular dados:', error);
      throw error;
    } finally {
      setPopulatingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!companyId) {
      setError('Erro: Empresa não identificada. Faça login novamente.');
      return;
    }

    if (!company) {
      setError('Erro: Dados da empresa não encontrados. Faça login novamente.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('📝 Criando lista de avaliação...');
      console.log('🏢 Empresa:', company.name, '(ID:', companyId, ')');
      
      // First, let's check if the company exists and if we can access it
      console.log('🔍 Verificando acesso à empresa...');
      const { data: companyCheck, error: companyError } = await supabase
        .from('companies')
        .select('id, name, slug')
        .eq('id', companyId)
        .single();
      
      if (companyError) {
        console.error('❌ Erro ao verificar empresa:', companyError);
        setError(`Erro ao verificar empresa: ${companyError.message}`);
        return;
      }
      
      if (!companyCheck) {
        console.error('❌ Empresa não encontrada');
        setError('Empresa não encontrada no banco de dados.');
        return;
      }
      
      console.log('✅ Empresa verificada:', companyCheck);
      
      // Check RLS status and policies
      console.log('🔍 Verificando status RLS...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'evaluation_lists')
        .single();
      
      console.log('📊 Info da tabela evaluation_lists:', tableInfo);
      
      const listData = {
        company_id: companyId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        date_range_start: formData.dateRangeStart || null,
        date_range_end: formData.dateRangeEnd || null,
        total_calls: 0,
        average_score: 0.00,
        created_by: companyId
      };
      
      console.log('📋 Dados da lista:', listData);
      
      // Add detailed logging for debugging
      console.log('🎯 Tentando inserir na tabela evaluation_lists...');
      console.log('🔑 Company ID atual:', companyId);
      console.log('👤 Dados do usuário atual:', { company: company.name, id: companyId });
      
      const { data, error: createError } = await supabase
        .from('evaluation_lists')
        .insert(listData)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar lista:', createError);
        console.error('📄 Detalhes completos do erro:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        
        if (createError.code === '42501' || createError.message.includes('row-level security')) {
          setError(
            `❌ ERRO DE PERMISSÃO RLS:\n\n` +
            `Código: ${createError.code}\n` +
            `Mensagem: ${createError.message}\n\n` +
            `🔧 SOLUÇÕES:\n` +
            `1. Execute o script: supabase-emergency-disable-rls.sql\n` +
            `2. Ou execute: supabase-fix-rls-evaluation-lists-final.sql\n\n` +
            `🏢 Empresa atual: ${company.name} (ID: ${companyId})\n` +
            `🔑 Verifique se o JWT está configurado corretamente no AuthContext.`
          );
        } else if (createError.code === '23505') {
          setError('Já existe uma lista com este nome para sua empresa.');
        } else if (createError.code === '23503') {
          setError('Erro de referência: Dados da empresa inválidos.');
        } else {
          setError(`Erro ao criar lista: ${createError.message} (Código: ${createError.code || 'N/A'})`);
        }
        return;
      }
      
      if (!data) {
        setError('Lista criada, mas não foi possível recuperar os dados. Recarregue a página.');
        return;
      }
      
      console.log('✅ Lista criada com sucesso:', data);
      setSuccess(`Lista "${formData.name}" criada com sucesso! Gerando dados únicos para ${company.name}...`);
      
      try {
        await populateMockData(data.id);
        setSuccess(`🎉 Lista "${formData.name}" criada e populada com dados únicos para ${company.name}! Redirecionando...`);
      } catch (populateError) {
        console.error('⚠️ Erro ao popular dados:', populateError);
        
        if (populateError instanceof Error && populateError.message.includes('overflow numérico')) {
          setError(
            `Lista criada, mas erro ao popular dados: ${populateError.message} ` +
            `Execute o script "supabase-simple-decimal-fix.sql" no Supabase para corrigir.`
          );
        } else {
          setSuccess(`Lista "${formData.name}" criada com sucesso, mas houve erro ao popular dados fictícios.`);
        }
      }
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setError('Erro inesperado ao criar lista. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading || populatingData) return;
    onBack();
  };

  const isProcessing = loading || populatingData;

  return (
    <div className="px-6 pb-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-[#373753]">Criar Nova Lista de Avaliação</h1>
          <p className="text-[#677c92] text-sm">
            Configure uma nova lista para organizar suas avaliações de chamadas
            {company && (
              <span className="ml-2 text-[#3057f2]">• {company.name}</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <Alert className="border-[#DC2F1C] bg-[#fef2f2]">
          <AlertCircle className="h-4 w-4 text-[#DC2F1C]" />
          <AlertDescription className="text-[#DC2F1C] whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-[#5CB868] bg-[#f0f9f4]">
          <CheckCircle className="h-4 w-4 text-[#5CB868]" />
          <AlertDescription className="text-[#5CB868]">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {populatingData && (
        <Alert className="border-[#3057f2] bg-[#f0f4fa]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin"></div>
            <AlertDescription className="text-[#3057f2]">
              Gerando dados únicos para {company?.name}: agentes, telefones e avaliações específicas...
            </AlertDescription>
          </div>
        </Alert>
      )}

      {error && error.includes('overflow') && (
        <Alert className="border-[#e67c0b] bg-[#fff6bf]">
          <AlertTriangle className="h-4 w-4 text-[#b86309]" />
          <AlertDescription className="text-[#b86309]">
            <div className="space-y-2">
              <p><strong>Erro de Overflow Numérico Detectado:</strong></p>
              <p>Execute este script no Supabase SQL Editor para corrigir:</p>
              <code className="block bg-white p-2 rounded text-sm">
                supabase-simple-decimal-fix.sql
              </code>
              <p className="text-xs">Este script corrige a estrutura das colunas de score para suportar valores até 9.5.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações da Lista
            </CardTitle>
            <CardDescription>
              Preencha os dados básicos da sua lista de avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#677c92]" />
                  Nome da Lista *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Campanha Black Friday 2024"
                  disabled={isProcessing}
                  className="h-11"
                  maxLength={255}
                />
                <p className="text-xs text-[#677c92]">
                  Nome que será exibido no dashboard para identificar esta lista
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#677c92]" />
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o objetivo desta lista de avaliação..."
                  disabled={isProcessing}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-[#677c92]">
                  Descrição opcional para detalhar o propósito desta lista
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateStart" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#677c92]" />
                    Data de Início
                  </Label>
                  <Input
                    id="dateStart"
                    type="date"
                    value={formData.dateRangeStart}
                    onChange={(e) => handleInputChange('dateRangeStart', e.target.value)}
                    disabled={isProcessing}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateEnd" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#677c92]" />
                    Data de Fim
                  </Label>
                  <Input
                    id="dateEnd"
                    type="date"
                    value={formData.dateRangeEnd}
                    onChange={(e) => handleInputChange('dateRangeEnd', e.target.value)}
                    disabled={isProcessing}
                    className="h-11"
                    min={formData.dateRangeStart || undefined}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#677c92]" />
                  Objetivo/Meta
                </Label>
                <Input
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="Ex: Melhorar atendimento ao cliente, Treinamento de vendas..."
                  disabled={isProcessing}
                  className="h-11"
                  maxLength={255}
                />
                <p className="text-xs text-[#677c92]">
                  Qual o objetivo principal desta lista de avaliação?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isProcessing || !formData.name.trim()}
                  className="bg-[#3057f2] hover:bg-[#2545d9] text-white px-6"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {populatingData ? 'Populando dados...' : 'Criando...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Lista
                    </div>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#e1e9f4] bg-[#f0f4fa]">
          <CardContent className="p-4">
            <h4 className="font-medium text-[#373753] mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              O que será criado automaticamente?
            </h4>
            <p className="text-sm text-[#677c92] mb-3">
              Após criar a lista, populamos automaticamente com dados únicos específicos para {company?.name}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[#677c92]">
                <Users className="h-4 w-4 text-[#3057f2]" />
                <span><strong>6 Agentes Únicos</strong><br />Com nomes e emails específicos</span>
              </div>
              <div className="flex items-center gap-2 text-[#677c92]">
                <Phone className="h-4 w-4 text-[#5CB868]" />
                <span><strong>200+ Chamadas</strong><br />Telefones baseados na empresa</span>
              </div>
              <div className="flex items-center gap-2 text-[#677c92]">
                <BarChart3 className="h-4 w-4 text-[#e67c0b]" />
                <span><strong>Scores 6.0-9.5</strong><br />Únicos por empresa</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-white rounded text-xs text-[#677c92]">
              <strong>🛡️ Multitenant:</strong> Cada empresa terá agentes únicos - "{company?.name}" não verá dados de outras empresas.
              Os agentes e chamadas são gerados especificamente para sua empresa usando algoritmos baseados no nome da empresa.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
