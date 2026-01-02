-- ============================================================================
-- VINCULAR SUPER ADMIN À ORGANIZAÇÃO DATA-RO
-- ============================================================================
-- Atualiza o perfil do super admin para vinculá-lo à organização DATA-RO
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  -- Buscar organização DATA-RO
  SELECT id INTO v_org_id
  FROM organizations
  WHERE slug = 'dataro';

  -- Buscar usuário super admin
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'contato@dataro-it.com.br';

  -- Verificar se ambos existem
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário super admin não encontrado. Execute a migration 20231231_create_super_admin.sql primeiro.';
  END IF;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organização DATA-RO não encontrada. Execute a migration 20240101_create_dataro_organization.sql primeiro.';
  END IF;

  -- Atualizar profile do super admin
  UPDATE profiles
  SET 
    organization_id = v_org_id,
    role = 'admin',
    full_name = 'Super Admin DATA-RO',
    updated_at = NOW()
  WHERE id = v_user_id;

  RAISE NOTICE 'Super admin vinculado à organização DATA-RO com sucesso!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Organization ID: %', v_org_id;
END $$;

-- Verificar resultado
SELECT 
  o.name as organizacao,
  o.slug,
  o.type,
  u.email,
  p.role,
  p.full_name,
  p.organization_id
FROM organizations o
INNER JOIN profiles p ON p.organization_id = o.id
INNER JOIN auth.users u ON u.id = p.id
WHERE o.slug = 'dataro';
