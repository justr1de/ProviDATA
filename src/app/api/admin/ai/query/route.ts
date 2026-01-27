import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Chave da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDIvU_7l4vDYpRxJ03ZuaLBwR0aKmNBtWc'

// Schema do banco de dados para contexto da IA
const DATABASE_SCHEMA = `
Tabelas do banco de dados ProviDATA:

1. gabinetes - Gabinetes parlamentares
   - id (uuid): ID único
   - nome (varchar): Nome do gabinete
   - parlamentar_nome (varchar): Nome do parlamentar
   - parlamentar_cargo (varchar): Cargo (vereador, deputado_estadual, deputado_federal, senador, governador, prefeito)
   - uf (varchar): Estado (sigla)
   - municipio (varchar): Cidade
   - partido (varchar): Partido político
   - ativo (boolean): Se está ativo
   - created_at (timestamp): Data de criação

2. providencias - Pedidos de providências
   - id (uuid): ID único
   - gabinete_id (uuid): FK para gabinetes
   - numero_protocolo (varchar): Número do protocolo
   - cidadao_id (uuid): FK para cidadãos
   - categoria_id (uuid): FK para categorias
   - orgao_destino_id (uuid): FK para órgãos
   - usuario_responsavel_id (uuid): FK para usuários
   - titulo (varchar): Título da providência
   - descricao (text): Descrição detalhada
   - localizacao_tipo (varchar): Tipo de localização
   - localizacao_descricao (text): Descrição da localização
   - latitude (numeric): Latitude
   - longitude (numeric): Longitude
   - prioridade (varchar): baixa, media, alta, urgente
   - status (varchar): pendente, em_analise, em_andamento, encaminhada, concluida
   - prazo_estimado (date): Prazo estimado
   - data_encaminhamento (timestamp): Data de encaminhamento
   - data_conclusao (timestamp): Data de conclusão
   - observacoes_internas (text): Observações internas
   - created_at (timestamp): Data de criação
   - updated_at (timestamp): Data de atualização

3. orgaos - Órgãos destinatários
   - id (uuid): ID único
   - gabinete_id (uuid): FK para gabinetes
   - nome (varchar): Nome do órgão
   - tipo (varchar): Tipo do órgão
   - sigla (varchar): Sigla
   - email (varchar): Email
   - telefone (varchar): Telefone
   - endereco (text): Endereço
   - responsavel (varchar): Responsável
   - ativo (boolean): Se está ativo
   - created_at (timestamp): Data de criação

4. users - Usuários do sistema
   - id (uuid): ID único (mesmo do auth.users)
   - email (varchar): Email
   - nome (varchar): Nome completo
   - role (varchar): super_admin, admin, gestor, assessor, operador, colaborador, visualizador
   - gabinete_id (uuid): FK para gabinetes
   - ativo (boolean): Se está ativo
   - created_at (timestamp): Data de criação

5. cidadaos - Cidadãos que fazem solicitações
   - id (uuid): ID único
   - gabinete_id (uuid): FK para gabinetes
   - nome (varchar): Nome
   - cpf (varchar): CPF
   - telefone (varchar): Telefone
   - email (varchar): Email
   - endereco (text): Endereço
   - bairro (varchar): Bairro
   - cidade (varchar): Cidade
   - uf (varchar): Estado
   - cep (varchar): CEP
   - created_at (timestamp): Data de criação

6. categorias - Categorias de providências
   - id (uuid): ID único
   - gabinete_id (uuid): FK para gabinetes
   - nome (varchar): Nome da categoria
   - descricao (text): Descrição
   - cor (varchar): Cor para exibição
   - ativo (boolean): Se está ativo
   - created_at (timestamp): Data de criação

Regras importantes:
- Gabinetes com nome contendo "demonstração", "dataro", "data-ro" ou "administração geral" são de teste e devem ser excluídos de relatórios
- Sempre use JOINs apropriados para relacionar tabelas
- Use COUNT, SUM, AVG para agregações
- Use GROUP BY para agrupamentos
- Use ORDER BY para ordenação
- Limite resultados com LIMIT quando apropriado
- Use DATE_TRUNC para agrupar por período
- Use CASE WHEN para transformar valores
`

// Interface para o log de uso
interface AIUsageLog {
  user_id: string
  gabinete_id: string | null
  question: string
  answer: string | null
  tokens_input: number | null
  tokens_output: number | null
  response_time_ms: number
  model: string
  status: 'success' | 'error'
  error_message: string | null
}

