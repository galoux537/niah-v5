import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';

interface DebugInfo {
  authStatus: {
    company: any;
    companyId: string | null;
    isAuthenticated: boolean;
  };
  databaseStatus: {
    companies: any[];
    criteria: any[];
    companiesError: any;
    criteriaError: any;
  };
  testResults: {
    canCreateCriteria: boolean;
    testError: string | null;
    testCriteriaId: string | null;
  };
}

export function DatabaseDebugComponent() {
  const { company, companyId } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Executando diagnóstico completo...');
      
      // 1. Status de autenticação
      const authStatus = {
        company,
        companyId,
        isAuthenticated: !!company && !!companyId
      };
      
      console.log('🔐 Status de autenticação:', authStatus);

      // 2. Status do banco de dados
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(5);

      const { data: criteria, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .limit(5);

      const databaseStatus = {
        companies: companies || [],
        criteria: criteria || [],
        companiesError,
        criteriaError
      };

      console.log('🗄️ Status do banco:', databaseStatus);

      // 3. Teste de criação de critério
      let testResults = {
        canCreateCriteria: false,
        testError: null as string | null,
        testCriteriaId: null as string | null
      };

      if (companyId) {
        try {
          const testName = 'TESTE_DEBUG_' + Date.now();
          console.log('🧪 Testando criação de critério:', testName);

          const { data, error } = await supabase
            .from('criteria')
            .insert([{
              name: testName,
              company_id: companyId,
              total_calls: 0,
              average_score: 0.0
            }])
            .select()
            .single();

          if (error) {
            testResults.testError = `${error.code}: ${error.message}`;
            console.error('❌ Erro no teste:', error);
          } else if (data) {
            testResults.canCreateCriteria = true;
            testResults.testCriteriaId = data.id;
            console.log('✅ Teste passou:', data);

            // Limpar teste
            await supabase
              .from('criteria')
              .delete()
              .eq('id', data.id);
            
            console.log('🧹 Teste limpo');
          }
        } catch (err) {
          testResults.testError = err instanceof Error ? err.message : 'Erro desconhecido';
          console.error('💥 Erro no teste:', err);
        }
      } else {
        testResults.testError = 'CompanyId não disponível';
      }

      setDebugInfo({
        authStatus,
        databaseStatus,
        testResults
      });

      console.log('📊 Diagnóstico completo:', {
        authStatus,
        databaseStatus,
        testResults
      });

    } catch (err) {
      console.error('💥 Erro no diagnóstico:', err);
      setDebugInfo({
        authStatus: { company, companyId, isAuthenticated: false },
        databaseStatus: { companies: [], criteria: [], companiesError: err, criteriaError: null },
        testResults: { canCreateCriteria: false, testError: 'Erro no diagnóstico', testCriteriaId: null }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      runDiagnostic();
    }
  }, [visible]);

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setVisible(true)}
          className="bg-[#f59e0b] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#d97706] transition-colors"
        >
          <Database className="h-4 w-4 mr-1" />
          Debug DB
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-[#3057f2]" />
              <h2 className="text-xl font-medium text-[#373753]">Diagnóstico do Sistema</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={runDiagnostic}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={() => setVisible(false)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#677c92]">Executando diagnóstico...</p>
            </div>
          ) : debugInfo ? (
            <div className="space-y-6">
              {/* Status de Autenticação */}
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-4">
                <h3 className="font-medium text-[#373753] mb-3 flex items-center gap-2">
                  {debugInfo.authStatus.isAuthenticated ? (
                    <CheckCircle className="h-5 w-5 text-[#16a34a]" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#dc2f1c]" />
                  )}
                  Status de Autenticação
                </h3>
                <div className="text-sm space-y-2">
                  <div><strong>Autenticado:</strong> {debugInfo.authStatus.isAuthenticated ? '✅ Sim' : '❌ Não'}</div>
                  <div><strong>Company ID:</strong> {debugInfo.authStatus.companyId || 'Não disponível'}</div>
                  <div><strong>Empresa:</strong> {debugInfo.authStatus.company?.name || 'Não logado'}</div>
                  <div><strong>Email:</strong> {debugInfo.authStatus.company?.email || 'Não disponível'}</div>
                </div>
              </div>

              {/* Status do Banco */}
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-4">
                <h3 className="font-medium text-[#373753] mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#3057f2]" />
                  Status do Banco de Dados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Empresas ({debugInfo.databaseStatus.companies.length}):</strong>
                    {debugInfo.databaseStatus.companiesError ? (
                      <div className="text-[#dc2f1c] mt-1">
                        Erro: {debugInfo.databaseStatus.companiesError.message}
                      </div>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {debugInfo.databaseStatus.companies.slice(0, 3).map((comp: any) => (
                          <li key={comp.id} className="text-xs">
                            • {comp.name} ({comp.email})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <strong>Critérios ({debugInfo.databaseStatus.criteria.length}):</strong>
                    {debugInfo.databaseStatus.criteriaError ? (
                      <div className="text-[#dc2f1c] mt-1">
                        Erro: {debugInfo.databaseStatus.criteriaError.message}
                      </div>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {debugInfo.databaseStatus.criteria.slice(0, 3).map((crit: any) => (
                          <li key={crit.id} className="text-xs">
                            • {crit.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Teste de Criação */}
              <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-4">
                <h3 className="font-medium text-[#373753] mb-3 flex items-center gap-2">
                  {debugInfo.testResults.canCreateCriteria ? (
                    <CheckCircle className="h-5 w-5 text-[#16a34a]" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#dc2f1c]" />
                  )}
                  Teste de Criação de Critério
                </h3>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Pode criar critérios:</strong> {debugInfo.testResults.canCreateCriteria ? '✅ Sim' : '❌ Não'}
                  </div>
                  {debugInfo.testResults.testError && (
                    <div>
                      <strong>Erro do teste:</strong>
                      <pre className="bg-[#fef2f2] border border-[#fecaca] p-2 rounded mt-1 text-xs text-[#dc2f1c] overflow-x-auto">
                        {debugInfo.testResults.testError}
                      </pre>
                    </div>
                  )}
                  {debugInfo.testResults.testCriteriaId && (
                    <div className="text-[#16a34a]">
                      <strong>Teste passou:</strong> Critério criado e removido com sucesso
                    </div>
                  )}
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-[#e1f0ff] border border-[#b3d9ff] rounded-lg p-4">
                <h4 className="font-medium text-[#1e40af] mb-2">🎯 Próximos Passos:</h4>
                <ul className="text-sm text-[#1e40af] space-y-1">
                  {!debugInfo.authStatus.isAuthenticated && (
                    <li>• Fazer login com uma empresa válida</li>
                  )}
                  {debugInfo.databaseStatus.companiesError && (
                    <li>• Executar script SQL para corrigir tabela companies</li>
                  )}
                  {debugInfo.databaseStatus.criteriaError && (
                    <li>• Executar script SQL para corrigir tabela criteria</li>
                  )}
                  {debugInfo.testResults.testError && (
                    <li>• Executar script SQL para desabilitar RLS</li>
                  )}
                  {debugInfo.testResults.canCreateCriteria && (
                    <li>✅ Sistema funcionando! Pode criar critérios normalmente.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#677c92]">Clique em "Atualizar" para executar o diagnóstico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
