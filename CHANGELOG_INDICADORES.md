# Changelog - Indicadores de Providências e Assistente de IA

## Data: 06/01/2026

### Novas Funcionalidades

#### 1. Página de Indicadores de Providências (`/admin/indicadores`)
- **Cards de Resumo**: Total de providências, taxa de resolução, tempo médio de resolução, providências atrasadas
- **Distribuição por Status**: Pendente, Em Análise, Em Andamento, Encaminhada, Concluída
- **Distribuição por Prioridade**: Baixa, Média, Alta, Urgente
- **Evolução Mensal**: Gráfico de linha mostrando providências criadas e resolvidas por mês
- **Top 10 Órgãos**: Ranking dos órgãos que mais recebem demandas

#### 2. Aba de Demandas por Órgão
- Total de órgãos cadastrados
- Órgãos ativos
- Órgãos com demandas
- Top 10 órgãos com mais demandas

#### 3. Assistente de IA
- Chat flutuante disponível nas páginas de indicadores e gabinetes
- Consultas em linguagem natural ao banco de dados
- Sugestões de perguntas pré-definidas:
  - "Quantas providências foram criadas este mês?"
  - "Quais gabinetes têm mais providências pendentes?"
  - "Qual o tempo médio de resolução das providências?"
  - "Quais órgãos recebem mais demandas?"
- Integração com OpenAI GPT-4.1-mini para processamento de linguagem natural
- Geração automática de queries SQL seguras (somente SELECT)

#### 4. Botão de Indicadores na Página de Gabinetes
- Acesso rápido aos indicadores a partir da página de administração de gabinetes

### APIs Criadas
- `GET /api/admin/stats/providencias` - Estatísticas de providências
- `GET /api/admin/stats/orgaos` - Estatísticas de órgãos
- `POST /api/admin/ai/query` - Consultas via assistente de IA

### Componentes Criados
- `AIChat` - Componente de chat flutuante com IA

### Configurações
- Variável de ambiente `OPENAI_API_KEY` adicionada na Vercel

### Observações
- Os dados mostram 0 providências porque o sistema exclui gabinetes de demonstração das estatísticas
- O assistente de IA está funcionando corretamente, respondendo consultas em linguagem natural
