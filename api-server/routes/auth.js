const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuração do Supabase
const supabaseUrl = 'https://iyqrjgwqjmsnhtxbywme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'niah-super-secret-key-2024';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

// Middleware para verificar JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ JWT inválido:', error.message);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// POST /api/v1/auth/login - Login com email/senha (mantendo comportamento multitenant)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    console.log(`🔐 Tentativa de login JWT: ${email}`);
    
    // 1. PRIMEIRO: Tentar login como EMPRESA (companies table)
    console.log('🏢 Verificando login como empresa...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, password, slug')
      .eq('email', email)
      .single();
    
    console.log('📊 Resultado empresa:', { companiesData, companiesError });
    
    if (!companiesError && companiesData) {
      // Verificar senha da empresa
      if (companiesData.password === password) {
        console.log(`✅ Login EMPRESA bem-sucedido: ${companiesData.name}`);
        
        const user = {
          id: companiesData.id,
          email: companiesData.email,
          name: companiesData.name,
          type: 'company',
          role: 'company_admin',
          company_id: companiesData.id,
          company_name: companiesData.name,
          company_slug: companiesData.slug
        };
        
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        return res.json({
          success: true,
          user,
          token,
          expires_in: JWT_EXPIRES_IN
        });
      } else {
        console.log(`❌ Senha incorreta para empresa: ${email}`);
      }
    }
    
    // 2. SEGUNDO: Tentar login como USUÁRIO (users table)
    // ✅ USAR SUPABASE AUTH COMO ANTES - NÃO VERIFICAR SENHAS MANUALMENTE
    console.log('👤 Verificando login como usuário via Supabase Auth...');
    
    try {
      // Primeiro, verificar se existe usuário ativo na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          companies!inner(id, name, slug, email)
        `)
        .eq('email', email)
        .eq('active', true)
        .single();
      
      console.log('📊 Resultado verificação usuário na tabela:', { userData, userError });
      
      if (!userError && userData) {
        // Se usuário existe na tabela, tentar autenticação via Supabase Auth
        console.log('🔐 Usuário encontrado na tabela, autenticando via Supabase Auth...');
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (!authError && authData.user) {
          console.log(`✅ Login USUÁRIO via Supabase Auth bem-sucedido: ${userData.name}`);
          
          const user = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            type: 'user',
            role: userData.role || 'user',
            company_id: userData.company_id,
            company_name: userData.companies.name,
            company_slug: userData.companies.slug
          };
          
          const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
          
          return res.json({
            success: true,
            user,
            token,
            expires_in: JWT_EXPIRES_IN
          });
        } else {
          console.log(`❌ Falha na autenticação Supabase para usuário ${email}:`, authError?.message);
        }
      } else {
        console.log(`❌ Usuário ${email} não encontrado ou inativo na tabela users`);
      }
    } catch (authError) {
      console.log(`❌ Erro na autenticação Supabase para ${email}:`, authError);
    }
    
    // 3. Se chegou até aqui, credenciais não encontradas ou inválidas
    console.log(`❌ Credenciais inválidas para: ${email}`);
    return res.status(401).json({ 
      error: 'Credenciais inválidas. Verifique email e senha.' 
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/v1/auth/me - Verificar token atual
router.get('/me', verifyJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/v1/auth/refresh - Renovar token
router.post('/refresh', verifyJWT, (req, res) => {
  const newToken = jwt.sign({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    type: req.user.type,
    role: req.user.role,
    company_id: req.user.company_id,
    company_name: req.user.company_name,
    company_slug: req.user.company_slug
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  res.json({
    success: true,
    token: newToken,
    expires_in: JWT_EXPIRES_IN
  });
});

// GET /api/v1/auth/test - Teste de credenciais existentes
router.get('/test-credentials', async (req, res) => {
  try {
    console.log('🧪 Testando credenciais existentes...');
    
    // Buscar todas as empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, slug');
    
    // Buscar todos os usuários ativos
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id, name, email, role, active,
        companies!inner(name, slug)
      `)
      .eq('active', true);
    
    // Adicionar senhas conhecidas para exibição
    const usersWithPasswords = users?.map(user => ({
      ...user,
      password_info: user.email === 'gabriel_pires05@hotmail.com' ? 'G@lofrit0' :
                     user.email === 'gabriel.camara@grupo-3c.com' ? 'gabriel.camara@grupo-3c.com' :
                     'Use campo demo_password do banco'
    })) || [];
    
    res.json({
      success: true,
      message: 'Credenciais disponíveis para teste JWT',
      companies: companies?.map(c => ({
        ...c,
        password_info: c.email === 'admin@niah.com' ? 'admin2024' :
                       c.email === 'contato@empresaabc.com' ? 'senha123' :
                       c.email === 'contato@empresadef.com' ? 'senha123' :
                       'Verifique campo password no banco'
      })) || [],
      users: usersWithPasswords,
      companiesError,
      usersError,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      error: 'Erro ao buscar credenciais',
      details: error.message
    });
  }
});

module.exports = { router, verifyJWT }; 