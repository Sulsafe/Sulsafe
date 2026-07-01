// ============================================================
// VIEW: MATERIAIS (com upload e organização por NR)
// ============================================================
// CORREÇÃO: imports da mesma pasta
import { S, isAdmin, isProf, uid, nav } from './state.js'
import { toast, handleError, sanitizar, NRS, $, $$ } from './utils.js'
import { sb, sbGetMateriais, sbCriarMaterial, sbUploadArquivo, STORAGE_BUCKET, sbGetAlunos, sbCriarNotificacao } from './supabase-client.js'

export function vMateriais() {
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Materiais de Apoio</h2><p class="wcs">Arquivos, apostilas e recursos complementares por NR.</p>`

    if (isAdmin() || isProf()) {
        h += `<div class="pnl" style="margin-bottom:24px; border:2px dashed var(--p);">
            <div class="pnl-h"><div class="pnl-t"><i class="fas fa-upload"></i> Subir novo material</div></div>
            <form id="frmAddMaterial" enctype="multipart/form-data" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="fld" style="grid-column: span 2;">
                    <label>NR</label>
                    <select id="addMatNR" required>
                        ${NRS.map(n => `<option value="${n.id}">NR ${n.id} — ${n.nm}</option>`).join('')}
                    </select>
                </div>
                <div class="fld">
                    <label>Título do material</label>
                    <input type="text" id="addMatTitulo" placeholder="Ex: Apostila NR 10" required>
                </div>
                <div class="fld">
                    <label>Tipo</label>
                    <select id="addMatTipo">
                        <option value="arquivo">Arquivo (PDF, DOC, etc.)</option>
                        <option value="link">Link externo</option>
                    </select>
                </div>
                <div class="fld" style="grid-column: span 2;">
                    <label>Arquivo (PDF, DOC, Imagem, etc.)</label>
                    <input type="file" id="addMatArquivo" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.xls,.xlsx,.txt">
                    <p style="font-size:11px;color:var(--tx3);margin-top:4px;">Máximo 20MB</p>
                </div>
                <div class="fld" style="grid-column: span 2;">
                    <label>Link externo (opcional se já enviou arquivo)</label>
                    <input type="url" id="addMatUrl" placeholder="https://drive.google.com/...">
                </div>
                <div class="fld" style="grid-column: span 2;">
                    <label>Descrição (opcional)</label>
                    <textarea id="addMatDesc" rows="2" placeholder="Descreva o material..."></textarea>
                </div>
                <button type="submit" class="btn btn-p" style="grid-column: span 2;">
                    <i class="fas fa-cloud-upload-alt"></i> Adicionar Material
                </button>
            </form>
        </div>`
    }

    h += `<div id="materiaisGrid"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando materiais...</p></div></div>`

    setTimeout(() => {
        const form = $('#frmAddMaterial')
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault()
                await adicionarMaterial()
            })
        }
        carregarMateriais()
    }, 100)

    return h
}

async function adicionarMaterial() {
    const nrId = $('#addMatNR').value
    const titulo = sanitizar($('#addMatTitulo').value.trim())
    const descricao = sanitizar($('#addMatDesc').value.trim())
    const tipo = $('#addMatTipo').value
    const arquivo = $('#addMatArquivo').files[0]
    const url = $('#addMatUrl').value.trim()

    if (!titulo) { toast('Título é obrigatório', 'err'); return }
    if (tipo === 'arquivo' && !arquivo) { toast('Selecione um arquivo', 'err'); return }
    if (tipo === 'link' && !url) { toast('Insira um link', 'err'); return }

    let urlFinal = url
    if (arquivo) {
        if (arquivo.size > 20 * 1024 * 1024) {
            toast('Arquivo muito grande (máx 20MB)', 'err')
            return
        const path = `materiais/${uid()}/${Date.now()}_${arquivo.name}`
        const { error: uploadError } = await sbUploadArquivo(STORAGE_BUCKET, path, arquivo)
        if (uploadError) { handleError(uploadError); return }
        const { data: urlData } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        urlFinal = urlData.publicUrl
    }

    const { data, error } = await sbCriarMaterial({
        nr_id: nrId,
        titulo,
        descricao,
        url: urlFinal,
        tipo: tipo,
        criado_por: uid()
    })

    if (error) { handleError(error); return }

    toast('Material adicionado com sucesso!', 'success')
    await enviarNotificacaoTodosAlunos(`Novo material disponível: "${titulo}" na NR ${nrId}`, 'materiais')

    $('#addMatTitulo').value = ''
    $('#addMatDesc').value = ''
    $('#addMatArquivo').value = ''
    $('#addMatUrl').value = ''
    carregarMateriais()
}

async function enviarNotificacaoTodosAlunos(mensagem, link) {
    const { data: alunos } = await sbGetAlunos()
    if (!alunos || alunos.length === 0) return
    for (const aluno of alunos) {
        await sbCriarNotificacao(aluno.id, 'Novo Material', mensagem, link)
    }
    if (S.user && (isAdmin() || isProf())) {
        await sbCriarNotificacao(S.user.id, 'Material adicionado', `Você adicionou: ${mensagem}`, link)
    }
}

export async function carregarMateriais() {
    const container = $('#materiaisGrid')
    if (!container) return

    const { data: materiais } = await sbGetMateriais()
    const materiaisPorNR = {}
    NRS.forEach(nr => { materiaisPorNR[nr.id] = [] })
    if (materiais) {
        materiais.forEach(m => {
            if (materiaisPorNR[m.nr_id]) materiaisPorNR[m.nr_id].push(m)
        })
    }

    let html = ''
    NRS.forEach(nr => {
        const items = materiaisPorNR[nr.id] || []
        html += `<div class="nr-c" style="flex-direction:column;align-items:stretch;gap:4px;cursor:default;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
                <div class="nr-ic"><i class="fas ${nr.ic}"></i></div>
                <div><div class="nr-num">NR ${nr.id}</div><div class="nr-nm">${nr.nm}</div></div>
                <span class="badge bg-info" style="margin-left:auto;">${items.length} materiais</span>
            </div>
            ${items.length === 0 ? `<p style="font-size:12px;color:var(--tx3);padding:4px 0;">Nenhum material disponível.</p>` : ''}
            ${items.map(m => `
                <div style="display:flex;align-items:center;gap:10px;padding:6px 8px;background:var(--ip);border-radius:8px;border:1px solid var(--bd);margin-top:4px;">
                    <i class="fas ${m.tipo === 'arquivo' ? 'fa-file' : 'fa-link'}" style="color:var(--p);"></i>
                    <span style="flex:1;font-size:13px;font-weight:500;">${m.titulo}</span>
                    <button class="btn btn-sm btn-p" onclick="estudarMaterial('${m.url}')">
                        <i class="fas fa-book-open"></i> Estudar
                    </button>
                </div>
            `).join('')}
        </div>`
    })
    container.innerHTML = html || `<div class="empty"><i class="fas fa-file-alt"></i><p>Nenhum material disponível ainda.</p></div>`
}

export function estudarMaterial(url) {
    window.open(url, '_blank')
}

window.estudarMaterial = estudarMaterial
