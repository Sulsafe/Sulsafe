// ============================================================
// VIEW: MATERIAIS (com upload, edição e exclusão)
// ============================================================
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

// ============================================================
// FUNÇÃO PARA ADICIONAR MATERIAL (CORRIGIDA)
// ============================================================
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
        }
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

// ============================================================
// FUNÇÃO PARA EDITAR MATERIAL (NOVA)
// ============================================================
window.editarMaterial = async function(id, tituloAtual, descricaoAtual, urlAtual, nrAtual) {
    console.log('✏️ Editando material:', id);
    
    // Criar modal de edição
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h2 style="color: #1f2937; margin-top: 0;">✏️ Editar Material</h2>
            <form id="formEditarMaterial">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #374151; margin-bottom: 5px;">NR</label>
                    <select id="editMatNR" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                        ${NRS.map(n => `<option value="${n.id}" ${n.id == nrAtual ? 'selected' : ''}>NR ${n.id} — ${n.nm}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #374151; margin-bottom: 5px;">Título</label>
                    <input type="text" id="editTitulo" value="${sanitizar(tituloAtual || '')}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #374151; margin-bottom: 5px;">Descrição</label>
                    <textarea id="editDescricao" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 80px;">${sanitizar(descricaoAtual || '')}</textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #374151; margin-bottom: 5px;">URL</label>
                    <input type="text" id="editUrl" value="${sanitizar(urlAtual || '')}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #374151; margin-bottom: 5px;">Tipo</label>
                    <select id="editTipo" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="arquivo">Arquivo</option>
                        <option value="link">Link</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('div[style]').remove()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        💾 Salvar
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Evento de submit
    document.getElementById('formEditarMaterial').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nr_id = document.getElementById('editMatNR').value;
        const titulo = document.getElementById('editTitulo').value.trim();
        const descricao = document.getElementById('editDescricao').value.trim();
        const url = document.getElementById('editUrl').value.trim();
        const tipo = document.getElementById('editTipo').value;
        
        if (!titulo) {
            alert('O título é obrigatório');
            return;
        }
        
        try {
            const { error } = await sb
                .from('materiais')
                .update({ 
                    nr_id,
                    titulo, 
                    descricao, 
                    url,
                    tipo,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) {
                console.error('❌ Erro ao atualizar:', error);
                alert('Erro ao atualizar: ' + error.message);
                return;
            }
            
            toast('Material atualizado com sucesso!', 'success');
            modal.remove();
            carregarMateriais();
            
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao atualizar: ' + error.message);
        }
    });
};

// ============================================================
// FUNÇÃO PARA EXCLUIR MATERIAL (NOVA)
// ============================================================
window.excluirMaterial = async function(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este material?')) {
        return;
    }
    
    try {
        const { error } = await sb
            .from('materiais')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('❌ Erro ao excluir:', error);
            toast('Erro ao excluir: ' + error.message, 'err');
            return;
        }
        
        toast('Material excluído com sucesso!', 'success');
        carregarMateriais();
        
    } catch (error) {
        console.error('❌ Erro:', error);
        toast('Erro ao excluir: ' + error.message, 'err');
    }
};

// ============================================================
// FUNÇÃO PARA ENVIAR NOTIFICAÇÃO
// ============================================================
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

// ============================================================
// FUNÇÃO PARA CARREGAR MATERIAIS (COM BOTÕES DE AÇÃO)
// ============================================================
export async function carregarMateriais() {
    const container = $('#materiaisGrid')
    if (!container) return

    const { data: materiais, error } = await sbGetMateriais()
    if (error) { 
        console.error(error); 
        container.innerHTML = `<div class="empty"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar materiais</p></div>`; 
        return 
    }

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
                <div style="display:flex;align-items:center;gap:10px;padding:6px 8px;background:var(--ip);border-radius:8px;border:1px solid var(--bd);margin-top:4px;flex-wrap:wrap;">
                    <i class="fas ${m.tipo === 'arquivo' ? 'fa-file' : 'fa-link'}" style="color:var(--p);"></i>
                    <span style="flex:1;font-size:13px;font-weight:500;">${m.titulo}</span>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-sm btn-p" onclick="estudarMaterial('${m.url}')">
                            <i class="fas fa-book-open"></i> Estudar
                        </button>
                        ${(isAdmin() || isProf()) ? `
                            <button class="btn btn-sm btn-warning" onclick="editarMaterial('${m.id}', '${m.titulo}', '${m.descricao || ''}', '${m.url || ''}', '${m.nr_id}')" style="background:#f59e0b;color:white;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="excluirMaterial('${m.id}')" style="background:#ef4444;color:white;">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>`
    })
    container.innerHTML = html || `<div class="empty"><i class="fas fa-file-alt"></i><p>Nenhum material disponível ainda.</p></div>`
}

// ============================================================
// FUNÇÃO PARA ESTUDAR MATERIAL (CORRIGIDA)
// ============================================================
export function estudarMaterial(url) {
    if (!url || url === 'null' || url === 'undefined') { 
        toast('Material sem link válido', 'err'); 
        return 
    }
    window.open(url, '_blank')
}

// ============================================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================================
window.estudarMaterial = estudarMaterial
window.carregarMateriais = carregarMateriais
window.editarMaterial = window.editarMaterial
window.excluirMaterial = window.excluirMaterial

console.log('✅ Materiais.js carregado com sucesso!')
console.log('📌 Funções disponíveis: editarMaterial(), excluirMaterial()')
