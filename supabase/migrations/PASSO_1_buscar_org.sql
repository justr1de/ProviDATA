-- =====================================================
-- PASSO 1: Buscar ID da Organização
-- Execute APENAS esta query primeiro
-- =====================================================

SELECT 
    id,
    name,
    slug,
    created_at
FROM public.organizations 
WHERE slug = 'vereador-thiago-tezzari';

-- COPIE O "id" QUE APARECER NO RESULTADO
-- Exemplo de resultado:
-- id: a1b2c3d4-1234-5678-90ab-cdef12345678
-- name: Gabinete do Vereador Thiago Tezzari
-- slug: vereador-thiago-tezzari

-- DEPOIS DE COPIAR O ID, me envie o valor para eu criar o próximo script
