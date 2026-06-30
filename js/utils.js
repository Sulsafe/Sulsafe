// ============================================================
// UTILITÁRIOS: DOM, TOAST, SANITIZAÇÃO, ERROS, DADOS NRs
// ============================================================

export const $ = s => document.querySelector(s)
export const $$ = s => document.querySelectorAll(s)

// Toast de notificação
export function toast(m, t = 'success') {
    const e = document.createElement('div')
    e.className = 'toast ' + t
    e.textContent = m
    $('#toast').appendChild(e)
    setTimeout(() => {
        e.style.opacity = '0'
        e.style.transform = 'translateY(10px)'
        e.style.transition = '.3s'
        setTimeout(() => e.remove(), 300)
    }, 3500)
}

// Sanitização de entrada
export function sanitizar(texto) {
    if (!texto) return ''
    return texto.replace(/[<>]/g, '').trim()
}

// Tratamento de erros avançado
export function handleError(error, fallbackMsg = 'Ocorreu um erro. Tente novamente.') {
    console.error('Erro detalhado:', error)
    if (error.code === '23505') {
        toast('Este email já está cadastrado', 'err')
    } else if (error.code === '42501') {
        toast('Você não tem permissão para isso', 'err')
    } else if (error.code === 'PGRST301') {
        toast('Sessão expirada. Faça login novamente.', 'err')
    } else if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        toast('Erro de conexão. Verifique sua internet.', 'err')
    } else {
        toast(error.message || fallbackMsg, 'err')
    }
}

// Alternar tabs de auth (login/cadastro)
export function showT(id) {
    $$('.t').forEach(t => t.classList.remove('on'))
    const el = $('#' + id)
    if (el) el.classList.add('on')
}

// Dados das 38 NRs - SÓ 1 VEZ
export const NRS = [
    { id: '1', nm: 'Disposições Gerais', cat: 'geral', ic: 'fa-clipboard-list' },
    { id: '2', nm: 'Inspeção Prévia', cat: 'geral', ic: 'fa-magnifying-glass' },
    { id: '3', nm: 'Embargo ou Interdição', cat: 'geral', ic: 'fa-ban' },
    { id: '4', nm: 'SESMT', cat: 'geral', ic: 'fa-users-gear' },
    { id: '5', nm: 'CIPA', cat: 'geral', ic: 'fa-people-group' },
    { id: '6', nm: 'EPI', cat: 'geral', ic: 'fa-hard-hat' },
    { id: '7', nm: 'PCMSO', cat: 'saude', ic: 'fa-stethoscope' },
    { id: '8', nm: 'Edificações', cat: 'especifico', ic: 'fa-building' },
    { id: '9', nm: 'PPRA', cat: 'especifico', ic: 'fa-shield-halved' },
    { id: '10', nm: 'Eletricidade', cat: 'especifico', ic: 'fa-bolt' },
    { id: '11', nm: 'Movimentação de Materiais', cat: 'especifico', ic: 'fa-truck' },
    { id: '12', nm: 'Máquinas e Equipamentos', cat: 'especifico', ic: 'fa-gears' },
    { id: '13', nm: 'Caldeiras e Vasos', cat: 'especifico', ic: 'fa-fire' },
    { id: '14', nm: 'Fornos', cat: 'especifico', ic: 'fa-temperature-high' },
    { id: '15', nm: 'Atividades Insalubres', cat: 'saude', ic: 'fa-biohazard' },
    { id: '16', nm: 'Atividades Perigosas', cat: 'saude', ic: 'fa-skull-crossbones' },
    { id: '17', nm: 'Ergonomia', cat: 'saude', ic: 'fa-person' },
    { id: '18', nm: 'Trabalho em Calor', cat: 'saude', ic: 'fa-sun' },
    { id: '19', nm: 'Explosivos', cat: 'especifico', ic: 'fa-explosion' },
    { id: '20', nm: 'Inflamáveis e Combustíveis', cat: 'especifico', ic: 'fa-fire-flame-curved' },
    { id: '21', nm: 'Trabalho a Céu Aberto', cat: 'especifico', ic: 'fa-cloud-sun' },
    { id: '22', nm: 'Trabalhos Subterrâneos', cat: 'especifico', ic: 'fa-mountain' },
    { id: '23', nm: 'Proteção contra Incêndios', cat: 'especifico', ic: 'fa-fire-extinguisher' },
    { id: '24', nm: 'Condições Sanitárias', cat: 'saude', ic: 'fa-hand-sparkles' },
    { id: '25', nm: 'Resíduos Industriais', cat: 'especifico', ic: 'fa-recycle' },
    { id: '26', nm: 'Sinalização de Segurança', cat: 'geral', ic: 'fa-triangle-exclamation' },
    { id: '27', nm: 'Registro Profissional', cat: 'geral', ic: 'fa-id-card' },
    { id: '28', nm: 'Fiscalização e Penalidades', cat: 'geral', ic: 'fa-gavel' },
    { id: '29', nm: 'Trabalho Portuário', cat: 'setorial', ic: 'fa-ship' },
    { id: '30', nm: 'Trabalho Aquaviário', cat: 'setorial', ic: 'fa-anchor' },
    { id: '31', nm: 'Trabalho em Altura', cat: 'especifico', ic: 'fa-arrow-up-long' },
    { id: '32', nm: 'Espaço Confinado', cat: 'especifico', ic: 'fa-dungeon' },
    { id: '33', nm: 'Segurança em Mineração', cat: 'setorial', ic: 'fa-helmet-safety' },
    { id: '34', nm: 'Construção Civil', cat: 'setorial', ic: 'fa-helmet-safety' },
    { id: '35', nm: 'Altura e Confinado - Mineração', cat: 'setorial', ic: 'fa-mountain-sun' },
    { id: '36', nm: 'Capacitação e Treinamento', cat: 'geral', ic: 'fa-graduation-cap' },
    { id: '37', nm: 'Segurança em Máquinas', cat: 'especifico', ic: 'fa-gear' },
    { id: '38', nm: 'PGR - Gerenciamento de Riscos', cat: 'geral', ic: 'fa-chart-line' }
]

// ============================================================
// MODAL GENÉRICO
// ============================================================
export function openMdl(html) {
    let mdl = $('#modal')
    if (!mdl) {
        mdl = document.createElement('div')
        mdl.id = 'modal'
        mdl.className = 'mdl'
        document.body.appendChild(mdl)
    }
    mdl.innerHTML = html
    mdl.classList.add('on')
    document.body.style.overflow = 'hidden'
}

export function close() {
    const mdl = $('#modal')
    if (mdl) {
        mdl.classList.remove('on')
        document.body.style.overflow = ''
    }
}

// Expõe pro HTML enxergar no onclick
window.close = close
