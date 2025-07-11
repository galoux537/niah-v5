import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Input } from './ui/input';
import { Button } from './ui/button';
import logoBlue from '../logo completa azul 1.svg';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Se o usuário ainda não estiver logado, o Supabase irá logar automaticamente via hash token
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log('Aguardando autenticação via token...');
      }
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const handleSave = async () => {
    if (!password || password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafc] flex flex-col items-center justify-center p-4">
      <img src={logoBlue} alt="NIAH Logo" className="h-6 mb-6" />
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-[#e1e9f4]">
        <h1 className="text-lg font-medium text-center text-[#373753] mb-4">Redefinir Senha</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success ? (
          <p className="text-green-600 text-center">Senha redefinida com sucesso! Redirecionando...</p>
        ) : (
          <>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button className="w-full mt-4 bg-[#3057f2] hover:bg-[#2545d9] text-white" onClick={handleSave}>
              Salvar Senha
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 