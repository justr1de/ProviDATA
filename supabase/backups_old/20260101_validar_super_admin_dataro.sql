-- =====================================================
-- VALIDAR E CONFIGURAR SUPER ADMIN DATA-RO
-- E-mail: contato@dataro-it.com.br
-- =====================================================

-- Constantes
DO $$
DECLARE
  v_super_admin_org_id UUID := '00000000-0000-0000-0000-000000000001';
  v_super_admin_email TEXT := 'contato@dataro-it.com.br';
  v_user_id UUID;
BEGIN
  -- 1. Buscar o user_id do auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_super_admin_email;

  -- Se o usuário não existir no auth.users, criar
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado no auth.users. Será necessário criar manualmente via Supabase Auth.';
    RAISE NOTICE 'Após criar, execute esta migration novamente.';
    RETURN;
  END IF;

  RAISE NOTICE 'Usuário encontrado: %', v_user_id;

  -- 2. Garantir que a organização DATA-RO existe
  INSERT INTO organizations (id, name, slug, created_at, updated_at)
  VALUES (
    v_super_admin_org_id,
    'DATA-RO Inteligência Territorial',
    'dataro',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    updated_at = NOW();

  RAISE NOTICE 'Organização DATA-RO garantida: %', v_super_admin_org_id;

  -- 3. Criar ou atualizar perfil do super admin
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    onboarding_completed,
    onboarding_step,
    created_at,
    updated_at,
    metadata
  )
  VALUES (
    v_user_id,
    v_super_admin_email,
    'Super Admin DATA-RO',
    'admin',
    v_super_admin_org_id,
    true,
    999,
    NOW(),
    NOW(),
    jsonb_build_object(
      'is_super_admin', true,
      'permissions', jsonb_build_array('all')
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = 'admin',
    organization_id = v_super_admin_org_id,
    onboarding_completed = true,
    onboarding_step = 999,
    updated_at = NOW(),
    metadata = jsonb_build_object(
      'is_super_admin', true,
      'permissions', jsonb_build_array('all')
    );

  RAISE NOTICE 'Perfil do super admin criado/atualizado';

  -- 4. Garantir que o usuário está confirmado no auth.users
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE id = v_user_id;

  RAISE NOTICE 'E-mail confirmado no auth.users';

  -- 5. Verificação final
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SUPER ADMIN CONFIGURADO COM SUCESSO!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'E-mail: %', v_super_admin_email;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Organization ID: %', v_super_admin_org_id;
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'O usuário pode agora acessar /admin';
  RAISE NOTICE '==============================================';

END $$;

-- Verificar configuração
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as organization_name,
  p.onboarding_completed,
  p.metadata,
  au.email_confirmed_at,
  au.confirmed_at
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.email = 'contato@dataro-it.com.br';
