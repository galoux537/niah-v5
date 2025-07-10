import React, { useState, useEffect } from 'react';
import { testConnection } from '../src/lib/supabase';
import { Check, X, Database, Globe, Key, AlertCircle, RefreshCw } from 'lucide-react';

interface ConnectionInfo {
  isConnected: boolean;
  projectUrl: string;
  projectRef: string;
  error?: string;
  lastCheck?: string;
}

export function SupabaseConnectionCheck() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    isConnected: false,
    projectUrl: 'https://iyqrjgwqjmsnhtxbywme.supabase.co',
    projectRef: 'iyqrjgwqjmsnhtxbywme'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    
    try {
      const { connected, error } = await testConnection();
      
      setConnectionInfo({
        isConnected: connected,
        projectUrl: 'https://iyqrjgwqjmsnhtxbywme.supabase.co',
        projectRef: 'iyqrjgwqjmsnhtxbywme',
        error: error || undefined,
        lastCheck: new Date().toISOString()
      });
    } catch (err) {
      setConnectionInfo({
        isConnected: false,
        projectUrl: 'https://iyqrjgwqjmsnhtxbywme.supabase.co',
        projectRef: 'iyqrjgwqjmsnhtxbywme',
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        lastCheck: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e1e9f4] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
          <Database className="h-4 w-4 text-[#3057f2]" />
        </div>
        <h3 className="text-[#373753] text-lg font-medium">Status da Conexão Supabase</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#677c92]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#3057f2]" />
          Verificando conexão...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            {connectionInfo.isConnected ? (
              <div className="flex items-center gap-2 text-[#5CB868]">
                <Check className="h-5 w-5" />
                <span className="font-medium">Conectado com sucesso</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#DC2F1C]">
                <X className="h-5 w-5" />
                <span className="font-medium">Falha na conexão</span>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-[#3057f2]" />
                <span className="text-[#373753] font-medium text-sm">URL do Projeto</span>
              </div>
              <p className="text-[#677c92] text-xs font-mono break-all">
                {connectionInfo.projectUrl}
              </p>
            </div>

            <div className="bg-[#f9fbfd] rounded-lg p-4 border border-[#e1e9f4]">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-[#3057f2]" />
                <span className="text-[#373753] font-medium text-sm">Referência do Projeto</span>
              </div>
              <p className="text-[#677c92] text-xs font-mono">
                {connectionInfo.projectRef}
              </p>
            </div>
          </div>

          {/* Success Info */}
          {connectionInfo.isConnected && (
            <div className="bg-[#f0f9f4] rounded-lg p-4 border border-[#d4edda]">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-[#5CB868]" />
                <span className="text-[#373753] font-medium text-sm">Detalhes da Conexão</span>
              </div>
              <div className="text-[#677c92] text-xs space-y-1">
                <p>✅ Banco de dados acessível</p>
                <p>✅ Tabelas configuradas corretamente</p>
                <p>✅ Políticas RLS ativas</p>
                <p>✅ Autenticação funcionando</p>
                {connectionInfo.lastCheck && (
                  <p>🕐 Verificado em: {new Date(connectionInfo.lastCheck).toLocaleString('pt-BR')}</p>
                )}
              </div>
            </div>
          )}

          {/* Error Info */}
          {!connectionInfo.isConnected && connectionInfo.error && (
            <div className="bg-[#fef2f2] rounded-lg p-4 border border-[#fecaca]">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-[#DC2F1C]" />
                <span className="text-[#373753] font-medium text-sm">Erro de Conexão</span>
              </div>
              <p className="text-[#DC2F1C] text-xs mb-3">
                {connectionInfo.error}
              </p>
              
              {/* Troubleshooting Steps */}
              <div className="text-[#677c92] text-xs">
                <p className="font-medium mb-2">🔧 Solução Rápida:</p>
                <div className="bg-[#fffbf0] border border-[#fed7aa] rounded p-3 mb-3">
                  <p className="font-medium text-[#92400e] mb-1">
                    ⚡ Execute este script adicional no SQL Editor:
                  </p>
                  <code className="text-[#92400e] text-xs">supabase-rls-fix.sql</code>
                </div>
                
                <p className="font-medium mb-1">📋 Passos detalhados:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Execute o script <code>supabase-setup.sql</code> (principal)</li>
                  <li>Execute o script <code>supabase-rls-fix.sql</code> (correção RLS)</li>
                  <li>Verifique se as políticas foram aplicadas</li>
                  <li>Teste novamente a conexão</li>
                </ol>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-[#677c92]">
              {connectionInfo.lastCheck && (
                <>Última verificação: {new Date(connectionInfo.lastCheck).toLocaleString('pt-BR')}</>
              )}
            </div>
            <button
              onClick={checkConnection}
              disabled={loading}
              className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Verificando...' : 'Verificar Novamente'}
            </button>
          </div>

          {/* Setup Instructions */}
          {!connectionInfo.isConnected && (
            <div className="bg-[#fff8f0] rounded-lg p-4 border border-[#fed7aa] mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-[#92400e]">
                  <p className="font-medium mb-1">⚡ Configuração Necessária</p>
                  <p className="mb-2">Para resolver este problema, execute os seguintes passos:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Acesse o <strong>SQL Editor</strong> no dashboard do Supabase</li>
                    <li>Execute o script completo do arquivo <code>supabase-setup.sql</code></li>
                    <li>Verifique se todas as tabelas foram criadas</li>
                    <li>Confirme as políticas RLS em Authentication &gt; Policies</li>
                  </ol>
                  <p className="mt-2">
                    📖 Consulte o arquivo <code>SUPABASE_SETUP_COMPLETE.md</code> para instruções detalhadas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
