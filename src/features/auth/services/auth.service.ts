import { supabase, getRedirectUrl, logEnvironment } from '../../../lib/supabase';
import type { 
  User, 
  Company, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  AuthState 
} from '../types/auth.types';

class AuthService {
  private currentUser: User | null = null;
  private currentCompany: Company | null = null;
  private authToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  // Carregar dados da sessão do localStorage
  private loadFromStorage(): void {
    try {
      const userData = localStorage.getItem('user');
      const companyData = localStorage.getItem('company');
      const token = localStorage.getItem('auth_token');

      if (userData) this.currentUser = JSON.parse(userData);
      if (companyData) this.currentCompany = JSON.parse(companyData);
      if (token) this.authToken = token;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      this.clearStorage();
    }
  }

  // Salvar dados no localStorage
  private saveToStorage(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
      if (this.currentCompany) {
        localStorage.setItem('company', JSON.stringify(this.currentCompany));
      }
      if (this.authToken) {
        localStorage.setItem('auth_token', this.authToken);
      }
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // Limpar dados do localStorage
  private clearStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase.auth.token');
  }

  // Login do usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (data.user) {
        // Buscar dados completos do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select(`
            *,
            companies (*)
          `)
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          return { error: { message: 'Erro ao carregar perfil do usuário' } };
        }

        const user: User = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          avatar_url: profileData.avatar_url,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        };

        const company: Company | undefined = profileData.companies ? {
          id: profileData.companies.id,
          name: profileData.companies.name,
          display_id: profileData.companies.display_id,
          created_at: profileData.companies.created_at,
          updated_at: profileData.companies.updated_at,
        } : undefined;

        this.currentUser = user;
        this.currentCompany = company || null;
        this.authToken = data.session?.access_token || null;
        
        this.saveToStorage();

        return { user, company };
      }

      return { error: { message: 'Falha na autenticação' } };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erro desconhecido no login' 
        } 
      };
    }
  }

  // Logout do usuário
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.currentUser = null;
      this.currentCompany = null;
      this.authToken = null;
      this.clearStorage();
    }
  }

  // Registrar novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Usar função utilitária para detectar ambiente e gerar URL correta
      const redirectUrl = getRedirectUrl('/login');
      logEnvironment();
      console.log('🔗 URL de redirecionamento:', redirectUrl);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (authData.user) {
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            role: 'user',
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          return { error: { message: 'Erro ao criar perfil do usuário' } };
        }

        return { 
          user: {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            role: 'user',
            created_at: authData.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };
      }

      return { error: { message: 'Falha no registro' } };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erro desconhecido no registro' 
        } 
      };
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.authToken;
  }

  // Obter usuário atual
  getUser(): User | null {
    return this.currentUser;
  }

  // Obter empresa atual
  getCompany(): Company | null {
    return this.currentCompany;
  }

  // Obter token de autenticação
  getToken(): string | null {
    return this.authToken;
  }

  // Obter estado completo da autenticação
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      company: this.currentCompany,
      isAuthenticated: this.isAuthenticated(),
      isLoading: false,
    };
  }

  // Fazer requisição autenticada
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    
    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Verificar se token ainda é válido
  async verifyToken(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      this.logout();
      return false;
    }
  }
}

// Instância única do serviço de autenticação
export const authService = new AuthService();

// Export da classe para casos que precisem de instâncias separadas
export { AuthService }; 

 
 