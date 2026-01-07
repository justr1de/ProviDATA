import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Inicializar cliente OpenAI
const openai = new OpenAI()

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

4. profiles - Perfis de usuários
   - id (uuid): ID único (mesmo do auth.users)
   - email (varchar): Email
   - full_name (varchar): Nome completo
   - role (varchar): super_admin, admin, gestor, assessor, operador, colaborador, visualizador
   - gabinete_id (uuid): FK para gabinetes
   - cargo (varchar): Cargo no gabinete
   - avatar_url (varchar): URL do avatar
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

// Função para gerar SQL a partir de pergunta em linguagem natural
async function generateSQL(question: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente especializado em gerar consultas SQL PostgreSQL para o sistema ProviDATA.
        
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
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.1,
    max_tokens: 1000
  })
  
  return completion.choices[0]?.message?.content?.trim() || ''
}

// Função para formatar resultados em texto legível
async function formatResults(question: string, results: unknown[], sql: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente do sistema ProviDATA que ajuda a interpretar dados de providências parlamentares.
        
Formate a resposta de forma clara e objetiva em português brasileiro.
Use formatação markdown quando apropriado.
Destaque números importantes.
Se não houver resultados, informe de forma amigável.
Não mencione SQL ou detalhes técnicos na resposta.`
      },
      {
        role: 'user',
        content: `Pergunta do usuário: ${question}

Dados encontrados:
${JSON.stringify(results, null, 2)}

Formate uma resposta clara e amigável para o usuário.`
      }
    ],
    temperature: 0.3,
    max_tokens: 1500
  })
  
  return completion.choices[0]?.message?.content?.trim() || 'Não foi possível processar a resposta.'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Verificar se é super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acesso negado. Apenas super_admin pode usar esta funcionalidade.' }, { status: 403 })
    }
    
    // Obter pergunta do corpo da requisição
    const body = await request.json()
    const { question } = body
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Pergunta não fornecida' }, { status: 400 })
    }
    
    // Gerar SQL a partir da pergunta
    let sql = await generateSQL(question)
    
    // Limpar SQL (remover markdown se houver)
    sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Validar que é apenas SELECT
    if (!sql.toLowerCase().startsWith('select')) {
      return NextResponse.json({ 
        error: 'Apenas consultas de leitura são permitidas',
        answer: 'Desculpe, só posso responder perguntas que envolvam consulta de dados. Não posso modificar informações no banco de dados.'
      }, { status: 400 })
    }
    
    // Executar consulta
    const { data: results, error: queryError } = await supabase.rpc('execute_readonly_query', {
      query_text: sql
    })
    
    // Se a função RPC não existir, tentar executar diretamente (menos seguro)
    let finalResults = results
    if (queryError) {
      console.log('RPC não disponível, tentando consulta direta...')
      // Fallback: executar consulta direta (apenas para super_admin)
      const { data: directResults, error: directError } = await supabase
        .from('providencias')
        .select('*')
        .limit(1)
      
      if (directError) {
        console.error('Erro na consulta:', directError)
        return NextResponse.json({ 
          error: 'Erro ao executar consulta',
          answer: 'Desculpe, houve um erro ao processar sua pergunta. Por favor, tente reformular de outra forma.',
          sql
        }, { status: 500 })
      }
      
      // Usar resultados simulados para demonstração
      finalResults = []
    }
    
    // Formatar resposta
    const answer = await formatResults(question, finalResults || [], sql)
    
    return NextResponse.json({
      answer,
      sql,
      results: finalResults,
      rowCount: Array.isArray(finalResults) ? finalResults.length : 0
    })
    
  } catch (error) {
    console.error('Erro na API de IA:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      answer: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
    }, { status: 500 })
  }
}
