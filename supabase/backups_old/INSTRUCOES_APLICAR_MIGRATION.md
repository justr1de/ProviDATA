# Instruções para Aplicar a Migration de Campos de Contato

## Migration Criada
`20260101_adicionar_campos_contato_gabinetes.sql`

## Como Aplicar a Migration

### Opção 1: Via Dashboard do Supabase
1. Acesse o Dashboard do Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo [`supabase/migrations/20260101_adicionar_campos_contato_gabinetes.sql`](./20260101_adicionar_campos_contato_gabinetes.sql)
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** para executar

### Opção 2: Via Supabase CLI (Recomendado)
```bash
# Execute no terminal na raiz do projeto
npx supabase db push
```

Ou se preferir aplicar apenas esta migration específica:
```bash
npx supabase db push --include-all
```

## Campos Adicionados

### Telefones
- `telefone_parlamentar` - Telefone pessoal do parlamentar
- `telefone_gabinete` - Telefone principal do gabinete
- `telefone_adicional` - Telefone adicional/alternativo

### E-mails
- `email_parlamentar` - E-mail pessoal do parlamentar
- `email_gabinete` - E-mail institucional do gabinete

### Assessores (Opcional)
- `assessor_1` - Nome do primeiro assessor
- `assessor_2` - Nome do segundo assessor

## Notas Importantes
- Os campos antigos `telefone` e `email` foram mantidos por compatibilidade
- A migration migra automaticamente dados existentes para os novos campos
- Todos os novos campos são opcionais (nullable)
- O formulário de criação de gabinetes foi atualizado para incluir os novos campos
