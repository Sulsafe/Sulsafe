// ============================================================
// APP - FUNÇÕES PRINCIPAIS DO DASHBOARD
// ============================================================

import { S, nav } from './state.js'
import { $, $$ } from './utils.js'

export function renderSB() {
    const sidebar = document.getElementById('appSidebar')
    if (!sidebar) return
    const r = S.user?.role || 'aluno'
    let h = `<div class="sb-head">`
    h += `<div class="sb-avatar">${S.user?.nome_completo?.charAt(0) || 'U'}</div>`
    h += `<div class="sb-name">${S.user?.nome_completo || 'Usuário'}</div>`
    h += `<div class="sb-role">${r === 'admin' ? '👑 Admin' : r === 'professor' ? '👨‍🏫 Professor' : '🎓 Aluno'}</div>`
    h += `</div>`
    h += `<nav class="sb-nav">`
    
    const items = [
        { id: 'inicio', icon: 'fa-house', label: 'Início' },
        { id: 'videoaulas', icon: 'fa-play-circle', label: 'Videoaulas' },
        { id: 'materiais', icon: 'fa-file-alt', label: 'Materiais' },
        { id: 'salas', icon: 'fa-tower-broadcast', label: 'Salas ao Vivo' },
        { id: 'nrs', icon: 'fa-book', label: 'Catálogo NRs' },
        { id: 'ia', icon: 'fa-robot', label: 'Assistente IA' }
    ]
    
    if (r === 'aluno') {
        items.push({ id: 'boletim', icon: 'fa-file-lines', label: 'Meu Boletim' })
        items.push({ id: 'provas', icon: 'fa-file-pdf', label: 'Minhas Provas' })
        items.push({ id: 'certificados', icon: 'fa-certificate', label: 'Certificados' })
    }
    if (r === 'professor' || r === 'admin') {
        items.push({ id: 'boletim', icon: 'fa-file-pen', label: 'Lançar Notas' })
        items.push({ id: 'provas', icon: 'fa-file-pdf', label: 'Corrigir Provas' })
        items.push({ id: 'certificados', icon: 'fa-certificate', label: 'Emitir Certificados' })
    }
    if (r === 'admin') {
        items.push({ id: 'pendentes', icon: 'fa-user-clock', label: 'Pendentes' })
        items.push({ id: 'admin', icon: 'fa-shield-halved', label: 'Modo Deus' })
    }
    
    items.push({ id: 'config', icon: 'fa-gear', label: 'Configurações' })
    
    items.forEach(item => {
        const active = S.currentView === item.id ? 'active' : ''
        h += `<a href="#" class="sb-item ${active}" data-view="${item.id}" onclick="window.nav('${item.id}')"><i class="fas ${item.icon}"></i> ${item.label}</a>`
    })
    
    h += `</nav>`
    h += `<div class="sb-foot"><button class="btn btn-sm btn-outline" onclick="window.logout()"><i class="fas fa-sign-out-alt"></i> Sair</button></div>`
    
    sidebar.innerHTML = h
}

export function renderV(view) {
    const content = document.getElementById('appContent')
    if (!content) return
    const fn = S.views[view]
    if (fn) {
        content.innerHTML = fn()
    }
}

export function enterDash() {
    const authWrap = document.getElementById('authWrap')
    if (authWrap) authWrap.classList.add('off')
    const appWrap = document.getElementById('appWrap')
    if (appWrap) appWrap.classList.remove('off')
    if (S.sidebar) S.sidebar()
    renderV(S.currentView || 'inicio')
    checkNotifs()
}

export function checkNotifs() {
    // Verificar notificações pendentes
    // Implementar depois
}

// Tornar funções globais
window.enterDash = enterDash
window.renderSB = renderSB
window.renderV = renderV
window.checkNotifs = checkNotifs
