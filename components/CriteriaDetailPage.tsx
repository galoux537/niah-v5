import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, AlertTriangle, RefreshCw, User, Building2, Plus, Edit, Trash2, MoreVertical, Database, Copy, Search, Pen, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';

interface Criteria {
  id: string;
  name: string;
  total_calls: number;
  average_score: number;
  created_at: string;
  company_id: string;
}

interface SubCriteria {
  id: string;
  name: string;
  description: string;
  color: string;
  criteria_id: string;
  created_at: string;
}

interface CriteriaDetailPageProps {
  criteriaId: string;
  onBack: () => void;
}

const colorOptions = [
  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'black', label: 'Preto', color: 'bg-gray-900' },
  { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'yellow', label: 'Amarelo', color: 'bg-yellow-500' },
];

const setupScript = `-- Script para criar a tabela sub_criteria
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela sub_criteria se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sub_criteria') THEN
        CREATE TABLE sub_criteria (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            color VARCHAR(50) DEFAULT 'orange',
            keywords TEXT[],
            ideal_phrase TEXT,
            criteria_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela sub_criteria criada com sucesso';
    END IF;
END $$;

-- 2. Criar índices e RLS
CREATE INDEX IF NOT EXISTS idx_sub_criteria_criteria_id ON sub_criteria(criteria_id);
CREATE INDEX IF NOT EXISTS idx_sub_criteria_company_id ON sub_criteria(company_id);

ALTER TABLE sub_criteria ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "sub_criteria_company_isolation" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_select" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_insert" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_update" ON sub_criteria;
DROP POLICY IF EXISTS "sub_criteria_delete" ON sub_criteria;

-- 4. Criar política permissiva para todas as operações
CREATE POLICY "sub_criteria_all_operations" ON sub_criteria
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Teste de funcionamento
SELECT 'Configuração de subcritérios concluída com sucesso!' as status;`;

