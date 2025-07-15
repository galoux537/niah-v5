import { useEffect, useRef } from 'react';

export type Page = 'avaliacoes' | 'list-detail' | 'criteria' | 'criteria-detail' | 'criteria-create' | 'configuracoes' | 'usuarios' | 'batch-analysis' | 'reset-password';

interface NavigationState {
  currentPage: Page;
  selectedCriteriaId?: string | null;
  selectedListId?: string | null;
  selectedListName?: string;
}

// Páginas que não devem permitir voltar (páginas de autenticação)
const AUTH_PAGES: Page[] = ['reset-password'];

// Páginas que são consideradas "páginas internas" (permitem navegação normal)
const INTERNAL_PAGES: Page[] = ['avaliacoes', 'list-detail', 'criteria', 'criteria-detail', 'criteria-create', 'configuracoes', 'usuarios', 'batch-analysis'];

export function useNavigationHistory(
  currentPage: Page,
  onPageChange: (page: Page) => void,
  onBackToDashboard?: () => void,
  onBackToCriteria?: () => void,
  selectedCriteriaId?: string | null,
  selectedListId?: string | null,
  selectedListName?: string
) {
  const navigationStack = useRef<NavigationState[]>([]);
  const isInitialized = useRef(false);
  const isNavigating = useRef(false);

  // Inicializar histórico quando o usuário faz login
  useEffect(() => {
    if (!isInitialized.current && currentPage && !AUTH_PAGES.includes(currentPage)) {
      console.log('🧭 Inicializando histórico de navegação');
      navigationStack.current = [{
        currentPage,
        selectedCriteriaId,
        selectedListId,
        selectedListName
      }];
      isInitialized.current = true;
      
      // Substituir o estado atual no histórico (não adicionar)
      window.history.replaceState(
        { 
          page: currentPage,
          selectedCriteriaId,
          selectedListId,
          selectedListName,
          isInternal: true
        },
        '',
        window.location.href
      );
    }
  }, [currentPage, selectedCriteriaId, selectedListId, selectedListName]);

  // Função para navegar para uma nova página
  const navigateTo = (page: Page, params?: {
    selectedCriteriaId?: string | null;
    selectedListId?: string | null;
    selectedListName?: string;
  }) => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    
    const newState: NavigationState = {
      currentPage: page,
      selectedCriteriaId: params?.selectedCriteriaId ?? selectedCriteriaId,
      selectedListId: params?.selectedListId ?? selectedListId,
      selectedListName: params?.selectedListName ?? selectedListName
    };

    // Se for uma página interna, adicionar ao histórico
    if (INTERNAL_PAGES.includes(page)) {
      navigationStack.current.push(newState);
      
      // Adicionar ao histórico do navegador
      window.history.pushState(
        {
          page,
          selectedCriteriaId: newState.selectedCriteriaId,
          selectedListId: newState.selectedListId,
          selectedListName: newState.selectedListName,
          isInternal: true
        },
        '',
        window.location.href
      );
    } else {
      // Para páginas de autenticação, substituir o estado atual
      window.history.replaceState(
        {
          page,
          selectedCriteriaId: newState.selectedCriteriaId,
          selectedListId: newState.selectedListId,
          selectedListName: newState.selectedListName,
          isInternal: false
        },
        '',
        window.location.href
      );
    }

    onPageChange(page);
    
    // Reset flag após um pequeno delay
    setTimeout(() => {
      isNavigating.current = false;
    }, 100);
  };

  // Função para voltar
  const goBack = () => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;

    // Se temos páginas no stack, voltar para a anterior
    if (navigationStack.current.length > 1) {
      navigationStack.current.pop(); // Remove a página atual
      const previousState = navigationStack.current[navigationStack.current.length - 1];
      
      // Atualizar o histórico do navegador
      window.history.back();
      
      // Aplicar o estado anterior
      onPageChange(previousState.currentPage);
      
      // Se necessário, chamar callbacks específicos
      if (previousState.currentPage === 'avaliacoes' && onBackToDashboard) {
        onBackToDashboard();
      } else if (previousState.currentPage === 'criteria' && onBackToCriteria) {
        onBackToCriteria();
      }
    } else {
      // Se não há páginas anteriores, ir para a página principal
      navigateTo('avaliacoes');
    }
    
    setTimeout(() => {
      isNavigating.current = false;
    }, 100);
  };

  // Listener para o botão voltar do navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isNavigating.current) return;
      
      console.log('🧭 PopState detectado:', event.state);
      
      // Se não há estado ou não é uma página interna, redirecionar para avaliacoes
      if (!event.state || !event.state.isInternal) {
        console.log('🧭 Redirecionando para avaliacoes (estado inválido)');
        navigateTo('avaliacoes');
        return;
      }

      const { page, selectedCriteriaId, selectedListId, selectedListName } = event.state;
      
      // Verificar se a página é válida
      if (!INTERNAL_PAGES.includes(page)) {
        console.log('🧭 Página inválida, redirecionando para avaliacoes');
        navigateTo('avaliacoes');
        return;
      }

      // Atualizar o stack de navegação
      const newState: NavigationState = {
        currentPage: page,
        selectedCriteriaId,
        selectedListId,
        selectedListName
      };

      // Encontrar a posição da página no stack
      const pageIndex = navigationStack.current.findIndex(
        state => state.currentPage === page &&
        state.selectedCriteriaId === selectedCriteriaId &&
        state.selectedListId === selectedListId
      );

      if (pageIndex !== -1) {
        // Se a página está no stack, cortar até ela
        navigationStack.current = navigationStack.current.slice(0, pageIndex + 1);
      } else {
        // Se não está no stack, adicionar
        navigationStack.current.push(newState);
      }

      // Aplicar o estado
      onPageChange(page);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onPageChange]);

  // Função para limpar o histórico quando o usuário faz logout
  const clearHistory = () => {
    navigationStack.current = [];
    isInitialized.current = false;
    isNavigating.current = false;
  };

  return {
    navigateTo,
    goBack,
    clearHistory,
    canGoBack: navigationStack.current.length > 1
  };
} 