import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardPage } from './components/DashboardPage';
import { ListDetailPage } from './components/ListDetailPage';
import { ListDetailPageV2 } from './components/ListDetailPageV2';
import { ListDetailPageV3 } from './components/ListDetailPageV3';
import { CriteriaPage } from './components/CriteriaPage';
import { CriteriaDetailPage } from './components/CriteriaDetailPage';
import { CriteriaCreatePage } from './components/CriteriaCreatePage';
import { AdminPage } from './components/AdminPage';
import { ConfiguracoesPage } from './components/ConfiguracoesPage';
import { BatchAnalysisPage } from './components/BatchAnalysisPage';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

import UsersPage from './components/UsersPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';

export type Page = 'avaliacoes' | 'list-detail' | 'criteria' | 'criteria-detail' | 'criteria-create' | 'configuracoes' | 'usuarios' | 'batch-analysis' | 'reset-password';

function AppContent() {
  const authContext = useAuth();
  
  // Verificar se o contexto foi carregado corretamente
  if (!authContext) {
    console.error('AuthContext not found');
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-[#373753] mb-2">Erro de configuração</h2>
          <p className="text-[#677c92] text-sm">Contexto de autenticação não foi encontrado.</p>
        </div>
      </div>
    );
  }

  const { company, loading, isAdmin } = authContext;
  const [currentPage, setCurrentPage] = useState<Page>('avaliacoes');
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListName, setSelectedListName] = useState<string>('');

  // Limpar seleções quando necessário
  useEffect(() => {
    if (currentPage !== 'criteria-detail' && currentPage !== 'criteria-create') {
      setSelectedCriteriaId(null);
    }
    if (currentPage !== 'list-detail') {
      setSelectedListId(null);
      setSelectedListName('');
    }
  }, [currentPage]);

  // Sempre que a empresa mudar, forçar navegação para avaliacoes
  useEffect(() => {
    setCurrentPage('avaliacoes');
  }, [company?.id]);

  // Detectar rota de redefinição de senha
  useEffect(() => {
    const checkResetPasswordRoute = () => {
      // Verificar se está na rota de redefinição de senha
      const isResetPasswordRoute = 
        window.location.pathname.includes('reset-password') ||
        window.location.hash.includes('reset-password') ||
        window.location.search.includes('reset-password') ||
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('type=recovery');
      
      if (isResetPasswordRoute) {
        console.log('🔧 Detectada rota de redefinição de senha');
        console.log('📍 Pathname:', window.location.pathname);
        console.log('🔗 Hash:', window.location.hash);
        console.log('❓ Search:', window.location.search);
        setCurrentPage('reset-password');
      }
    };

    // Verificar imediatamente
    checkResetPasswordRoute();

    // Listener para mudanças de URL
    const handleUrlChange = () => {
      console.log('🔄 URL mudou, verificando rota...');
      checkResetPasswordRoute();
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // NOVO: Forçar renderização da tela de redefinição de senha SEM autenticação
  const isResetPasswordRoute =
    window.location.pathname.includes('reset-password') ||
    window.location.hash.includes('reset-password') ||
    window.location.search.includes('reset-password') ||
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('type=recovery');

  if (isResetPasswordRoute) {
    return <ResetPasswordPage />;
  }

  const handleBackToDashboard = useCallback(() => {
    setCurrentPage('avaliacoes');
  }, []);

  const handleListClick = useCallback((listId: string, listName: string) => {
    setSelectedListId(listId);
    setSelectedListName(listName);
    setCurrentPage('list-detail');
  }, []);

  const handleCriteriaClick = useCallback((criteriaId: string) => {
    if (!criteriaId || typeof criteriaId !== 'string') {
      console.error('handleCriteriaClick: invalid criteriaId provided:', criteriaId);
      return;
    }
    setSelectedCriteriaId(criteriaId);
    setCurrentPage('criteria-detail');
  }, []);

  const handleCreateCriteria = useCallback(() => {
    setCurrentPage('criteria-create');
  }, []);

  const handleBackToCriteria = useCallback(() => {
    setCurrentPage('criteria');
    setSelectedCriteriaId(null);
  }, []);

  const handlePageChange = useCallback((page: Page) => {
    if (!page || typeof page !== 'string') {
      console.error('handlePageChange: invalid page provided:', page);
      return;
    }
    setCurrentPage(page);
  }, []);

  const renderPage = useCallback(() => {
    try {
      switch (currentPage) {
        case 'avaliacoes':
          return (
            <DashboardPage 
              onListClick={handleListClick} 
            />
          );
        
        case 'list-detail':
          if (!selectedListId || !selectedListName) {
            console.warn('list-detail page accessed without selectedListId or selectedListName, redirecting to avaliacoes');
            setCurrentPage('avaliacoes');
            return (
              <DashboardPage 
                onListClick={handleListClick} 
              />
            );
          }
          return (
            <ListDetailPageV3 
              listId={selectedListId} 
              listName={selectedListName}
              onBack={handleBackToDashboard} 
            />
          );
        
        case 'criteria':
          return (
            <CriteriaPage 
              onCriteriaClick={handleCriteriaClick} 
              onCreateCriteria={handleCreateCriteria} 
            />
          );
        
        case 'criteria-detail':
          if (!selectedCriteriaId) {
            console.warn('criteria-detail page accessed without selectedCriteriaId, redirecting to criteria');
            setCurrentPage('criteria');
            return (
              <CriteriaPage 
                onCriteriaClick={handleCriteriaClick} 
                onCreateCriteria={handleCreateCriteria} 
              />
            );
          }
          return (
            <CriteriaDetailPage 
              criteriaId={selectedCriteriaId} 
              onBack={handleBackToCriteria} 
            />
          );
        
        case 'criteria-create':
          return (
            <CriteriaCreatePage 
              onBack={handleBackToCriteria} 
            />
          );
        
        case 'configuracoes':
          return <ConfiguracoesPage />;
        
        case 'usuarios':
          return <UsersPage />;
        
        case 'batch-analysis':
          return <BatchAnalysisPage />;

        case 'reset-password':
          return <ResetPasswordPage />;
        
        default:
          console.warn(`Unknown page: ${currentPage}, defaulting to avaliacoes`);
          setCurrentPage('avaliacoes');
          return (
            <DashboardPage 
              onListClick={handleListClick} 
            />
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="px-6 py-12 text-center">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#dc2f1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-[#373753] mb-2">
              Erro ao carregar página
            </h2>
            <p className="text-[#677c92] text-sm mb-4">
              Ocorreu um erro ao carregar esta página. Tente navegar para outra seção.
            </p>
            <button
              onClick={() => {
                setCurrentPage('avaliacoes');
                setSelectedCriteriaId(null);
                setSelectedListId(null);
                setSelectedListName('');
              }}
              className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }
  }, [currentPage, selectedCriteriaId, selectedListId, selectedListName, handleBackToDashboard, handleListClick, handleCriteriaClick, handleCreateCriteria, handleBackToCriteria]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show login page if company is not authenticated
  if (!company) {
    return (
      <ErrorBoundary>
        <div className="relative">
          <LoginPage />
        </div>
      </ErrorBoundary>
    );
  }

  // If company is admin (NIAH! Sistemas), show admin panel for company management
  if (isAdmin) {
    return (
      <ErrorBoundary>
        <div className="relative">
          <AdminPage />
        </div>
      </ErrorBoundary>
    );
  }

  // Show main app with header sempre presente
  return (
    <ErrorBoundary>
      <div className="bg-[#f9fafc] min-h-screen relative">
        <Header currentPage={currentPage} onPageChange={handlePageChange} />
        <div className="pt-6">
          {renderPage()}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#e1e9f4] p-6 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#dc2f1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-[#373753] mb-2">
            Erro Crítico da Aplicação
          </h2>
          <p className="text-[#677c92] text-sm mb-4">
            Ocorreu um erro crítico. Por favor, recarregue a página para tentar novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    }>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
