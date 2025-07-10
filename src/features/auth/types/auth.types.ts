export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'agent';
  company?: Company;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  display_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company_name?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  user?: User;
  company?: Company;
  error?: AuthError;
} 

 
 