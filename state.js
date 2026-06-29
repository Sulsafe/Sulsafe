// ============================================================
// ESTADO GLOBAL + NAVEGAÇÃO + CONFIGURAÇÃO
// ============================================================

export const S = {
    user: null,
    view: 'inicio',
    prevView: null,
    cfg: JSON.parse(localStorage.getItem('ss_cfg') || '{"tema":"verde","vol":80,"qual":"hd","speed":"1","autoPlay":true,"notifs":true}')
}

export const ADMIN_EMAIL = 'sulsafetreinamentos@gmail.com' // <-- ADICIONADO

// Funções de acesso ao estado
export const role = () => S.user?.role || 'aluno'
export const isAdmin = () => role() === 'admin' || S.user?.email === ADMIN_EMAIL
export const isProf = () => role() === 'professor'
export const canManage = () => isAdmin() || isProf()
export const uid = () => S.user?.id
export const fmtD = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
export const genId = () => 'ss_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6)

// Registro de views (padrão plugin)
const viewRegistry = {}
export function registerView(name, fn) {
    viewRegistry[name] = fn
}

// Referência para renderSidebar (evita circular dependency)
let _renderSidebar = () => {}
export function setRenderSidebar(fn) {
    _renderSidebar = fn
}

// Navegação principal
export function nav(viewName) {
    S.prevView = S.view
    S.view = viewName
    _renderSidebar()
    const fn = viewRegistry[viewName]
    if (fn) {
        fn()
        window.dispatchEvent(new CustomEvent('viewchange', { detail: { view: viewName } }))
    } else {
        document.getElementById('mc').innerHTML = `
            <div class="empty">
                <i class="fas fa-exclamation-circle"></i>
                <h4>View "${viewName}" não encontrada</h4>
            </div>`
    }
}

export const navigateTo = nav

export function loadCfg() {
    const t = S.cfg.tema || 'verde'
    document.body.className = t !== 'verde' ? 't-' + t : ''
}

export function saveCfg() {
    localStorage.setItem('ss_cfg', JSON.stringify(S.cfg))
    loadCfg()
}

export function refreshView() {
    if (S.view) {
        const fn = viewRegistry[S.view]
        if (fn) fn()
    }
}

export const getCurrentView = () => S.view