// Função para registrar o uso da IA
async function logAIUsage(supabase: any, log: AIUsageLog) {
  try {
    await supabase.from('ai_usage_logs').insert(log)
  } catch (error) {
    console.error('Erro ao registrar uso da IA:', error)
    // Não interrompe o fluxo se o log falhar
  }
}

// Função para estimar tokens (aproximação simples)
function estimateTokens(text: string): number {
  // Aproximação: ~4 caracteres por token em português
  return Math.ceil(text.length / 4)
}

// Função para chamar a API do Gemini
async function callGemini(prompt: string, systemPrompt: string): Promise<{ text: string; tokensInput: number; tokensOutput: number }> {
  const fullPrompt = `${systemPrompt}\n\nUsuário: ${prompt}`
  const tokensInput = estimateTokens(fullPrompt)
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Erro na API do Gemini:', error)
    throw new Error(`Erro na API do Gemini: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const tokensOutput = estimateTokens(text)
  
  return { text, tokensInput, tokensOutput }
}

// Função para gerar SQL a partir de pergunta em linguagem natural
async function generateSQL(question: string): Promise<{ sql: string; tokensInput: number; tokensOutput: number }> {
  const systemPrompt = `Você é um assistente especializado em gerar consultas SQL PostgreSQL para o sistema ProviDATA.
        
${DATABASE_SCHEMA}

Regras para gerar SQL:
1. Gere APENAS a consulta SQL, sem explicações
2. Use apenas SELECT, nunca INSERT, UPDATE, DELETE
3. Sempre exclua gabinetes de demonstração usando: WHERE g.nome NOT ILIKE '%demonstra%' AND g.nome NOT ILIKE '%dataro%' AND g.nome NOT ILIKE '%data-ro%' AND g.nome NOT ILIKE '%administração geral%'
4. Use aliases claros para tabelas (g para gabinetes, p para providencias, etc.)
5. Formate datas para exibição legível
6. Limite resultados a 100 linhas por padrão
7. Use COALESCE para tratar valores nulos
8. Retorne apenas a query SQL, sem markdown ou explicações`

  const result = await callGemini(question, systemPrompt)
  return { sql: result.text.trim(), tokensInput: result.tokensInput, tokensOutput: result.tokensOutput }
}

// Função para formatar resultados em texto legível
async function formatResults(question: string, results: unknown[], sql: string): Promise<{ text: string; tokensInput: number; tokensOutput: number }> {
  const systemPrompt = `Você é um assistente do sistema ProviDATA que ajuda a interpretar dados de providências parlamentares.
        
Formate a resposta de forma clara e objetiva em português brasileiro.
Use formatação markdown quando apropriado.
Destaque números importantes.
Se não houver resultados, informe de forma amigável.
Não mencione SQL ou detalhes técnicos na resposta.`

  const prompt = `Pergunta do usuário: ${question}

Dados encontrados:
${JSON.stringify(results, null, 2)}

Formate uma resposta clara e amigável para o usuário.`

  return await callGemini(prompt, systemPrompt)
}

// Função para responder perguntas gerais sobre o sistema
async function answerGeneralQuestion(question: string, gabineteInfo: any, stats: any): Promise<{ text: string; tokensInput: number; tokensOutput: number }> {
  const systemPrompt = `Você é o assistente de IA do ProviDATA, um sistema de gestão de pedidos de providência para gabinetes parlamentares.

Informações do gabinete atual:
${JSON.stringify(gabineteInfo, null, 2)}

Estatísticas atuais:
${JSON.stringify(stats, null, 2)}

Você deve:
1. Responder perguntas sobre o sistema e suas funcionalidades
2. Fornecer insights sobre os dados do gabinete
3. Dar sugestões de como melhorar a gestão de providências
4. Ser sempre educado e profissional
5. Responder em português brasileiro
6. Usar markdown para formatação quando apropriado`

  return await callGemini(question, systemPrompt)
}

export async function POST(request: Request) {
  const startTime = Date.now()
  let userId: string | null = null
  let gabineteId: string | null = null
  let question: string = ''
  
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    userId = user.id
    
    // Buscar informações do usuário
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, gabinete_id, nome')
      .eq('id', user.id)
      .single()
    
    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }
    
    gabineteId = userProfile.gabinete_id
    
    // Obter pergunta do corpo da requisição
    const body = await request.json()
    question = body.question
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Pergunta não fornecida' }, { status: 400 })
    }
    
    // Buscar informações do gabinete
    let gabineteInfo = null
    let stats = null
    
    if (userProfile.gabinete_id) {
      const { data: gabinete } = await supabase
        .from('gabinetes')
        .select('*')
        .eq('id', userProfile.gabinete_id)
        .single()
      
      gabineteInfo = gabinete
      
      // Buscar estatísticas
      const { data: providencias } = await supabase
        .from('providencias')
        .select('status, prioridade')
        .eq('gabinete_id', userProfile.gabinete_id)
      
      if (providencias) {
        stats = {
          total: providencias.length,
          pendentes: providencias.filter(p => p.status === 'pendente').length,
          em_analise: providencias.filter(p => p.status === 'em_analise').length,
          em_andamento: providencias.filter(p => p.status === 'em_andamento').length,
          encaminhadas: providencias.filter(p => p.status === 'encaminhado').length,
          concluidas: providencias.filter(p => p.status === 'concluido').length,
          urgentes: providencias.filter(p => p.prioridade === 'urgente').length,
        }
      }
    }
    
    // Se for super_admin e a pergunta parecer ser sobre dados/relatórios, tentar gerar SQL
    const isSuperAdmin = userProfile.role === 'super_admin'
    const isDataQuery = /quantos|total|lista|relatório|dados|estatísticas|média|soma|contagem/i.test(question)
    
    let totalTokensInput = 0
    let totalTokensOutput = 0
    
    if (isSuperAdmin && isDataQuery) {
      try {
        // Gerar SQL a partir da pergunta
        const sqlResult = await generateSQL(question)
        totalTokensInput += sqlResult.tokensInput
        totalTokensOutput += sqlResult.tokensOutput
        
        let sql = sqlResult.sql
        
        // Limpar SQL (remover markdown se houver)
        sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
        
        // Validar que é apenas SELECT
        if (sql.toLowerCase().startsWith('select')) {
          // Executar consulta
          const { data: results, error: queryError } = await supabase.rpc('execute_readonly_query', {
            query_text: sql
          })
          
          if (!queryError && results) {
            // Formatar resposta
            const formatResult = await formatResults(question, results, sql)
            totalTokensInput += formatResult.tokensInput
            totalTokensOutput += formatResult.tokensOutput
            
            const responseTime = Date.now() - startTime
            
            // Registrar uso da IA
            await logAIUsage(supabase, {
              user_id: userId,
              gabinete_id: gabineteId,
              question,
              answer: formatResult.text,
              tokens_input: totalTokensInput,
              tokens_output: totalTokensOutput,
              response_time_ms: responseTime,
              model: 'gemini-2.0-flash',
              status: 'success',
              error_message: null
            })
            
            return NextResponse.json({
              answer: formatResult.text,
              sql,
              results,
              rowCount: Array.isArray(results) ? results.length : 0
            })
          }
        }
      } catch (sqlError) {
        console.log('Erro ao gerar/executar SQL, usando resposta geral:', sqlError)
      }
    }
    
    // Responder pergunta geral
    const answerResult = await answerGeneralQuestion(question, gabineteInfo, stats)
    totalTokensInput += answerResult.tokensInput
    totalTokensOutput += answerResult.tokensOutput
    
    const responseTime = Date.now() - startTime
    
    // Registrar uso da IA
    await logAIUsage(supabase, {
      user_id: userId,
      gabinete_id: gabineteId,
      question,
      answer: answerResult.text,
      tokens_input: totalTokensInput,
      tokens_output: totalTokensOutput,
      response_time_ms: responseTime,
      model: 'gemini-2.0-flash',
      status: 'success',
      error_message: null
    })
    
    return NextResponse.json({
      answer: answerResult.text,
      gabinete: gabineteInfo?.nome,
      stats
    })
    
  } catch (error) {
    console.error('Erro na API de IA:', error)
    
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    // Tentar registrar o erro
    if (userId) {
      try {
        const supabase = await createClient()
        await logAIUsage(supabase, {
          user_id: userId,
          gabinete_id: gabineteId,
          question,
          answer: null,
          tokens_input: null,
          tokens_output: null,
          response_time_ms: responseTime,
          model: 'gemini-2.0-flash',
          status: 'error',
          error_message: errorMessage
        })
      } catch (logError) {
        console.error('Erro ao registrar falha:', logError)
      }
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      answer: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
    }, { status: 500 })
  }
}
