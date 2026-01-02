-- =====================================================
-- MIGRATION: Performance Indexes
-- Data: 2026-01-02
-- Objetivo: Adicionar índices para otimizar queries do painel admin
-- =====================================================

-- Índice para ordenação de gabinetes por data de criação (usado no admin)
CREATE INDEX IF NOT EXISTS idx_gabinetes_created_at 
ON gabinetes(created_at DESC);

-- Índice para filtrar gabinetes ativos
CREATE INDEX IF NOT EXISTS idx_gabinetes_ativo 
ON gabinetes(ativo) 
WHERE ativo = true;

-- Índice composto para busca de gabinetes por município e UF
CREATE INDEX IF NOT EXISTS idx_gabinetes_municipio_uf 
ON gabinetes(municipio, uf);

-- Índice para contagem rápida de providências
CREATE INDEX IF NOT EXISTS idx_providencias_created_at
ON providencias(created_at DESC);

-- Índice para relacionamento providências -> gabinetes (multitenancy)
CREATE INDEX IF NOT EXISTS idx_providencias_tenant_id
ON providencias(tenant_id);

-- Índice para profiles por role (usado no middleware/layout)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role) 
WHERE role IN ('admin', 'super_admin');

-- Índice para buscar profiles por user id (otimiza joins)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);

-- Índice para users por email (login rápido)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Índice para organization_users (relacionamento usuário-organização)
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id 
ON organization_users(user_id);

CREATE INDEX IF NOT EXISTS idx_organization_users_organization_id 
ON organization_users(organization_id);

-- Índice para invites por status
CREATE INDEX IF NOT EXISTS idx_invites_status 
ON invites(status) 
WHERE status = 'pending';

-- Índice para invites por token (validação de convites)
CREATE INDEX IF NOT EXISTS idx_invites_token 
ON invites(token);

-- Índice para invites por email
CREATE INDEX IF NOT EXISTS idx_invites_email 
ON invites(email);

-- =====================================================
-- ANALYZE: Atualizar estatísticas do PostgreSQL
-- =====================================================

-- Atualizar estatísticas para o query planner usar os índices corretamente
ANALYZE gabinetes;
ANALYZE providencias;
ANALYZE profiles;
ANALYZE users;
ANALYZE organization_users;
ANALYZE invites;

-- =====================================================
-- COMENTÁRIOS: Documentar os índices
-- =====================================================

COMMENT ON INDEX idx_gabinetes_created_at IS 
'Otimiza ordenação de gabinetes por data no painel admin';

COMMENT ON INDEX idx_gabinetes_ativo IS 
'Filtragem rápida de gabinetes ativos';

COMMENT ON INDEX idx_gabinetes_municipio_uf IS 
'Busca de gabinetes por localização e cálculo de cidades únicas';

COMMENT ON INDEX idx_providencias_gabinete_id IS 
'Otimiza JOIN entre providências e gabinetes';

COMMENT ON INDEX idx_profiles_role IS 
'Acesso rápido a perfis de administradores';

COMMENT ON INDEX idx_invites_token IS 
'Validação rápida de tokens de convite';

-- =====================================================
-- VERIFICAÇÃO: Listar índices criados
-- =====================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