export function CriteriaDetailPage({ criteriaId, onBack }: CriteriaDetailPageProps) {
  const { companyId, company } = useAuth();
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [subCriteria, setSubCriteria] = useState<SubCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSubCriteria, setEditingSubCriteria] = useState<SubCriteria | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subCriteriaToDelete, setSubCriteriaToDelete] = useState<SubCriteria | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subCriteriaTableExists, setSubCriteriaTableExists] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para edição inline do nome
  const [isEditingName, setIsEditingName] = useState(false);
  const [criteriaName, setCriteriaName] = useState('');
  const [originalName, setOriginalName] = useState('');

  // Função para mascarar ID do critério
  const getDisplayCriteriaId = (id: string) => {
    if (!id) return '';
    if (id.length < 10) return id;
    return `${id.slice(0, 8)}${'*'.repeat(8)}${id.slice(-8)}`;
  };

  // Form state
  const [newSubCriteria, setNewSubCriteria] = useState({
    name: '',
    description: '',
    color: 'orange',
    keywords: [] as string[],
    idealPhrase: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (criteriaId && companyId) {
      loadCriteriaDetails();
    }
  }, [criteriaId, companyId]);

  const checkSubCriteriaTableExists = async () => {
    try {
      const { error } = await supabase
        .from('sub_criteria')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        setSubCriteriaTableExists(false);
        return false;
      }
      
      setSubCriteriaTableExists(true);
      return true;
    } catch (err) {
      console.error('Error checking sub_criteria table:', err);
      setSubCriteriaTableExists(false);
      return false;
    }
  };

  const loadCriteriaDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Carregando detalhes do critério:', criteriaId);

      // Carregar critério principal
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('id', criteriaId)
        .eq('company_id', companyId)
        .single();

      if (criteriaError) {
        if (criteriaError.code === 'PGRST116') {
          setError('Critério não encontrado ou você não tem permissão para acessá-lo.');
        } else {
          setError(`Erro ao carregar critério: ${criteriaError.message}`);
        }
        return;
      }

      if (!criteriaData || criteriaData.company_id !== companyId) {
        setError('Acesso negado: Este critério não pertence à sua empresa');
        return;
      }

      console.log('✅ Critério carregado:', criteriaData);
      setCriteria(criteriaData);
      setCriteriaName(criteriaData.name);
      setOriginalName(criteriaData.name);

      // Verificar se a tabela sub_criteria existe
      const tableExists = await checkSubCriteriaTableExists();
      
      if (tableExists) {
        // Carregar subcritérios
        const { data: subCriteriaData, error: subCriteriaError } = await supabase
          .from('sub_criteria')
          .select('*')
          .eq('criteria_id', criteriaId)
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });

        if (subCriteriaError) {
          console.error('Erro ao carregar subcritérios:', subCriteriaError);
          setError(`Erro ao carregar subcritérios: ${subCriteriaError.message}`);
          if (subCriteriaError.code === '42P01') {
            setSubCriteriaTableExists(false);
          }
        } else {
          console.log('✅ Subcritérios carregados:', subCriteriaData);
          setSubCriteria(subCriteriaData || []);
        }
      }
    } catch (err) {
      console.error('Erro geral ao carregar critério:', err);
      setError('Erro interno do sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setOriginalName(criteriaName);
  };

  const handleSaveCriteriaName = async () => {
    if (!criteriaName.trim() || criteriaName === originalName) {
      setCriteriaName(originalName);
      setIsEditingName(false);
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('criteria')
        .update({ name: criteriaName.trim() })
        .eq('id', criteriaId)
        .eq('company_id', companyId);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar o estado local
      setCriteria(prev => prev ? { ...prev, name: criteriaName.trim() } : null);
      setOriginalName(criteriaName.trim());
      setIsEditingName(false);
      
      console.log('✅ Nome do critério salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar nome do critério:', err);
      setError('Erro ao salvar nome do critério. Tente novamente.');
      setCriteriaName(originalName);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditName = () => {
    setCriteriaName(originalName);
    setIsEditingName(false);
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!newSubCriteria.keywords.includes(keywordInput.trim())) {
        setNewSubCriteria({
          ...newSubCriteria,
          keywords: [...newSubCriteria.keywords, keywordInput.trim()]
        });
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setNewSubCriteria({
      ...newSubCriteria,
      keywords: newSubCriteria.keywords.filter(k => k !== kw)
    });
  };

  const handleCreateSubCriteria = async () => {
    if (!newSubCriteria.name.trim() || !newSubCriteria.description.trim()) {
      setError('Nome e descrição são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('sub_criteria')
        .insert([{
          name: newSubCriteria.name.trim(),
          description: newSubCriteria.description.trim(),
          color: newSubCriteria.color,
          keywords: newSubCriteria.keywords,
          ideal_phrase: newSubCriteria.idealPhrase.trim() || null,
          criteria_id: criteriaId,
          company_id: companyId
        }]);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Subcritério criado com sucesso!');
      
      // Recarregar dados
      await loadCriteriaDetails();
      
      // Limpar formulário e fechar modal
      setNewSubCriteria({
        name: '',
        description: '',
        color: 'orange',
        keywords: [],
        idealPhrase: ''
      });
      setKeywordInput('');
      setIsSheetOpen(false);
      
    } catch (err) {
      console.error('Erro ao criar subcritério:', err);
      setError('Erro ao criar subcritério. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubCriteria = async () => {
    if (!editingSubCriteria || !newSubCriteria.name.trim() || !newSubCriteria.description.trim()) {
      setError('Nome e descrição são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('sub_criteria')
        .update({
          name: newSubCriteria.name.trim(),
          description: newSubCriteria.description.trim(),
          color: newSubCriteria.color,
          keywords: newSubCriteria.keywords,
          ideal_phrase: newSubCriteria.idealPhrase.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSubCriteria.id)
        .eq('criteria_id', criteriaId)
        .eq('company_id', companyId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Subcritério editado com sucesso!');
      
      // Recarregar dados
      await loadCriteriaDetails();
      
      // Limpar formulário e fechar modal
      setNewSubCriteria({
        name: '',
        description: '',
        color: 'orange',
        keywords: [],
        idealPhrase: ''
      });
      setKeywordInput('');
      setEditingSubCriteria(null);
      setIsSheetOpen(false);
      
    } catch (err) {
      console.error('Erro ao editar subcritério:', err);
      setError('Erro ao editar subcritério. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubCriteria = async () => {
    if (!subCriteriaToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('sub_criteria')
        .delete()
        .eq('id', subCriteriaToDelete.id)
        .eq('criteria_id', criteriaId)
        .eq('company_id', companyId);

      if (deleteError) {
        throw new Error(`Erro ao excluir: ${deleteError.message}`);
      }

      console.log('✅ Subcritério excluído com sucesso!');
      
      // Recarregar dados
      await loadCriteriaDetails();
      
      // Fechar modal
      setDeleteDialogOpen(false);
      setSubCriteriaToDelete(null);
      
    } catch (err) {
      console.error('Erro ao excluir subcritério:', err);
      setError('Erro ao excluir subcritério. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const openEditSheet = (subCrit: any) => {
    setEditingSubCriteria(subCrit);
    setNewSubCriteria({
      name: subCrit.name,
      description: subCrit.description,
      color: subCrit.color,
      keywords: subCrit.keywords || [],
      idealPhrase: subCrit.ideal_phrase || ''
    });
    setKeywordInput('');
    setIsSheetOpen(true);
  };

  const openCreateSheet = () => {
    if (!subCriteriaTableExists) {
      setShowSetupDialog(true);
      return;
    }
    
    setEditingSubCriteria(null);
    setNewSubCriteria({
      name: '',
      description: '',
      color: 'orange',
      keywords: [],
      idealPhrase: ''
    });
    setKeywordInput('');
    setIsSheetOpen(true);
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      orange: '#f97316',
      blue: '#3b82f6',
      black: '#1f2937',
      pink: '#ec4899',
      green: '#10b981',
      red: '#ef4444',
      purple: '#8b5cf6',
      yellow: '#eab308',
    };
    return colorMap[color] || '#f97316';
  };

  const handleRetry = () => {
    loadCriteriaDetails();
  };

  const copySetupScript = () => {
    navigator.clipboard.writeText(setupScript).then(() => {
      console.log('Script copiado para a área de transferência');
    });
  };

  if (loading) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div className="flex-1">
            <div className="text-[#677c92] text-xs uppercase tracking-wide">CRITÉRIO</div>
            <div className="text-[#373753] text-lg font-medium tracking-tight">Carregando critério...</div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#3057f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#677c92]">Carregando detalhes do critério...</p>
        </div>
      </div>
    );
  }

  if (error && !criteria) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div className="flex-1">
            <div className="text-[#677c92] text-xs uppercase tracking-wide">CRITÉRIO</div>
            <div className="text-[#373753] text-lg font-medium tracking-tight">Erro ao carregar</div>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-xl border border-[#e1e9f4] p-8 text-center">
          <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-[#DC2F1C]" />
          </div>
          <h3 className="text-lg font-medium text-[#373753] mb-2">Erro ao carregar critério</h3>
          <p className="text-[#677c92] mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="w-full bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Tentar Novamente
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white border border-[#e1e9f4] text-[#677c92] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafc] transition-colors"
            >
              Voltar aos Critérios
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!criteria) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
          >
            <ArrowLeft className="h-4 w-4 text-[#373753]" />
          </button>
          <div className="flex-1">
            <div className="text-[#677c92] text-xs uppercase tracking-wide">CRITÉRIO</div>
            <div className="text-[#373753] text-lg font-medium tracking-tight">Critério não encontrado</div>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-[#677c92]">Critério não encontrado</p>
          <button
            onClick={onBack}
            className="mt-4 bg-[#3057f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2545d9] transition-colors"
          >
            Voltar aos Critérios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Header com edição inline */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
        >
          <ArrowLeft className="h-4 w-4 text-[#373753]" />
        </button>
        <div className="flex-1">
          <div className="text-[#677c92] text-xs uppercase tracking-wide">CRITÉRIO</div>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <Input
                value={criteriaName}
                onChange={(e) => setCriteriaName(e.target.value)}
                onBlur={handleSaveCriteriaName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCriteriaName();
                  } else if (e.key === 'Escape') {
                    handleCancelEditName();
                  }
                }}
                className="text-[#373753] text-lg font-medium tracking-tight h-8 border-[#3057f2] focus:border-[#3057f2] focus:ring-1 focus:ring-[#3057f2]/20"
                autoFocus
                disabled={saving}
              />
            ) : (
              <>
                <div className="text-[#373753] text-lg font-medium tracking-tight">{criteria.name}</div>
                <button
                  onClick={handleStartEditName}
                  className="p-1 text-[#677c92] hover:text-[#373753] hover:bg-[#f8fafc] rounded transition-colors"
                  title="Editar nome do critério"
                >
                  <Pen className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#dc2f1c] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[#dc2f1c] font-medium mb-1">Erro</p>
              <p className="text-[#dc2f1c] text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ID Section */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] py-3 pl-3 pr-3">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-[#373753]">
              ID do critério
            </Label>
            <p className="text-xs text-[#677c92]">
              Use este ID para fazer requisições à API
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={getDisplayCriteriaId(criteriaId)}
              readOnly
              className="flex-1 h-10 rounded-lg border border-[#e1e9f4] px-3 py-2 text-sm bg-[#f8fafc] text-[#677c92] cursor-default font-mono"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(criteriaId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="outline"
              size="sm"
              className={`h-10 px-3 border-[#e1e9f4] hover:bg-[#f8fafc] shadow-none flex items-center gap-1 transition-colors ${copied ? 'text-green-600 border-green-200 bg-green-50' : 'text-[#677c92] hover:text-[#373753]'}`}
              title="Copiar ID do critério completo"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className={`text-xs font-medium transition-colors duration-200 ${copied ? 'text-green-600' : ''}`}>
                {copied ? 'Copiado' : 'Copiar'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sub Criteria Table */}
      <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
        {/* Search and Actions */}
        <div className="flex items-center justify-between py-3 pl-6 pr-3 border-b border-[#e1e9f4]">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="h-4 w-4 text-[#677c92]" />
            <Input
              type="text"
              placeholder="Pesquisar subcritério"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent px-0 text-[#373753] placeholder:text-[#677c92] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            onClick={openCreateSheet}
            className="bg-[#e1e9f4] text-[#677c92] hover:bg-[#d1d9e4] border-none h-8 px-4 rounded-lg shadow-none"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-xs">Novo subcritério</span>
          </Button>
        </div>

        {/* Table Header */}
        <div className="bg-[#f0f4fa] px-6 py-3">
          <div className="flex items-center justify-between text-[#677c92] text-xs uppercase tracking-wide">
            <div className="w-12">Cor</div>
            <div className="w-48">Nome</div>
            <div className="flex-1 pl-4">Descrição</div>
            <div className="w-12"></div>
          </div>
        </div>
        {/* Table Rows */}
        <div>
          {subCriteriaTableExists && subCriteria
            .filter(sc =>
              sc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (sc.description && sc.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((subCrit) => (
            <div
              key={subCrit.id}
              className="border-b border-[#e1e9f4] px-6 py-2 hover:bg-gray-50 group relative"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 flex items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subCrit.color }}></div>
                </div>
                <div className="w-48 flex items-center">
                  <span className="text-[#373753] text-base font-medium">{subCrit.name}</span>
                </div>
                <div className="flex-1 flex items-center pl-4">
                  <span className="text-[#677c92] text-base">{subCrit.description}</span>
                </div>
                <div className="w-12 flex justify-center relative z-30 pointer-events-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[#677c92] hover:text-[#373753] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditSheet(subCrit);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubCriteriaToDelete(subCrit);
                          setDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer text-[#dc2f1c] hover:text-[#dc2f1c] hover:bg-[#fef2f2]"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          {(subCriteria.length === 0 || !subCriteriaTableExists) && (
            <div className="px-6 py-8 text-center">
              <div className="text-[#677c92] text-base">
                {!subCriteriaTableExists 
                  ? 'Configure a funcionalidade de subcritérios para começar'
                  : 'Nenhum critério adicionado ainda'
                }
              </div>
              <Button
                onClick={openCreateSheet}
                variant="ghost"
                className="mt-2 text-[#3057f2] hover:text-[#2545d9]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {!subCriteriaTableExists 
                  ? 'Configurar subcritérios'
                  : 'Adicionar primeiro critério'
                }
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#e1e9f4] rounded-lg p-4">
              <h4 className="font-medium text-[#373753] mb-4">Exemplos de como utilizar subcritérios para avaliar chamadas:</h4>
              <ul className="text-sm text-[#677c92] space-y-1">
                <li>• <strong>Finalização:</strong> Como o atendente finaliza a chamada</li>
                <li>• <strong>Cordialidade:</strong> Nível de cortesia e educação</li>
                <li>• <strong>Formalidade:</strong> Uso apropriado da linguagem formal</li>
                <li>• <strong>Saudação:</strong> Qualidade da abertura da chamada</li>
                <li>• <strong>Negociação:</strong> Habilidade de negociação e persuasão</li>
                <li>• <strong>Abordagem:</strong> Técnica de abordagem do cliente</li>
              </ul>
            </div>

      {/* Create/Edit Modal */}
      {isSheetOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm" onClick={() => setIsSheetOpen(false)} />
          
          {/* Modal */}
          <div className="fixed right-0 top-11 bottom-0 w-[520px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
            <div className="h-full flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="w-10 h-10 bg-white border border-[#e1e9f4] rounded-full flex items-center justify-center shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]"
              >
                <ArrowLeft className="h-4 w-4 text-[#373753]" />
              </button>
              <div className="text-[#373753] text-base">Critérios</div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
                <h3 className="text-lg font-medium text-[#373753] mb-4">Detalhes do subcritério</h3>
                <div className="border-b border-[#e1e9f4] -mx-4 mb-4" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-[#373753] mb-2 block">Nome <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={newSubCriteria.name}
                        onChange={(e) => setNewSubCriteria({ ...newSubCriteria, name: e.target.value })}
                        placeholder="Abordagem"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color" className="text-sm font-medium text-[#373753] mb-2 block">Cor <span className="text-red-500">*</span></Label>
                      <Select
                        value={newSubCriteria.color}
                        onValueChange={(value) => setNewSubCriteria({ ...newSubCriteria, color: value })}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-[#373753] mb-2 block">Descrição <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      value={newSubCriteria.description}
                      onChange={(e) => setNewSubCriteria({ ...newSubCriteria, description: e.target.value })}
                      placeholder="Termos de saudação"
                      className="text-sm min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] p-4">
                <h3 className="text-lg font-medium text-[#373753] mb-4">Complementos da IA</h3>
                <div className="border-b border-[#e1e9f4] -mx-4 mb-4" />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keywords" className="text-sm font-medium text-[#373753] mb-2 block">Palavra chave</Label>
                    <div className="flex flex-wrap items-center gap-1 border border-[#e1e9f4] bg-white px-3 py-2 rounded-lg min-h-[40px] focus-within:border-[#3057f2] focus-within:ring-1 focus-within:ring-[#3057f2]/20">
                      {newSubCriteria.keywords.map((kw, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-[#e6f0ff] text-[#2563eb] px-2 py-0.5 text-xs font-medium flex items-center gap-1 border-none rounded-[6px]">
                          {kw}
                          <button type="button" onClick={() => handleRemoveKeyword(kw)} className="ml-1 text-[#2563eb] hover:text-[#dc2f1c]">×</button>
                        </Badge>
                      ))}
                      <input
                        type="text"
                        className="flex-1 border-none outline-none bg-transparent text-sm px-1 min-w-[60px] h-6"
                        placeholder="Digite e pressione Enter"
                        value={keywordInput}
                        onChange={e => setKeywordInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ideal-phrase" className="text-sm font-medium text-[#373753] mb-2 block">Frase ideal</Label>
                    <Textarea
                      id="ideal-phrase"
                      value={newSubCriteria.idealPhrase}
                      onChange={(e) => setNewSubCriteria({ ...newSubCriteria, idealPhrase: e.target.value })}
                      className="text-sm min-h-[80px]"
                      placeholder="Exemplo de frase ideal para IA"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={editingSubCriteria ? handleEditSubCriteria : handleCreateSubCriteria}
                  disabled={saving || !newSubCriteria.name.trim() || !newSubCriteria.description.trim()}
                  className="bg-[#3057f2] text-white hover:bg-[#2545d9] rounded-lg h-12 text-base font-medium shadow-none"
                >
                  {saving ? 'Salvando...' : editingSubCriteria ? 'Salvar' : 'Criar'}
                </Button>
                <Button
                  onClick={() => setIsSheetOpen(false)}
                  variant="ghost"
                  className="text-[#677c92] hover:text-[#373753] rounded-lg h-10 text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Setup Dialog */}
      <AlertDialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuração de Subcritérios
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Para usar a funcionalidade de subcritérios, você precisa executar um script SQL no Supabase.
                  Siga os passos abaixo:
                </p>
                
                <div className="space-y-2">
                  <p className="font-medium">1. Acesse o Supabase Dashboard</p>
                  <p className="font-medium">2. Vá em SQL Editor</p>
                  <p className="font-medium">3. Cole e execute o script abaixo:</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono max-h-60 overflow-y-auto">
                  <pre>{setupScript}</pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copySetupScript}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Script
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSetupDialog(false);
                window.location.reload(); // Recarregar para verificar se a tabela foi criada
              }}
            >
              Executei o Script
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog - Vermelho */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Excluir critério
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-700">
              Tem certeza que deseja excluir o critério "{subCriteriaToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubCriteria}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
