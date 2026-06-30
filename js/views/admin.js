// ============================================================
// VIEW: ADMIN (MODO DEUS) - VERSÃO SIMPLIFICADA PARA TESTE
// ============================================================
import { S, isAdmin, uid, nav, fmtD } from '../state.js'
import { sb, sbGetDashboardMetrics, sbGetAllUsers, sbGetRankingAlunos, sbUpdateUser, sbLiberarUsuario } from '../supabase-client.js'
import { toast, handleError, openMdl, close, $, $$ } from '../utils.js'

export function vAdmin() {
    if (!isAdmin()) return nav('inicio')
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<div class="god-hd"><h2><i class="fas fa-shield-halved"></i> Modo Deus</h2><p>Controle total — ${S.user.email}</p></div>`
    h += `<div id="adminStats"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando dados...</p></div></div>`
    h += `<div id="adminUsers"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando usuários...</p></div></div>`
    h += `<div class="pnl" style="border:2px solid #D32F2F"><div class="pnl-h"><div class="pnl-t" style="color:#D32F2F"><i class="fas fa-skull-crossbones"></i> Zona de Perigo</div></div><p style="font-size:13px;color:var(--tx2);margin-bottom:14px">Apaga <strong>TODOS</strong> os dados da plataforma.</p><button class="btn btn-d" onclick="modalApagarTudo()"><i class="fas fa-bomb"></i> APAGAR TUDO</button></div>`
    
    setTimeout(carregarAdminData, 200)
    return h
}

async function carregarAdminData() {
    const { data: metrics } = await sbGetDashboardMetrics()
    const { data: users } = await sbGetAllUsers()
    const { data: ranking } = await sbGetRankingAlunos()
    const statsDiv = $('#adminStats')
    if (statsDiv && metrics) {
        statsDiv.innerHTML = `
            <div class="stats">
                ${stC(metrics.total_usuarios || 0, 'Usuários', 'fa-users')}
                ${stC(metrics.total_alunos || 0, 'Alunos', 'fa-user-graduate')}
                ${stC(metrics.total_professores || 0, 'Professores', 'fa-chalkboard-user')}
                ${stC(metrics.pendentes || 0, 'Pendentes', 'fa-user-clock')}
                ${stC(metrics.provas_pendentes || 0, 'Provas Pendentes', 'fa-file-pdf')}
                ${stC(metrics.total_concluidas || 0, 'Aulas Concluídas', 'fa-check-circle')}
            </div>
        `
    }
    
    const usersDiv = $('#adminUsers')
    if (usersDiv && users) {
        let h = `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-users-gear"></i> Gerenciar Usuários (${users.length})</div></div><input class="search" placeholder="Buscar usuário..." oninput="filterU(this.value)"><div class="tw" style="margin-top:14px"><table><thead><tr><th>Nome</th><th>Email</th><th>Role</th><th>Status</th><th>Ações</th></tr></thead><tbody id="uTB">`
        users.forEach(u => {
            const rc = u.role === 'admin' ? 'bg-warn' : u.role === 'professor' ? 'bg-ok' : 'bg-info'
            const st = u.status === 'ativo' ? 'bg-ok' : u.status === 'pendente' ? 'bg-pendente' : 'bg-err'
            h += `<tr data-un="${u.nome_completo.toLowerCase()} ${u.email.toLowerCase()}">
                <td><strong>${u.nome_completo}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${rc}">${u.role}</span></td>
                <td><span class="badge ${st}">${u.status || 'pendente'}</span></td>
                <td>${u.email !== 'sulsafetreinamentos@gmail.com' ? `
                    <select onchange="changeRole('${u.id}',this.value)" style="background:var(--ip);border:1px solid var(--bd);border-radius:8px;padding:4px 8px;font-size:12px;color:var(--tx)">
                        <option value="aluno" ${u.role === 'aluno' ? 'selected' : ''}>Aluno</option>
                        <option value="professor" ${u.role === 'professor' ? 'selected' : ''}>Professor</option>
                    </select>
                    ${u.status === 'pendente' ? `<button class="btn btn-sm btn-p" onclick="liberarUsuario('${u.id}')"><i class="fas fa-check"></i></button>` : ''}
                ` : '<span style="font-size:11px;color:var(--tx3)">Protegido</span>'}</td>
            </tr>`
        })
        h += `</tbody></table></div></div>`
        usersDiv.innerHTML = h
    }
}

function filterU(q) { q = q.toLowerCase(); $$('#uTB tr').forEach(r => { r.style.display = r.dataset.un.includes(q) ? '' : 'none' }) }

async function changeRole(id, role) {
    await sbUpdateUser(id, { role: role })
    toast('Role alterado para ' + role, 'success')
    carregarAdminData()
}

function modalApagarTudo() {
   openMdl(`<button class="mdl-x" onclick="close()"><i class="fas fa-times"></i></button>...`)

async function execApagar() {
    if ($('#cfmApagar')?.value?.trim() !== 'APAGAR') { toast('Digite "APAGAR" para confirmar', 'err'); return }
    await sb.from('salas').delete().neq('id', '')
    await sb.from('notas').delete().neq('id', '')
    await sb.from('provas').delete().neq('id', '')
    await sb.from('certificados').delete().neq('id', '')
    await sb.from('progresso_aulas').delete().neq('id', '')
    await sb.from('videoaulas').delete().neq('id', '')
    await sb.from('materiais').delete().neq('id', '')
    close()
    toast('TODOS os dados foram apagados!', 'warn')
    carregarAdminData()
}

function stC(v, l, ic) { return `<div class="st"><div class="st-v">${v}</div><div class="st-l"><i class="fas ${ic}" style="margin-right:4px"></i>${l}</div></div>` }

window.changeRole = changeRole
window.liberarUsuario = async function(id) {
    const { data, error } = await sbLiberarUsuario(id)
    if (error) { handleError(error); return }
    toast('Usuário liberado com sucesso!', 'success')
    carregarAdminData()
}
window.modalApagarTudo = modalApagarTudo
window.execApagar = execApagar
