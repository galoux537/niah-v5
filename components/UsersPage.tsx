import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const { companyId, company } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar o usuário logado (simulação, ajuste conforme seu AuthContext)
  useEffect(() => {
    // Exemplo: buscar pelo e-mail salvo no localStorage
    const email = localStorage.getItem('niah_user_email');
    if (email && companyId) {
      supabase.from('users').select('*').eq('email', email).eq('company_id', companyId).single().then(({ data }) => {
        if (data) setCurrentUser(data);
      });
    }
  }, [companyId]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (companyId) fetchUsers();
  }, [companyId]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Cria no Auth do Supabase (como funcionava antes)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      
      if (authError) {
        setError('Erro ao criar usuário: ' + authError.message);
        setCreating(false);
        return;
      }

      // 2. Cria na tabela users (SEM salvar senha - como funcionava antes)
      const { error: userError } = await supabase.from('users').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company_id: companyId,
        role: 'company_admin',
        active: true
        // ✅ NÃO salvamos senha na tabela - autenticação via Supabase Auth
      });
      
      if (userError) {
        setError('Usuário criado no Auth, mas erro ao salvar dados extras: ' + userError.message);
      } else {
        setForm({ name: '', email: '', password: '' });
        fetchUsers();
        setError(null);
        setSuccess(`✅ Usuário ${form.name} criado com sucesso! Um email de confirmação foi enviado para ${form.email}.`);
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('💥 Erro ao criar usuário:', error);
      setError('Erro inesperado ao criar usuário: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setError(null);
    const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
    if (error) setError(error.message);
    else setUsers(users.filter(u => u.id !== userToDelete.id));
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const displayedUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#f9fafc] px-6 pb-6 space-y-6">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#373753] mb-1">Usuários da Empresa</h1>
          <p className="text-[#677c92] text-sm">Gerencie os acessos dos usuários da empresa <span className="font-medium">{company?.name}</span></p>
        </div>
        {/* Card de CRIAÇÃO de usuário */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-[10.5px] w-full">
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end mb-0 w-full">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-[#373753] mb-1">Nome</label>
              <Input name="name" value={form.name} onChange={handleInput} placeholder="Digite o nome completo" required />
      </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-[#373753] mb-1">E-mail</label>
              <Input name="email" value={form.email} onChange={handleInput} placeholder="email@empresa.com" required type="email" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-[#373753] mb-1">Senha</label>
              <Input name="password" value={form.password} onChange={handleInput} placeholder="Digite uma senha" required type="password" />
            </div>
            <Button type="submit" disabled={creating} className="h-10 px-6 mt-6 md:mt-0 bg-[#3057f2] hover:bg-[#2545d9] text-white">Adicionar</Button>
          </form>
          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          {success && <div className="text-green-600 mb-4 text-sm font-medium">{success}</div>}

        </div>

        {/* Card de LISTAGEM de usuários */}
        <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
          {/* Search bar */}
          <div className="flex items-center justify-between py-3 pl-6 pr-3 border-b border-[#e1e9f4]">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="h-4 w-4 text-[#677c92]" />
              <Input
                type="text"
                placeholder="Pesquisar usuário"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent px-0 text-[#373753] placeholder:text-[#677c92] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Header */}
          <div className="bg-[#f0f4fa] px-6 py-3">
            <div className="flex items-center justify-between text-[#677c92] text-xs uppercase tracking-wide">
              <div className="w-48">Nome</div>
              <div className="flex-1">E-mail</div>
              <div className="w-32">Tipo</div>
              <div className="w-12"></div>
            </div>
          </div>

          {/* Rows */}
          <div>
                {loading ? (
              <div className="px-6 py-8 text-center text-[#677c92]">Carregando usuários...</div>
            ) : displayedUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#677c92]">Nenhum usuário encontrado.</div>
            ) : (
              displayedUsers.map(user => (
                <div key={user.id} className="border-b border-[#e1e9f4] px-6 py-2 hover:bg-gray-50 group relative">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-48 text-[#373753] font-medium">{user.name}</div>
                    <div className="flex-1 text-[#677c92]">{user.email}</div>
                    <div className="w-32">
                      {user.role === 'master_admin' ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-[#3057f2] text-white text-xs font-semibold">Master Admin</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-[#e1e9f4] text-[#677c92] text-xs">Gestor</span>
                      )}
                    </div>
                    <div className="w-12 text-right">
                      <button
                        onClick={() => openDeleteModal(user)}
                        title="Excluir usuário"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          </div>
      {/* Modal de confirmação de exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-[#373753]">
            Tem certeza que deseja excluir o usuário <b>{userToDelete?.name}</b> (<span className="text-[#3057f2]">{userToDelete?.email}</span>)?
            <br />Essa ação não poderá ser desfeita.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                          Cancelar
                        </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
                        </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
