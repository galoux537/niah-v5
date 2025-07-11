import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logoBlue from '../logo completa azul 1.svg';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      }
    } catch (err) {
      setError('Erro inesperado durante o login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email e clique em "Esqueci minha senha" para receber o link.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://zingy-tanuki-154026.netlify.app/reset-password',
      });
      if (error) {
        setError('Erro ao enviar e-mail de redefinição: ' + error.message);
      } else {
        setInfo('Enviamos um link de redefinição de senha para seu e-mail.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafc] to-[#e1e9f4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Espaço superior removido para visual limpo */}

        {/* Card de Login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center">
              <img src={logoBlue} alt="NIAH Logo" className="h-6 mb-2" />
            </div>
            <CardTitle className="text-xl text-center text-[#373753]">
              Login da Empresa
            </CardTitle>
            <CardDescription className="text-center">
              Entre com o email e senha cadastrados para sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-[#DC2F1C] bg-[#fef2f2]">
                <AlertCircle className="h-4 w-4 text-[#DC2F1C]" />
                <AlertDescription className="text-[#DC2F1C]">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert className="mb-4 border-green-500 bg-green-50">
                <AlertDescription className="text-green-700 text-sm">{info}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#373753] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#677c92]" />
                  Email da Empresa
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="empresa@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#373753] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#677c92]" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#677c92] hover:text-[#373753]"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-[#3057f2] hover:bg-[#2545d9] text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Entrar na Plataforma
                  </div>
                )}
              </Button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="block w-full text-xs text-[#3057f2] hover:text-[#2545d9] mt-2 focus:outline-none"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </form>

            {/* Seções de acesso rápido removidas por segurança */}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#677c92]">
          <p>NIAH! - Plataforma de Avaliação de Chamadas</p>
          <p className="mt-1">Sistema de gestão para empresas</p>
        </div>
      </div>
    </div>
  );
}
