import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

// Stripe com a chave secreta
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
}

serve(async (req) => {
  // CORS para preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Obter assinatura do Stripe
    const signature = req.headers.get("stripe-signature")
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET não configurado")
      return new Response("Webhook secret not configured", { status: 500, headers: corsHeaders })
    }

    // Obter corpo da requisição
    const body = await req.text()
    console.log("📦 Body recebido:", body.substring(0, 200) + "...")

    // Verificar assinatura do webhook
    let event
    try {
      // Usar constructEventAsync (versão async)
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
      console.log("✅ Evento verificado:", event.type)
    } catch (err) {
      console.error("❌ Erro ao verificar assinatura:", err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders })
    }

    // Processar evento
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      console.log("💰 Pagamento recebido! Session ID:", session.id)

      const userId = session.metadata?.userId
      const userEmail = session.customer_details?.email || session.customer_email
      const amount = (session.amount_total || 0) / 100
      const paymentMethod = session.payment_method_types?.includes("pix") ? "PIX" : 
                           session.payment_method_types?.includes("boleto") ? "BOLETO" : "CARTÃO"

      console.log(`📝 Dados: userId=${userId}, email=${userEmail}, valor=R$ ${amount}, método=${paymentMethod}`)

      // Criar cliente Supabase dentro da função (não funciona importar de fora)
      const supabaseUrl = "https://dhhvhiyoxadcwsfqlndw.supabase.co"
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxNDQ3MiwiZXhwIjoyMDk2NDkwNDcyfQ.w7tN0k9Lfhv5J6kT5Fb7bNU2o2WUqCc3zKJw7c8e2t8"
      
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      // Verificar se transação já existe
      const { data: existing } = await supabaseAdmin
        .from("transacoes")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle()

      if (existing) {
        console.log("⚠️ Transação já registrada:", session.id)
        return new Response(JSON.stringify({ received: true, alreadyExists: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }

      // Inserir transação
      const { error: insertError } = await supabaseAdmin.from("transacoes").insert({
        aluno_id: userId,
        aluno_email: userEmail,
        tipo: paymentMethod,
        valor: amount,
        status: "PAGO",
        descricao: `Pagamento Stripe - ${session.id}`,
        data_criacao: new Date().toISOString(),
        data_pagamento: new Date().toISOString(),
        stripe_session_id: session.id,
      })

      if (insertError) {
        console.error("❌ Erro ao salvar transação:", insertError.message)
        return new Response(JSON.stringify({ error: insertError.message }), { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        })
      }

      console.log("✅ Transação salva com sucesso!")
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })

  } catch (error) {
    console.error("❌ Erro geral:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }
})