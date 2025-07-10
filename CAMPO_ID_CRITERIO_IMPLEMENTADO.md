# Campo ID do Critério Implementado

## Funcionalidade Adicionada
Implementado campo para exibir e copiar o ID do critério na seção "Geral" da página de detalhes do critério.

## Problema Resolvido
Os usuários precisavam do ID do critério para fazer requisições à API, mas não tinham acesso fácil a essa informação na interface.

## Solução Implementada

### **Campo ID do Critério**
```jsx
<div>
  <Label className="text-sm font-medium text-[#373753] mb-2 block">
    ID do critério
  </Label>
  <div className="flex items-center gap-2">
    <Input
      value={criteriaId}
      readOnly
      className="flex-1 h-10 rounded-lg border border-[#e1e9f4] px-3 py-2 text-sm bg-[#f8fafc] text-[#677c92] cursor-default"
    />
    <Button
      onClick={() => {
        navigator.clipboard.writeText(criteriaId);
      }}
      variant="outline"
      size="sm"
      className="h-10 px-3 text-[#677c92] hover:text-[#373753] border-[#e1e9f4] hover:bg-[#f8fafc] shadow-none"
      title="Copiar ID do critério"
    >
      <Copy className="h-4 w-4" />
    </Button>
  </div>
  <p className="text-xs text-[#677c92] mt-1">
    Use este ID para fazer requisições à API
  </p>
</div>
```

## Características Implementadas

### 1. **Campo de Exibição**
- **Input somente leitura:** `readOnly` com valor do `criteriaId`
- **Estilo diferenciado:** Background `bg-[#f8fafc]` e texto `text-[#677c92]`
- **Cursor:** `cursor-default` para indicar que não é editável

### 2. **Botão de Cópia**
- **Ícone:** `Copy` do lucide-react
- **Funcionalidade:** `navigator.clipboard.writeText(criteriaId)`
- **Tooltip:** "Copiar ID do critério"
- **Estilo:** Outline button com hover states

### 3. **Texto Explicativo**
- **Descrição:** "Use este ID para fazer requisições à API"
- **Estilo:** `text-xs text-[#677c92]`
- **Posição:** Abaixo do campo de input

### 4. **Layout Atualizado**
- **Espaçamento:** `space-y-4` entre campos
- **Título da seção:** "Geral" adicionado
- **Organização:** Campo ID abaixo do nome do critério

## UX/UI Design

### **Visual Consistency**
- Segue o mesmo padrão dos outros campos
- Cores consistentes com o design system
- Espaçamentos padronizados

### **Usabilidade**
- Campo claramente identificado como somente leitura
- Botão de cópia intuitivo com ícone reconhecível
- Texto explicativo orienta o uso

### **Acessibilidade**
- Label apropriado para o campo
- Tooltip no botão de cópia
- Cursor adequado para campo não editável

## Benefícios

### ✅ **Para Desenvolvedores**
- Acesso fácil ao ID do critério
- Cópia rápida para usar em requisições
- Não precisa inspecionar elementos ou consultar banco

### ✅ **Para Usuários Técnicos**
- Interface mais completa
- Informação técnica acessível
- Workflow mais eficiente

### ✅ **Para a API**
- Facilita integração
- Reduz erros de digitação de IDs
- Melhora experiência de desenvolvimento

## Arquivos Modificados
- `components/CriteriaDetailPage.tsx` - Campo ID do critério implementado 