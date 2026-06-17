import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

serve(async (req) => {
  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json()

    // Busca ou cria cliente no Stripe
    let customer = await stripe.customers.list({ email: userEmail, limit: 1 })
    let customerId = customer.data[0]?.id

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      customerId = newCustomer.id
    }

    // Cria sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "boleto", "pix"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || "https://seusite.com/sucesso",
      cancel_url: cancelUrl || "https://seusite.com/cancelado",
      metadata: { userId },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})