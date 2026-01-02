# Configurar Thiago Tezzari - Passo a Passo

Execute cada comando SEPARADAMENTE no SQL Editor do Supabase.

## PASSO 1: Remover constraint
```sql
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey CASCADE;
```

## PASSO 2: Inserir perfil
```sql
INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    'admin',
    '223c9f14-4961-43b4-a9d9-eeb00f1002cd'::uuid,
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

## PASSO 3: Recriar constraint
```sql
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## PASSO 4: Verificar
```sql
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    p.onboarding_completed
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'gab.thiagotezzari@gmail.com';
```

---

**Execute cada comando acima UM POR VEZ, na ordem.**

Se o PASSO 1 der erro dizendo que a constraint não existe, pule para o PASSO 2.
