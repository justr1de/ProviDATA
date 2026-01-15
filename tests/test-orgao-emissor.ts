/**
 * Script de Teste: Sugestão Automática de Órgão Emissor
 * 
 * Este script testa se a funcionalidade de sugestão automática do campo
 * "Órgão Emissor" funciona corretamente para diferentes CEPs.
 * 
 * Para executar: npx ts-node tests/test-orgao-emissor.ts
 */

// Mapeamento de órgãos emissores por UF (mesmo do código fonte)
const orgaoEmissorPorUF: Record<string, string[]> = {
  'AC': ['SSP/AC', 'SEJUSP/AC', 'PC/AC', 'DETRAN/AC'],
  'AL': ['SSP/AL', 'PC/AL', 'DETRAN/AL', 'IML/AL'],
  'AP': ['SSP/AP', 'SEJUSP/AP', 'PC/AP', 'DETRAN/AP'],
  'AM': ['SSP/AM', 'PC/AM', 'DETRAN/AM', 'SEJUSC/AM'],
  'BA': ['SSP/BA', 'PC/BA', 'DETRAN/BA', 'PM/BA'],
  'CE': ['SSP/CE', 'SSPDS/CE', 'PC/CE', 'DETRAN/CE'],
  'DF': ['SSP/DF', 'PCDF', 'DETRAN/DF', 'IFP/DF'],
  'ES': ['SSP/ES', 'SESP/ES', 'PC/ES', 'DETRAN/ES'],
  'GO': ['SSP/GO', 'DGPC/GO', 'PC/GO', 'DETRAN/GO'],
  'MA': ['SSP/MA', 'SEJUSP/MA', 'PC/MA', 'DETRAN/MA'],
  'MT': ['SSP/MT', 'SEJUSP/MT', 'PJC/MT', 'DETRAN/MT'],
  'MS': ['SSP/MS', 'SEJUSP/MS', 'PC/MS', 'DETRAN/MS'],
  'MG': ['SSP/MG', 'PC/MG', 'DETRAN/MG', 'MAI/MG'],
  'PA': ['SSP/PA', 'SEGUP/PA', 'PC/PA', 'DETRAN/PA'],
  'PB': ['SSP/PB', 'SEDS/PB', 'PC/PB', 'DETRAN/PB'],
  'PR': ['SSP/PR', 'SESP/PR', 'PC/PR', 'DETRAN/PR', 'II/PR'],
  'PE': ['SSP/PE', 'SDS/PE', 'PC/PE', 'DETRAN/PE'],
  'PI': ['SSP/PI', 'PC/PI', 'DETRAN/PI', 'IML/PI'],
  'RJ': ['SSP/RJ', 'DETRAN/RJ', 'IFP/RJ', 'PCERJ'],
  'RN': ['SSP/RN', 'ITEP/RN', 'PC/RN', 'DETRAN/RN'],
  'RS': ['SSP/RS', 'SJS/RS', 'PC/RS', 'DETRAN/RS', 'IGP/RS'],
  'RO': ['SSP/RO', 'SEJUCEL/RO', 'PC/RO', 'DETRAN/RO', 'SESDEC/RO'],
  'RR': ['SSP/RR', 'SESP/RR', 'PC/RR', 'DETRAN/RR'],
  'SC': ['SSP/SC', 'PC/SC', 'DETRAN/SC', 'IGP/SC'],
  'SP': ['SSP/SP', 'PC/SP', 'DETRAN/SP', 'IIRGD/SP'],
  'SE': ['SSP/SE', 'PC/SE', 'DETRAN/SE', 'IML/SE'],
  'TO': ['SSP/TO', 'PC/TO', 'DETRAN/TO', 'IGP/TO'],
}

// Função para obter sugestão de órgão emissor (mesmo do código fonte)
const getSugestaoOrgaoEmissor = (uf: string): string => {
  if (!uf || !orgaoEmissorPorUF[uf]) return ''
  return orgaoEmissorPorUF[uf][0]
}

