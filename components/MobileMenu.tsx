import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Page } from '../src/lib/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogOut, User, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

interface MobileMenuProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onBack?: () => void;
}

export function MobileMenu({ currentPage, onPageChange, onBack }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { company, signOut } = useAuth();

  const tabs = [
    { id: 'avaliacoes' as Page, label: 'Avaliações' },
    { id: 'criteria' as Page, label: 'Critérios' },
    { id: 'configuracoes' as Page, label: 'Documentação API' },
  ];

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  const isActiveTab = (tabId: Page) => {
    return currentPage === tabId || 
      (tabId === 'avaliacoes' && currentPage === 'list-detail') ||
      (tabId === 'criteria' && (currentPage === 'criteria-detail' || currentPage === 'criteria-create'));
  };

  return (
    <div className="lg:hidden">
      {/* Botão do menu hambúrguer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#677c92] hover:text-[#373753] hover:bg-[#f9fafc] rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay do menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu lateral */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header do menu */}
              <div className="p-6 border-b border-[#e1e9f4]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#373753] text-lg font-medium">Menu</div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-[#677c92] hover:text-[#373753] hover:bg-[#f9fafc] rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Informações da empresa */}
                <div className="flex items-center gap-3 p-3 bg-[#f9fafc] rounded-lg">
                  <div className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[#677c92]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#373753] text-sm font-medium truncate">
                      {company?.name || 'Empresa'}
                    </div>
                    <div className="text-[#677c92] text-xs truncate">
                      {company?.email || 'empresa@exemplo.com'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navegação */}
              <div className="flex-1 p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handlePageChange(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                        isActiveTab(tab.id)
                          ? 'bg-[#3057f2] text-white'
                          : 'text-[#677c92] hover:text-[#373753] hover:bg-[#f9fafc]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {/* Botão voltar (se aplicável) */}
                {onBack && (currentPage === 'list-detail' || currentPage === 'criteria-detail' || currentPage === 'criteria-create') && (
                  <div className="mt-6 pt-6 border-t border-[#e1e9f4]">
                    <button
                      onClick={() => {
                        onBack();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-[#677c92] hover:text-[#373753] hover:bg-[#f9fafc] transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Voltar
                    </button>
                  </div>
                )}
              </div>

              {/* Footer com ações do usuário */}
              <div className="p-6 border-t border-[#e1e9f4] space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[#677c92] hover:text-[#373753] hover:bg-[#f9fafc] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#E1E9F4] rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-[#677c92]" />
                        </div>
                        <span className="text-sm font-medium">Usuário</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => {
                        handlePageChange('usuarios');
                      }}
                      className="cursor-pointer"
                    >
                      <Users className="h-4 w-4 mr-2 text-[#677c92]" />
                      Ver Usuários
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-[#dc2f1c] hover:text-[#dc2f1c] hover:bg-[#fef2f2]"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 