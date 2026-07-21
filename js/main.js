// js/main.js - VERSÃO FINAL
console.log('🚀 MAIN.JS CARREGADO!');

import { checkAuth, initAuthListener } from './auth.js';
import { S, setUser, clearUser, isAuthenticated, ADMIN_EMAIL } from './state.js';
import { sb } from './supabase-client.js';

// ============================================================
// FUNÇÃO PARA MOSTRAR O DASHBOARD
// ============================================================
function showDashboard() {
    console.log('🚪 Entrando no dashboard...');
    
    if (document.getElementById('dashboardContainer')) {
        console.log('✅ Dashboard já está visível');
        return;
    }
    
    // Esconde conteúdo da página inicial
    document.querySelectorAll('.hero, .features, .nrs, .planos, .faq, .cta-final, .trust-bar, .imagens-section, .footer').forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    const userEmail = S.user?.email || localStorage.getItem('user_email') || 'Usuário';
    const isAdminUser = S.user?.email === ADMIN_EMAIL;
    
    const dashboardDiv = document.createElement('div');
    dashboardDiv.id = 'dashboardContainer';
    dashboardDiv.style.cssText = 'padding:30px 20px;max-width:1200px;margin:0 auto;min-height:70vh;';
    
    dashboardDiv.innerHTML = `
        <div style="background:linear-gradient(135deg,#1B5E20,#2E7D32);color:white;border-radius:16px;padding:40px;margin-bottom:30px;">
            <h1 style="font-size:32px;font-weight:900;margin-bottom:8px;">👋 Bem-vindo, ${isAdminUser ? 'Admin' : 'Aluno'}!</h1>
            <p style="opacity:0.9;font-size:16px;">${userEmail}</p>
            <p style="opacity:0.8;margin-top:8px;font-size:14px;">${isAdminUser ? '👑 Você tem acesso administrativo' : '📚 Aproveite seus cursos'}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:30px;">
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e8ecf1;">
                <div style="font-size:36px;">📚</div>
                <h3 style="font-size:24px;color:#2E7D32;">38</h3>
                <p style="color:#666;">NRs Disponíveis</p>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e8ecf1;">
                <div style="font-size:36px;">🎓</div>
                <h3 style="font-size:24px;color:#2E7D32;">+100</h3>
                <p style="color:#666;">Videoaulas</p>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e8ecf1;">
                <div style="font-size:36px;">📜</div>
                <h3 style="font-size:24px;color:#2E7D32;">+500</h3>
                <p style="color:#666;">Certificados</p>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e8ecf1;">
                <div style="font-size:36px;">🤖</div>
                <h3 style="font-size:24px;color:#2E7D32;">24/7</h3>
                <p style="color:#666;">Assistente IA</p>
            </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
            <button onclick="document.querySelector('#nrs')?.scrollIntoView({behavior:'smooth'})" style="background:#2E7D32;color:white;padding:12px 24px;border-radius:8px;border:none;cursor:pointer;font-weight:600;">Ver NRs</button>
            <button onclick="document.querySelector('#planos')?.scrollIntoView({behavior:'smooth'})" style="background:#C9B037;color:#1a1a2e;padding:12px 24px;border-radius:8px;border:none;cursor:pointer;font-weight:600;">Ver Planos</button>
            <button onclick="window.doLogout()" style="background:#c0392b;color:white;padding:12px 24px;border-radius:8px;border:none;cursor:pointer;font-weight:600;">Sair</button>
        </div>
    `;
    
    const header = document.querySelector('.header');
    if (header) header.after(dashboardDiv);
    else document.body.prepend(dashboardDiv);
    
    // Atualiza cabeçalho
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.innerHTML = `
            <span style="color:#2E7D32;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;">
                <i class="fas fa-user-circle"></i> ${userEmail}
            </span>
            <button onclick="window.doLogout()" class="btn btn-outline" style="padding:8px 16px;font-size:13px;">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        `;
    }
}

// ============================================================
// LOGOUT GLOBAL
// ============================================================
window.doLogout = async function() {
    console.log('🚪 Fazendo logout...');
    try {
        await sb.auth.signOut();
        clearUser();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    } catch (err) {
        console.error('❌ Erro no logout:', err);
        alert('Erro ao sair. Tente novamente.');
    }
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔍 Verificando sessão...');
    
    // Se estiver na página de login, NÃO FAZ NADA
    if (window.location.pathname.includes('login.html')) {
        console.log('📄 Página de login, ignorando verificação');
        return;
    }
    
    // Inicializa o listener de autenticação
    initAuthListener();
    
    try {
        const auth = await checkAuth();
        
        if (auth.isAuthenticated) {
            console.log('✅ Sessão ativa:', auth.user.email);
            showDashboard();
        } else {
            console.log('🔓 Nenhuma sessão, redirecionando para login...');
            window.location.href = '/login.html';
        }
    } catch (err) {
        console.error('❌ Erro na verificação:', err);
        window.location.href = '/login.html';
    }
});

console.log('✅ Main.js inicializado!');
