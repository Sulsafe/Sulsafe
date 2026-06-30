// ============================================================
// VIEW: VIDEOAULAS (com modal interno e temporizador)
// ============================================================
import { S, isAdmin, isProf, uid, nav, toast, handleError, sanitizar, NRS, $, $$ } from '../utils.js'
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
    // Verifica se usuário está logado
    if (!S.user) {
        return `<div class="alert alert-warning">Faça login para acessar as videoaulas.</div>`
    }

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

    // Progresso geral (vídeos)
    h += `<div id="progressoVideoaulas" class="prog-w">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-weight:600;font-size:13px">Seu Progresso</span>
            <span style="font-weight:800;color:var(--p)">0%</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" style="width:0%"></div></div>
        <p style="font-size:11px;color:var(--tx3);margin-top:6px" id="progressoDetalhe">0 de 0 vídeos concluídos</p>
    </div>`
    h += `<input class="search" placeholder="Buscar NR..." oninput="filterVA(this.value)">`
    h += `<div class="nr-g" id="vaGrid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));"></div>`

    // Configurar evento do formulário (apenas uma vez)
    setTimeout(() => {
        const form = document.getElementById('frmAddVideo')
        if (form) {
            // Remove listeners anteriores (se houver) e define um único
            form.onsubmit = async function(e) {
                e.preventDefault()
                const nrId = document.getElementById('addVideoNR').value
                const titulo = sanitizar(document.getElementById('addVideoTitulo').value.trim())
                const descricao = sanitizar(document.getElementById('addVideoDesc').value.trim())
                const url = document.getElementById('addVideoUrl').value.trim()
                const duracao = parseInt(document.getElementById('addVideoDuracao').value) || 300

                if (!titulo || !url) {
                    toast('Preencha título e link', 'err')
                    return
                }

                // Validação robusta de URL do YouTube
                try {
                    const parsed = new URL(url)
                    const host = parsed.hostname
                    if (!host.endsWith('youtube.com') && !host.endsWith('youtu.be')) {
                        throw new Error('Domínio não permitido')
                    }
                    // Se for youtu.be, pode ser convertido para embed? Mas aceitamos.
                } catch (_) {
                    toast('Insira um link válido do YouTube (ex: https://www.youtube.com/embed/... ou https://youtu.be/...)', 'err')
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
                if (error) {
                    handleError(error)
                    return
                }
                toast('Videoaula adicionada!', 'success')
                document.getElementById('addVideoTitulo').value = ''
                document.getElementById('addVideoDesc').value = ''
                document.getElementById('addVideoUrl').value = ''
                document.getElementById('addVideoDuracao').value = '300'
                await carregarListaVideoaulas() // recarrega a lista
            }
        }
        carregarListaVideoaulas()
    }, 100)

    return h
}

