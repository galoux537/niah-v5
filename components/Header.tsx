import React from 'react';
import logoBlue from '../logo completa azul 1.svg';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogOut, User, Users } from 'lucide-react';
import { Page } from '../src/lib/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onBack?: () => void;
}

export function Header({ currentPage, onPageChange, onBack }: HeaderProps) {
  const { company, signOut } = useAuth();

  const tabs = [
    { id: 'avaliacoes' as Page, label: 'Avaliações' },
    { id: 'criteria' as Page, label: 'Critérios' },
    { id: 'configuracoes' as Page, label: 'Documentação API' },
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-white border-b border-[#e1e9f4] sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo – clicável para voltar às Avaliações */}
          <button
            type="button"
            onClick={() => onPageChange('avaliacoes')}
            className="flex items-center focus:outline-none"
            title="Voltar para Avaliações"
          >
            <img src={logoBlue} alt="Logo" width={73} height={22} />
          </button>



          {/* Menu Mobile */}
          <MobileMenu currentPage={currentPage} onPageChange={onPageChange} onBack={onBack} />

          {/* Informações da Empresa e Logout (desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-[#373753] text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#677c92]" />
                {company?.name || 'Empresa'}
              </div>
              <div className="text-[#677c92] text-xs">
                {company?.email || 'empresa@exemplo.com'}
              </div>
            </div>
            
            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-8 h-8 bg-[#E1E9F4] rounded-full flex items-center justify-center hover:bg-[#d9e2f0] transition-colors"
                  title="Menu do usuário"
                >
                  <User className="h-4 w-4 text-[#677c92]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => onPageChange('usuarios')}
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

      {/* Navigation Tabs - CENTRALIZADAS (desktop) */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 bottom-0">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPageChange(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === tab.id || 
                (tab.id === 'avaliacoes' && currentPage === 'list-detail') ||
                (tab.id === 'criteria' && (currentPage === 'criteria-detail' || currentPage === 'criteria-create'))
                  ? 'border-[#3057f2] text-[#3057f2]'
                  : 'border-transparent text-[#677c92] hover:text-[#373753] hover:border-[#e1e9f4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
