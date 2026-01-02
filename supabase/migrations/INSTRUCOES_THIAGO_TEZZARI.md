# Instruções para Configurar Gabinete Thiago Tezzari

## Passo 1: Execute a Migration Base
Execute o arquivo `20240101_setup_completo_thiago_tezzari.sql` no SQL Editor do Supabase.

---

## Passo 2: Criar Usuário no Supabase Auth

1. Acesse: **Authentication > Users > Add User**
2. Preencha:
   - **Email**: `gab.thiagotezzari@gmail.com`
   - **Password**: (defina uma senha segura, ex: `Tezzari@2024!`)
   - Marque: ✅ **Auto Confirm User**
3. Clique em **Create User**
4. **COPIE O USER ID** que aparece (formato: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

## Passo 3: Buscar ID da Organização

Execute no SQL Editor:

```sql
SELECT id, name, slug 
FROM public.organizations 
WHERE slug = 'vereador-thiago-tezzari';
```

**COPIE O ID** retornado (formato: `12345678-1234-1234-1234-123456789012`)

---

## Passo 4: Configurar Perfil como Admin

**IMPORTANTE**: Substitua os valores entre aspas pelos IDs reais que você copiou!

### Exemplo de como deve ficar:

Se você copiou:
- **USER ID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **ORG ID**: `12345678-1234-1234-1234-123456789012`

Execute no SQL Editor:

```sql
INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    'admin',
    '12345678-1234-1234-1234-123456789012'::uuid,
    true,
    jsonb_build_object('is_gabinete_admin', true, 'setup_date', NOW())
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    organization_id = EXCLUDED.organization_id,
    full_name = EXCLUDED.full_name,
    onboarding_completed = true,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
```

---

## Passo 5: Verificar Configuração

Execute no SQL Editor:

```sql
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.created_at
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'gab.thiagotezzari@gmail.com';
```

### Resultado esperado:
- **email**: gab.thiagotezzari@gmail.com
- **full_name**: Thiago Tezzari
- **role**: admin
- **organization_name**: Gabinete do Vereador Thiago Tezzari
- **organization_slug**: vereador-thiago-tezzari
- **onboarding_completed**: true

---

## Passo 6: Testar Login

1. Acesse a aplicação: `/login`
2. Use as credenciais:
   - **Email**: `gab.thiagotezzari@gmail.com`
   - **Senha**: (a senha que você definiu no Passo 2)
3. Deve redirecionar para `/dashboard`

---

## Atualizar Informações do Gabinete (Opcional)

Para adicionar mais informações ao gabinete:

```sql
UPDATE public.organizations
SET settings = settings || jsonb_build_object(
    'partido', 'PARTIDO_DO_VEREADOR',
    'municipio', 'NOME_DA_CIDADE',
    'uf', 'RS',
    'telefone', '(XX) XXXXX-XXXX',
    'email_contato', 'gab.thiagotezzari@gmail.com'
)
WHERE slug = 'vereador-thiago-tezzari';
```

---

## Troubleshooting

### Erro: "invalid input syntax for type uuid"
- Você não substituiu `'USER_ID_AQUI'` ou `'ORG_ID_AQUI'` pelos IDs reais
- Certifique-se de copiar os IDs completos (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Erro: "relation does not exist"
- Execute primeiro o script `20240101_setup_completo_thiago_tezzari.sql`

### Usuário não consegue fazer login
- Verifique se marcou "Auto Confirm User" ao criar o usuário
- Verifique se o perfil foi criado corretamente (Passo 5)
- Verifique se a senha está correta

---

## Próximos Passos

Após configurar o admin:

1. **Convidar equipe**: Use a interface `/admin/convites` para convidar assessores
2. **Configurar gabinete**: Adicione logo, informações de contato
3. **Criar categorias**: Configure categorias de providências
4. **Cadastrar órgãos**: Adicione órgãos públicos para encaminhamento
5. **Treinar equipe**: Mostre como usar o sistema

---

**Suporte**: Se tiver dúvidas, consulte a documentação ou entre em contato.
