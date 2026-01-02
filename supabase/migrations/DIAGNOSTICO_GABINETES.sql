-- =====================================================
-- DIAGNÓSTICO: Problemas na Criação de Gabinetes
-- =====================================================

-- TESTE 1: Verificar se a tabela gabinetes existe
SELECT 
    'TESTE 1: Tabela gabinetes' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'gabinetes'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE - Execute: 20240101_gabinetes_multitenancy.sql'
    END as resultado;

-- TESTE 2: Verificar colunas da tabela gabinetes
SELECT 
    'TESTE 2: Colunas da tabela gabinetes' as teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'gabinetes'
ORDER BY ordinal_position;

-- TESTE 3: Verificar se os NOVOS campos de contato existem
SELECT 
    'TESTE 3: Campos de contato' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'gabinetes'
            AND column_name = 'telefone_parlamentar'
        ) THEN '✅ telefone_parlamentar EXISTE'
        ELSE '❌ telefone_parlamentar NÃO EXISTE - Execute: 20260101_adicionar_campos_contato_gabinetes.sql'
    END as telefone_parlamentar,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'gabinetes'
            AND column_name = 'email_parlamentar'
        ) THEN '✅ email_parlamentar EXISTE'
        ELSE '❌ email_parlamentar NÃO EXISTE - Execute: 20260101_adicionar_campos_contato_gabinetes.sql'
    END as email_parlamentar,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'gabinetes'
            AND column_name = 'assessor_1'
        ) THEN '✅ assessor_1 EXISTE'
        ELSE '❌ assessor_1 NÃO EXISTE - Execute: 20260101_adicionar_campos_contato_gabinetes.sql'
    END as assessor_1;

-- TESTE 4: Verificar políticas RLS da tabela gabinetes
SELECT 
    'TESTE 4: Políticas RLS' as teste,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_condition,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'gabinetes'
ORDER BY policyname;

-- TESTE 5: Verificar se RLS está habilitado
SELECT 
    'TESTE 5: RLS Status' as teste,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '⚠️ RLS DESABILITADO'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'gabinetes';

-- TESTE 6: Verificar usuários com role super_admin
SELECT 
    'TESTE 6: Super Admins' as teste,
    p.id,
    p.email,
    p.full_name,
    p.role,
    CASE 
        WHEN p.role = 'super_admin' THEN '✅ É SUPER ADMIN'
        ELSE '❌ NÃO É SUPER ADMIN'
    END as pode_criar_gabinete
FROM public.profiles p
WHERE p.role IN ('super_admin', 'admin')
ORDER BY p.role DESC, p.created_at;

-- TESTE 7: Verificar gabinetes existentes
SELECT 
    'TESTE 7: Gabinetes Existentes' as teste,
    COUNT(*) as total_gabinetes
FROM public.gabinetes;

-- TESTE 8: Tentar criar um gabinete de TESTE (será revertido)
DO $$
DECLARE
    v_error TEXT;
BEGIN
    BEGIN
        -- Tentar inserir gabinete de teste
        INSERT INTO public.gabinetes (
            nome,
            municipio,
            uf,
            parlamentar_nome,
            parlamentar_cargo,
            partido
        ) VALUES (
            'TESTE DIAGNOSTICO - DELETAR',
            'Teste',
            'XX',
            'Teste',
            'vereador',
            'XX'
        );
        
        RAISE NOTICE '✅ TESTE 8: INSERT funcionou! Problema pode ser nos novos campos ou RLS';
        
        -- Deletar o teste
        DELETE FROM public.gabinetes 
        WHERE nome = 'TESTE DIAGNOSTICO - DELETAR';
        
    EXCEPTION WHEN OTHERS THEN
        v_error := SQLERRM;
        RAISE NOTICE '❌ TESTE 8: INSERT falhou com erro: %', v_error;
    END;
END $$;

-- TESTE 9: Verificar se há erros de constraints
SELECT 
    'TESTE 9: Constraints' as teste,
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK constraint'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 't' THEN 'TRIGGER'
        WHEN 'x' THEN 'EXCLUSION'
    END as tipo,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.gabinetes'::regclass
ORDER BY contype;

-- TESTE 10: Verificar perfil do usuário atual (se autenticado)
SELECT 
    'TESTE 10: Seu Perfil' as teste,
    id,
    email,
    full_name,
    role,
    gabinete_id,
    CASE 
        WHEN role = 'super_admin' THEN '✅ Você PODE criar gabinetes'
        ELSE '❌ Você NÃO PODE criar gabinetes (precisa ser super_admin)'
    END as permissao
FROM public.profiles
WHERE id = auth.uid();

-- =====================================================
-- RESUMO E PRÓXIMOS PASSOS
-- =====================================================

SELECT '
=======================================================
📊 RESUMO DO DIAGNÓSTICO
=======================================================

Analise os resultados acima e identifique:

1. ❌ Se algum campo novo NÃO EXISTE:
   → Execute: 20260101_adicionar_campos_contato_gabinetes.sql

2. ❌ Se você NÃO é super_admin:
   → Peça para ser promovido ou use um usuário super_admin

3. ❌ Se o TESTE 8 falhou:
   → Veja o erro específico e corrija a causa

4. ✅ Se tudo passou:
   → O problema pode estar no frontend/aplicação

=======================================================
' as instrucoes;
