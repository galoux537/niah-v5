import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Input } from './ui/input';
import { Button } from './ui/button';
import logoBlue from '../logo completa azul 1.svg';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // loading só para operação, não para carregamento inicial
  const [initializing, setInitializing] = useState(true); // novo estado para carregamento inicial
  const [tokenDetected, setTokenDetected] = useState(false);

  useEffect(() => {
    console.log('🔧 ResetPasswordPage carregado');
    console.log('📍 URL atual:', window.location.href);
    console.log('🔗 Hash:', window.location.hash);
    console.log('❓ Search:', window.location.search);
    
    // Verificar se há token de redefinição na URL
    const hasResetToken = 
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('access_token') ||
      window.location.search.includes('type=recovery');
    
    if (hasResetToken) {
      console.log('✅ Token de redefinição detectado na URL');
      setTokenDetected(true);
    } else {
      console.log('⚠️ Nenhum token de redefinição encontrado na URL');
      setError('Link de redefinição inválido. Solicite um novo link.');
    }
    
    setInitializing(false);
    
    // Listener para mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Mudança de estado de autenticação:', event, session ? 'Sessão ativa' : 'Sem sessão');
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ Evento de recuperação de senha detectado');
        setTokenDetected(true);
        setError(null);
      }
      
      if (event === 'SIGNED_IN') {
        console.log('✅ Usuário autenticado via token de redefinição');
        setTokenDetected(true);
        setError(null);
      }
    });
    
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const handleSave = async () => {
    if (!password || password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Atualizando senha...');
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        setError(error.message);
      } else {
        console.log('✅ Senha atualizada com sucesso');
        setSuccess(true);
        setTimeout(() => {
          // Redirecionar para login após sucesso
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setError('Erro inesperado ao atualizar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex flex-col items-center justify-center p-4">
        <img src={logoBlue} alt="NIAH Logo" className="h-6 mb-6" />
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-[#e1e9f4]">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#677c92]">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafc] to-[#e1e9f4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center">
              <img src={logoBlue} alt="NIAH Logo" className="h-6 mb-2" />
            </div>
            <CardTitle className="text-xl text-center text-[#373753]">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-[#DC2F1C] bg-[#fef2f2]">
                <AlertDescription className="text-[#DC2F1C]">{error}</AlertDescription>
              </Alert>
            )}
            {success ? (
              <Alert className="mb-4 border-green-500 bg-green-50">
                <AlertDescription className="text-green-700 text-sm">Senha redefinida com sucesso! Redirecionando para o login...</AlertDescription>
              </Alert>
            ) : tokenDetected ? (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    type="password"
                    placeholder="Confirmar nova senha"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full h-11 bg-[#3057f2] hover:bg-[#2545d9] text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </div>
                  ) : (
                    'Salvar Senha'
                  )}
                </Button>
              </form>
            ) : (
              <Alert className="mb-4 border-[#DC2F1C] bg-[#fef2f2]">
                <AlertDescription className="text-[#DC2F1C]">Link inválido ou expirado. Solicite um novo link.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 