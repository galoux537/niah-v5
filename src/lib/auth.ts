import React from 'react';

// Gerenciamento de autenticação JWT para o sistema NIAH

interface User {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'company';
  role?: string;
  company_id: string;
  company_name: string;
  company_slug?: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  expires_in: string;
}

class AuthManager {
  private token: string | null = null;
  private user: User | null = null;
  private apiBaseUrl = 'http://localhost:3001/api/v1';
  private enableJWT = true; // ✅ REABILITAR JWT - API server está rodando!

  constructor() {
    // Tentar carregar token do localStorage na inicialização
    this.loadFromStorage();
  }

  // Salvar no localStorage
  private saveToStorage(token: string, user: User) {
    localStorage.setItem('niah_token', token);
    localStorage.setItem('niah_user', JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  // Carregar do localStorage
  private loadFromStorage() {
    const token = localStorage.getItem('niah_token');
    const userStr = localStorage.getItem('niah_user');
    
    if (token && userStr) {
      this.token = token;
      this.user = JSON.parse(userStr);
    }
  }

  // Limpar storage
  private clearStorage() {
    localStorage.removeItem('niah_token');
    localStorage.removeItem('niah_user');
    this.token = null;
    this.user = null;
  }

  // Login com email e senha
  async login(email: string, password: string): Promise<AuthResponse> {
    // Se JWT estiver desabilitado, falhar imediatamente
    if (!this.enableJWT) {
      throw new Error('Sistema JWT desabilitado para desenvolvimento');
    }

    try {
      console.log('🔐 Iniciando login JWT...', email);
      
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        // Tenta extrair mensagem de erro, mas se não for JSON, usa texto simples
        let errorMsg = 'Falha na autenticação';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          try {
            errorMsg = await response.text() || errorMsg;
          } catch {}
        }
        throw new Error(errorMsg + ` (HTTP ${response.status})`);
      }

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        this.saveToStorage(data.token, data.user);
        console.log('✅ Login JWT bem-sucedido:', data.user.name);
        return data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro no login JWT:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    console.log('🚪 Fazendo logout...');
    this.clearStorage();
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  // Obter token atual
  getToken(): string | null {
    return this.token;
  }

  // Obter usuário atual
  getUser(): User | null {
    return this.user;
  }

  // Obter headers de autenticação para requisições
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Verificar se o token ainda é válido
  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Atualizar dados do usuário
          this.user = data.user;
          localStorage.setItem('niah_user', JSON.stringify(data.user));
          return true;
        }
      }
      
      // Token inválido, limpar storage
      this.clearStorage();
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar token:', error);
      this.clearStorage();
      return false;
    }
  }

  // Renovar token
  async refreshToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          this.token = data.token;
          localStorage.setItem('niah_token', data.token);
          console.log('🔄 Token renovado com sucesso');
          return true;
        }
      }
      
      this.clearStorage();
      return false;
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      this.clearStorage();
      return false;
    }
  }

  // Fazer requisição autenticada
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> || {})
    };

    // Se a requisição tem FormData, não incluir Content-Type
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Se receber 401/403, tentar renovar token uma vez
    if ((response.status === 401 || response.status === 403) && this.token) {
      console.log('🔄 Token expirado, tentando renovar...');
      const renewed = await this.refreshToken();
      
      if (renewed) {
        // Tentar novamente com o token renovado
        const newHeaders: Record<string, string> = {
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string> || {})
        };
        
        if (options.body instanceof FormData) {
          delete newHeaders['Content-Type'];
        }
        
        return fetch(url, {
          ...options,
          headers: newHeaders
        });
      }
    }

    return response;
  }
}

// Instância singleton
export const authManager = new AuthManager();

// Hooks para React (se necessário)
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(authManager.isAuthenticated());
  const [user, setUser] = React.useState(authManager.getUser());

  React.useEffect(() => {
    const checkAuth = async () => {
      if (authManager.isAuthenticated()) {
        const isValid = await authManager.verifyToken();
        setIsAuthenticated(isValid);
        setUser(authManager.getUser());
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authManager.login(email, password);
    setIsAuthenticated(true);
    setUser(authManager.getUser());
    return result;
  };

  const logout = () => {
    authManager.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    authManager
  };
};

export default authManager; 
