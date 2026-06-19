// ============================================================================
//  SulSafe — Webhook Mercado Pago (Vercel Serverless Function)
//  Recebe notificações de pagamento do MP e libera acesso automaticamente.
//
//  Como funciona:
//  1. MP envia POST quando um pagamento muda de status
//  2. Esta função consulta a API do MP pra saber o status real
//  3. Se confirmado, identifica o plano pelo valor (R$ 49,90 = Mensal, etc.)
//  4. Atualiza a tabela `profiles` no Supabase (plano + expiração)
//  5. Também atualiza a tabela `transacoes` (status = 'pago')
//
//  Configure no Mercado Pago:
//  URL: https://sulsafe.com.br/api/webhook-mp
//  Eventos: payment
// ============================================================================

import { createClient } from '@supabase/supabase-js'

// ===== Configuração (via variáveis de ambiente da Vercel) =====
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dhhvhiyoxadcwsfqlndw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // service_role key (NÃO usar a anon)
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

// ===== Planos =====
const PLANOS = [
  { slug: 'MENSAL',     valor: 49.90,  dias: 30,  label: 'Mensal'     },
  { slug: 'TRIMESTRAL', valor: 129.90, dias: 90,  label: 'Trimestral' },
  { slug: 'ANUAL',      valor: 399.90, dias: 365, label: 'Anual'      },
]

function identificarPlanoPorValor(valor) {
  const v = parseFloat(valor)
  if (isNaN(v)) return null
  for (const p of PLANOS) {
    if (Math.abs(v - p.valor) < 0.10) return p
  }
  return null
}

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // GET endpoint pra health check
  if (req.method === 'GET') {
    return res.status(200).json({ 
      ok: true, 
      service: 'sulsafe-webhook-mp',
      timestamp: new Date().toISOString()
    })
  }

  console.log('[webhook-mp] Recebido:', JSON.stringify(req.body).substring(0, 500))

  try {
    const body = req.body || {}
    
    // MP envia { type: 'payment', data: { id: '123456789' } }
    if (body.type !== 'payment' || !body.data?.id) {
      console.log('[webhook-mp] Notificação ignorada (não é payment):', body.type)
      return res.status(200).json({ ok: true, ignored: true, reason: 'not_payment' })
    }

    const paymentId = String(body.data.id)

    // ===== Validação: consulta o pagamento na API do MP =====
    if (!MP_ACCESS_TOKEN) {
      console.error('[webhook-mp] MP_ACCESS_TOKEN não configurado')
      return res.status(500).json({ ok: false, error: 'MP_TOKEN_MISSING' })
    }

    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!payRes.ok) {
      console.error('[webhook-mp] Erro ao consultar MP:', payRes.status, await payRes.text())
      return res.status(200).json({ ok: true, ignored: true, reason: 'mp_api_error' })
    }

    const pay = await payRes.json()
    console.log('[webhook-mp] Pagamento:', pay.id, 'status:', pay.status, 'valor:', pay.transaction_amount)

    // Só processa se o pagamento foi aprovado
    if (pay.status !== 'approved') {
      console.log('[webhook-mp] Pagamento não aprovado, status:', pay.status)
      return res.status(200).json({ ok: true, ignored: true, reason: 'not_approved', status: pay.status })
    }

    // ===== Identifica o aluno pelo email =====
    const emailAluno = pay.payer?.email || pay.external_reference?.split('|')[1]
    if (!emailAluno) {
      console.error('[webhook-mp] Sem email do payer')
      return res.status(200).json({ ok: true, ignored: true, reason: 'no_email' })
    }

    // ===== Identifica o plano pelo valor =====
    const planoInfo = identificarPlanoPorValor(pay.transaction_amount)
    if (!planoInfo) {
      console.error('[webhook-mp] Valor não bate com nenhum plano:', pay.transaction_amount)
      return res.status(200).json({ ok: true, ignored: true, reason: 'valor_invalido', valor: pay.transaction_amount })
    }

    console.log(`[webhook-mp] Liberando plano ${planoInfo.slug} para ${emailAluno}`)

    // ===== Atualiza Supabase =====
    if (!SUPABASE_SERVICE_KEY) {
      console.error('[webhook-mp] SUPABASE_SERVICE_KEY não configurado')
      return res.status(500).json({ ok: false, error: 'SUPABASE_KEY_MISSING' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Calcula data de expiração
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + planoInfo.dias)

    // 1. Atualiza o profile do aluno (por email)
    const { data: profileUpdate, error: profileErr } = await supabase
      .from('profiles')
      .update({
        plano: planoInfo.slug,
        plano_expira_em: expiraEm.toISOString(),
      })
      .eq('email', emailAluno.toLowerCase())
      .select('id')

    if (profileErr) {
      console.error('[webhook-mp] Erro ao atualizar profile:', profileErr)
    } else if (!profileUpdate || profileUpdate.length === 0) {
      // Aluno não encontrado — pode ter pago antes de criar conta
      // Cria registro na tabela transacoes mesmo assim, pra sincronizar depois
      console.warn('[webhook-mp] Aluno não encontrado no profiles:', emailAluno)
    } else {
      console.log('[webhook-mp] Profile atualizado:', profileUpdate[0].id)
    }

    // 2. Cria ou atualiza a transação
    const { error: transErr } = await supabase
      .from('transacoes')
      .upsert({
        aluno_email: emailAluno.toLowerCase(),
        aluno_id: profileUpdate?.[0]?.id || null,
        valor: pay.transaction_amount,
        status: 'pago',
        tipo: `MERCADOPAGO-${planoInfo.slug}`,
        descricao: `Plano ${planoInfo.label} - ${planoInfo.dias} dias`,
        provedor: 'mercadopago',
        provedor_id: String(pay.id),
        data_criacao: new Date().toISOString(),
      }, { onConflict: 'provedor_id' })

    if (transErr) {
      console.error('[webhook-mp] Erro ao salvar transação:', transErr)
    } else {
      console.log('[webhook-mp] Transação salva')
    }

    return res.status(200).json({
      ok: true,
      processed: true,
      plano: planoInfo.slug,
      email: emailAluno,
      expira: expiraEm.toISOString(),
    })

  } catch (e) {
    console.error('[webhook-mp] Erro geral:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
}
