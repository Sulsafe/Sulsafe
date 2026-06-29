// ============================================================
// APP - FUNÇÕES PRINCIPAIS (SIDEBAR, RENDER, ENTER DASH, NOTIFS)
// ============================================================
import { S, role, isAdmin, isProf, uid, fmtD, nav, registerView, loadCfg } from './state.js'
import { sb } from './supabase-client.js'
import { sbCriarNotificacao } from './supabase-client.js'
import { toast, $, $$, NRS } from './utils.js'
import { vInicio } from './views/inicio.js'
import { vVideoaulas } from './views/videoaulas.js'
import { vMateriais } from './views/materiais.js'
import { vSalas } from './views/salas.js'
import { vNRs } from './views/nrs.js'
import { vIA } from './views/ia.js'
import { vBoletim } from './views/boletim.js'
import { vProvas } from './views/provas.js'
import { vCerts } from './views/certificados.js'
import { vAdmin } from './views/admin.js'
import { vConfig } from './views/config.js'
import { vPendentes } from './views/pendentes.js'

// Registrar todas as views
registerView('inicio', vInicio)
registerView('videoaulas', vVideoaulas)
registerView('materiais', vMateriais)
registerView('salas', vSalas)
registerView('nrs', vNRs)
registerView('ia', vIA)
registerView('boletim', vBoletim)
registerView('provas', vProvas)
registerView('certificados', vCerts)
registerView('admin', vAdmin)
registerView('config', vConfig)
registerView('pendentes', vPendentes)

// (view 'subir' removida)

// ============================================================
// RENDER SIDEBAR
// ============================================================
export function renderSB() {
    const r = role()
    const items = [
        { id: 'inicio', ic: 'fa-house', lb: 'Início' },
        { id: 'videoaulas', ic: 'fa-play-circle', lb: 'Videoaulas' },
        { id: 'materiais', ic: 'fa-file-alt', lb: 'Materiais' },
        { id: 'salas', ic: 'fa-tower-broadcast', lb: 'Salas ao Vivo' },
        { id: 'nrs', ic: 'fa-book', lb: 'NRs' },
        { id: 'ia', ic: 'fa-robot', lb: 'Assistente IA' }
    ]
    if (r === 'aluno') {
        items.push({ sep: 'ACADÊMICO' })
        items.push({ id: 'boletim', ic: 'fa-file-lines', lb: 'Meu Boletim' })
        items.push({ id: 'provas', ic: 'fa-file-pdf', lb: 'Minhas Provas' })
        items.push({ sep: 'DOCUMENTOS' })
        items.push({ id: 'certificados', ic: 'fa-certificate', lb: 'Certificados' })
    }
    if (r === 'professor') {
        items.push({ sep: 'ACADÊMICO' })
        items.push({ id: 'boletim', ic: 'fa-file-pen', lb: 'Lançar Notas' })
        items.push({ sep: 'GESTÃO' })
        items.push({ id: 'provas', ic: 'fa-file-pdf', lb: 'Corrigir Provas' })
        items.push({ sep: 'DOCUMENTOS' })
        items.push({ id: 'certificados', ic: 'fa-certificate', lb: 'Certificados' })
    }
    if (r === 'admin') {
        items.push({ sep: 'GESTÃO' })
        items.push({ id: 'pendentes', ic: 'fa-user-clock', lb: 'Pendentes' })
        items.push({ sep: 'ACADÊMICO' })
        items.push({ id: 'boletim', ic: 'fa-file-pen', lb: 'Notas' })
        items.push({ id: 'provas', ic: 'fa-file-pdf', lb: 'Corrigir Provas' })
        items.push({ sep: 'DOCUMENTOS' })
        items.push({ id: 'certificados', ic: 'fa-certificate', lb: 'Certificados' })
        items.push({ sep: 'SISTEMA' })
        items.push({ id: 'admin', ic: 'fa-shield-halved', lb: 'Modo Deus' })
        // item 'subir' removido intencionalmente
    }
    items.push({ sep: 'CONTA' })
    items.push({ id: 'config', ic: 'fa-gear', lb: 'Configurações' })

    let h = `<div class="sb-hd"><div class="lic">SS</div><div class="lt">SulSafe</div></div>`
    h += `<div class="sb-role ${r}"><i class="fas fa-${r === 'admin' ? 'crown' : r === 'professor' ? 'chalkboard-user' : 'user-graduate'}"></i> <span>${r}</span></div>`
    h += `<nav class="sb-nav">`
    items.forEach(i => {
        if (i.sep) h += `<div class="sb-lbl">${i.sep}</div>`
        else h += `<div class="ni${S.view === i.id ? ' on' : ''}" onclick="window.nav('${i.id}')"><i class="fas ${i.ic}"></i><span>${i.lb}</span></div>`
    })
    h += `</nav><div class="sb-ft"><span class="sb-name">${S.user?.nome_completo || ''}</span><div class="sb-out" onclick="window.logout()" title="Sair"><i class="fas fa-right-from-bracket"></i></div></div>`
    document.getElementById('sidebar').innerHTML = h
}

