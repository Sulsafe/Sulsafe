// ============================================================
// VIEW: ASSISTENTE IA
// ============================================================
import { $ } from '../utils.js'

export function vIA() {
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Assistente IA</h2><p class="wcs">Tire dúvidas sobre NRs e segurança do trabalho.</p>`
    h += `<div class="pnl"><div class="chat-box"><div class="chat-msgs" id="chatMsgs"><div class="chat-m b">Olá! Sou o assistente IA da SulSafe. Pergunte sobre qualquer NR, EPI, CIPA, PPP, PCMSO e muito mais.</div></div><div class="chat-row"><input id="chatIn" placeholder="Digite sua pergunta..." onkeydown="if(event.key==='Enter')sendIA()"><button class="btn btn-p btn-sm" onclick="sendIA()"><i class="fas fa-paper-plane"></i></button></div></div></div>`
    return h
}

function sendIA() {
    const inp = $('#chatIn'), msg = inp.value.trim()
    if (!msg) return
    const msgs = $('#chatMsgs')
    msgs.innerHTML += `<div class="chat-m u">${msg}</div>`
    inp.value = ''
    msgs.scrollTop = msgs.scrollHeight
    setTimeout(() => {
        msgs.innerHTML += `<div class="chat-m b">${genIA(msg)}</div>`
        msgs.scrollTop = msgs.scrollHeight
    }, 500 + Math.random() * 700)
}

function genIA(q) {
    const ql = q.toLowerCase()
    if (ql.includes('nr 10') || ql.includes('eletricidade')) return 'A <strong>NR 10</strong> estabelece requisitos de segurança em instalações e serviços em eletricidade. Exige treinamento específico (SEP), EPIs adequados, e que as instalações atendam a NBR 5410. Curso básico: 40h, complementar SEP: 40h.'
    if (ql.includes('nr 35') || ql.includes('altura')) return 'A <strong>NR 35</strong> regulamenta trabalho em altura (acima de 2m). Exige: Análise de Risco, Permissão de Trabalho, treinamento 8h, cinto tipo paraquedista com duplo talabarte, pontos de ancoragem com resistência mínima 15kN.'
    if (ql.includes('nr 6') || ql.includes('epi')) return 'A <strong>NR 6</strong> regulamenta os EPIs. O empregador deve fornecer gratuitamente, adequados ao risco. Todo EPI deve ter CA do MTE. Exemplos: capacete, óculos, luvas, protetor auricular, cinto de segurança.'
    if (ql.includes('nr 5') || ql.includes('cipa')) return 'A <strong>NR 5</strong> regulamenta a CIPA. Obrigatória para empresas com mais de 20 empregados. Composição paritária, mandato 1 ano. Realiza mapas de risco, investiga acidentes.'
    if (ql.includes('nr 9') || ql.includes('ppra')) return 'A <strong>NR 9</strong> exige o PPRA. Deve abranger todos os trabalhadores, identificar e avaliar riscos, definir medidas de controle. Atualizado anualmente. Mantido por 20 anos.'
    if (ql.includes('certificado')) return 'Os certificados são emitidos pelo admin ou professor ao concluir o curso com nota mínima. Contém: nome, NR, carga horária, data e código de verificação único.'
    if (ql.includes('prova') || ql.includes('provas')) return 'As provas são enviadas em PDF pelo aluno e corrigidas pelo professor. Você pode enviar sua prova na aba "Minhas Provas".'
    return `Sobre "<strong>${q}</strong>": As NRs são extensas. Recomendo consultar o catálogo da plataforma. Tente perguntar sobre uma NR específica (ex: "NR 10", "EPI", "CIPA").`
}

window.sendIA = sendIA
