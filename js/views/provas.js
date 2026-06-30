// ============================================================
// VIEW: PROVAS (Aluno / Professor)
// ============================================================
// CORREÇÃO: imports com '../'
import { S, role, uid, nav, fmtD } from '../state.js'
import { sbEnviarProva, sbGetProvasPendentes, sbCorrigirProva, sbUploadArquivo, STORAGE_BUCKET } from '../supabase-client.js'
import { toast, handleError, sanitizar, openMdl, closeMdl, $, $$, NRS } from '../utils.js'

export function vProvas() {
    const r = role()
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">${r === 'aluno' ? 'Minhas Provas' : 'Corrigir Provas'}</h2>`
    
    if (r === 'aluno') {
        h += `<p class="wcs">Envie sua prova em PDF para correção.</p>`
        h += `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-upload"></i> Enviar Prova</div></div>
            <form id="frmEnviarProva" onsubmit="enviarProva(event)">
                <div class="fld"><label>NR</label>
                    <select id="pNR" required>${NRS.map(n => `<option value="${n.id}">NR ${n.id} — ${n.nm}</option>`).join('')}</select>
                </div>
                <div class="fld"><label>Título da Prova</label>
                    <input type="text" id="pTitulo" placeholder="Ex: Prova NR 10" required>
                </div>
                <div class="fld"><label>Arquivo PDF</label>
                    <input type="file" id="pArquivo" accept=".pdf" required>
                </div>
                <button type="submit" class="btn btn-p btn-block"><i class="fas fa-upload"></i> Enviar Prova</button>
            </form>
        </div>`
        h += `<div id="minhasProvas"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
        setTimeout(carregarMinhasProvas, 200)
    } else {
        h += `<p class="wcs">Corrija as provas enviadas pelos alunos.</p>`
        h += `<div id="provasPendentes"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
        setTimeout(carregarProvasPendentes, 200)
    }
    return h
}

async function enviarProva(e) {
    e.preventDefault()
    const nrId = $('#pNR').value
    const titulo = sanitizar($('#pTitulo').value.trim())
    const arquivo = $('#pArquivo').files[0]
    
    if (!arquivo) { toast('Selecione um arquivo PDF', 'err'); return }
    if (arquivo.type !== 'application/pdf') { toast('Formato inválido. Envie um PDF.', 'err'); return }
    if (arquivo.size > 5 * 1024 * 1024) { toast('Arquivo muito grande. Máximo 5MB.', 'err'); return }
    
    try {
        const path = `provas/${uid()}/${Date.now()}_${arquivo.name}`
        const { data: uploadData, error: uploadError } = await sbUploadArquivo(STORAGE_BUCKET, path, arquivo)
        if (uploadError) throw uploadError
        
        const { data, error } = await sbEnviarProva(uid(), nrId, titulo, uploadData.publicUrl)
        if (error) throw error
        
        toast('Prova enviada com sucesso! Aguarde correção.', 'success')
        $('#pTitulo').value = ''
        $('#pArquivo').value = ''
        carregarMinhasProvas()
    } catch (error) {
        handleError(error)
    }
}

async function carregarMinhasProvas() {
    const container = document.getElementById('minhasProvas')
    if (!container) return
    const { data: provas } = await sbGetProvasAluno(uid())
    
    if (!provas || provas.length === 0) {
        container.innerHTML = `<div class="empty"><i class="fas fa-file-pdf"></i><p>Nenhuma prova enviada.</p></div>`
        return
    }
    
    let h = `<div class="tw"><table><thead><tr><th>NR</th><th>Título</th><th>Status</th><th>Nota</th><th>Data</th></tr></thead><tbody>`
    provas.forEach(p => {
        const statusCor = p.status === 'corrigido' ? 'bg-ok' : p.status === 'reprovado' ? 'bg-err' : 'bg-pendente'
        h += `<tr><td>NR ${p.nr_id}</td><td>${p.titulo}</td><td><span class="badge ${statusCor}">${p.status}</span></td><td>${p.nota ?? '—'}</td><td>${fmtD(p.criado_em)}</td></tr>`
    })
    h += `</tbody></table></div>`
    container.innerHTML = h
}

async function carregarProvasPendentes() {
    const container = document.getElementById('provasPendentes')
    if (!container) return
    const { data: provas } = await sbGetProvasPendentes()
    
    if (!provas || provas.length === 0) {
        container.innerHTML = `<div class="empty"><i class="fas fa-check-circle"></i><p>Todas as provas corrigidas!</p></div>`
        return
    }
    
    let h = `<div class="tw"><table><thead><tr><th>Aluno</th><th>NR</th><th>Título</th><th>Ações</th></tr></thead><tbody>`
    provas.forEach(p => {
        h += `<tr>
            <td>${p.profiles?.nome_completo || '—'}</td>
            <td>NR ${p.nr_id}</td>
            <td>${p.titulo}</td>
            <td>
                <button class="btn btn-sm btn-p" onclick="abrirCorrecao('${p.id}')"><i class="fas fa-check"></i> Corrigir</button>
            </td>
        </tr>`
    })
    h += `</tbody></table></div>`
    container.innerHTML = h
}

function abrirCorrecao(provaId) {
    openMdl(`<button class="mdl-x" onclick="window.closeMdl()"><i class="fas fa-times"></i></button>
        <h2 style="font-size:18px;font-weight:700;color:var(--p);margin-bottom:16px">Corrigir Prova</h2>
        <div class="fld"><label>Nota (0 a 10)</label>
            <input type="number" id="corrNota" min="0" max="10" step="0.1" required>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn btn-p" onclick="finalizarCorrecao('${provaId}','aprovado')"><i class="fas fa-check"></i> Aprovar</button>
            <button class="btn btn-d" onclick="finalizarCorrecao('${provaId}','reprovado')"><i class="fas fa-times"></i> Reprovar</button>
        </div>
    `)
}

async function finalizarCorrecao(provaId, status) {
    const nota = parseFloat($('#corrNota').value)
    if (isNaN(nota) || nota < 0 || nota > 10) { toast('Nota inválida (0-10)', 'err'); return }
    
    const statusFinal = status === 'aprovado' ? 'corrigido' : 'reprovado'
    const { error } = await sbCorrigirProva(provaId, nota, statusFinal)
    if (error) { handleError(error); return }
    
    toast('Prova corrigida! Nota: ' + nota, 'success')
    window.closeMdl()
    carregarProvasPendentes()
}

window.enviarProva = enviarProva
window.abrirCorrecao = abrirCorrecao
window.finalizarCorrecao = finalizarCorrecao
