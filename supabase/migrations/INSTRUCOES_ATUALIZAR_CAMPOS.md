# Instruções para Atualizar Campos de Gabinetes

## Resumo das Alterações

A migration [`20260101_atualizar_campos_gabinetes.sql`](supabase/migrations/20260101_atualizar_campos_gabinetes.sql) realiza as seguintes mudanças na tabela `gabinetes`:

### 1. Campos de Equipe
- **`chefe_gabinete`** (renomeado de `assessor_1`) - Nome do Chefe de Gabinete (opcional)
- **`assessor_2`** - Nome do Assessor (opcional)

### 2. Campos de E-mail
- **`email_parlamentar`** - E-mail do Parlamentar
- **`email_gabinete`** - E-mail do Gabinete

### 3. Campos de Telefone
- **`telefone_parlamentar`** - Telefone do Parlamentar
- **`telefone_gabinete`** - Telefone do Gabinete
- **`telefone_alternativo`** (renomeado de `telefone_adicional`) - Telefone Alternativo

### 4. Indicadores de WhatsApp
Cada telefone possui um campo boolean para indicar se tem WhatsApp:
- **`telefone_parlamentar_whatsapp`** - Checkbox para indicar WhatsApp
- **`telefone_gabinete_whatsapp`** - Checkbox para indicar WhatsApp
- **`telefone_alternativo_whatsapp`** - Checkbox para indicar WhatsApp

### 5. Site do Parlamentar
- **`site_parlamentar`** (opcional) - Site oficial do parlamentar

### 6. Redes Sociais (todas opcionais)
- **`instagram`** - Perfil do Instagram
- **`facebook`** - Perfil do Facebook
- **`tiktok`** - Perfil do TikTok
- **`twitter`** - Perfil do Twitter/X ou Threads
- **`linkedin`** - Perfil do LinkedIn

## Formatos Recomendados para Links

### Site
```
https://www.exemplo.com.br
```

### Instagram
```
https://www.instagram.com/nomedousuario
ou simplesmente
@nomedousuario
```

### Facebook
```
https://www.facebook.com/nomedousuario
```

### TikTok
```
https://www.tiktok.com/@nomedousuario
```

### Twitter/X ou Threads
```
https://twitter.com/nomedousuario
ou
https://www.threads.net/@nomedousuario
```

### LinkedIn
```
https://www.linkedin.com/in/nomedousuario
```

## Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo [`20260101_atualizar_campos_gabinetes.sql`](supabase/migrations/20260101_atualizar_campos_gabinetes.sql)
6. Execute a query clicando em **Run**

### Opção 2: Via Supabase CLI (se configurado)
```bash
supabase db push
```

## Verificação

Após executar a migration, você verá uma mensagem de sucesso indicando:
- Telefones: telefone_parlamentar, telefone_gabinete, telefone_alternativo
- WhatsApp: telefone_parlamentar_whatsapp, telefone_gabinete_whatsapp, telefone_alternativo_whatsapp
- E-mails: email_parlamentar, email_gabinete
- Equipe: chefe_gabinete, assessor_2
- Web: site_parlamentar
- Redes sociais: instagram, facebook, tiktok, twitter, linkedin

## Próximos Passos

Após aplicar a migration no banco de dados, você precisará atualizar:
1. Os tipos TypeScript em [`src/types/database.ts`](src/types/database.ts)
2. Os formulários de cadastro/edição de gabinetes
3. As telas de visualização de gabinetes

Para gerar os tipos TypeScript automaticamente, você pode usar:
```bash
supabase gen types typescript --local > src/types/database.ts
```