// ============================================================
// CARREGAR LISTA DE VIDEOAULAS
// ============================================================
export async function carregarListaVideoaulas() {
    const grid = document.getElementById('vaGrid')
    if (!grid) return

    try {
        const [videoaulasRes, progressosRes] = await Promise.all([
            sbGetVideoaulas(),
            sbGetProgressoUsuario(S.user.id)
        ])

        const videoaulas = videoaulasRes.data || []
        const progressos = progressosRes.data || []

        // Mapa de vídeos concluídos (baseado no campo 'concluido' sem acento)
        const concluidosMap = new Map()
        progressos.forEach(p => {
            if (p.concluido === true) {
                concluidosMap.set(p.aula_id, true)
            }
        })

        let html = ''
        let totalVideos = 0
        let concluidosCount = 0

        NRS.forEach(nr => {
            const vids = videoaulas.filter(v => v.nr_id === nr.id)
            if (vids.length === 0) {
                // NR sem vídeos: pode mostrar vazio ou não renderizar
                // Vamos mostrar um card indicando que não há vídeos ainda
                html += `<div class="nr-c" data-s="${nr.nm.toLowerCase()} ${nr.id}" style="flex-direction:column;align-items:stretch;gap:0">
                    <div style="display:flex;align-items:center;gap:12px;padding:14px">
                        <div class="nr-ic"><i class="fas ${nr.ic}"></i></div>
                        <div><div class="nr-num">NR ${nr.id}</div><div class="nr-nm">${nr.nm}</div></div>
                    </div>
                    <div style="padding:8px 14px;border-top:1px solid var(--bd2);color:var(--tx3);font-size:13px;">
                        <i class="fas fa-info-circle"></i> Nenhuma videoaula disponível ainda.
                    </div>
                </div>`
                return
            }

            // Conta vídeos
            const vidsConcluidos = vids.filter(v => concluidosMap.has(v.id))
            const allConcluidos = vids.length === vidsConcluidos.length

            html += `<div class="nr-c" data-s="${nr.nm.toLowerCase()} ${nr.id}" style="flex-direction:column;align-items:stretch;gap:0">
                <div style="display:flex;align-items:center;gap:12px;padding:14px">
                    <div class="nr-ic"><i class="fas ${nr.ic}"></i></div>
                    <div><div class="nr-num">NR ${nr.id}</div><div class="nr-nm">${nr.nm}</div></div>
                    ${allConcluidos ? `<span class="badge bg-ok"><i class="fas fa-check"></i> Concluída</span>` : ''}
                </div>
                <div style="padding:8px 14px;border-top:1px solid var(--bd2);display:flex;flex-direction:column;gap:6px;">
                    ${vids.map(v => {
                        const isConcluido = concluidosMap.has(v.id)
                        totalVideos++
                        if (isConcluido) concluidosCount++
                        return `
                            <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
                                <span style="font-size:14px;flex:1;">${sanitizar(v.titulo)} ${isConcluido ? '<i class="fas fa-check-circle" style="color:var(--ok);"></i>' : ''}</span>
                                <button class="btn btn-sm btn-p" onclick="abrirVideoModal(${JSON.stringify({
                                    id: v.id,
                                    titulo: v.titulo,
                                    url_video: v.url_video,
                                    duracao: v.duracao || 300,
                                    nr_id: v.nr_id
                                })})">
                                    <i class="fas fa-play"></i> Assistir
                                </button>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>`
        })

        grid.innerHTML = html

        // Atualizar barra de progresso geral
        const pct = totalVideos ? Math.round((concluidosCount / totalVideos) * 100) : 0
        const progDiv = document.getElementById('progressoVideoaulas')
        if (progDiv) {
            progDiv.querySelector('.prog-fill').style.width = pct + '%'
            progDiv.querySelector('.prog-fill + span')?.remove() // se houver um span antigo
            const label = progDiv.querySelector('span:last-child') // pega o span de percentual
            if (label) label.textContent = pct + '%'
            const detalhe = document.getElementById('progressoDetalhe')
            if (detalhe) detalhe.textContent = `${concluidosCount} de ${totalVideos} vídeos concluídos`
        }
    } catch (err) {
        console.error('Erro ao carregar videoaulas:', err)
        toast('Erro ao carregar a lista de vídeos', 'err')
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
    // Verifica se o modal existe, senão cria
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
                    <button class="btn-concluir" id="videoConcluirBtn" onclick="marcarVideoConcluido()" style="display:none;">
                        <i class="fas fa-check"></i> Marcar como concluído
                    </button>
                </div>
            </div>
        `
        document.body.appendChild(modal)
        // Fechar ao clicar no backdrop
        modal.addEventListener('click', function(e) {
            if (e.target === this) fecharVideoModal()
        })
    }

    // Guarda o vídeo atual e reseta estado
    videoAtual = video
    tempoAssistido = 0
    videoConcluido = false

    // Atualiza título
    document.getElementById('videoModalTitle').textContent = video.titulo || 'Videoaula'

    // Configura iframe
    const iframe = document.getElementById('videoIframe')
    iframe.src = video.url_video + '?autoplay=1&rel=0'

    // Atualiza texto de progresso
    document.getElementById('videoProgressText').textContent = `⏱️ 0s / ${video.duracao || '?'}s`

    // Esconde botão concluir
    document.getElementById('videoConcluirBtn').style.display = 'none'

    // Abre modal
    modal.classList.add('on')

    // Inicia temporizador
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

        // Salva progresso a cada 5 segundos (não concluído)
        if (tempoAssistido % 5 === 0) {
            sbSalvarProgresso(S.user.id, video.id, tempoAssistido, false).catch(err => {
                console.warn('Erro ao salvar progresso:', err)
            })
        }
    }, 1000)
}

export function fecharVideoModal() {
    if (videoTimer) {
        clearInterval(videoTimer)
        videoTimer = null
    }
    const iframe = document.getElementById('videoIframe')
    if (iframe) iframe.src = '' // para parar o vídeo
    const modal = document.getElementById('videoModal')
    if (modal) modal.classList.remove('on')

    // Salva o progresso atual se não foi concluído
    if (videoAtual && !videoConcluido) {
        sbSalvarProgresso(S.user.id, videoAtual.id, tempoAssistido, false).catch(err => {
            console.warn('Erro ao salvar progresso:', err)
        })
    }
    videoAtual = null
}

export async function marcarVideoConcluido() {
    if (!videoAtual) return
    try {
        await sbSalvarProgresso(S.user.id, videoAtual.id, videoAtual.duracao || tempoAssistido, true)
        toast('✅ Vídeo concluído!', 'success')
        document.getElementById('videoConcluirBtn').style.display = 'none'
        // Recarrega a lista para atualizar o ícone de check
        await carregarListaVideoaulas()
        setTimeout(fecharVideoModal, 1000)
    } catch (err) {
        toast('Erro ao marcar como concluído', 'err')
        console.error(err)
    }
}

// ============================================================
// EXPOR FUNÇÕES GLOBAIS (para onclick)
// ============================================================
window.abrirVideoModal = abrirVideoModal
window.fecharVideoModal = fecharVideoModal
window.marcarVideoConcluido = marcarVideoConcluido
window.filterVA = filterVA
