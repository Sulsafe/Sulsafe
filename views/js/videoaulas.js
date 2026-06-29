// ============================================================
// VIEW: VIDEOAULAS (com modal interno e temporizador)
// ============================================================
import { S, role, isAdmin, isProf, uid, nav, toast, handleError, sanitizar, NRS, $, $$ } from '../utils.js'
import { sbGetVideoaulas, sbCriarVideoaula, sbGetProgressoUsuario, sbSalvarProgresso } from '../supabase-client.js'

// ============================================================
// VARIÁVEIS PARA CONTROLE DO MODAL DE VÍDEO
// ============================================================
let videoAtual = null
let videoTimer = null
let tempoAssistido = 0
let videoConcluido = false

// ============================================================
// RENDERIZAÇÃO DA VIEW
// ============================================================
export function vVideoaulas() {
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Videoaulas</h2><p class="wcs">Assista as aulas das 38 NRs no seu ritmo.</p>`

    // Admin/Professor: formulário para adicionar vídeo (integrado)
    if (isAdmin() || isProf()) {
        h += `<div class="pnl" style="margin-bottom:20px; border:2px dashed var(--p);">
            <div class="pnl-h"><div class="pnl-t"><i class="fas fa-video"></i> Adicionar Videoaula</div></div>
            <form id="frmAddVideo" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="fld" style="grid-column: span 2;">
                    <label>NR</label>
                    <select id="addVideoNR" required>
                        ${NRS.map(n => `<option value="${n.id}">NR ${n.id} — ${n.nm}</option>`).join('')}
                    </select>
                </div>
                <div class="fld">
                    <label>Título da Aula</label>
                    <input type="text" id="addVideoTitulo" placeholder="Ex: Aula Completa NR 10" required>
                </div>
                <div class="fld">
                    <label>Duração (segundos)</label>
                    <input type="number" id="addVideoDuracao" placeholder="Ex: 360" value="300" min="1">
                </div>
                <div class="fld" style="grid-column: span 2;">
                    <label>Link do YouTube (embed)</label>
                    <input type="url" id="addVideoUrl" placeholder="https://www.youtube.com/embed/VIDEO_ID" required>
                </div>
                <div class="fld" style="grid-column: span 2;">
                    <label>Descrição</label>
                    <textarea id="addVideoDesc" rows="2" placeholder="Descrição da aula..."></textarea>
                </div>
                <button type="submit" class="btn btn-p" style="grid-column: span 2;">
                    <i class="fas fa-plus"></i> Adicionar Videoaula
                </button>
            </form>
        </div>`
    }

    // Progresso
    h += `<div id="progressoVideoaulas" class="prog-w">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-weight:600;font-size:13px">Seu Progresso</span>
            <span style="font-weight:800;color:var(--p)">0%</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" style="width:0%"></div></div>
    </div>`
    h += `<input class="search" placeholder="Buscar NR..." oninput="filterVA(this.value)">`
    h += `<div class="nr-g" id="vaGrid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));"></div>`

    // Configurar evento do formulário
    setTimeout(() => {
        const form = document.getElementById('frmAddVideo')
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault()
                const nrId = document.getElementById('addVideoNR').value
                const titulo = sanitizar(document.getElementById('addVideoTitulo').value.trim())
                const descricao = sanitizar(document.getElementById('addVideoDesc').value.trim())
                const url = document.getElementById('addVideoUrl').value.trim()
                const duracao = parseInt(document.getElementById('addVideoDuracao').value) || 300
                if (!titulo || !url) { toast('Preencha título e link', 'err'); return }
                if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                    toast('Insira um link válido do YouTube', 'err')
                    return
                }
                const { data, error } = await sbCriarVideoaula({
                    nr_id: nrId,
                    titulo,
                    descricao,
                    url_video: url,
                    duracao,
                    ordem: 0,
                    criado_por: uid()
                })
                if (error) { handleError(error); return }
                toast('Videoaula adicionada!', 'success')
                document.getElementById('addVideoTitulo').value = ''
                document.getElementById('addVideoDesc').value = ''
                document.getElementById('addVideoUrl').value = ''
                document.getElementById('addVideoDuracao').value = '300'
                carregarListaVideoaulas()
            })
        }
        carregarListaVideoaulas()
    }, 100)

    return h
}

// ============================================================
// CARREGAR LISTA DE VIDEOAULAS COM BOTÃO "ASSISTIR"
// ============================================================
export async function carregarListaVideoaulas() {
    const grid = document.getElementById('vaGrid')
    if (!grid) return
    const { data: videoaulas } = await sbGetVideoaulas()
    const { data: progressos } = await sbGetProgressoUsuario(S.user?.id)
    const concluidos = progressos?.filter(p => p.concluído === true).map(p => p.aula_id) || []

    let html = ''
    NRS.forEach(nr => {
        const vids = videoaulas?.filter(v => v.nr_id === nr.id) || []
        const anyConcluida = vids.some(v => concluidos.includes(v.id))

        html += `<div class="nr-c" data-s="${nr.nm.toLowerCase()} ${nr.id}" style="flex-direction:column;align-items:stretch;gap:0">
            <div style="display:flex;align-items:center;gap:12px;padding:14px">
                <div class="nr-ic"><i class="fas ${nr.ic}"></i></div>
                <div><div class="nr-num">NR ${nr.id}</div><div class="nr-nm">${nr.nm}</div></div>
                <span class="badge bg-ok" style="${anyConcluida ? '' : 'display:none'}">Concluída</span>
            </div>
            <div style="padding:8px 14px;border-top:1px solid var(--bd2);display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end">
                ${vids.map(v => `
                    <button class="btn btn-sm btn-p" onclick="abrirVideoModal({
                        id: '${v.id}',
                        titulo: '${v.titulo.replace(/'/g, "\\'")}',
                        url_video: '${v.url_video}',
                        duracao: ${v.duracao || 300},
                        nr_id: '${v.nr_id}'
                    })">
                        <i class="fas fa-play"></i> Assistir
                    </button>
                `).join('')}
                ${role() === 'aluno' ? `
                    <button class="btn btn-sm ${anyConcluida ? 'btn-p' : 'btn-s'}" onclick="toggleAulaSupabase('${nr.id}', this)">
                        ${anyConcluida ? '<i class="fas fa-check"></i> Concluída' : 'Marcar como concluída'}
                    </button>
                ` : ''}
            </div>
        </div>`
    })
    grid.innerHTML = html

    // Atualizar progresso geral
    const total = NRS.length
    const concluidas = videoaulas?.filter(v => concluidos.includes(v.id)).length || 0
    const pct = total ? Math.round(concluidas / total * 100) : 0
    const progDiv = document.getElementById('progressoVideoaulas')
    if (progDiv) {
        progDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-weight:600;font-size:13px">Seu Progresso</span>
                <span style="font-weight:800;color:var(--p)">${pct}%</span>
            </div>
            <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
            <p style="font-size:11px;color:var(--tx3);margin-top:6px">${concluidas} de ${total} NRs concluídas</p>
        `
    }
}

