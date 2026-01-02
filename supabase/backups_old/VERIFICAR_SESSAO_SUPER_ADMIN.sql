-- =====================================================
-- VERIFICAR E CORRIGIR SESSÃO DO SUPER ADMIN
-- =====================================================

-- 1. Confirmar que o usuário está configurado corretamente
SELECT 
    '✓ CONFIGURAÇÃO ATUAL' as status,
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.name as organization_name,
    p.onboarding_completed,
    p.metadata
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'contato@dataro-it.com.br';

-- 2. Verificar se há algum problema com o metadata
DO $$
DECLARE
    v_user_id UUID;
    v_current_metadata JSONB;
BEGIN
    -- Buscar user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'contato@dataro-it.com.br';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado!';
    END IF;
    
    -- Buscar metadata atual
    SELECT metadata INTO v_current_metadata
    FROM public.profiles
    WHERE id = v_user_id;
    
    RAISE NOTICE '
╔════════════════════════════════════════════════════════════════╗
║              VERIFICAÇÃO DE SESSÃO SUPER ADMIN                 ║
╚════════════════════════════════════════════════════════════════╝

User ID: %
Metadata atual: %

', v_user_id, v_current_metadata;
    
    -- Garantir que o metadata está correto
    UPDATE public.profiles
    SET 
        metadata = jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'permissions', jsonb_build_array(
                'manage_organizations',
                'manage_users',
                'manage_gabinetes',
                'view_all_data',
                'system_settings'
            )
        ),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE '✓ Metadata atualizado com sucesso!';
    
    RAISE NOTICE '
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 PRÓXIMOS PASSOS PARA RESOLVER O ERRO "unauthorized":

1. LIMPAR CACHE E SESSÃO:
   - Abra o navegador em modo anônimo/privado
   - Ou limpe todo o cache (Ctrl+Shift+Delete)
   - Feche TODAS as abas do sistema

2. FAZER LOGOUT COMPLETO:
   - Se conseguir acessar /dashboard, faça logout
   - Ou execute no console do navegador:
     localStorage.clear();
     sessionStorage.clear();
     location.reload();

3. FAZER LOGIN NOVAMENTE:
   - Acesse: http://localhost:3000/login
   - Email: contato@dataro-it.com.br
   - Senha: (sua senha)

4. ACESSAR ÁREA ADMIN:
   - Após login, acesse: http://localhost:3000/admin
   - Você deve ver o painel Super Admin com menu vermelho

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  SE AINDA ASSIM NÃO FUNCIONAR:

O erro pode estar no middleware. Vamos verificar...
';

END $$;

-- 3. Verificar se o middleware está bloqueando
-- Mostrar informações para debug do middleware
SELECT 
    '🔍 INFO PARA DEBUG DO MIDDLEWARE' as tipo,
    'User ID: ' || id as info
FROM auth.users
WHERE email = 'contato@dataro-it.com.br'
UNION ALL
SELECT 
    '🔍 INFO PARA DEBUG DO MIDDLEWARE' as tipo,
    'Role: ' || role as info
FROM public.profiles
WHERE email = 'contato@dataro-it.com.br'
UNION ALL
SELECT 
    '🔍 INFO PARA DEBUG DO MIDDLEWARE' as tipo,
    'Org ID: ' || organization_id::TEXT as info
FROM public.profiles
WHERE email = 'contato@dataro-it.com.br';

-- 4. Resultado final
SELECT 
    '✅ VERIFICAÇÃO COMPLETA' as status,
    'Configuração está correta. Se ainda houver erro, é problema de cache/sessão.' as mensagem;
