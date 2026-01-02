-- =====================================================
-- DEBUG: Verificar exatamente o que o middleware está vendo
-- =====================================================

-- 1. Verificar o perfil EXATAMENTE como o middleware busca
SELECT 
    '1. DADOS QUE O MIDDLEWARE VÊ' as etapa,
    id,
    role,
    organization_id,
    metadata,
    CASE 
        WHEN role = 'admin' AND organization_id = '00000000-0000-0000-0000-000000000001'
        THEN '✓ DEVERIA PASSAR'
        ELSE '✗ SERÁ BLOQUEADO'
    END as resultado_esperado
FROM public.profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'contato@dataro-it.com.br');

-- 2. Verificar se há algum problema com o tipo de dados
DO $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
    v_org_id UUID;
    v_org_id_string TEXT;
    v_metadata JSONB;
BEGIN
    -- Buscar dados
    SELECT 
        id,
        role,
        organization_id,
        organization_id::TEXT,
        metadata
    INTO 
        v_user_id,
        v_role,
        v_org_id,
        v_org_id_string,
        v_metadata
    FROM public.profiles
    WHERE id = (SELECT id FROM auth.users WHERE email = 'contato@dataro-it.com.br');
    
    RAISE NOTICE '
╔════════════════════════════════════════════════════════════════╗
║                    DEBUG DO MIDDLEWARE                         ║
╚════════════════════════════════════════════════════════════════╝

User ID: %
Role: %
Organization ID (UUID): %
Organization ID (String): %
Metadata: %

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERIFICAÇÕES DO MIDDLEWARE:

1. role === "admin"? %
2. organization_id === "00000000-0000-0000-0000-000000000001"? %
3. Ambas condições satisfeitas? %

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
', 
    v_user_id,
    v_role,
    v_org_id,
    v_org_id_string,
    v_metadata,
    CASE WHEN v_role = 'admin' THEN '✓ SIM' ELSE '✗ NÃO (role = ' || COALESCE(v_role, 'NULL') || ')' END,
    CASE WHEN v_org_id = '00000000-0000-0000-0000-000000000001'::UUID THEN '✓ SIM' ELSE '✗ NÃO (org_id = ' || COALESCE(v_org_id::TEXT, 'NULL') || ')' END,
    CASE WHEN v_role = 'admin' AND v_org_id = '00000000-0000-0000-0000-000000000001'::UUID THEN '✓ SIM - DEVERIA FUNCIONAR!' ELSE '✗ NÃO - POR ISSO ESTÁ BLOQUEANDO' END;
    
    -- Se não passar, forçar atualização
    IF v_role != 'admin' OR v_org_id != '00000000-0000-0000-0000-000000000001'::UUID THEN
        RAISE NOTICE '
⚠️  PROBLEMA DETECTADO! Atualizando perfil...
';
        
        UPDATE public.profiles
        SET 
            role = 'admin',
            organization_id = '00000000-0000-0000-0000-000000000001'::UUID,
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
        
        RAISE NOTICE '✓ Perfil atualizado! Tente fazer login novamente.';
    ELSE
        RAISE NOTICE '
✅ CONFIGURAÇÃO ESTÁ CORRETA!

O problema pode ser:
1. Cache do Supabase no middleware
2. Sessão antiga no navegador
3. Cookies corrompidos

SOLUÇÃO:
1. Reinicie o servidor Next.js (npm run dev)
2. Limpe TODOS os cookies do site
3. Faça login novamente em janela privada
';
    END IF;
END $$;

-- 3. Verificar se há múltiplos perfis (pode causar conflito)
SELECT 
    '3. VERIFICAR PERFIS DUPLICADOS' as etapa,
    COUNT(*) as total_perfis,
    CASE 
        WHEN COUNT(*) > 1 THEN '⚠️  PROBLEMA: Múltiplos perfis encontrados!'
        ELSE '✓ OK: Apenas um perfil'
    END as status
FROM public.profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'contato@dataro-it.com.br');

-- 4. Resultado final com instruções
SELECT 
    '4. PRÓXIMOS PASSOS' as etapa,
    'Execute este script, depois reinicie o servidor Next.js e tente novamente' as instrucao;
