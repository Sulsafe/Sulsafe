// ============================================================
// VIEW: IA (Assistente)
// ============================================================
// CORREÇÃO: imports com '../'
import { S, role, isAdmin, isProf, uid, nav } from '../state.js'
import { toast, handleError, sanitizar, $, $$ } from '../utils.js'
import { sb } from '../supabase-client.js'

export function vIA() {
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Assistente IA</h2><p class="wcs">Tire dúvidas sobre as NRs com nossa Inteligência Artificial 24/7.</p>`
    h += `<div style="display:flex;flex-direction:column;gap:16px;max-width:700px;margin:0 auto;">`
    h += `<div style="background:var(--ip);border-radius:var(--radius);padding:20px;border:1px solid var(--bd);">`
    h += `<div id="chatMessages" style="min-height:200px;max-height:400px;overflow-y:auto;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;">`
    h += `<div class="chat-msg bot"><i class="fas fa-robot" style="color:var(--p);margin-right:6px;"></i> Olá! Sou a IA da SulSafe. Pergunte sobre qualquer NR, segurança do trabalho ou dúvidas técnicas.</div>`
    h += `</div>`
    h += `<div style="display:flex;gap:8px;">`
    h += `<input type="text" id="chatInput" placeholder="Digite sua pergunta..." style="flex:1;padding:12px 16px;border-radius:100px;border:1px solid var(--bd);background:var(--bg);color:var(--tx);">`
    h += `<button class="btn btn-p" id="chatSend"><i class="fas fa-paper-plane"></i></button>`
    h += `</div>`
    h += `</div>`
    // Sugestões rápidas
    h += `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">`
    const sugestoes = ['O que é NR 10?', 'Como funciona a CIPA?', 'Quais EPIs são obrigatórios?', 'Diferença entre PGR e PCMSO?']
    sugestoes.forEach(s => {
        h += `<button class="btn btn-sm btn-s" onclick="document.getElementById('chatInput').value='${s}'; document.getElementById('chatSend').click();">${s}</button>`
    })
    h += `</div>`
    h += `</div>`

    setTimeout(() => {
        const input = document.getElementById('chatInput')
        const send = document.getElementById('chatSend')
        if (input && send) {
            const handler = async () => {
                const pergunta = input.value.trim()
                if (!pergunta) return
                const chat = document.getElementById('chatMessages')
                chat.innerHTML += `<div class="chat-msg user"><i class="fas fa-user" style="color:var(--p);margin-right:6px;"></i> ${pergunta}</div>`
                input.value = ''
                chat.scrollTop = chat.scrollHeight

                // Simula resposta da IA (pode integrar com API real)
                const resp = await respostaIA(pergunta)
                chat.innerHTML += `<div class="chat-msg bot"><i class="fas fa-robot" style="color:var(--p);margin-right:6px;"></i> ${resp}</div>`
                chat.scrollTop = chat.scrollHeight
            }
            send.onclick = handler
            input.addEventListener('keypress', e => { if (e.key === 'Enter') handler() })
        }
    }, 100)

    return h
}

// Função mock (substituir por chamada real à API)
async function respostaIA(pergunta) {
    // Simula um delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
    const respostas = [
        'A NR 10 trata da segurança em instalações e serviços com eletricidade. É obrigatória para todos os trabalhadores que atuam com energia elétrica.',
        'A CIPA (Comissão Interna de Prevenção de Acidentes) é exigida pela NR 5 e visa a prevenção de acidentes e doenças no trabalho.',
        'Os EPIs (Equipamentos de Proteção Individual) são regulados pela NR 6. Cada atividade exige EPIs específicos, como capacete, óculos, luvas, etc.',
        'O PGR (Programa de Gerenciamento de Riscos) e o PCMSO (Programa de Controle Médico de Saúde Ocupacional) são exigidos pelas NRs 9 e 7, respectivamente. O PGR foca nos riscos ambientais e o PCMSO na saúde dos trabalhadores.',
        'Para mais detalhes, consulte o conteúdo completo na plataforma.'
    ]
    return respostas[Math.floor(Math.random() * respostas.length)]
}

window.vIA = vIA
