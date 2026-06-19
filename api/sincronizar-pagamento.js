// ============================================================================
//  SulSafe — Sincronizar Pagamento (client-side fallback)
//  Chamado pelo login.html quando o aluno volta do MP mas o webhook ainda
//  não processou. Busca pagamentos recentes do MP e atualiza o Supabase.
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dhhvhiyoxadcwsfqlndw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

const PLANOS = [
  { slug: 'MENSAL',     valor: 49.90,  dias: 30  },
  { slug: 'TRIMESTRAL', valor: 129.90, dias: 90  },
  { slug: 'ANUAL',      valor: 399.90, dias: 365 },
]

function identificarPlanoPorValor(valor) {
  const v = parseFloat(valor)
  if (isNaN(v)) return null
  for (const p of PLANOS) {
    if (Math.abs(v - p.valor) < 0.10) return p
  }
  return null
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req, res) {
  // CORS
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v))
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'GET only' })
  }

  const email = (req.query.email || '').toLowerCase().trim()
  if (!email) {
    return res.status(400).json({ ok: false, error: 'email parameter required' })
  }

  console.log('[sincronizar] Buscando pagamentos para:', email)

  try {
    if (!MP_ACCESS_TOKEN || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ ok: false, error: 'config_missing' })
    }

    // 1. Busca pagamentos recentes no MP pelo email do payer
    // MP v1: /v1/payments/search?payer.email=X&sort=date_created&criteria=desc&limit=5
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/search?payer.email=${encodeURIComponent(email)}&sort=date_created&criteria=desc&limit=10`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
    )

    if (!mpRes.ok) {
      console.error('[sincronizar] Erro MP:', mpRes.status)
      return res.status(502).json({ ok: false, error: 'mp_api_error' })
    }

    const mpData = await mpRes.json()
    const payments = mpData.results || []

    console.log(`[sincronizar] ${payments.length} pagamentos encontrados para ${email}`)

    // 2. Procura o pagamento aprovado mais recente que bate com um plano
    let planoEncontrado = null
    let paymentUsado = null
    for (const pay of payments) {
      if (pay.status !== 'approved') continue
      const plano = identificarPlanoPorValor(pay.transaction_amount)
      if (plano) {
        // Verifica se ainda está dentro do prazo (data do pagamento + dias)
        const dataPag = new Date(pay.date_approved || pay.date_created)
        const expira = new Date(dataPag)
        expira.setDate(expira.getDate() + plano.dias)
        if (expira > new Date()) {
          planoEncontrado = { ...plano, expira: expira.toISOString(), dataPagamento: dataPag.toISOString() }
          paymentUsado = pay
          break
        }
      }
    }

    if (!planoEncontrado) {
      console.log('[sincronizar] Nenhum pagamento aprovado compatível encontrado')
      return res.status(200).json({ 
        ok: true, 
        liberado: false, 
        motivo: 'SEM_PAGAMENTO_COMPATIVEL',
        totalPagamentos: payments.length 
      })
    }

    // 3. Atualiza Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Atualiza profile
    const { data: profileUpd, error: pErr } = await supabase
      .from('profiles')
      .update({
        plano: planoEncontrado.slug,
        plano_expira_em: planoEncontrado.expira,
      })
      .eq('email', email)
      .select('id')

    if (pErr) console.error('[sincronizar] Erro profile:', pErr)

    // Upsert transação
    const { error: tErr } = await supabase
      .from('transacoes')
      .upsert({
        aluno_email: email,
        aluno_id: profileUpd?.[0]?.id || null,
        valor: paymentUsado.transaction_amount,
        status: 'pago',
        tipo: `MERCADOPAGO-${planoEncontrado.slug}`,
        descricao: `Plano ${planoEncontrado.slug} - ${planoEncontrado.dias} dias (sincronizado)`,
        provedor: 'mercadopago',
        provedor_id: String(paymentUsado.id),
        data_criacao: planoEncontrado.dataPagamento,
      }, { onConflict: 'provedor_id' })

    if (tErr) console.error('[sincronizar] Erro transação:', tErr)

    console.log(`[sincronizar] Plano ${planoEncontrado.slug} liberado para ${email}`)

    return res.status(200).json({
      ok: true,
      liberado: true,
      plano: planoEncontrado.slug,
      expira: planoEncontrado.expira,
      paymentId: paymentUsado.id,
    })

  } catch (e) {
    console.error('[sincronizar] Erro:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
}
