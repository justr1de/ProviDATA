-- ============================================================================
-- CRIAR ORGANIZAÇÃO DATA-RO (ADMINISTRADORA GERAL)
-- ============================================================================
-- Esta organização será a administradora geral do sistema
-- O super admin (contato@dataro-it.com.br) pertencerá a esta organização
-- e terá acesso a todos os gabinetes
-- ============================================================================

-- 1. Criar a organização DATA-RO
INSERT INTO organizations (
  name,
  slug,
  type,
  settings
) VALUES (
  'DATA-RO',
  'dataro',
  'estadual',
  jsonb_build_object(
    'is_super_admin_org', true,
    'can_access_all_organizations', true,
    'description', 'Organização administradora geral do sistema ProviDATA'
  )
)
ON CONFLICT (slug) DO UPDATE SET
  settings = EXCLUDED.settings;

-- 2. Buscar o ID da organização DATA-RO
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

  -- Se o usuário existir, atualizar sua organização
  IF v_user_id IS NOT NULL AND v_org_id IS NOT NULL THEN
    -- Atualizar profile do super admin
    UPDATE profiles
    SET 
      organization_id = v_org_id,
      role = 'admin',
      full_name = 'Super Admin DATA-RO',
      updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'Super admin vinculado à organização DATA-RO com sucesso!';
  ELSE
    IF v_user_id IS NULL THEN
      RAISE NOTICE 'Usuário super admin não encontrado. Execute a migration de criação do super admin primeiro.';
    END IF;
    IF v_org_id IS NULL THEN
      RAISE NOTICE 'Organização DATA-RO não foi criada.';
    END IF;
  END IF;
END $$;

-- 3. Verificar resultado
SELECT 
  o.name as organizacao,
  o.slug,
  o.type,
  u.email,
  p.role,
  p.full_name
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id
LEFT JOIN auth.users u ON u.id = p.id
WHERE o.slug = 'dataro';
