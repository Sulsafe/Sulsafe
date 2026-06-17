import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

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

    console.log('🔑 Chave configurada?', GEMINI_API_KEY ? '✅ SIM' : '❌ NÃO');
    console.log('📝 Prompt:', prompt);

    // Se não tiver chave da API
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'Chave da API Gemini não configurada',
          response: '⚠️ Configure a chave no Supabase: supabase secrets set GEMINI_API_KEY=sua_chave'
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 200 }
      )
    }

    // ============================================================
    // TENTA USAR O GEMINI
    // ============================================================
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      
      // Tenta com gemini-1.5-flash primeiro
      let model
      try {
        model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      } catch {
        // Se falhar, tenta gemini-pro
        model = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('✅ Gemini respondeu com sucesso!');
      
      return new Response(
        JSON.stringify({ response: text }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
      
    } catch (geminiError) {
      console.error('❌ Erro no Gemini:', geminiError.message)
      
      // Se o Gemini falhar, retorna o erro
      return new Response(
        JSON.stringify({ 
          error: geminiError.message,
          response: `⚠️ Erro ao acessar o Gemini: ${geminiError.message}\n\nVerifique se sua chave API é válida e tem acesso aos modelos.`
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 200 }
      )
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 500 }
    )
  }
})
