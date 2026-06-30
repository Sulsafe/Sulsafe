// ============================================================
// VIEW: CONFIGURAÇÕES
// ============================================================
import { S, saveCfg, loadCfg } from './state.js'
import { sbUpdateUser } from './supabase-client.js'
import { toast, sanitizar, $, $$ } from './utils.js'

export function vConfig() {
    const c = S.cfg
    const temas = [
        { id: 'verde', cor: '#2E7D32', nm: 'Verde' },
        { id: 'azul', cor: '#1565C0', nm: 'Azul' },
        { id: 'roxo', cor: '#7B1FA2', nm: 'Roxo' },
        { id: 'vermelho', cor: '#C62828', nm: 'Vermelho' },
        { id: 'laranja', cor: '#E65100', nm: 'Laranja' },
        { id: 'escuro', cor: '#1a1a1a', nm: 'Escuro' }
    ]
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Configurações</h2><p class="wcs">Personalize sua experiência na plataforma.</p>`
    h += `<div class="cfg-w"><div class="cfg-sb"><div class="cfg-tb on" onclick="cfgTab('tema',this)"><i class="fas fa-palette"></i><span>Tema</span></div><div class="cfg-tb" onclick="cfgTab('video',this)"><i class="fas fa-video"></i><span>Vídeo</span></div><div class="cfg-tb" onclick="cfgTab('audio',this)"><i class="fas fa-volume-high"></i><span>Áudio</span></div><div class="cfg-tb" onclick="cfgTab('geral',this)"><i class="fas fa-sliders-h"></i><span>Geral</span></div></div>`
    h += `<div class="cfg-bd">`
    h += `<div class="cfg-sc on" id="cfgTema"><h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Cores do Tema</h3><div class="tema-g">`
    temas.forEach(t => {
        h += `<div class="tema-o${c.tema === t.id ? ' on' : ''}" onclick="setTema('${t.id}')"><div class="tema-dot" style="background:${t.cor};${t.id === 'escuro' ? 'border:2px solid #555' : ''}"></div>${t.nm}</div>`
    })
    h += `</div></div>`
    h += `<div class="cfg-sc" id="cfgVideo"><h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Configurações de Vídeo</h3><div class="cfg-grp"><label>Qualidade Padrão</label><select id="cfgQual" onchange="atualizarCfg()"><option value="sd"${c.qual === 'sd' ? ' selected' : ''}>SD (480p)</option><option value="hd"${c.qual === 'hd' ? ' selected' : ''}>HD (720p)</option><option value="fhd"${c.qual === 'fhd' ? ' selected' : ''}>Full HD (1080p)</option><option value="auto"${c.qual === 'auto' ? ' selected' : ''}>Automático</option></select></div><div class="cfg-grp"><label>Velocidade</label><select id="cfgSpeed" onchange="atualizarCfg()"><option value="0.75"${c.speed === '0.75' ? ' selected' : ''}>0.75x</option><option value="1"${c.speed === '1' ? ' selected' : ''}>1x</option><option value="1.25"${c.speed === '1.25' ? ' selected' : ''}>1.25x</option><option value="1.5"${c.speed === '1.5' ? ' selected' : ''}>1.5x</option><option value="2"${c.speed === '2' ? ' selected' : ''}>2x</option></select></div></div>`
    h += `<div class="cfg-sc" id="cfgAudio"><h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Configurações de Áudio</h3><div class="cfg-grp"><label>Volume Geral: <strong id="volVal">${c.vol}%</strong></label><input type="range" id="cfgVol" min="0" max="100" value="${c.vol}" oninput="document.getElementById('volVal').textContent=this.value+'%'; atualizarCfg()"></div></div>`
    h += `<div class="cfg-sc" id="cfgGeral"><h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Configurações Gerais</h3><div class="cfg-grp"><label>Notificações de Novo Conteúdo</label><select onchange="S.cfg.notifs=this.value==='true';atualizarCfg()"><option value="true"${c.notifs !== false ? ' selected' : ''}>Ativadas</option><option value="false"${c.notifs === false ? ' selected' : ''}>Desativadas</option></select></div><div class="cfg-grp"><label>Nome de Exibição</label><input type="text" value="${S.user?.nome_completo || ''}" onchange="atualizarNome(this.value)"></div></div>`
    h += `</div></div>`
    return h
}

async function atualizarNome(nome) {
    if (!S.user) return
    await sbUpdateUser(S.user.id, { nome_completo: sanitizar(nome) })
    S.user.nome_completo = nome
    localStorage.setItem('ss_user', JSON.stringify(S.user))
    window.renderSB()
    toast('Nome atualizado!', 'success')
}

function cfgTab(id, el) {
    $$('.cfg-tb').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
    $$('.cfg-sc').forEach(s => s.classList.remove('on'));
    const map = { tema: 'cfgTema', video: 'cfgVideo', audio: 'cfgAudio', geral: 'cfgGeral' };
    $('#' + map[id])?.classList.add('on')
}

function setTema(id) {
    document.body.className = id === 'verde' ? '' : 't-' + id;
    S.cfg.tema = id;
    // Salva config usando a função importada de state.js (não redefinir)
    saveCfg(); // esta função agora vem do state.js
    $$('.tema-o').forEach(o => o.classList.remove('on'));
    // O evento 'currentTarget' não está disponível aqui, então pegamos o último clicado
    // Melhor: passar o elemento como parâmetro
    // Como não temos o evento, vamos usar um seletor para marcar o ativo com base no id
    // Mas vamos apenas atualizar a classe via querySelector
    document.querySelector(`.tema-o[onclick*="${id}"]`)?.classList.add('on');
    toast('Tema alterado!', 'success')
}

// Função que salva as configurações atuais (chamada pelos eventos onchange)
// Ela usa a função importada de state.js, mas a view também precisa atualizar o S.cfg
// Para simplificar, vamos usar a função global (que deve ser a mesma)
window.atualizarCfg = function() {
    // Lê os valores dos elementos
    const q = $('#cfgQual')?.value;
    const sp = $('#cfgSpeed')?.value;
    const v = $('#cfgVol')?.value;
    if (q) S.cfg.qual = q;
    if (sp) S.cfg.speed = sp;
    if (v) S.cfg.vol = parseInt(v);
    // Salva usando a função importada
    saveCfg(); // importada de state.js
};

window.setTema = setTema
window.cfgTab = cfgTab
window.atualizarNome = atualizarNome
// Também expõe atualizarCfg globalmente
window.atualizarCfg = window.atualizarCfg
