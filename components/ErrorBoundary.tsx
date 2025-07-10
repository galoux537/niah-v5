import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error info:', errorInfo);
    console.error('🚨 Stack trace:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return this.props.fallback || (
        <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl border border-[#e1e9f4] p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#dc2f1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-[#373753] mb-2">
                Erro na Aplicação
              </h2>
              <p className="text-[#677c92] text-sm mb-4">
                Ocorreu um erro inesperado na aplicação NIAH!
              </p>
            </div>

            {/* Detalhes do erro para desenvolvimento */}
            {isDevelopment && this.state.error && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-[#dc2f1c] mb-2">Detalhes do Erro (Desenvolvimento):</h3>
                <div className="space-y-2">
                  <div>
                    <strong className="text-[#dc2f1c] text-sm">Mensagem:</strong>
                    <p className="text-[#dc2f1c] text-sm font-mono bg-white p-2 rounded border mt-1">
                      {this.state.error.message}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-[#dc2f1c] text-sm">Stack Trace:</strong>
                      <pre className="text-[#dc2f1c] text-xs font-mono bg-white p-2 rounded border mt-1 overflow-x-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-[#dc2f1c] text-sm">Component Stack:</strong>
                      <pre className="text-[#dc2f1c] text-xs font-mono bg-white p-2 rounded border mt-1 overflow-x-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações sobre possíveis causas */}
            <div className="bg-[#f0f4fa] border border-[#e1e9f4] rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-[#373753] mb-2">Possíveis Causas:</h4>
              <ul className="text-sm text-[#677c92] space-y-1">
                <li>• Problema na conexão com o banco de dados Supabase</li>
                <li>• Políticas RLS (Row Level Security) muito restritivas</li>
                <li>• Componente tentando acessar dados indisponíveis</li>
                <li>• Erro na criação ou manipulação de critérios</li>
                <li>• Problema na autenticação da empresa</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#3057f2] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
              >
                Recarregar Página
              </button>
              
              <button
                onClick={() => {
                  // Limpar localStorage e recarregar
                  localStorage.clear();
                  window.location.reload();
                }}
                className="bg-[#f59e0b] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#d97706] transition-colors"
              >
                Limpar Cache e Recarregar
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="bg-white border border-[#e1e9f4] text-[#677c92] px-6 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
              >
                Tentar Novamente
              </button>
            </div>

            {/* Instrução para o usuário */}
            <div className="mt-6 p-3 bg-[#e1f0ff] border border-[#b3d9ff] rounded-lg">
              <p className="text-[#1e40af] text-xs text-center">
                <strong>Para desenvolvedores:</strong> Execute o script SQL de correção no Supabase e verifique o console do navegador para mais detalhes.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
