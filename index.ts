import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''

serve(async (req) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const { prompt } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt não fornecido' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 400 }
      )
    }

    // ============================================================
    // TENTA USAR O GEMINI PRIMEIRO
    // ============================================================
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("https://esm.sh/@google/generative-ai")
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        return new Response(
          JSON.stringify({ response: text }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      } catch (geminiError) {
        console.error('Erro no Gemini:', geminiError)
        // Se o Gemini falhar, continua para o fallback
      }
    }

    // ============================================================
    // FALLBACK: USAR API GRATUITA DO HUGGING FACE
    // ============================================================
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt })
      })
      
      const hfData = await hfResponse.json()
      
      if (hfData?.generated_text) {
        return new Response(
          JSON.stringify({ response: hfData.generated_text }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      }
    } catch (hfError) {
      console.error('Erro no Hugging Face:', hfError)
    }

    // ============================================================
    // ÚLTIMO RECURSO: RESPOSTA PRÉ-DEFINIDA
    // ============================================================
    const respostaFallback = gerarRespostaOffline(prompt)
    
    return new Response(
      JSON.stringify({ response: respostaFallback }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
    
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 500 }
    )
  }
})

// ============================================================
// RESPOSTAS PRÉ-DEFINIDAS (ÚLTIMO RECURSO)
// ============================================================
function gerarRespostaOffline(prompt) {
  const p = prompt.toLowerCase()
  
  if (p.includes('nr-01') || p.includes('nr 01')) {
    return `📋 NR-01 - Disposições Gerais e Gerenciamento de Riscos\n\nObjetivo: Estabelecer os requisitos para o gerenciamento de riscos ocupacionais.\n\nPrincipais pontos:\n- PGR - Programa de Gerenciamento de Riscos\n- GRO - Gerenciamento de Riscos Ocupacionais\n- Hierarquia de controles\n- Inventário de riscos`
  }
  
  if (p.includes('nr-03') || p.includes('nr 03')) {
    return `🚫 NR-03 - Embargo ou Interdição\n\nObjetivo: Estabelecer critérios para embargo e interdição quando houver risco grave e iminente.\n\nPrincipais pontos:\n- Embargo: paralisação de obra\n- Interdição: paralisação de estabelecimento\n- Risco grave e iminente\n- Ação do Auditor Fiscal`
  }
  
  if (p.includes('nr-05') || p.includes('nr 05') || p.includes('cipa')) {
    return `🤝 NR-05 - CIPA\n\nObjetivo: Prevenir acidentes e doenças do trabalho.\n\nPrincipais pontos:\n- Composição paritária\n- Eleição dos representantes\n- SIPAT\n- Estabilidade do cipeiro`
  }
  
  if (p.includes('nr-35') || p.includes('nr 35')) {
    return `🧗 NR-35 - Trabalho em Altura\n\nObjetivo: Estabelecer requisitos para atividades acima de 2,0m.\n\nPrincipais pontos:\n- Altura mínima: 2,0m\n- PTA - Permissão de Trabalho\n- Cinto de segurança\n- Treinamento obrigatório`
  }
  
  if (p.includes('nr-33') || p.includes('nr 33')) {
    return `🕳️ NR-33 - Espaços Confinados\n\nObjetivo: Estabelecer requisitos para trabalho em espaços confinados.\n\nPrincipais pontos:\n- PET - Permissão de Entrada\n- Supervisor e vigias\n- Monitoramento da atmosfera\n- Treinamento e resgate`
  }
  
  return `📚 NRs disponíveis: NR-01, NR-03, NR-05, NR-06, NR-10, NR-18, NR-33, NR-35\n\nDigite o número da NR para mais informações.`
}