-- ═══════════════════════════════════════════════════════════════
-- VERIFICAR POR QUE O LOGIN NÃO ESTÁ FUNCIONANDO
-- ═══════════════════════════════════════════════════════════════

-- 1. Verificar se o usuário existe e está confirmado
SELECT 
    '1. USUARIO NO AUTH' as verificacao,
    id,
    email,
    email_confirmed_at,
    phone_confirmed_at,
    confirmed_at,
    last_sign_in_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'EMAIL CONFIRMADO'
        ELSE 'EMAIL NAO CONFIRMADO - PROBLEMA!'
    END as status_email,
    CASE 
        WHEN confirmed_at IS NOT NULL THEN 'USUARIO CONFIRMADO'
        ELSE 'USUARIO NAO CONFIRMADO - PROBLEMA!'
    END as status_usuario
FROM auth.users
WHERE email = 'ranieri.braga@hotmail.com';

-- 2. Verificar perfil completo
SELECT 
    '2. PERFIL COMPLETO' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id::text as org_id,
    o.slug as org_slug,
    p.onboarding_completed,
    p.metadata,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- 3. Verificar se há algum problema com o email
SELECT 
    '3. COMPARACAO DE EMAILS' as verificacao,
    au.email as email_auth,
    p.email as email_profile,
    au.email = p.email as emails_coincidem,
    LENGTH(au.email) as tamanho_email_auth,
    LENGTH(p.email) as tamanho_email_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE '%ranieri%';

-- 4. Forçar confirmação do email se necessário
UPDATE auth.users
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email = 'ranieri.braga@hotmail.com'
  AND (email_confirmed_at IS NULL OR confirmed_at IS NULL);

-- 5. Verificar novamente após update
SELECT 
    '5. VERIFICACAO APOS UPDATE' as verificacao,
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL AND confirmed_at IS NOT NULL 
        THEN 'USUARIO PRONTO PARA LOGIN'
        ELSE 'AINDA HA PROBLEMAS'
    END as status
FROM auth.users
WHERE email = 'ranieri.braga@hotmail.com';

-- 6. Verificar se há múltiplos usuários com emails similares
SELECT 
    '6. BUSCAR USUARIOS SIMILARES' as verificacao,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email ILIKE '%ranieri%'
   OR email ILIKE '%braga%'
ORDER BY created_at DESC;

/*
═══════════════════════════════════════════════════════════════
ANALISE DOS RESULTADOS:
═══════════════════════════════════════════════════════════════

Verifique:

1. Se email_confirmed_at e confirmed_at estão preenchidos
   - Se estiverem NULL, o login não vai funcionar
   - O script acima já tenta corrigir isso

2. Se o email no auth.users é exatamente igual ao do profiles
   - Deve ser: ranieri.braga@hotmail.com
   - Sem espaços extras ou caracteres invisíveis

3. Se há múltiplos usuários com emails similares
   - Pode estar tentando logar com o usuário errado

PRÓXIMO PASSO:
- Execute este script
- Copie e cole TODOS os resultados aqui
- Vou analisar e identificar o problema exato
═══════════════════════════════════════════════════════════════
*/