// ============================================================
// RENDER VIEW
// ============================================================
export function renderV() {
    const mc = document.getElementById('mc')
    if (!mc) return
    // A navegação já é feita pelo state.js, apenas garantimos que a view seja renderizada.
    // O state.js chama a função registrada, que atualiza o mc.
    // Esta função é chamada após a navegação para triggers adicionais.
    bindPostRender()
}

// ============================================================
// ENTER DASHBOARD
// ============================================================
export function enterDash() {
    document.getElementById('authWrap').classList.add('off')
    document.getElementById('dash').classList.add('on')
    S.view = 'inicio'
    renderSB()
    // A primeira view é renderizada pelo state.js via nav('inicio')
    window.nav('inicio')
    checkNotifs()
}

// ============================================================
// NOTIFICAÇÕES
// ============================================================
export async function checkNotifs() {
    if (!S.user) return
    try {
        const { data } = await sb.from('notificacoes')
            .select('*')
            .eq('usuario_id', S.user.id)
            .eq('lida', false)
            .order('criado_em', { ascending: false })
            .limit(1)
        if (data && data.length > 0) {
            const last = data[0]
            if (Date.now() - new Date(last.criado_em).getTime() < 60000) {
                showNotifPopup({ msg: last.mensagem, view: last.link })
            }
        }
    } catch (e) {}
}

export function showNotifPopup(n) {
    document.getElementById('notifBody').innerHTML = `<p>${n.msg}</p><p style="font-size:11px;color:var(--tx3);margin-top:6px">${fmtD(Date.now())}</p>`
    document.getElementById('notifAction').onclick = () => { closeNotif(); if (n.view) window.nav(n.view) }
    document.getElementById('notifPopup').classList.add('show')
    setTimeout(closeNotif, 8000)
}

function closeNotif() {
    document.getElementById('notifPopup').classList.remove('show')
}
window.closeNotif = closeNotif

// ============================================================
// BIND POST RENDER (gráficos, etc)
// ============================================================
export function bindPostRender() {
    if (S.view === 'boletim' && role() !== 'aluno') setTimeout(drawChartNotas, 100)
    if (S.view === 'admin') setTimeout(drawChartAdmin, 100)
    if (S.view === 'pendentes') setTimeout(carregarPendentes, 100)
    if (S.view === 'provas') setTimeout(carregarProvas, 100)
}

// Funções auxiliares (serão substituídas quando importarmos de views)
let drawChartNotas, drawChartAdmin, carregarPendentes, carregarProvas
export function setBindFunctions(fns) {
    drawChartNotas = fns.drawChartNotas
    drawChartAdmin = fns.drawChartAdmin
    carregarPendentes = fns.carregarPendentes
    carregarProvas = fns.carregarProvas
}

// Expor funções globais para onclick
window.nav = nav
window.logout = logout
