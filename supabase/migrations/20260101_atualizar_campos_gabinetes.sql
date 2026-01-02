-- =====================================================
-- Migration: Atualizar campos de gabinetes
-- Descrição: Ajusta nomenclatura e adiciona campos de site, redes sociais e WhatsApp
-- Data: 2026-01-01
-- =====================================================

-- Renomear campo assessor_1 para chefe_gabinete
ALTER TABLE public.gabinetes
RENAME COLUMN assessor_1 TO chefe_gabinete;

-- Renomear campo telefone_adicional para telefone_alternativo
ALTER TABLE public.gabinetes
RENAME COLUMN telefone_adicional TO telefone_alternativo;

-- Adicionar campos boolean para indicar se os telefones têm WhatsApp
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS telefone_parlamentar_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telefone_gabinete_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telefone_alternativo_whatsapp BOOLEAN DEFAULT false;

-- Adicionar campo para site do parlamentar
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS site_parlamentar TEXT;

-- Adicionar campos para redes sociais (todos opcionais)
ALTER TABLE public.gabinetes
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Atualizar comentários dos campos renomeados
COMMENT ON COLUMN public.gabinetes.chefe_gabinete IS 'Nome do chefe de gabinete (opcional)';
COMMENT ON COLUMN public.gabinetes.assessor_2 IS 'Nome do segundo assessor (opcional)';
COMMENT ON COLUMN public.gabinetes.telefone_alternativo IS 'Telefone alternativo do gabinete (opcional)';

-- Comentários para os campos de WhatsApp
COMMENT ON COLUMN public.gabinetes.telefone_parlamentar_whatsapp IS 'Indica se o telefone do parlamentar possui WhatsApp';
COMMENT ON COLUMN public.gabinetes.telefone_gabinete_whatsapp IS 'Indica se o telefone do gabinete possui WhatsApp';
COMMENT ON COLUMN public.gabinetes.telefone_alternativo_whatsapp IS 'Indica se o telefone alternativo possui WhatsApp';

-- Comentários para os novos campos de site e redes sociais
COMMENT ON COLUMN public.gabinetes.site_parlamentar IS 'Site oficial do parlamentar (opcional) - Formato: https://www.exemplo.com.br';
COMMENT ON COLUMN public.gabinetes.instagram IS 'Perfil do Instagram (opcional) - Formato: https://www.instagram.com/usuario ou @usuario';
COMMENT ON COLUMN public.gabinetes.facebook IS 'Perfil do Facebook (opcional) - Formato: https://www.facebook.com/usuario';
COMMENT ON COLUMN public.gabinetes.tiktok IS 'Perfil do TikTok (opcional) - Formato: https://www.tiktok.com/@usuario';
COMMENT ON COLUMN public.gabinetes.twitter IS 'Perfil do Twitter/X ou Threads (opcional) - Formato: https://twitter.com/usuario ou https://www.threads.net/@usuario';
COMMENT ON COLUMN public.gabinetes.linkedin IS 'Perfil do LinkedIn (opcional) - Formato: https://www.linkedin.com/in/usuario';

-- Verificar estrutura final
DO $$
BEGIN
    RAISE NOTICE 'Campos de contato atualizados com sucesso!';
    RAISE NOTICE 'Estrutura final da tabela gabinetes:';
    RAISE NOTICE '- Telefones: telefone_parlamentar, telefone_gabinete, telefone_alternativo';
    RAISE NOTICE '- WhatsApp: telefone_parlamentar_whatsapp, telefone_gabinete_whatsapp, telefone_alternativo_whatsapp';
    RAISE NOTICE '- E-mails: email_parlamentar, email_gabinete';
    RAISE NOTICE '- Equipe: chefe_gabinete, assessor_2';
    RAISE NOTICE '- Web: site_parlamentar';
    RAISE NOTICE '- Redes sociais: instagram, facebook, tiktok, twitter, linkedin';
END $$;
