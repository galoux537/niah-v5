# Padronização do Modal Lateral - Critérios

## Problema Identificado
O modal lateral de edição/criação de critérios estava usando o componente `Sheet` com design inconsistente em relação ao padrão estabelecido no `CallsSidebarModal.tsx`.

## Solução Implementada

### **Antes - Sheet Component:**
```jsx
<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
  <SheetOverlay className="bg-[#00000040]" />
  <SheetContent className="bg-white border-l border-[#e1e9f4] w-[520px] max-w-full">
    <SheetHeader>
      <div className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 cursor-pointer" />
        <SheetTitle>Critérios</SheetTitle>
      </div>
    </SheetHeader>
    ...
  </SheetContent>
</Sheet>
```

### **Depois - Modal Lateral Padronizado:**
```jsx
{isSheetOpen && (
  <div className="fixed right-0 top-14 bottom-0 w-[520px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-lg z-40">
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
      ...
    </div>
  </div>
)}
```

## Mudanças Aplicadas

### 1. **Estrutura Base**
- **Container:** `fixed right-0 top-14 bottom-0 w-[520px]`
- **Background:** `bg-[#f9fafc]` (mesmo do CallsSidebarModal)
- **Borda:** `border-l border-[#e1e9f4]`
- **Shadow:** `shadow-lg z-40`

### 2. **Cabeçalho Padronizado**
- **Botão Voltar:** Circular com shadow sutil
- **Título:** Texto simples ao lado do botão
- **Layout:** `flex items-center gap-4 mb-6`

### 3. **Cards de Conteúdo**
- **Background:** `bg-white`
- **Border:** `border border-[#e1e9f4]`
- **Shadow:** `shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]`
- **Radius:** `rounded-xl`
- **Padding:** `p-6`

### 4. **Tipografia Atualizada**
- **Títulos:** `text-lg font-medium text-[#373753]`
- **Labels:** `text-sm font-medium text-[#373753] mb-2 block`
- **Inputs:** Altura `h-10` e texto `text-sm`
- **Textareas:** Altura mínima `min-h-[80px]`

### 5. **Espaçamentos Consistentes**
- **Entre seções:** `space-y-6`
- **Entre campos:** `space-y-4`
- **Grid gaps:** `gap-4`
- **Botões:** `gap-3`

### 6. **Botões Padronizados**
- **Primário:** `bg-[#3057f2] h-12 text-base font-medium rounded-lg shadow-none`
- **Secundário:** `text-[#677c92] h-10 text-sm rounded-lg`

### 7. **Campo de Keywords**
- **Container:** `border border-[#e1e9f4] px-3 py-2 rounded-lg min-h-[40px]`
- **Focus:** `focus-within:border-[#3057f2] focus-within:ring-1 focus-within:ring-[#3057f2]/20`

## Remoções
- **Importações removidas:** `Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetOverlay`
- **Overlay:** Removido overlay escuro desnecessário

## Resultado Final

### ✅ **Consistência Visual Total**
- Modal lateral idêntico ao padrão do `CallsSidebarModal`
- Tipografia e espaçamentos padronizados
- Cores e shadows consistentes
- Botões seguindo o design system

### 🎯 **Melhorias de UX**
- Visual mais limpo e profissional
- Navegação mais intuitiva
- Interações consistentes em todo o sistema
- Performance melhorada (sem overlay)

### 8. **Overlay de Profundidade**
- **Adicionado:** `<div className="fixed inset-0 bg-black/20 z-30" />`
- **Funcionalidade:** Clique no overlay fecha o modal
- **Z-index:** 30 (modal em z-40)
- **Transparência:** `bg-black/20` para escurecer sutilmente

## Arquivos Modificados
- `components/CriteriaDetailPage.tsx` - Modal lateral padronizado com overlay 