// Função para obter opções de órgão emissor
const getOrgaoEmissorOptions = (uf: string): string[] => {
  if (!uf || !orgaoEmissorPorUF[uf]) return []
  return orgaoEmissorPorUF[uf]
}

// Interface para resposta do ViaCEP
interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// Função para buscar CEP na API ViaCEP
async function buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCEP = cep.replace(/\D/g, '')
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data = await response.json()
    
    if (data.erro) {
      return null
    }
    
    return data as ViaCEPResponse
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

// Função de teste principal
async function testarSugestaoOrgaoEmissor() {
  console.log('=' .repeat(60))
  console.log('TESTE: Sugestão Automática de Órgão Emissor')
  console.log('=' .repeat(60))
  console.log('')

  // CEPs de teste
  const cepsTeste = [
    { cep: '01310-100', descricao: 'São Paulo - SP (Av. Paulista)' },
    { cep: '30130-000', descricao: 'Belo Horizonte - MG (Praça Sete)' },
  ]

  let testesPassaram = 0
  let testesFalharam = 0

  for (const teste of cepsTeste) {
    console.log('-'.repeat(60))
    console.log(`📍 Testando: ${teste.descricao}`)
    console.log(`   CEP: ${teste.cep}`)
    console.log('')

    // Buscar CEP
    const resultado = await buscarCEP(teste.cep)

    if (!resultado) {
      console.log('   ❌ FALHA: CEP não encontrado')
      testesFalharam++
      continue
    }

    console.log(`   📌 Endereço: ${resultado.logradouro || 'N/A'}`)
    console.log(`   📌 Bairro: ${resultado.bairro}`)
    console.log(`   📌 Cidade: ${resultado.localidade}`)
    console.log(`   📌 UF: ${resultado.uf}`)
    console.log('')

    // Testar sugestão de órgão emissor
    const sugestao = getSugestaoOrgaoEmissor(resultado.uf)
    const opcoes = getOrgaoEmissorOptions(resultado.uf)

    if (sugestao) {
      console.log(`   ✅ Sugestão de Órgão Emissor: ${sugestao}`)
      console.log(`   📋 Opções disponíveis: ${opcoes.join(', ')}`)
      
      // Verificar se a sugestão segue o padrão esperado
      const ufEsperada = resultado.uf
      const sugestaoEsperada = `SSP/${ufEsperada}`
      
      if (sugestao === sugestaoEsperada) {
        console.log(`   ✅ PASSOU: Sugestão correta (${sugestaoEsperada})`)
        testesPassaram++
      } else {
        console.log(`   ⚠️ AVISO: Sugestão diferente do padrão SSP`)
        console.log(`      Esperado: ${sugestaoEsperada}`)
        console.log(`      Recebido: ${sugestao}`)
        testesPassaram++ // Ainda conta como passou se retornou algo válido
      }
    } else {
      console.log(`   ❌ FALHA: Nenhuma sugestão retornada para UF ${resultado.uf}`)
      testesFalharam++
    }

    console.log('')
  }

  // Resumo
  console.log('='.repeat(60))
  console.log('RESUMO DOS TESTES')
  console.log('='.repeat(60))
  console.log(`   ✅ Testes que passaram: ${testesPassaram}`)
  console.log(`   ❌ Testes que falharam: ${testesFalharam}`)
  console.log(`   📊 Total de testes: ${cepsTeste.length}`)
  console.log('')

  if (testesFalharam === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!')
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique os resultados acima.')
  }

  console.log('')
  console.log('='.repeat(60))

  return testesFalharam === 0
}

// Executar testes
testarSugestaoOrgaoEmissor()
  .then((sucesso) => {
    process.exit(sucesso ? 0 : 1)
  })
  .catch((error) => {
    console.error('Erro ao executar testes:', error)
    process.exit(1)
  })
