# Instruções para Criar Gabinete da Vereadora Alissa Souza

## 📋 Dados do Gabinete

- **Vereadora**: Alissa de Souza Lopes
- **Email da vereadora**: aliissasouzaa@gmail.com
- **Telefone principal**: 69 984834481
- **Telefone secundário**: 69 984354744
- **Email do gabinete**: alissa.souza@estudante.ifro.edu.br
- **Assessora 1**: Amanda de Souza Lopes
- **Assessora 2**: Isadora de Oliveira Salvaterra
- **Partido**: PT
- **Município**: Porto Velho
- **UF**: RO

---

## 🚀 Passo a Passo

### Passo 1: Verificar se a Vereadora Já Tem Conta

A migration foi preparada para funcionar com o email **aliissasouzaa@gmail.com** que já existe no sistema de autenticação do Supabase.

Para verificar, execute no SQL Editor:

```sql
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'aliissasouzaa@gmail.com';
```

✅ **Se encontrar o usuário**: Prossiga para o Passo 2
❌ **Se NÃO encontrar**: A vereadora precisa fazer login primeiro para o perfil ser criado automaticamente

---

### Passo 2: Aplicar a Migration

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo [`supabase/migrations/20260101_gabinete_alissa_souza_completo.sql`](./20260101_gabinete_alissa_souza_completo.sql)
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** para executar

A migration fará automaticamente:
- ✅ Criar o gabinete com todos os dados
- ✅ Vincular a vereadora como admin do gabinete
- ✅ Registrar todos os contatos e assessores
- ✅ Configurar as permissões adequadas

---

### Passo 3: Verificar a Criação

Execute as queries de verificação (já incluídas na migration):

**Verificar Gabinete:**
```sql
SELECT 
    id,
    nome,
    municipio,
    uf,
    parlamentar_nome,
    partido,
    telefone_parlamentar,
    telefone_gabinete,
    email_parlamentar,
    email_gabinete,
    assessor_1,
    assessor_2
FROM public.gabinetes
WHERE nome = 'Gabinete da Vereadora Alissa Souza'
AND municipio = 'Porto Velho';
```

**Verificar Perfil da Vereadora:**
```sql
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    g.nome as gabinete_nome,
    p.onboarding_completed
FROM public.profiles p
LEFT JOIN public.gabinetes g ON g.id = p.gabinete_id
WHERE p.email = 'aliissasouzaa@gmail.com';
```

**Resultado Esperado:**
- ✅ Gabinete criado com todos os dados
- ✅ Vereadora com role = 'admin'
- ✅ gabinete_id preenchido no perfil
- ✅ Todos os campos de contato preenchidos

---

## 📱 Teste de Login

Após a execução da migration:

1. A vereadora pode fazer login com: **aliissasouzaa@gmail.com**
2. Ela terá acesso total como **admin** do gabinete
3. Poderá convidar as assessoras Amanda e Isadora

---

## 🔧 Próximos Passos (Opcional)

### Convidar Assessoras

Para convidar as assessoras para o gabinete, execute:

```sql
-- Buscar o ID do gabinete
SELECT id FROM public.gabinetes 
WHERE nome = 'Gabinete da Vereadora Alissa Souza';

-- Criar convite para Amanda de Souza Lopes
INSERT INTO public.convites (
    email,
    gabinete_id,
    cargo,
    convidado_por,
    validade
)
SELECT
    'amanda.lopes@email.com', -- SUBSTITUIR pelo email real da Amanda
    g.id,
    'assessor',
    p.id,
    NOW() + INTERVAL '30 days'
FROM public.gabinetes g
CROSS JOIN public.profiles p
WHERE g.nome = 'Gabinete da Vereadora Alissa Souza'
AND p.email = 'aliissasouzaa@gmail.com'
RETURNING id, token, email;

-- Criar convite para Isadora de Oliveira Salvaterra
INSERT INTO public.convites (
    email,
    gabinete_id,
    cargo,
    convidado_por,
    validade
)
SELECT
    'isadora.salvaterra@email.com', -- SUBSTITUIR pelo email real da Isadora
    g.id,
    'assessor',
    p.id,
    NOW() + INTERVAL '30 days'
FROM public.gabinetes g
CROSS JOIN public.profiles p
WHERE g.nome = 'Gabinete da Vereadora Alissa Souza'
AND p.email = 'aliissasouzaa@gmail.com'
RETURNING id, token, email;
```

**Observação**: Substitua os emails de exemplo pelos emails reais das assessoras.

---

## 🆘 Troubleshooting

### Problema: "Usuário não encontrado"

Se a migration mostrar a mensagem:
```
ATENÇÃO: Usuário com email aliissasouzaa@gmail.com não encontrado no auth.users!
```

**Solução**: A vereadora precisa fazer o primeiro login no sistema para o perfil ser criado automaticamente. Depois execute a migration novamente.

### Problema: "Duplicate key value violates unique constraint"

**Causa**: O gabinete já foi criado anteriormente.

**Solução**: A migration usa `ON CONFLICT DO UPDATE`, então apenas atualizará os dados existentes.

### Problema: Campos de contato não aparecem

**Causa**: A migration de campos de contato não foi aplicada antes.

**Solução**: Execute primeiro a migration [`20260101_adicionar_campos_contato_gabinetes.sql`](./20260101_adicionar_campos_contato_gabinetes.sql), depois execute a migration do gabinete da Alissa.

---

## ✅ Checklist de Conclusão

- [ ] Migration executada com sucesso
- [ ] Gabinete aparece na consulta de verificação
- [ ] Perfil da vereadora vinculado ao gabinete
- [ ] Role da vereadora = 'admin'
- [ ] Todos os campos de contato preenchidos
- [ ] Assessoras registradas nos campos assessor_1 e assessor_2
- [ ] Vereadora consegue fazer login
- [ ] Dashboard do gabinete acessível

---

## 📞 Contatos Registrados

| Campo | Valor |
|-------|-------|
| Telefone Parlamentar | 69 984834481 |
| Telefone Gabinete | 69 984354744 |
| Email Parlamentar | aliissasouzaa@gmail.com |
| Email Gabinete | alissa.souza@estudante.ifro.edu.br |
| Assessora 1 | Amanda de Souza Lopes |
| Assessora 2 | Isadora de Oliveira Salvaterra |

---

**Gabinete criado com sucesso! 🎉**
