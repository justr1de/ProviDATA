# ProviDATA - Sistema de Gestão de Providências Parlamentares

## Visão Geral

O **ProviDATA** é um sistema SaaS multi-tenant desenvolvido para a gestão de providências parlamentares. Permite que vereadores, deputados e senadores gerenciem as solicitações dos cidadãos de forma organizada e transparente.

**Desenvolvido por:** DATA-RO INTELIGÊNCIA TERRITORIAL

---

## URLs de Acesso

- **Produção:** https://providata.vercel.app
- **GitHub:** https://github.com/justr1de/ProviDATA
- **Supabase:** https://wntiupkhjtgiaxiicxeq.supabase.co

---

## Arquitetura

### Stack Tecnológica

| Componente | Tecnologia |
|------------|------------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Estilização | Tailwind CSS |
| Backend/BaaS | Supabase (PostgreSQL + Auth + Storage) |
| Hospedagem | Vercel (Serverless) |
| Versionamento | GitHub |
| Gerenciamento de Estado | Zustand |

### Estrutura Multi-tenant

O sistema utiliza **Row Level Security (RLS)** do Supabase para garantir isolamento completo entre os dados de diferentes gabinetes parlamentares. Cada tenant (gabinete) possui:

- Dados completamente isolados
- Usuários próprios com diferentes níveis de acesso
- Configurações personalizadas

---

## Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `tenants` | Gabinetes parlamentares (multi-tenant) |
| `users` | Usuários do sistema vinculados a tenants |
| `cidadaos` | Cadastro de cidadãos solicitantes |
| `categorias` | Categorias de providências |
| `orgaos` | Órgãos destinatários (secretarias, MP, etc.) |
| `providencias` | Pedidos de providência |
| `providencia_anexos` | Arquivos anexados às providências |
| `providencia_historico` | Histórico de alterações |
| `notificacoes` | Sistema de notificações |

### Níveis de Acesso

- **admin**: Administrador do gabinete (acesso total)
- **assessor**: Assessor parlamentar (gerencia providências)
- **visualizador**: Apenas visualização

---

## Funcionalidades Implementadas

### 1. Landing Page
- Apresentação do sistema
- Funcionalidades destacadas
- Call-to-action para cadastro

### 2. Autenticação
- Login com e-mail e senha via Supabase Auth
- Cadastro de novos gabinetes
- Recuperação de senha
- Proteção de rotas via middleware

### 3. Dashboard Principal
- Estatísticas em tempo real
- Providências por status
- Providências recentes
- Alertas de prazos

### 4. Gestão de Providências
- Listagem com filtros (status, categoria, órgão)
- Cadastro completo com:
  - Dados do cidadão
  - Descrição do problema
  - Localização
  - Órgão destinatário
  - Prazo de resposta
  - Upload de anexos (fotos, vídeos, documentos)
- Timeline de acompanhamento
- Alteração de status
- Histórico completo

### 5. Cadastro de Cidadãos
- Informações pessoais completas
- Endereço
- Contatos
- Histórico de solicitações

### 6. Órgãos Destinatários
- Secretarias Municipais
- Secretarias Estaduais
- Ministério Público (Estadual/Federal)
- Defensoria Pública
- Tribunal de Contas
- Outros órgãos personalizados

### 7. Categorias
- Categorização de providências
- Organização por tipo de problema

### 8. Notificações
- Alertas de prazos
- Atualizações de status
- Notificações por e-mail (configurável)

### 9. Configurações
- Dados do gabinete
- Preferências de notificação
- Gerenciamento de usuários

---

## Estrutura de Diretórios

```
/src
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── cadastro/
│   ├── dashboard/
│   │   ├── providencias/
│   │   │   ├── nova/
│   │   │   └── [id]/
│   │   ├── cidadaos/
│   │   │   └── novo/
│   │   ├── orgaos/
│   │   │   └── novo/
│   │   ├── categorias/
│   │   ├── notificacoes/
│   │   └── configuracoes/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── store/
│   └── auth-store.ts
├── types/
│   └── database.ts
└── middleware.ts
```

---

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://wntiupkhjtgiaxiicxeq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
```

---

## Próximos Passos (Roadmap)

### Fase 2 - Melhorias
- [ ] Integração com serviço de e-mail (Resend/SendGrid)
- [ ] Push notifications via Web Push API
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Dashboard analítico avançado
- [ ] Integração com WhatsApp Business API

### Fase 3 - Expansão
- [ ] App mobile (React Native)
- [ ] Portal do cidadão para acompanhamento
- [ ] Integração com sistemas governamentais
- [ ] API pública para integrações

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Iniciar produção
pnpm start
```

---

## Suporte

Para suporte técnico ou dúvidas:
- **E-mail:** contato@dataro-it.com.br
- **Website:** https://dataro-it.com.br

---

© 2024 DATA-RO INTELIGÊNCIA TERRITORIAL. Todos os direitos reservados.
