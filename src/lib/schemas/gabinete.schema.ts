/**
 * Schema de validação Zod para formulário de Gabinete
 * Define as regras de validação para criação/edição de gabinetes
 */

import { z } from 'zod';

/**
 * Lista de UFs válidas do Brasil
 */
const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

/**
 * Lista de cargos parlamentares válidos
 */
const CARGO_LIST = [
  'vereador',
  'prefeito',
  'deputado_estadual',
  'deputado_federal',
  'senador',
  'governador'
] as const;

/**
 * Schema principal do formulário de Gabinete
 */
export const gabineteSchema = z.object({
  // Informações básicas do gabinete
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome muito longo (máximo 255 caracteres)')
    .trim(),
  
  // Localização
  municipio: z
    .string()
    .min(2, 'Município é obrigatório')
    .max(100, 'Nome do município muito longo')
    .trim(),
  
  uf: z.enum(UF_LIST, {
    errorMap: () => ({ message: 'Selecione uma UF válida' })
  }),
  
  // Informações do parlamentar
  parlamentar_nome: z
    .string()
    .min(3, 'Nome do parlamentar é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  
  parlamentar_cargo: z.enum(CARGO_LIST, {
    errorMap: () => ({ message: 'Selecione um cargo válido' })
  }),
  
  partido: z
    .string()
    .min(2, 'Partido deve ter no mínimo 2 caracteres')
    .max(20, 'Nome do partido muito longo')
    .trim()
    .toUpperCase(),
  
  // Contatos (opcionais mas validados se preenchidos)
  email_parlamentar: z
    .string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  email_gabinete: z
    .string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  telefone_parlamentar: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  telefone_gabinete: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  telefone_adicional: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  // Equipe
  chefe_de_gabinete: z
    .string()
    .max(255, 'Nome muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  assessor_2: z
    .string()
    .max(255, 'Nome muito longo')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
});

/**
 * Tipo inferido do schema para uso no TypeScript
 */
export type GabineteFormData = z.infer<typeof gabineteSchema>;

/**
 * Schema para validação de email isolado
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(254, 'Email muito longo')
  .toLowerCase()
  .trim();

/**
 * Schema para validação de telefone isolado
 */
export const telefoneSchema = z
  .string()
  .regex(/^[\d+\-() ]+$/, 'Telefone contém caracteres inválidos')
  .max(20, 'Telefone muito longo')
  .optional();

/**
 * Tipos exportados para facilitar uso
 */
export type UFType = typeof UF_LIST[number];
export type CargoType = typeof CARGO_LIST[number];
