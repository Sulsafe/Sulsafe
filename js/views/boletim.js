// ============================================================
// VIEW: BOLETIM (Aluno / Professor)
// ============================================================
import { S, role, uid, nav, fmtD } from '../state.js'
import { sbGetNotasAluno, sbLancarNota, sbGetAlunos, sbGetMediasNRs } from './supabase-client.js'
import { toast, handleError, sanitizar, openMdl, closeMdl, $, $$, NRS } from './utils.js'

export function vBoletim() {
    const r = role()
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">${r === 'aluno' ? 'Meu Boletim' : 'Gerenciar Notas'}</h2>`
    h += `<p class="wcs">${r === 'aluno' ? 'Acompanhe suas notas e progresso.' : 'Lance notas e observações dos alunos.'}</p>`
    
    if (r === 'aluno') {
        h += `<div id="boletimAluno"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
        setTimeout(carregarBoletimAluno, 200)
    } else {
        h += `<div id="boletimProfessor"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando alunos...</p></div></div>`
        setTimeout(carregarBoletimProfessor, 200)
    }
    return h
}

async function carregarBoletimAluno() {
    const container = document.getElementById('boletimAluno')
    if (!container) return
    const { data: notas } = await sbGetNotasAluno(uid())
    
    if (!notas || notas.length === 0) {
        container.innerHTML = `<div class="empty"><i class="fas fa-file-lines"></i><p>Nenhuma nota lançada ainda.</p></div>`
        return
    }
    
    const media = notas.reduce((a, n) => a + Number(n.nota || 0), 0) / notas.length
    let h = `<div class="stats">${stC(media.toFixed(1), 'Média Geral', 'fa-chart-line')}${stC(notas.length, 'NRs Avaliadas', 'fa-list')}</div>`
    h += `<div class="tw"><table><thead><tr><th>NR</th><th>Nota</th><th>Observação</th><th>Data</th></tr></thead><tbody>`
    notas.forEach(n => { const cor = Number(n.nota) >= 7 ? 'bg-ok' : Number(n.nota) >= 5 ? 'bg-warn' : 'bg-err'; h += `<tr><td><strong>NR ${n.nr_id}</strong></td><td><span class="badge ${cor}">${n.nota ?? '—'}</span></td><td>${n.obs || '—'}</td><td>${fmtD(n.criado_em)}</td></tr>` })
    h += `</tbody></table></div>`
    h += `<div class="ch-b"><h3><i class="fas fa-chart-bar"></i> Minhas Notas por NR</h3><canvas id="chartBoletimAluno" height="200"></canvas></div>`
    container.innerHTML = h
    setTimeout(drawChartAluno, 100)
}

async function carregarBoletimProfessor() {
    const container = document.getElementById('boletimProfessor')
    if (!container) return
    const { data: alunos } = await sbGetAlunos()
    
    let h = `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-filter"></i> Selecionar Aluno</div><button class="btn btn-p btn-sm" onclick="modalNota()"><i class="fas fa-plus"></i> Lançar Nota</button></div><select id="selAlunoN" class="search" style="margin:0;border-radius:var(--r)" onchange="renderNotasAl()"><option value="">Selecione um aluno...</option>${alunos.map(a => `<option value="${a.id}">${a.nome_completo} (${a.email})</option>`).join('')}</select></div><div id="notasAlC"></div>`
    h += `<div class="ch-g"><div class="ch-b"><h3><i class="fas fa-chart-bar"></i> Média de Notas por NR</h3><canvas id="chartMediasNR" height="200"></canvas></div></div>`
    container.innerHTML = h
    setTimeout(drawChartNotas, 100)
}

async function renderNotasAl() {
    const aid = $('#selAlunoN')?.value
    const c = $('#notasAlC')
    if (!aid || !c) return
    const { data: notas } = await sbGetNotasAluno(aid)
    const { data: alunos } = await sbGetAlunos()
    const al = alunos.find(u => u.id === aid)
    
    let h = `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-user-graduate"></i> ${al?.nome_completo || 'Aluno'}</div><button class="btn btn-p btn-sm" onclick="modalNota('${aid}')"><i class="fas fa-plus"></i> Lançar</button></div>`
    if (!notas || notas.length === 0) {
        h += `<div class="empty" style="padding:30px"><p>Nenhuma nota lançada.</p></div>`
    } else {
        h += `<div class="tw"><table><thead><tr><th>NR</th><th>Nota</th><th>Obs</th><th>Data</th><th>Ações</th></tr></thead><tbody>`
        notas.forEach(n => { const cor = Number(n.nota) >= 7 ? 'bg-ok' : Number(n.nota) >= 5 ? 'bg-warn' : 'bg-err'; h += `<tr><td>NR ${n.nr_id}</td><td><span class="badge ${cor}">${n.nota}</span></td><td>${n.obs || '—'}</td><td>${fmtD(n.criado_em)}</td><td><button class="btn btn-sm btn-s" onclick="modalNota('${aid}','${n.id}')"><i class="fas fa-pen"></i></button> <button class="btn btn-sm btn-d" onclick="delNota('${n.id}','${aid}')"><i class="fas fa-trash"></i></button></td></tr>` })
        h += `</tbody></table></div>`
    }
    h += `</div>`
    c.innerHTML = h
}

async function modalNota(aid, notaIdEdit) {
    const alunos = (await sbGetAlunos()).data || []
    const opts = NRS.map(n => `<option value="${n.id}">NR ${n.id} — ${n.nm}</option>`).join('')
    let nota = null
    if (notaIdEdit) {
        const { data: notas } = await sbGetNotasAluno(aid)
        nota = notas?.find(n => n.id === notaIdEdit)
    }
    
    openMdl(`<button class="mdl-x" onclick="window.closeMdl()"><i class="fas fa-times"></i></button>
        <h2 style="font-size:18px;font-weight:700;color:var(--p);margin-bottom:16px">${nota ? 'Editar' : 'Lançar'} Nota</h2>
        <form onsubmit="saveNota(event, '${aid || ''}', '${notaIdEdit || ''}')">
            <div class="fld"><label>Aluno</label>
                <select id="nAluno" required>${alunos.map(a => `<option value="${a.id}" ${a.id === aid ? 'selected' : ''}>${a.nome_completo}</option>`).join('')}</select>
            </div>
            <div class="fld"><label>NR</label><select id="nNR" required>${opts}</select></div>
            <div class="fld"><label>Nota (0 a 10)</label><input type="number" id="nVal" min="0" max="10" step="0.1" value="${nota?.nota || ''}" required></div>
            <div class="fld"><label>Observação</label><textarea id="nObs" rows="3" style="width:100%;background:var(--ip);border:1px solid var(--bd);border-radius:var(--r);padding:10px;color:var(--tx);font-size:13px;resize:vertical">${nota?.obs || ''}</textarea></div>
            <button type="submit" class="btn btn-p btn-block"><i class="fas fa-save"></i> Salvar</button>
        </form>`)
}

async function saveNota(e, aid, notaIdEdit) {
    e.preventDefault()
    const alunoId = $('#nAluno').value
    const nrid = $('#nNR').value
    const nota = parseFloat($('#nVal').value)
    const obs = sanitizar($('#nObs').value.trim())
    
    if (isNaN(nota) || nota < 0 || nota > 10) {
        toast('Nota deve ser entre 0 e 10', 'err')
        return
    }
    
    if (notaIdEdit) {
        await sb.from('notas').update({ nota, obs }).eq('id', notaIdEdit)
        toast('Nota atualizada!', 'success')
    } else {
        await sbLancarNota(alunoId, nrid, nota, obs, uid())
        toast('Nota lançada!', 'success')
        pushNotif(`Nova nota lançada para NR ${nrid}: ${nota}/10`, 'Ver boletim', 'boletim')
    }
    window.closeMdl()
    renderNotasAl()
    carregarBoletimProfessor()
}

async function delNota(notaId, aid) {
    if (!confirm('Excluir esta nota?')) return
    await sb.from('notas').delete().eq('id', notaId)
    toast('Nota excluída', 'info')
    renderNotasAl()
}

async function drawChartAluno() {
    const cv = document.getElementById('chartBoletimAluno')
    if (!cv) return
    const { data: notas } = await sbGetNotasAluno(uid())
    if (window.charts && window.charts.aluno) try { window.charts.aluno.destroy() } catch (e) {}
    window.charts = window.charts || {}
    window.charts.aluno = new Chart(cv, { type: 'bar', data: { labels: notas.map(n => 'NR ' + n.nr_id), datasets: [{ label: 'Nota', data: notas.map(n => Number(n.nota || 0)), backgroundColor: notas.map(n => Number(n.nota) >= 7 ? 'rgba(46,125,50,.7)' : Number(n.nota) >= 5 ? 'rgba(255,152,0,.7)' : 'rgba(211,47,47,.7)'), borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } } } })
}

async function drawChartNotas() {
    const cv = document.getElementById('chartMediasNR')
    if (!cv) return
    const { data: medias } = await sbGetMediasNRs()
    if (window.charts && window.charts.notas) try { window.charts.notas.destroy() } catch (e) {}
    window.charts = window.charts || {}
    window.charts.notas = new Chart(cv, { type: 'bar', data: { labels: medias.map(m => 'NR ' + m.nr_id), datasets: [{ label: 'Média', data: medias.map(m => Number(m.media_nota || 0)), backgroundColor: 'rgba(46,125,50,.7)', borderRadius: 6 }] }, options: { responsive: true, scales: { y: { min: 0, max: 10 } } } })
}

function stC(v, l, ic) { return `<div class="st"><div class="st-v">${v}</div><div class="st-l"><i class="fas ${ic}" style="margin-right:4px"></i>${l}</div></div>` }

window.modalNota = modalNota
window.saveNota = saveNota
window.delNota = delNota
