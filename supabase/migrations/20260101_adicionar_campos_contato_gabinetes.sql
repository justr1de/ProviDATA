-- =====================================================
-- Migration: Adicionar campos de contato e assessores
-- Descrição: Adiciona campos para telefones, e-mails e assessores
-- Data: 2026-01-01
-- =====================================================

-- Adicionar novos campos de telefone
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS telefone_parlamentar TEXT,
ADD COLUMN IF NOT EXISTS telefone_gabinete TEXT,
ADD COLUMN IF NOT EXISTS telefone_adicional TEXT;

-- Adicionar novos campos de e-mail
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS email_parlamentar TEXT,
ADD COLUMN IF NOT EXISTS email_gabinete TEXT;

-- Adicionar campos de assessores (não obrigatórios)
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS chefe_de_gabinete TEXT,
ADD COLUMN IF NOT EXISTS assessor_2 TEXT;

-- Migrar dados existentes
-- O campo 'telefone' existente será mantido por compatibilidade
-- O campo 'email' existente será mantido por compatibilidade
UPDATE public.gabinetes
SET telefone_gabinete = telefone
WHERE telefone IS NOT NULL AND telefone_gabinete IS NULL;

UPDATE public.gabinetes
SET email_gabinete = email
WHERE email IS NOT NULL AND email_gabinete IS NULL;

-- Comentários
COMMENT ON COLUMN public.gabinetes.telefone_parlamentar IS 'Telefone pessoal do parlamentar';
COMMENT ON COLUMN public.gabinetes.telefone_gabinete IS 'Telefone principal do gabinete';
COMMENT ON COLUMN public.gabinetes.telefone_adicional IS 'Telefone adicional/alternativo do gabinete';
COMMENT ON COLUMN public.gabinetes.email_parlamentar IS 'E-mail pessoal do parlamentar';
COMMENT ON COLUMN public.gabinetes.email_gabinete IS 'E-mail institucional do gabinete';
COMMENT ON COLUMN public.gabinetes.chefe_de_gabinete IS 'Nome do Chefe de Gabinete (opcional)';
COMMENT ON COLUMN public.gabinetes.assessor_2 IS 'Nome do segundo assessor (opcional)';
