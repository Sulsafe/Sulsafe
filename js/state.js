// js/state.js - ESTADO GLOBAL UNIFICADO
import { sb } from './supabase-client.js';

// ============================================================
// ESTADO GLOBAL
// ============================================================
export const S = {
    user: null,
    view: 'inicio',
    prevView: null,
    cfg: JSON.parse(localStorage.getItem('ss_cfg') || '{"tema":"verde","vol":80,"qual":"hd","speed":"1","autoPlay":true,"notifs":true}')
};

export const ADMIN_EMAIL = 'sulsafetreinamentos@gmail.com';

// ============================================================
// FUNÇÕES DE ACESSO
// ============================================================
export const role = () => S.user?.role || 'aluno';
export const isAdmin = () => role() === 'admin' || S.user?.email === ADMIN_EMAIL;
export const isProf = () => role() === 'professor';
export const canManage = () => isAdmin() || isProf();
export const uid = () => S.user?.id;
export const fmtD = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
export const genId = () => 'ss_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

// ============================================================
// FUNÇÕES DE USUÁRIO (SUBSTITUEM O state.js ANTIGO)
// ============================================================
export function setUser(user) {
    S.user = user;
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_id', user?.id || '');
    localStorage.setItem('user_email', user?.email || '');
    localStorage.setItem('user_role', isAdmin() ? 'admin' : 'aluno');
    
    // Notifica listeners
    window.dispatchEvent(new CustomEvent('authchange', { detail: { user } }));
}

export function clearUser() {
    S.user = null;
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    
    // Notifica listeners
    window.dispatchEvent(new CustomEvent('authchange', { detail: { user: null } }));
}

export function getUser() {
    return S.user;
}

export function isAuthenticated() {
    return S.user !== null;
}

// ============================================================
// CONFIGURAÇÕES
// ============================================================
export function loadCfg() {
    const t = S.cfg.tema || 'verde';
    document.body.className = t !== 'verde' ? 't-' + t : '';
}

export async function loadCfgDB() {
    try {
        const { data, error } = await sb.from('configuracoes').select('*').single();
        if (error) throw error;
        S.cfg = { ...S.cfg, ...data };
        saveCfg();
        loadCfg();
    } catch (e) {
        console.log('Sem config no banco ou erro:', e);
        loadCfg();
    }
}

export function saveCfg() {
    localStorage.setItem('ss_cfg', JSON.stringify(S.cfg));
    loadCfg();
}

// ============================================================
// REGISTRO DE VIEWS (PARA O DASHBOARD)
// ============================================================
const viewRegistry = {};

export function registerView(name, fn) {
    viewRegistry[name] = fn;
}

let _renderSidebar = () => {};

export function setRenderSidebar(fn) {
    _renderSidebar = fn;
}

export function nav(viewName) {
    S.prevView = S.view;
    S.view = viewName;
    if (_renderSidebar) _renderSidebar();
    
    const fn = viewRegistry[viewName];
    if (fn) {
        fn();
        window.dispatchEvent(new CustomEvent('viewchange', { detail: { view: viewName } }));
    } else {
        const mc = document.getElementById('mc');
        if (mc) {
            mc.innerHTML = `
                <div class="empty">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>View "${viewName}" não encontrada</h4>
                </div>`;
        }
    }
}

export const navigateTo = nav;
export function refreshView() {
    if (S.view) {
        const fn = viewRegistry[S.view];
        if (fn) fn();
    }
}
export const getCurrentView = () => S.view;
