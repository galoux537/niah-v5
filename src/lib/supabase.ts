import { createClient } from '@supabase/supabase-js'

// Declaração de tipos para import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL?: string
      VITE_SUPABASE_ANON_KEY?: string
    }
  }
}

// Environment variables with fallbacks and error handling
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://iyqrjgwqjmsnhtxbywme.supabase.co'
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA'

// Debug logging for development
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ URL configured' : '❌ URL missing',
    key: supabaseKey ? '✅ Key configured' : '❌ Key missing',
    env: import.meta.env ? '✅ Environment available' : '❌ Environment missing'
  })
}

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  const errorMsg = `Missing Supabase configuration:
    - URL: ${supabaseUrl ? '✅' : '❌ Missing VITE_SUPABASE_URL'}
    - Key: ${supabaseKey ? '✅' : '❌ Missing VITE_SUPABASE_ANON_KEY'}
    
    Please check your .env file and make sure it contains:
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here`
  
  console.error('❌ Supabase Configuration Error:', errorMsg)
  throw new Error(errorMsg)
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Utilitário para detectar ambiente e gerar URLs de redirecionamento
export const getRedirectUrl = (path: string): string => {
  const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );
  
  if (isDevelopment) {
    return `${window.location.origin}${path}`;
  }
  
  // URLs de produção
  const productionUrls: Record<string, string> = {
    '/login': 'https://zingy-tanuki-154026.netlify.app/login',
    '/reset-password': 'https://zingy-tanuki-154026.netlify.app/reset-password',
  };
  
  return productionUrls[path] || `https://zingy-tanuki-154026.netlify.app${path}`;
};

// Função para log de ambiente (debug)
export const logEnvironment = (): void => {
  if (typeof window !== 'undefined') {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log('🔧 Ambiente detectado:', isDevelopment ? 'Desenvolvimento' : 'Produção');
    console.log('🌐 Hostname:', window.location.hostname);
    console.log('🔗 Origin:', window.location.origin);
  }
};

// Database types (updated for new structure)
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          email: string | null
          phone: string | null
          address: string | null
          settings: Record<string, any>
          active: boolean
          display_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email?: string | null
          phone?: string | null
          address?: string | null
          settings?: Record<string, any>
          active?: boolean
          display_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          settings?: Record<string, any>
          active?: boolean
          display_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      criteria: {
        Row: {
          id: string
          name: string
          company_id: string
          evaluation_list_id: string | null
          total_calls: number
          average_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_id: string
          evaluation_list_id?: string | null
          total_calls?: number
          average_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_id?: string
          evaluation_list_id?: string | null
          total_calls?: number
          average_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      sub_criteria: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          keywords: string[] | null
          ideal_phrase: string | null
          criteria_id: string
          company_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          keywords?: string[] | null
          ideal_phrase?: string | null
          criteria_id: string
          company_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          keywords?: string[] | null
          ideal_phrase?: string | null
          criteria_id?: string
          company_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_lists: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          campaign_id: string | null
          criteria_id: string | null
          date_range_start: string | null
          date_range_end: string | null
          total_calls: number
          average_score: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          campaign_id?: string | null
          criteria_id?: string | null
          date_range_start?: string | null
          date_range_end?: string | null
          total_calls?: number
          average_score?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          campaign_id?: string | null
          criteria_id?: string | null
          date_range_start?: string | null
          date_range_end?: string | null
          total_calls?: number
          average_score?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          company_id: string
          criteria_id: string | null
          phone_number: string
          customer_name: string | null
          duration: number
          status: 'completed' | 'failed' | 'busy' | 'no_answer' | 'in_progress'
          score: number | null
          transcript: string | null
          audio_url: string | null
          call_date: string
          evaluation_data: Record<string, any>
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          criteria_id?: string | null
          phone_number: string
          customer_name?: string | null
          duration?: number
          status?: 'completed' | 'failed' | 'busy' | 'no_answer' | 'in_progress'
          score?: number | null
          transcript?: string | null
          audio_url?: string | null
          call_date?: string
          evaluation_data?: Record<string, any>
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          criteria_id?: string | null
          phone_number?: string
          customer_name?: string | null
          duration?: number
          status?: 'completed' | 'failed' | 'busy' | 'no_answer' | 'in_progress'
          score?: number | null
          transcript?: string | null
          audio_url?: string | null
          call_date?: string
          evaluation_data?: Record<string, any>
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          name: string;
          role: string;
          active: boolean;
          last_login: string | null;
          settings: any;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          demo_password: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          name: string;
          role?: string;
          active?: boolean;
          last_login?: string | null;
          settings?: any;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          demo_password?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          name?: string;
          role?: string;
          active?: boolean;
          last_login?: string | null;
          settings?: any;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          demo_password?: string | null;
        };
      },
    }
    Enums: {
      call_status: 'completed' | 'failed' | 'busy' | 'no_answer' | 'in_progress'
    }
  }
}

// Connection test helper
export const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...')
    
    // Testa a conexão de forma mais simples - apenas verifica se consegue acessar o Supabase
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return { 
        connected: false, 
        error: `Connection failed: ${error.message}. Verifique as configurações do Supabase.`
      }
    }
    
    console.log('✅ Supabase connection successful')
    return { connected: true, error: null }
  } catch (err) {
    console.error('💥 Connection test error:', err)
    return { 
      connected: false, 
      error: err instanceof Error 
        ? `Network error: ${err.message}` 
        : 'Unknown connection error'
    }
  }
}

// Company helpers
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('active', true)
    .order('name')
  
  return { data, error }
}

export const createCompany = async (companyData: Database['public']['Tables']['companies']['Insert']) => {
  const { data, error } = await supabase
    .from('companies')
    .insert(companyData)
    .select()
    .single()
  
  return { data, error }
}

// Criteria helpers
export const getCompanyCriteria = async (companyId: string) => {
  const { data, error } = await supabase
    .from('criteria')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createCriteria = async (criteriaData: Database['public']['Tables']['criteria']['Insert']) => {
  const { data, error } = await supabase
    .from('criteria')
    .insert(criteriaData)
    .select()
    .single()
  
  return { data, error }
}

// Sub-criteria helpers
export const getCriteriaSubCriteria = async (criteriaId: string) => {
  const { data, error } = await supabase
    .from('sub_criteria')
    .select('*')
    .eq('criteria_id', criteriaId)
    .order('created_at', { ascending: true })
  
  return { data, error }
}

export const createSubCriteria = async (subCriteriaData: Database['public']['Tables']['sub_criteria']['Insert']) => {
  const { data, error } = await supabase
    .from('sub_criteria')
    .insert(subCriteriaData)
    .select()
    .single()
  
  return { data, error }
}

// Call helpers
export const getCompanyCalls = async (companyId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      criteria(name)
    `)
    .eq('company_id', companyId)
    .order('call_date', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export const createCall = async (callData: Database['public']['Tables']['calls']['Insert']) => {
  const { data, error } = await supabase
    .from('calls')
    .insert(callData)
    .select()
    .single()
  
  return { data, error }
}

// Evaluation Lists helpers
export const getCompanyEvaluationLists = async (companyId: string) => {
  const { data, error } = await supabase
    .from('evaluation_lists')
    .select(`
      *,
      criteria(name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createEvaluationList = async (listData: Database['public']['Tables']['evaluation_lists']['Insert']) => {
  const { data, error } = await supabase
    .from('evaluation_lists')
    .insert(listData)
    .select()
    .single()
  
  return { data, error }
}