// ============================================================
// FILTRO
// ============================================================
export function filterVA(q) {
    q = q.toLowerCase()
    document.querySelectorAll('#vaGrid .nr-c').forEach(c => {
        c.style.display = c.dataset.s.includes(q) ? '' : 'none'
    })
}

// ============================================================
// MODAL DE VÍDEO (com temporizador)
// ============================================================
export function abrirVideoModal(video) {
    // Verificar se o modal existe, senão cria
    let modal = document.getElementById('videoModal')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'videoModal'
        modal.className = 'mdl-bg'
        modal.innerHTML = `
            <div class="mdl">
                <div class="video-header">
                    <span id="videoModalTitle">Assistindo...</span>
                    <button class="mdl-x" onclick="fecharVideoModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="video-wrapper">
                    <iframe id="videoIframe" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
                <div class="video-footer">
                    <span class="progress-text" id="videoProgressText">⏱️ 0s / 0s</span>
                    <button class="btn-concluir" id="videoConcluirBtn" onclick="marcarVideoConcluido()">
                        <i class="fas fa-check"></i> Marcar como concluído
                    </button>
                </div>
            </div>
        `
        document.body.appendChild(modal)
        // Adicionar evento de clique no backdrop para fechar
        modal.addEventListener('click', function(e) {
            if (e.target === this) fecharVideoModal()
        })
    }

    videoAtual = video
    tempoAssistido = 0
    videoConcluido = false
    document.getElementById('videoModalTitle').textContent = video.titulo || 'Videoaula'
    document.getElementById('videoIframe').src = video.url_video + '?autoplay=1&rel=0'
    document.getElementById('videoProgressText').textContent = `⏱️ 0s / ${video.duracao || '?'}s`
    document.getElementById('videoConcluirBtn').style.display = 'none'
    modal.classList.add('on')

    if (videoTimer) clearInterval(videoTimer)
    videoTimer = setInterval(() => {
        tempoAssistido++
        const duracao = video.duracao || 999999
        const pct = Math.min(100, Math.round((tempoAssistido / duracao) * 100))
        document.getElementById('videoProgressText').textContent = `⏱️ ${tempoAssistido}s / ${duracao}s (${pct}%)`
        if (tempoAssistido >= duracao && !videoConcluido) {
            videoConcluido = true
            document.getElementById('videoConcluirBtn').style.display = 'inline-flex'
            toast('🎉 Você assistiu todo o vídeo! Clique em "Marcar como concluído".', 'success')
        }
        if (tempoAssistido % 5 === 0) {
            sbSalvarProgresso(S.user.id, video.id, tempoAssistido, false)
        }
    }, 1000)
}

