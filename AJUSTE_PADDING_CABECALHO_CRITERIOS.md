# 📏 **Ajuste de Padding do Cabeçalho - Critérios**

## 🎯 **Objetivo**
Ajustar o padding do cabeçalho da tabela de critérios para 12px no top e bottom, mantendo 24px nas laterais.

## 🔧 **Mudança Realizada**

### **❌ Antes**
```jsx
<div className="flex items-center justify-between p-6 border-b border-[#e1e9f4]">
```
- **Padding:** 24px em todos os lados (`p-6`)

### **✅ Depois**
```jsx
<div className="flex items-center justify-between py-3 pl-6 pr-3 border-b border-[#e1e9f4]">
```
- **Padding vertical:** 12px (`py-3`)
- **Padding left:** 24px (`pl-6`)
- **Padding right:** 12px (`pr-3`)

## 📐 **Especificações**

### **Valores de Padding**
- **Top:** 12px
- **Bottom:** 12px  
- **Left:** 24px (mantido)
- **Right:** 12px (ajustado)

### **Classes Tailwind**
- `py-3` = padding-top: 12px + padding-bottom: 12px
- `pl-6` = padding-left: 24px
- `pr-3` = padding-right: 12px

## 🎨 **Impacto Visual**

### **Antes e Depois**
```
❌ Antes: [24px] Search + Botão [24px]
✅ Depois: [12px] Search + Botão [12px]
```

### **Benefícios**
- ✅ **Altura reduzida** do cabeçalho
- ✅ **Espaçamento mais compacto** verticalmente
- ✅ **Consistência** com outros elementos da interface
- ✅ **Melhor proporção** visual

## 📁 **Arquivo Modificado**
- `components/CriteriaPage.tsx` - Ajuste de padding do cabeçalho da tabela

## 📝 **Observação**
O padding esquerdo foi mantido em 24px para preservar o alinhamento com o conteúdo interno da tabela. O padding direito foi reduzido para 12px conforme solicitado. 