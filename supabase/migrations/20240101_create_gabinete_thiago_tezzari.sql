-- Migration: Criar Gabinete do Vereador Thiago Tezzari
-- Descrição: Cria organização e estrutura inicial para o gabinete do Vereador Thiago Tezzari

-- =====================================================
-- 1. CRIAR ORGANIZAÇÃO DO GABINETE
-- =====================================================
INSERT INTO public.organizations (id, name, slug, type, settings)
VALUES (
    gen_random_uuid(),
    'Gabinete do Vereador Thiago Tezzari',
    'vereador-thiago-tezzari',
    'municipal',
    jsonb_build_object(
        'parlamentar_name', 'Thiago Tezzari',
        'cargo', 'Vereador',
        'partido', 'A definir',
        'municipio', 'A definir',
        'uf', 'A definir',
        'description', 'Gabinete do Vereador Thiago Tezzari',
        'features', jsonb_build_object(
            'providencias', true,
            'cidadaos', true,
            'relatorios', true,
            'mapa_calor', true,
            'notificacoes', true
        )
    )
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- =====================================================
-- 2. FUNÇÃO PARA CRIAR USUÁRIO ADMIN DO GABINETE
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_thiago_tezzari_admin(
    admin_email TEXT,
    admin_name TEXT DEFAULT 'Thiago Tezzari'
)
RETURNS JSONB AS $$
DECLARE
    new_user_id UUID;
    org_id UUID;
BEGIN
    -- Buscar ID da organização
    SELECT id INTO org_id
    FROM public.organizations
    WHERE slug = 'vereador-thiago-tezzari';

    IF org_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Organização não encontrada. Execute a migration primeiro.'
        );
    END IF;

    -- Verificar se usuário já existe
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = admin_email;

    IF new_user_id IS NOT NULL THEN
        -- Atualizar perfil existente
        UPDATE public.profiles
        SET
            role = 'admin',
            organization_id = org_id,
            full_name = admin_name,
            onboarding_completed = true,
            updated_at = NOW()
        WHERE id = new_user_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Usuário existente atualizado para admin do gabinete',
            'user_id', new_user_id,
            'organization_id', org_id
        );
    END IF;

    -- Se não existe, retornar instruções
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Usuário não encontrado. Crie primeiro via Supabase Auth Dashboard',
        'instructions', jsonb_build_object(
            'email', admin_email,
            'organization_slug', 'vereador-thiago-tezzari',
            'organization_id', org_id,
            'steps', jsonb_build_array(
                '1. Acesse Supabase Dashboard > Authentication > Users',
                '2. Clique em "Add User"',
                '3. Preencha email e senha',
                '4. Após criar, execute: SELECT public.setup_gabinete_admin_profile(''user_id_aqui'', ''' || org_id || ''');'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNÇÃO PARA CONFIGURAR PERFIL DE ADMIN DO GABINETE
-- =====================================================
CREATE OR REPLACE FUNCTION public.setup_gabinete_admin_profile(
    user_id UUID,
    org_id UUID
)
RETURNS JSONB AS $$
BEGIN
    -- Verificar se organização existe
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Organização não encontrada'
        );
    END IF;

    -- Atualizar ou criar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        organization_id,
        onboarding_completed,
        metadata
    )
    SELECT
        user_id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email),
        'admin',
        org_id,
        true,
        jsonb_build_object(
            'is_gabinete_admin', true,
            'setup_date', NOW()
        )
    FROM auth.users u
    WHERE u.id = user_id
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        organization_id = org_id,
        onboarding_completed = true,
        metadata = COALESCE(profiles.metadata, '{}'::jsonb) || jsonb_build_object(
            'is_gabinete_admin', true,
            'setup_date', NOW()
        ),
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Perfil de admin do gabinete configurado com sucesso',
        'user_id', user_id,
        'organization_id', org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.create_thiago_tezzari_admin IS 'Cria ou atualiza usuário como admin do Gabinete Thiago Tezzari';
COMMENT ON FUNCTION public.setup_gabinete_admin_profile IS 'Configura perfil de admin para gabinete específico';

-- =====================================================
-- 5. INSTRUÇÕES DE USO
-- =====================================================

/*
INSTRUÇÕES PARA CRIAR O ADMIN DO GABINETE THIAGO TEZZARI:

OPÇÃO 1 - Via Supabase Dashboard (Recomendado):
=================================================

1. Criar usuário no Supabase Auth:
   - Acesse: Supabase Dashboard > Authentication > Users > Add User
   - Email: thiago.tezzari@gabinete.com.br (ou email desejado)
   - Password: Defina uma senha segura
   - Marque "Auto Confirm User" para confirmar email automaticamente
   - Copie o User ID gerado

2. Buscar ID da organização:
   SELECT id, name, slug 
   FROM public.organizations 
   WHERE slug = 'vereador-thiago-tezzari';

3. Configurar perfil como admin:
   SELECT public.setup_gabinete_admin_profile(
       'USER_ID_AQUI'::uuid,
       'ORGANIZATION_ID_AQUI'::uuid
   );

4. Verificar configuração:
   SELECT 
       p.id,
       p.email,
       p.full_name,
       p.role,
       o.name as organization_name,
       p.onboarding_completed
   FROM public.profiles p
   JOIN public.organizations o ON o.id = p.organization_id
   WHERE p.email = 'thiago.tezzari@gabinete.com.br';


OPÇÃO 2 - Via Função Helper:
=============================

1. Criar usuário no Supabase Auth Dashboard (passos 1 da Opção 1)

2. Executar função helper:
   SELECT public.create_thiago_tezzari_admin(
       'thiago.tezzari@gabinete.com.br',
       'Thiago Tezzari'
   );


OPÇÃO 3 - Via API (Node.js/TypeScript):
========================================

// 1. Criar usuário via Supabase Admin API
const { data: userData, error: userError } = await supabase.auth.admin.createUser({
  email: 'thiago.tezzari@gabinete.com.br',
  password: 'SenhaSegura123!',
  email_confirm: true,
  user_metadata: {
    full_name: 'Thiago Tezzari'
  }
});

if (userData.user) {
  // 2. Buscar organização
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'vereador-thiago-tezzari')
    .single();

  // 3. Configurar perfil
  if (org) {
    const { data: result } = await supabase.rpc('setup_gabinete_admin_profile', {
      user_id: userData.user.id,
      org_id: org.id
    });
    console.log(result);
  }
}


DADOS DA ORGANIZAÇÃO:
=====================
Nome: Gabinete do Vereador Thiago Tezzari
Slug: vereador-thiago-tezzari
Tipo: municipal

PRÓXIMOS PASSOS:
================
1. Definir partido político
2. Definir município e UF
3. Adicionar logo do gabinete
4. Configurar informações de contato
5. Criar convites para equipe (assessores, colaboradores)

Para atualizar informações da organização:
UPDATE public.organizations
SET settings = settings || jsonb_build_object(
    'partido', 'PARTIDO_AQUI',
    'municipio', 'CIDADE_AQUI',
    'uf', 'UF_AQUI',
    'telefone', 'TELEFONE_AQUI',
    'email_contato', 'EMAIL_AQUI'
)
WHERE slug = 'vereador-thiago-tezzari';
*/
