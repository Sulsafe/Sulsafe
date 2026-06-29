// ============================================================
// VIEW: PENDENTES (Admin)
// ============================================================
import { S, isAdmin, nav, fmtD } from './state.js'
import { sbGetPendentes, sbLiberarUsuario } from './supabase-client.js'
import { toast, handleError, $, $$ } from './utils.js'

export function vPendentes() {
    if (!isAdmin()) return window.nav('inicio')
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<div class="god-hd"><h2><i class="fas fa-user-clock"></i> Pendentes de Aprovação</h2>
        <p>Usuários aguardando liberação de acesso</p></div>`
    h += `<div id="listaPendentes"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
    setTimeout(carregarPendentes, 100)
    return h
}

async function carregarPendentes() {
    const container = document.getElementById('listaPendentes')
    if (!container) return
    
    if (!S.user || !isAdmin()) {
        container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--tx3)">Acesso negado.</p>`
        return
    }

    const { data: pendentes, error } = await sbGetPendentes()
    if (error) { handleError(error); return }
    
    const total = pendentes?.length || 0
    
    if (total === 0) {
        container.innerHTML = `
            <div class="pnl" style="text-align:center;padding:40px">
                <i class="fas fa-check-circle" style="font-size:48px;color:var(--p);margin-bottom:12px;display:block"></i>
                <h4 style="font-size:18px;font-weight:700">Ninguém na fila 🚀</h4>
                <p style="color:var(--tx3)">Todos os alunos já foram liberados.</p>
            </div>
        `
        return
    }

    let h = `<div class="pnl">
        <div class="pnl-h">
            <div class="pnl-t"><i class="fas fa-users"></i> ${total} usuário(s) aguardando</div>
            <span class="badge bg-pendente" style="font-size:14px;padding:6px 16px">${total} pendentes</span>
        </div>
        <div class="tw"><table><thead><tr><th>Nome</th><th>Email</th><th>Solicitado em</th><th>Ação</th></tr></thead><tbody>`
    pendentes.forEach(u => {
        h += `<tr id="pendente-${u.id}">
            <td><strong>${u.nome_completo}</strong></td>
            <td>${u.email}</td>
            <td>${fmtD(u.created_at)}</td>
            <td><button class="btn btn-sm btn-p" onclick="liberarUsuario('${u.id}')"><i class="fas fa-check"></i> Liberar</button></td>
        </tr>`
    })
    h += `</tbody></table></div></div>`
    container.innerHTML = h
}

async function liberarUsuario(id) {
    const { data, error } = await sbLiberarUsuario(id)
    if (error) { handleError(error); return }
    toast('Usuário liberado com sucesso!', 'success')
    const row = document.getElementById(`pendente-${id}`)
    if (row) row.remove()
    const totalEl = document.querySelector('.badge.bg-pendente')
    if (totalEl) {
        const current = parseInt(totalEl.textContent) - 1
        totalEl.textContent = current > 0 ? current + ' pendentes' : '0 pendentes'
    }
    const remaining = document.querySelectorAll('#listaPendentes tbody tr').length
    if (remaining === 0) carregarPendentes()
}

window.liberarUsuario = liberarUsuario
