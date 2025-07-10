import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, Building2, LogOut, User, AlertCircle, CheckCircle, RefreshCw, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import logoBlue from '../logo completa azul 1.svg';

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string; // Corrigido: era login_email, agora é email
  password?: string; // Corrigido: adicionado password da estrutura real
  phone?: string;
  address?: string;
  display_id?: number; // ID sequencial público
  created_at: string;
  updated_at?: string;
}

export function AdminPage() {
  const { signOut, company } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load companies from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 Carregando empresas do banco...');
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, slug, email, password, phone, address, display_id, created_at, updated_at') // Incluindo display_id
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error('❌ Erro ao carregar empresas:', companiesError);
        setError(`Erro ao carregar empresas: ${companiesError.message}`);
      } else if (companiesData) {
        console.log('✅ Empresas carregadas do banco:', companiesData);
        setCompanies(companiesData);
      }

    } catch (dbError: any) {
      console.error('💥 Erro crítico ao carregar dados:', dbError);
      setError(`Erro ao conectar com o banco: ${dbError.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .trim();
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.email || !newCompany.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      const slug = generateSlug(newCompany.name);

      console.log('💾 Criando empresa no banco...');
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          slug: slug,
          email: newCompany.email, // Corrigido: usando email em vez de login_email
          password: newCompany.password, // Corrigido: usando password diretamente
        })
        .select('id, name, slug, email, password, phone, address, display_id, created_at, updated_at') // Incluindo display_id
        .single();

      if (companyError) {
        console.error('❌ Erro ao criar no banco:', companyError);
        setError(`Erro ao criar empresa: ${companyError.message}`);
      } else if (companyData) {
        console.log('✅ Empresa criada no banco com sucesso:', companyData);
        setCompanies([companyData, ...companies]);
        setSuccess(`Empresa ${newCompany.name} criada com sucesso! (Email: ${newCompany.email}, Senha: ${newCompany.password})`);

        // Reset form
        setNewCompany({
          name: '',
          email: '',
          password: ''
        });

        setIsCreateDialogOpen(false);
        setTimeout(() => setSuccess(null), 8000);
      }

    } catch (err) {
      console.error('💥 Erro ao criar empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const targetCompany = companies.find(c => c.id === companyId);
      if (!targetCompany) return;

      // Não permitir excluir a própria empresa NIAH! Sistemas
      if (targetCompany.slug === 'niah-sistemas') {
        setError('Não é possível excluir a empresa NIAH! Sistemas');
        return;
      }

      if (!confirm(`Tem certeza que deseja excluir a empresa ${targetCompany.name}? Esta ação não pode ser desfeita.`)) {
        return;
      }

      console.log('🗑️ Excluindo empresa do banco...');
      
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (deleteError) {
        console.error('❌ Erro ao excluir do banco:', deleteError);
        setError(`Erro ao excluir: ${deleteError.message}`);
        return;
      }
      
      console.log('✅ Empresa excluída do banco');

      // Update local state
      setCompanies(companies.filter(c => c.id !== companyId));
      
      setSuccess(`Empresa ${targetCompany.name} excluída com sucesso!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('💥 Erro ao excluir empresa:', err);
      setError('Erro ao excluir empresa');
    }
  };

  const handleOpenEdit = (company: Company) => {
    setEditCompany(company);
    setIsEditDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleUpdateCompany = async () => {
    if (!editCompany) return;
    if (!editCompany.name || !editCompany.email) {
      setError('Nome e email são obrigatórios');
      return;
    }
    try {
      setUpdating(true);
      const { data, error: updateError } = await supabase
        .from('companies')
        .update({ name: editCompany.name, email: editCompany.email, password: editCompany.password })
        .eq('id', editCompany.id)
        .select('id, name, slug, email, password, phone, address, display_id, created_at, updated_at')
        .single();

      if (updateError) {
        setError(`Erro ao atualizar: ${updateError.message}`);
      } else if (data) {
        setCompanies(companies.map(c => c.id === data.id ? data : c));
        setSuccess('Empresa atualizada com sucesso');
        setIsEditDialogOpen(false);
        setTimeout(()=>setSuccess(null),3000);
      }
    } catch(err:any){
      setError(err.message || 'Erro ao atualizar');
    } finally {
      setUpdating(false);
    }
  };

  const filteredCompanies = companies.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.email.toLowerCase().includes(searchQuery.toLowerCase()) || // Corrigido: usando email
    comp.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#677c92]">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e1e9f4] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoBlue} alt="Logo" className="h-6" />
            <div>
              <h1 className="text-[#373753] text-xl font-semibold tracking-tight">Painel Administrativo</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[#373753] text-sm font-medium">
                {company?.name || 'NIAH! Sistemas'}
              </div>
              <div className="text-[#677c92] text-xs">
                Administrador do Sistema
              </div>
            </div>
            
            <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-[#677c92]" />
            </div>
            
            <button
              onClick={handleSignOut}
              className="text-[#677c92] hover:text-[#DC2F1C] transition-colors p-2 rounded-lg hover:bg-[#f0f4fa]"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-[#DC2F1C] bg-[#fef2f2]">
            <AlertCircle className="h-4 w-4 text-[#DC2F1C]" />
            <AlertDescription className="text-[#DC2F1C]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-[#5CB868] bg-[#f0f9f4]">
            <CheckCircle className="h-4 w-4 text-[#5CB868]" />
            <AlertDescription className="text-[#5CB868]">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-[#677c92]" />
                </div>
                <div>
                  <p className="text-[#677c92] text-sm">Total de Empresas</p>
                  <p className="text-2xl font-semibold text-[#373753]">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#677c92]" />
                </div>
                <div>
                  <p className="text-[#677c92] text-sm">Empresas Criadas</p>
                  <p className="text-2xl font-semibold text-[#373753]">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-[#677c92]" />
                </div>
                <div>
                  <p className="text-[#677c92] text-sm">Criadas Hoje</p>
                  <p className="text-2xl font-semibold text-[#373753]">
                    {companies.filter(comp => {
                      const today = new Date().toDateString();
                      const companyDate = new Date(comp.created_at).toDateString();
                      return today === companyDate;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciar Empresas</CardTitle>
                <CardDescription>
                  Gerencie as empresas que têm acesso à plataforma NIAH!
                </CardDescription>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#3057f2] hover:bg-[#2545d9]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da nova empresa que terá acesso à plataforma.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#677c92]" />
                        Nome da Empresa
                      </Label>
                      <Input
                        id="name"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#677c92]" />
                        Email de Acesso
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#677c92]" />
                        Senha de Acesso
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={newCompany.password}
                        onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                        placeholder="Digite a senha de acesso"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateCompany}
                      className="bg-[#3057f2] hover:bg-[#2545d9]"
                      disabled={!newCompany.name || !newCompany.email || !newCompany.password || creating}
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        'Criar Empresa'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Company Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Empresa</DialogTitle>
                    <DialogDescription>Altere as informações da empresa e salve.</DialogDescription>
                  </DialogHeader>
                  {editCompany && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Nome da Empresa</Label>
                        <Input id="edit-name" value={editCompany.name} onChange={e=>setEditCompany({...editCompany,name:e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input id="edit-email" type="email" value={editCompany.email} onChange={e=>setEditCompany({...editCompany,email:e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-password">Senha (opcional)</Label>
                        <Input id="edit-password" type="password" value={editCompany.password||''} onChange={e=>setEditCompany({...editCompany,password:e.target.value})} placeholder="Manter senha atual se vazio" />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={()=>setIsEditDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateCompany} disabled={updating} className="bg-[#3057f2] hover:bg-[#2545d9]">
                      {updating? 'Salvando...' : 'Salvar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#677c92] h-4 w-4" />
                <Input
                  placeholder="Buscar empresas por nome, email ou identificador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-4">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-[#677c92]">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-[#677c92] opacity-50" />
                  <p>Nenhuma empresa encontrada</p>
                </div>
              ) : (
                filteredCompanies.map((comp) => (
                  <Card key={comp.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-[#677c92]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-[#373753]">{comp.name}</h3>
                            {comp.slug === 'niah-sistemas' && (
                              <Badge className="text-xs bg-[#DC2F1C] text-white">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#677c92]">{comp.email}</p> {/* Corrigido: usando email */}
                          <p className="text-xs text-[#677c92]">
                            ID: {comp.display_id || 'Não atribuído'} • Slug: {comp.slug} • UUID: {comp.id.substring(0, 8)}... • Criada em {formatDate(comp.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#677c92] border-[#e1e9f4]"
                          onClick={() => handleOpenEdit(comp)}
                          disabled={comp.slug === 'niah-sistemas'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCompany(comp.id)}
                          className="text-[#DC2F1C] border-[#DC2F1C]"
                          disabled={comp.slug === 'niah-sistemas'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}