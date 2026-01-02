# 🔧 Correção: Problema ao Criar Gabinetes

## 🎯 Problema Identificado

O diagnóstico mostrou:
```
❌ Se você NÃO é super_admin
```

**Causa Raiz**: As políticas RLS (Row Level Security) da tabela [`gabinetes`](./20240101_gabinetes_multitenancy.sql) permitem apenas usuários com role `super_admin` criar novos gabinetes.

## 📋 Duas Soluções Possíveis

### ✅ Solução 1: Promover Usuário para Super Admin (Recomendado)

Execute no SQL Editor do Supabase:

```sql
-- Se VOCÊ vai criar gabinetes, execute:
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = auth.uid()
RETURNING id, email, full_name, role;
```

**OU**, se for promover um usuário específico:

```sql
-- Promover Ranieri
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'ranieri.bragas@hotmail.com'
RETURNING id, email, full_name, role;

-- OU promover Alissa
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'aliissasouzaa@gmail.com'
RETURNING id, email, full_name, role;
```

**Depois:**
1. ✅ Faça **logout** do sistema
2. ✅ Faça **login** novamente
3. ✅ Tente criar o gabinete novamente

---

### ✅ Solução 2: Alterar Política RLS (Alternativa)

Se você **NÃO quer** criar super_admins, pode permitir que usuários com role `admin` também criem gabinetes:

```sql
-- Permitir que admins também criem gabinetes
DROP POLICY IF EXISTS "Admins can create gabinetes" ON public.gabinetes;
CREATE POLICY "Admins can create gabinetes"
    ON public.gabinetes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );
```

**Depois:**
1. ✅ Faça **logout** do sistema  
2. ✅ Faça **login** novamente
3. ✅ Tente criar o gabinete novamente

---

## 🔍 Verificações Adicionais

### Problema 2 Possível: Campos Novos Não Existem

Se após promover para super_admin ainda der erro, pode ser que os campos novos não existam.

**Verificar:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'gabinetes'
AND column_name IN ('telefone_parlamentar', 'email_parlamentar', 'assessor_1', 'assessor_2');
```

**Se retornar vazio**, execute primeiro:
```sql
-- Arquivo: 20260101_adicionar_campos_contato_gabinetes.sql
```

---

## 📝 Passo a Passo Completo

### Para Criar o Gabinete da Alissa:

1. **Execute Solução 1 ou 2** (acima)
2. **Faça logout e login novamente**
3. **Execute a migration do gabinete**:

```sql
-- Copie e cole todo o conteúdo de:
-- supabase/migrations/20260101_gabinete_alissa_souza_completo.sql
```

**OU** use a interface da aplicação se preferir.

---

## ✅ Teste Rápido

Após aplicar a solução, teste se funcionou:

```sql
-- Tentar criar um gabinete de teste
INSERT INTO public.gabinetes (
    nome,
    municipio,
    uf,
    parlamentar_nome,
    parlamentar_cargo,
    partido
) VALUES (
    'Teste',
    'Teste',
    'XX',
    'Teste',
    'vereador',
    'XX'
)
RETURNING id, nome;

-- Se funcionou, deletar o teste:
DELETE FROM public.gabinetes WHERE nome = 'Teste';
```

Se o INSERT acima funcionar, o problema está resolvido! 🎉

---

## 🆘 Se Ainda Não Funcionar

Execute novamente o diagnóstico completo e me mostre os resultados:

```sql
-- Arquivo: supabase/migrations/DIAGNOSTICO_GABINETES.sql
```

---

## 📊 Resumo

| Problema | Causa | Solução |
|----------|-------|---------|
| ❌ Não pode criar gabinete | Role não é super_admin | Promover para super_admin |
| ❌ Campos não encontrados | Migration não aplicada | Executar 20260101_adicionar_campos_contato_gabinetes.sql |
| ❌ Permissão negada após promoção | Sessão não atualizada | Fazer logout e login novamente |

---

**Próximo passo**: Execute a **Solução 1** e depois teste criar o gabinete novamente!
