import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface CriteriaCreatePageProps {
  onBack: () => void;
}

export function CriteriaCreatePage({ onBack }: CriteriaCreatePageProps) {
  const { companyId, company } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome do critério é obrigatório');
      return;
    }

    if (!companyId) {
      setError('Dados da empresa não encontrados');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Criando novo critério:', {
        name: name.trim(),
        company: company?.name,
        companyId
      });

      // Verificação adicional de dados
      if (!companyId || typeof companyId !== 'string') {
        throw new Error('ID da empresa inválido ou ausente');
      }

      if (!name.trim() || name.trim().length < 2) {
        throw new Error('Nome do critério deve ter pelo menos 2 caracteres');
      }

      const { data, error: insertError } = await supabase
        .from('criteria')
        .insert([
          {
            name: name.trim(),
            company_id: companyId,
            total_calls: 0,
            average_score: 0.0
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar critério:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Tratamento específico de erros
        switch (insertError.code) {
          case '23505':
            if (insertError.message.includes('criteria_name_company_id_key')) {
              setError('Já existe um critério com este nome nesta empresa.');
            } else {
              setError('Erro de duplicação: ' + insertError.message);
            }
            break;
          case '23503':
            setError('Erro de integridade: Empresa não encontrada. Faça login novamente.');
            break;
          case '42501':
            setError('Erro de permissão: Não autorizado a criar critérios. Verifique suas permissões.');
            break;
          case 'PGRST301':
            setError('Erro de política: Verifique se RLS está configurado corretamente.');
            break;
          default:
            setError(`Erro ao criar critério: ${insertError.message} (Código: ${insertError.code})`);
        }
        return;
      }

      if (!data) {
        throw new Error('Critério criado mas dados não retornados');
      }

      console.log('✅ Critério criado com sucesso:', data);
      
      setSuccess(true);
      
      // Voltar após 2 segundos
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err) {
      console.error('💥 Erro inesperado ao criar critério:', err);
      
      if (err instanceof Error) {
        // Erros específicos conhecidos
        if (err.message.includes('Failed to fetch')) {
          setError('Erro de conexão: Verifique sua conexão com a internet e tente novamente.');
        } else if (err.message.includes('JWT')) {
          setError('Erro de autenticação: Faça login novamente.');
        } else if (err.message.includes('RLS')) {
          setError('Erro de segurança: Políticas de acesso restritivas. Contate o administrador.');
        } else {
          setError(`Erro: ${err.message}`);
        }
      } else {
        setError('Erro desconhecido. Tente novamente ou contate o suporte.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#f0f9f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-[#16a34a]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Critério criado com sucesso!</h3>
          <p className="text-[#677c92] text-sm mb-4">
            O critério "{name}" foi adicionado à empresa {company?.name}.
          </p>
          <div className="w-6 h-6 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#677c92] text-xs mt-2">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-[#677c92] text-xs uppercase tracking-wide">CRITÉRIOS</p>
          <h1 className="text-[#373753] text-xl font-medium">Novo Critério</h1>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-[#e1f0ff] border border-[#b3d9ff] rounded-lg p-4">
        <p className="text-[#1e40af] text-sm">
          <strong>Criando critério para a empresa:</strong> {company?.name}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        <div className="p-6">
          <h2 className="text-lg font-medium text-[#373753] mb-6">Informações Gerais</h2>
          
          {error && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#dc2f1c] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#dc2f1c] font-medium text-sm">Erro ao criar critério</p>
                  <p className="text-[#dc2f1c] text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#373753] mb-2">
                Nome do critério *
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cordialidade, Objetividade, Tempo de resposta..."
                className="w-full"
                required
                disabled={loading}
              />
              <p className="text-xs text-[#677c92] mt-1">
                Nome que identificará este critério de avaliação
              </p>
            </div>

            <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-4">
              <h4 className="font-medium text-[#373753] mb-2">Subcritérios de Avaliação</h4>
              <p className="text-sm text-[#677c92] mb-3">
                Exemplos de Como utilizar subcritérios para avaliar chamadas nesta empresa:
              </p>
              <ul className="text-sm text-[#677c92] space-y-1">
                <li>• <strong>Finalização:</strong> Como o atendente finaliza a chamada</li>
                <li>• <strong>Cordialidade:</strong> Nível de cortesia e educação</li>
                <li>• <strong>Formalidade:</strong> Uso apropriado da linguagem formal</li>
                <li>• <strong>Saudação:</strong> Qualidade da abertura da chamada</li>
                <li>• <strong>Negociação:</strong> Habilidade de negociação e persuasão</li>
                <li>• <strong>Abordagem:</strong> Técnica de abordagem do cliente</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e1e9f4]">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-[#3057f2] text-white hover:bg-[#2545d9]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </div>
                ) : (
                  'Criar Critério'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Box */}
    </div>
  );
}
