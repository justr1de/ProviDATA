# Referência de Design - Modelo DTE

## Análise do Modelo DTE (Data Tracking Eleitoral)

### Layout Geral
- **Sidebar**: Fixo à esquerda, fundo escuro (#0a0a0a ou similar)
- **Conteúdo Principal**: Área branca/clara com padding adequado
- **Header**: Título da página + controles (filtros, botões)

### Sidebar (Barra Lateral)
- **Largura**: ~240-256px
- **Fundo**: Preto/muito escuro
- **Logo**: No topo, com nome do sistema
- **Informações do usuário/gabinete**: Abaixo da logo
- **Menu de navegação**: 
  - Itens com ícone + texto
  - Item ativo com fundo destacado (verde ou cor primária)
  - Espaçamento vertical adequado entre itens (~8-12px)
  - Agrupamento por seções (separadores visuais)
- **Rodapé do sidebar**: Links secundários (Notificações, Configurações)

### Cards de Estatísticas (Topo)
- **Layout**: 4 cards em linha no desktop
- **Estrutura de cada card**:
  - Ícone pequeno no canto (com fundo colorido sutil)
  - Número grande e bold
  - Descrição pequena abaixo
- **Cores dos ícones**: Diferentes para cada card (azul, amarelo, verde, vermelho)
- **Fundo**: Branco/claro com borda sutil
- **Responsividade**: 2 colunas em tablet, 1 coluna em mobile

### Barra de Progresso (Taxa de Participação/Conclusão)
- **Largura**: 100% do container
- **Altura**: ~8-12px
- **Cor**: Verde (cor primária)
- **Fundo**: Cinza claro
- **Texto**: Porcentagem à direita, descrição à esquerda

### Seção de Cards de Informação
- **Layout**: Grid de cards (4 colunas no desktop)
- **Estrutura de cada card**:
  - Nome/título no topo
  - Tags/badges coloridos
  - Barra de progresso
  - Número/porcentagem
- **Cores das barras**: Diferentes para cada item

### Gráficos
- **Layout**: 2 gráficos lado a lado no desktop
- **Gráfico de Barras Horizontais**:
  - Título com ícone
  - Barras coloridas (amarelo, laranja, marrom)
  - Labels à esquerda, valores à direita
- **Gráfico de Pizza/Donut**:
  - Título com ícone
  - Gráfico circular com legenda
  - Cores: Verde (válidos), Cinza (brancos), Vermelho (nulos), Azul (abstenções)

### Seção de Fonte dos Dados
- **Layout**: Barra horizontal no rodapé
- **Informações**: Origem, Estado, Anos, Última Atualização
- **Fundo**: Cinza claro
- **Texto**: Pequeno, em colunas

### Cores do Tema
- **Primária**: Verde (#22c55e ou similar)
- **Fundo escuro**: #0a0a0a, #1a1a1a
- **Fundo claro**: #ffffff, #f5f5f5
- **Texto escuro**: #0a0a0a
- **Texto claro**: #ffffff
- **Texto muted**: #6b7280
- **Bordas**: #e5e7eb (claro), #374151 (escuro)

### Responsividade (Breakpoints Padrão)
- **Mobile**: < 640px (1 coluna)
- **Tablet**: 640px - 1023px (2 colunas)
- **Desktop**: >= 1024px (4 colunas, sidebar visível)

### Espaçamentos Padrão
- **Padding do container**: 24px (desktop), 16px (mobile)
- **Gap entre cards**: 16px (desktop), 12px (mobile)
- **Margin entre seções**: 24px
- **Padding interno dos cards**: 16-24px
