# 📄 **Implementação da Paginação na Tabela de Lotes**

## 🎯 **Objetivo**
Implementar paginação na tabela de lotes da página "Avaliações" limitando a exibição a 15 linhas por página, seguindo o padrão visual da interface.

## 🔧 **Implementação**

### **Estados Adicionados**
```typescript
// Estados de paginação
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 15;
```

### **Lógica de Paginação**
```typescript
// Reset página quando muda o termo de pesquisa
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);

// Cálculos de paginação
const totalPages = Math.ceil(filteredLists.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedLists = filteredLists.slice(startIndex, endIndex);
```

### **Funções de Navegação**
```typescript
// Função para ir para página específica
const goToPage = (page: number) => {
  setCurrentPage(page);
};

// Função para página anterior
const goToPreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

// Função para próxima página
const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};
```

### **Geração de Números das Páginas**
```typescript
const generatePageNumbers = () => {
  const pages = [];
  const maxVisiblePages = 7;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
};
```

## 🎨 **Interface da Paginação**

### **Estrutura Visual**
```jsx
{/* Pagination */}
{filteredLists.length > 0 && (
  <div className="border-t border-[#e1e9f4] px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Informações da página */}
      <div className="text-[#677c92] text-sm">
        Mostrando {startIndex + 1} - {Math.min(endIndex, filteredLists.length)} de {filteredLists.length} {filteredLists.length === 1 ? 'lista' : 'listas'}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Botão Anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {/* Números das páginas */}
          <div className="flex items-center gap-1">
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-[#677c92] text-sm">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page as number)}
                    className={`min-w-[32px] h-8 px-2 text-sm ${
                      currentPage === page
                        ? 'bg-[#3057f2] text-white hover:bg-[#2545d9] border-[#3057f2]'
                        : 'border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Botão Próximo */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border-[#e1e9f4] text-[#677c92] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </div>
)}
```

## ✨ **Funcionalidades Implementadas**

### **1. Paginação Inteligente**
- **Limite:** 15 itens por página
- **Navegação:** Botões "Anterior" e "Próximo"
- **Páginas Numeradas:** Clique direto na página desejada
- **Reticências:** Para grandes quantidades de páginas

### **2. Integração com Pesquisa**
- **Reset Automático:** Volta para página 1 quando pesquisa
- **Contagem Dinâmica:** Mostra resultados filtrados
- **Mensagens Contextuais:** Diferentes mensagens para diferentes estados

### **3. Estados Visuais**
- **Página Atual:** Destacada em azul (`#3057f2`)
- **Páginas Disponíveis:** Borda cinza com hover
- **Botões Desabilitados:** Opacity 50% quando não aplicável
- **Informações:** Mostra "X - Y de Z listas"

### **4. Lógica de Exibição**
- **Máximo 7 páginas visíveis** por vez
- **Algoritmo inteligente** para mostrar páginas relevantes
- **Reticências** quando há muitas páginas
- **Primeira e última** sempre visíveis quando necessário

## 📊 **Padrões de Exibição**

### **Poucas Páginas (≤ 7)**
```
1 2 3 4 5 6 7
```

### **Início (páginas 1-4)**
```
1 2 3 4 5 ... 15
```

### **Meio (página 8)**
```
1 ... 7 8 9 ... 15
```

### **Final (páginas 12-15)**
```
1 ... 11 12 13 14 15
```

## 🎯 **Resultado Final**
- ✅ **Paginação funcional** com 15 itens por página
- ✅ **Interface consistente** com o padrão visual
- ✅ **Navegação intuitiva** com botões e números
- ✅ **Integração perfeita** com pesquisa existente
- ✅ **Estados visuais** claros e informativos
- ✅ **Responsividade** mantida em todos os tamanhos
- ✅ **Performance otimizada** com slice dos dados

## 📁 **Arquivo Modificado**
- `components/DashboardPage.tsx` - Implementação completa da paginação 