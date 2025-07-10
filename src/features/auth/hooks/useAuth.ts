import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Company 
} from '../types/auth.types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  }));

  // Carregar estado inicial
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Verificar se o token ainda é válido
        const isValid = await authService.verifyToken();
        
        if (isValid) {
          const state = authService.getAuthState();
          setAuthState({ ...state, isLoading: false });
        } else {
          setAuthState({
            user: null,
            company: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        setAuthState({
          user: null,
          company: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadAuthState();
  }, []);

  // Função de login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login(credentials);
      
      if (response.error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.error.message);
      }

      const newState = authService.getAuthState();
      setAuthState({ ...newState, isLoading: false });
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Função de logout
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      setAuthState({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      setAuthState({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Função de registro
  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register(data);
      
      if (response.error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.error.message);
      }

      // Após registro bem-sucedido, fazer login automaticamente
      if (response.user) {
        const loginResponse = await authService.login({
          email: data.email,
          password: data.password,
        });

        if (loginResponse.error) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return response; // Retorna sucesso do registro mesmo se login falhar
        }

        const newState = authService.getAuthState();
        setAuthState({ ...newState, isLoading: false });
      }
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Verificar autenticação
  const checkAuth = useCallback(async () => {
    const isValid = await authService.verifyToken();
    
    if (!isValid) {
      setAuthState({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    
    return isValid;
  }, []);

  return {
    // Estado
    user: authState.user,
    company: authState.company,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    
    // Ações
    login,
    logout,
    register,
    checkAuth,
    
    // Métodos auxiliares
    getToken: () => authService.getToken(),
    authenticatedFetch: (url: string, options?: RequestInit) => 
      authService.authenticatedFetch(url, options),
  };
} 

 
 