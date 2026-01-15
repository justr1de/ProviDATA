# Correção: Sugestão Automática de Órgão Emissor

## Data: 15/01/2026

## Problema Identificado
O campo "Órgão Emissor" no formulário de cadastro de cidadão não estava sendo preenchido automaticamente quando a UF era identificada através da busca de CEP.

### Causa Raiz
A função `searchCEP` atualizava os campos de endereço (logradouro, bairro, cidade, UF) mas não atualizava o campo `rg_orgao_emissor` com a sugestão baseada na UF encontrada.

## Solução Implementada

### Arquivo Modificado
`/src/app/dashboard/cidadaos/novo/page.tsx`

### Alteração
Na função `searchCEP`, foi adicionada a lógica para preencher automaticamente o campo `rg_orgao_emissor` quando:
1. A UF é encontrada através da busca de CEP
2. O campo de órgão emissor ainda está vazio

### Código Antes
```javascript
setFormData(prev => ({
  ...prev,
  endereco: data.logradouro || '',
  bairro: data.bairro || '',
  cidade: data.localidade || '',
  uf: data.uf || '',
  complemento: data.complemento || prev.complemento,
}))
```

### Código Depois
```javascript
const ufEncontrada = data.uf || ''
setFormData(prev => ({
  ...prev,
  endereco: data.logradouro || '',
  bairro: data.bairro || '',
  cidade: data.localidade || '',
  uf: ufEncontrada,
  complemento: data.complemento || prev.complemento,
  rg_orgao_emissor: (!prev.rg_orgao_emissor && ufEncontrada) 
    ? getSugestaoOrgaoEmissor(ufEncontrada) 
    : prev.rg_orgao_emissor,
}))
```

## Comportamento Atual

### Cenários de Uso

1. **Busca por CEP**: Quando o usuário digita um CEP válido, o sistema:
   - Preenche automaticamente os campos de endereço
   - Identifica a UF
   - Sugere automaticamente o órgão emissor padrão (SSP) para aquela UF
   - Exibe as opções disponíveis abaixo do campo

2. **Seleção Manual de UF**: Quando o usuário seleciona manualmente a UF:
   - O campo de órgão emissor é preenchido automaticamente (se estiver vazio)
   - O placeholder muda para mostrar a sugestão

3. **Preservação de Dados**: Se o usuário já preencheu o órgão emissor manualmente:
   - O valor não é sobrescrito pela sugestão automática

### Órgãos Emissores por UF

O sistema possui um mapeamento completo de órgãos emissores para todas as 27 UFs brasileiras, incluindo:
- SSP (Secretaria de Segurança Pública) - padrão
- DETRAN
- PC (Polícia Civil)
- Órgãos específicos de cada estado (SEJUCEL/RO, ITEP/RN, etc.)

## Commit
- Hash: 5867997898d51e56167759e0deb925a6b2e44e1a
- Mensagem: "fix: Auto-suggest órgão emissor when UF is filled via CEP search"

## Deploy
- Plataforma: Vercel
- Status: READY
- URL: https://providata.vercel.app
