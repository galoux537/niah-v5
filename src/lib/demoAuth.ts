// Demo authentication service for development
// Replace this with actual Supabase when configured

interface DemoUser {
  id: string;
  email: string;
  company_id?: string;
}

interface AuthResponse {
  user?: DemoUser;
  error?: string;
}

// Demo users for testing
const DEMO_USERS = [
  { id: '1', email: 'admin@niah.com', password: 'demo123', company_id: 'company_1' },
  { id: '2', email: 'user@niah.com', password: 'user123', company_id: 'company_1' },
];

// Simple localStorage-based demo auth
class DemoAuthService {
  private currentUser: DemoUser | null = null;
  private listeners: ((user: DemoUser | null) => void)[] = [];

  constructor() {
    // Check for existing session
    const stored = localStorage.getItem('demo_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { error: 'Email ou senha inválidos' };
    }

    const authUser = { id: user.id, email: user.email, company_id: user.company_id };
    this.currentUser = authUser;
    localStorage.setItem('demo_user', JSON.stringify(authUser));
    this.notifyListeners();

    return { user: authUser };
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    if (DEMO_USERS.find(u => u.email === email)) {
      return { error: 'Este email já está cadastrado' };
    }

    // For demo, just add to memory (won't persist)
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      company_id: 'company_new'
    };
    
    DEMO_USERS.push(newUser);
    
    const authUser = { id: newUser.id, email: newUser.email, company_id: newUser.company_id };
    this.currentUser = authUser;
    localStorage.setItem('demo_user', JSON.stringify(authUser));
    this.notifyListeners();

    return { user: authUser };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('demo_user');
    this.notifyListeners();
  }

  getCurrentUser(): DemoUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: DemoUser | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const demoAuth = new DemoAuthService();
