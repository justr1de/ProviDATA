-- Script para adicionar os cargos Admin e Super Admin na tabela gabinetes
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a constraint antiga
ALTER TABLE public.gabinetes 
DROP CONSTRAINT IF EXISTS gabinetes_parlamentar_cargo_check;

-- 2. Adicionar a nova constraint com os novos valores
ALTER TABLE public.gabinetes 
ADD CONSTRAINT gabinetes_parlamentar_cargo_check 
CHECK (parlamentar_cargo IN (
  'vereador', 
  'prefeito', 
  'deputado_estadual', 
  'deputado_federal', 
  'senador', 
  'governador',
  'admin',
  'super_admin'
));

-- 3. Verificar se a constraint foi criada corretamente
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.gabinetes'::regclass 
AND contype = 'c';
