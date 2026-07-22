// ============================================================
// VIEW: SALAS AO VIVO
// ============================================================
import { role, canManage, uid, nav, fmtD } from '../state.js'
import { sb, sbGetSalasAtivas, sbCriarSala } from '../supabase-client.js'
import { toast, handleError, sanitizar, $, $$ } from '../utils.js'

export function vSalas() {
    const r = role()
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Salas ao Vivo</h2><p class="wcs">${r === 'aluno' ? 'Participe das aulas em tempo real.' : 'Crie e gerencie salas ao vivo.'}</p>`
    if (canManage()) {
        h += `<div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
            <input class="search" id="salaTop" placeholder="Tópico da aula" style="flex:2;min-width:200px;margin:0">
            <input class="search" id="salaMeet" placeholder="ID da reunião" style="flex:1;min-width:160px;margin:0">
            <button class="btn btn-p" onclick="criarSalaSupabase()"><i class="fas fa-plus"></i> Criar Sala</button>
        </div>`
    }
    h += `<div id="listaSalas"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando salas...</p></div></div>`
    setTimeout(carregarSalas, 200)
    return h
}

async function carregarSalas() {
    const { data: salas } = await sbGetSalasAtivas()
    const container = $('#listaSalas')
    if (!container) return
    
    if (!salas || salas.length === 0) {
        container.innerHTML = `<div class="empty"><i class="fas fa-tower-broadcast"></i><p>Nenhuma sala ativa no momento.</p></div>`
        return
    }
    
    let h = ''
    salas.forEach(s => {
        h += `<div class="mt-c">
            <div>
                <div class="mt-topic">${s.topico}</div>
                <div class="mt-id">ID: ${s.meet_id || 'N/A'}</div>
                <div style="font-size:11px;color:var(--tx3);margin-top:4px">Criada por: ${s.profiles?.nome_completo || '—'} — ${fmtD(s.created_at)}</div>
            </div>
            <div style="display:flex;gap:8px">
                <a href="https://meet.google.com/${s.meet_id || ''}" target="_blank" class="btn btn-p btn-sm"><i class="fas fa-video"></i> Entrar na Sala</a>
                ${canManage() ? `<button class="btn btn-d btn-sm" onclick="encerrarSalaSupabase('${s.id}')"><i class="fas fa-times"></i></button>` : ''}
            </div>
        </div>`
    })
    container.innerHTML = h
}

async function criarSalaSupabase() {
    const top = sanitizar($('#salaTop')?.value?.trim())
    const meet = sanitizar($('#salaMeet')?.value?.trim())
    if (!top) { toast('Informe o tópico', 'err'); return }
    const { data, error } = await sbCriarSala(top, meet, uid())
    if (error) { handleError(error); return }
    toast('Sala criada!', 'success')
    carregarSalas()
    $('#salaTop').value = ''
    $('#salaMeet').value = ''
}

async function encerrarSalaSupabase(id) {
    if (!confirm('Encerrar esta sala?')) return
    await sb.from('salas').update({ ativa: false }).eq('id', id)
    toast('Sala encerrada', 'info')
    carregarSalas()
}

window.criarSalaSupabase = criarSalaSupabase
window.encerrarSalaSupabase = encerrarSalaSupabase
