import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { authManager } from '../src/lib/auth';

interface Company {
  id: string;
  name: string;
  email: string;
  slug: string;
}

interface AuthContextType {
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  companyId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to create a mock JWT session for development
  const createMockSession = async (company: Company) => {
    try {
      console.log('🔧 Creating mock session for company:', company.name);
      
      // Para desenvolvimento, apenas armazenamos os dados da empresa no localStorage
      // Não precisamos mais de sessão anônima do Supabase com nosso sistema JWT
      console.log('✅ Mock session created for:', company.name);
      
    } catch (error) {
      console.error('❌ Error creating mock session:', error);
      // Don't throw, let the app continue
    }
  };

  useEffect(() => {
    // Verificar se existe JWT válido
    if (authManager.isAuthenticated()) {
      const jwtUser = authManager.getUser();
      if (jwtUser) {
        const company: Company = {
          id: jwtUser.company_id,
          name: jwtUser.company_name,
          email: jwtUser.email,
          slug: jwtUser.company_slug || 'default-slug'
        };
        setCompany(company);
        localStorage.setItem('niah_company', JSON.stringify(company));
        createMockSession(company);
        setLoading(false);
        return;
      }
    }

    // Fallback: Verificar se existe uma empresa logada no localStorage (sistema antigo)
    const storedCompany = localStorage.getItem('niah_company');
    if (storedCompany) {
      try {
        const parsedCompany = JSON.parse(storedCompany);
        setCompany(parsedCompany);
        
        // Create a mock session for development
        createMockSession(parsedCompany);
      } catch (error) {
        console.error('Erro ao parsear empresa do localStorage:', error);
        localStorage.removeItem('niah_company');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // NOVA ABORDAGEM: Usar nosso sistema JWT primeiro (se habilitado)
      const isJWTEnabled = true; // ✅ REABILITAR JWT - API server está rodando!
      
      if (isJWTEnabled) {
        console.log('🔐 Tentando login com JWT...');
        try {
          const authResponse = await authManager.login(email, password);
          
          if (authResponse.success && authResponse.user) {
            const company: Company = {
              id: authResponse.user.company_id,
              name: authResponse.user.company_name,
              email: authResponse.user.email,
              slug: authResponse.user.company_slug || 'default-slug'
            };
            
            setCompany(company);
            localStorage.setItem('niah_company', JSON.stringify(company));
            
            // Create mock session for compatibility
            await createMockSession(company);
            
            console.log('✅ Login JWT bem-sucedido:', authResponse.user.name);
            return { error: null };
          }
        } catch (jwtError) {
          console.warn('⚠️ Login JWT falhou, tentando método tradicional:', jwtError);
        }
      }

      // SISTEMA TRADICIONAL SUPABASE
      console.log('🔄 Usando sistema de login tradicional...');
      
      // 1. Tenta login como empresa
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, email, password, slug')
        .eq('email', email)
        .single();
      if (!companiesError && companiesData && companiesData.password === password) {
        // Login de empresa
        const company: Company = {
          id: companiesData.id,
          name: companiesData.name,
          email: companiesData.email,
          slug: companiesData.slug
        };
        setCompany(company);
        localStorage.setItem('niah_company', JSON.stringify(company));
        return { error: null };
      }
      
      // 2. Se não for empresa, tenta login como gestor
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        return { error: 'Credenciais inválidas. Verifique email e senha.' };
      }
      
      // Busca usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (userError || !userData || userData.active === false) {
        return { error: 'Usuário não encontrado ou inativo.' };
      }
      
      // Busca empresa pelo company_id do usuário
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, email, slug')
        .eq('id', userData.company_id)
        .single();
      if (companyError || !companyData) {
        return { error: 'Empresa não encontrada para este usuário.' };
      }
      
      const company: Company = {
        id: companyData.id,
        name: companyData.name,
        email: companyData.email,
        slug: companyData.slug
      };
      setCompany(company);
      localStorage.setItem('niah_company', JSON.stringify(company));
      return { error: null };
    } catch (error) {
      console.error('💥 Erro inesperado no login:', error);
      return { error: 'Erro de login. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔓 Fazendo logout...');
      
      // Logout do JWT
      authManager.logout();
      
      // Sign out from Supabase (if session exists)
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.warn('⚠️ Error signing out from Supabase:', supabaseError);
        // Continue with logout even if Supabase signout fails
      }
      
      setCompany(null);
      localStorage.removeItem('niah_company');
      
      // Limpar histórico de navegação
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.href);
      }
      
      console.log('✅ Logout bem-sucedido');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  // Admin é determinado pelo slug da empresa (niah-sistemas)
  const isAdmin = company?.slug === 'niah-sistemas';
  const companyId = company?.id || null;

  const value = {
    company,
    loading,
    signIn,
    signOut,
    isAdmin,
    companyId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
