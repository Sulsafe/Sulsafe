import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json()

    if (!priceId) throw new Error("priceId é obrigatório")
    if (!userEmail) throw new Error("userEmail é obrigatório")

    // Busca ou cria cliente
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
    let customerId = customers.data[0]?.id

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: userId || "" },
      })
      customerId = newCustomer.id
    }

    // Cria sessão de checkout com BOLETO e PIX
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "boleto", "pix"],  // <-- LINHA ALTERADA
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || "https://sulsafe.com.br/sucesso",
      cancel_url: cancelUrl || "https://sulsafe.com.br/cancelado",
      metadata: { userId: userId || "" },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error) {
    console.error("❌ Erro:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  }
})