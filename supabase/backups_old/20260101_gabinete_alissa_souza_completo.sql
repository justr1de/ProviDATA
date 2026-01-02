-- =====================================================
-- CRIAR GABINETE DA VEREADORA ALISSA DE SOUZA LOPES
-- =====================================================
-- Vereadora: Alissa de Souza Lopes
-- Email da vereadora: aliissasouzaa@gmail.com
-- Telefone vereadora: 69 984834481
-- Telefone secundário: 69 984354744
-- Email do gabinete: alissa.souza@estudante.ifro.edu.br
-- Assessora 1: Amanda de Souza Lopes
-- Assessora 2: Isadora de Oliveira Salvaterra
-- Partido: PT
-- Cidade: Porto Velho
-- UF: RO
-- =====================================================

-- PASSO 1: Criar o gabinete com todos os dados de contato
INSERT INTO public.gabinetes (
    nome,
    municipio,
    uf,
    parlamentar_nome,
    parlamentar_cargo,
    partido,
    -- Novos campos de contato
    telefone_parlamentar,
    telefone_gabinete,
    telefone_adicional,
    email_parlamentar,
    email_gabinete,
    chefe_de_gabinete,
    assessor_2,
    -- Campos legados (por compatibilidade)
    telefone,
    email,
    settings,
    ativo
)
VALUES (
    'Gabinete da Vereadora Alissa Souza',
    'Porto Velho',
    'RO',
    'Alissa de Souza Lopes',
    'vereador',
    'PT',
    -- Novos campos de contato
    '69 984834481',                              -- telefone_parlamentar
    '69 984354744',                              -- telefone_gabinete (secundário)
    '69 984834481',                              -- telefone_adicional
    'aliissasouzaa@gmail.com',                   -- email_parlamentar
    'alissa.souza@estudante.ifro.edu.br',       -- email_gabinete
    'Amanda de Souza Lopes',                     -- chefe_de_gabinete
    'Isadora de Oliveira Salvaterra',            -- assessor_2
    -- Campos legados
    '69 984834481',                              -- telefone (compatibilidade)
    'alissa.souza@estudante.ifro.edu.br',       -- email (compatibilidade)
    jsonb_build_object(
        'description', 'Gabinete da Vereadora Alissa Souza - Porto Velho/RO',
        'features', jsonb_build_object(
            'providencias', true,
            'cidadaos', true,
            'relatorios', true,
            'mapa_calor', true,
            'notificacoes', true
        )
    ),
    true
)
ON CONFLICT (nome, municipio, uf) DO UPDATE SET
    parlamentar_nome = EXCLUDED.parlamentar_nome,
    parlamentar_cargo = EXCLUDED.parlamentar_cargo,
    partido = EXCLUDED.partido,
    telefone_parlamentar = EXCLUDED.telefone_parlamentar,
    telefone_gabinete = EXCLUDED.telefone_gabinete,
    telefone_adicional = EXCLUDED.telefone_adicional,
    email_parlamentar = EXCLUDED.email_parlamentar,
    email_gabinete = EXCLUDED.email_gabinete,
    chefe_de_gabinete = EXCLUDED.chefe_de_gabinete,
    assessor_2 = EXCLUDED.assessor_2,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    settings = EXCLUDED.settings,
    ativo = EXCLUDED.ativo,
    updated_at = NOW()
RETURNING id, nome, municipio, uf;

-- PASSO 2: Buscar o user_id da Alissa (ela já tem autenticação)
-- e vincular ao gabinete criado
DO $$
DECLARE
    v_user_id UUID;
    v_gabinete_id UUID;
BEGIN
    -- Buscar o user_id da Alissa pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'aliissasouzaa@gmail.com'
    LIMIT 1;

    -- Buscar o ID do gabinete criado
    SELECT id INTO v_gabinete_id
    FROM public.gabinetes
    WHERE nome = 'Gabinete da Vereadora Alissa Souza'
    AND municipio = 'Porto Velho'
    AND uf = 'RO'
    LIMIT 1;

    -- Verificar se encontrou o usuário
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'ATENÇÃO: Usuário com email aliissasouzaa@gmail.com não encontrado no auth.users!';
        RAISE NOTICE 'A vereadora precisa fazer login primeiro para criar o perfil.';
    ELSE
        -- Verificar se já existe perfil
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
            -- Atualizar perfil existente
            UPDATE public.profiles
            SET
                role = 'admin',
                gabinete_id = v_gabinete_id,
                full_name = 'Alissa de Souza Lopes',
                updated_at = NOW()
            WHERE id = v_user_id;
            
            RAISE NOTICE 'Perfil da Vereadora Alissa atualizado com sucesso!';
            RAISE NOTICE 'User ID: %', v_user_id;
            RAISE NOTICE 'Gabinete ID: %', v_gabinete_id;
        ELSE
            -- Criar perfil novo
            INSERT INTO public.profiles (
                id,
                email,
                full_name,
                role,
                gabinete_id,
                onboarding_completed
            )
            VALUES (
                v_user_id,
                'aliissasouzaa@gmail.com',
                'Alissa de Souza Lopes',
                'admin',
                v_gabinete_id,
                true
            );
            
            RAISE NOTICE 'Perfil da Vereadora Alissa criado com sucesso!';
            RAISE NOTICE 'User ID: %', v_user_id;
            RAISE NOTICE 'Gabinete ID: %', v_gabinete_id;
        END IF;
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO: Consultar dados criados
-- =====================================================

-- Verificar o gabinete criado
SELECT 
    id,
    nome,
    municipio,
    uf,
    parlamentar_nome,
    parlamentar_cargo,
    partido,
    telefone_parlamentar,
    telefone_gabinete,
    telefone_adicional,
    email_parlamentar,
    email_gabinete,
    chefe_de_gabinete,
    assessor_2,
    ativo,
    created_at
FROM public.gabinetes
WHERE nome = 'Gabinete da Vereadora Alissa Souza'
AND municipio = 'Porto Velho'
AND uf = 'RO';

-- Verificar o perfil da vereadora
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    g.nome as gabinete_nome,
    p.gabinete_id,
    p.onboarding_completed,
    p.created_at
FROM public.profiles p
LEFT JOIN public.gabinetes g ON g.id = p.gabinete_id
WHERE p.email = 'aliissasouzaa@gmail.com';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Gabinete "Gabinete da Vereadora Alissa Souza" criado
-- ✅ Vereadora Alissa vinculada como admin do gabinete
-- ✅ Todos os dados de contato registrados
-- ✅ Assessoras registradas: Amanda de Souza Lopes e Isadora de Oliveira Salvaterra
-- ✅ Sistema pronto para uso
-- =====================================================