export function fecharVideoModal() {
    if (videoTimer) clearInterval(videoTimer)
    const iframe = document.getElementById('videoIframe')
    if (iframe) iframe.src = ''
    const modal = document.getElementById('videoModal')
    if (modal) modal.classList.remove('on')
    if (videoAtual && !videoConcluido) {
        sbSalvarProgresso(S.user.id, videoAtual.id, tempoAssistido, false)
    }
    videoAtual = null
}

export async function marcarVideoConcluido() {
    if (!videoAtual) return
    await sbSalvarProgresso(S.user.id, videoAtual.id, videoAtual.duracao || tempoAssistido, true)
    toast('✅ Vídeo concluído!', 'success')
    document.getElementById('videoConcluirBtn').style.display = 'none'
    carregarListaVideoaulas()
    setTimeout(fecharVideoModal, 1000)
}

// Expor funções globalmente para onclick funcionar
window.abrirVideoModal = abrirVideoModal
window.fecharVideoModal = fecharVideoModal
window.marcarVideoConcluido = marcarVideoConcluido
window.toggleAulaSupabase = toggleAulaSupabase // será definida depois
window.filterVA = filterVA

// ============================================================
// TOGGLE AULA (marcar/desmarcar como concluída)
// ============================================================
export async function toggleAulaSupabase(nrId, btn) {
    if (!S.user) return
    const { data: progressos } = await sbGetProgressoUsuario(S.user.id)
    const existente = progressos?.find(p => p.aula_id === nrId)

    if (existente) {
        await sbSalvarProgresso(S.user.id, nrId, 0, false)
        btn.className = 'btn btn-sm btn-s'
        btn.innerHTML = 'Marcar como concluída'
        document.querySelector(`#nr-${nrId} .badge`).style.display = 'none'
        toast('Aula desmarcada', 'info')
    } else {
        await sbSalvarProgresso(S.user.id, nrId, 300, true)
        btn.className = 'btn btn-sm btn-p'
        btn.innerHTML = '<i class="fas fa-check"></i> Concluída'
        document.querySelector(`#nr-${nrId} .badge`).style.display = 'inline-block'
        toast('Aula concluída! 🎉', 'success')
    }
    carregarListaVideoaulas()
}
