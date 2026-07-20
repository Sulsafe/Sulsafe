// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO (VERSÃO CORRIGIDA)
// ============================================================
import { S, registerView, setRenderSidebar, loadCfg } from './state.js'
import { sb, sbGetUser } from './supabase-client.js'

// Views
import { vInicio } from './views/inicio.js'
import { vSalas } from './views/salas.js'
import { vNRs } from './views/nrs.js'
import { vIA } from './views/ia.js'
import { vBoletim } from './views/boletim.js'
import { vProvas } from './views/provas.js'
import { vCerts } from './views/certificados.js'
import { vAdmin } from './views/admin.js'
import { vConfig } from './views/config.js'
import { vPendentes } from './views/pendentes.js'
import { vVideoaulas } from './videoaulas.js'
import { vMateriais } from './materiais.js'

import { renderSB, renderV, enterDash } from './app.js'

// Registrar views
registerView('inicio', vInicio)
registerView('videoaulas', vVideoaulas)
registerView('materiais', vMateriais)
registerView('salas', vSalas)
registerView('nrs', vNRs)
registerView('ia', vIA)
registerView('boletim', vBoletim)
registerView('provas', vProvas)
registerView('certificados', vCerts)
registerView('admin', vAdmin)
registerView('config', vConfig)
registerView('pendentes', vPendentes)

setRenderSidebar(renderSB)

// ============================================================
// CONSTANTES
// ============================================================
const ZAP_NUMBER = '5553997060864'

// ============================================================
// TOAST (feedback rápido)
// ============================================================
function toast(msg, tipo = 'ok') {
  const t = document.querySelector('#toast')
  if (!t) { console.warn('Toast element not found:', msg); return }
  t.textContent = msg
  t.className = `on ${tipo}`
  clearTimeout(t._timeout)
  t._timeout = setTimeout(() => t.className = '', 3000)
}

// ============================================================
// FUNÇÃO PARA MOSTRAR O DASHBOARD (VERSÃO SIMPLIFICADA)
// ============================================================
function showDashboard() {
  console.log('🚪 Entrando no dashboard...')
  
  // Verificar se já existe um dashboard renderizado
  if (document.getElementById('dashboardContainer')) {
    console.log('✅ Dashboard já está visível')
    return
  }
  
  // Esconder o conteúdo da página inicial
  const sectionsToHide = [
    '.hero', '.features', '.nrs', '.planos', '.faq', '.cta-final', 
    '.trust-bar', '.imagens-section', '.section'
  ]
  
  sectionsToHide.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.display = 'none'
    })
  })
  
  // Esconder o footer também
  const footer = document.querySelector('.footer')
  if (footer) footer.style.display = 'none'
  
  // Criar o container do dashboard
  const dashboardDiv = document.createElement('div')
  dashboardDiv.id = 'dashboardContainer'
  dashboardDiv.style.cssText = `
    padding: 30px 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 70vh;
  `
  
  const userEmail = localStorage.getItem('user_email') || S?.user?.email || 'sulsafetreinamentos@gmail.com'
  const isAdmin = userEmail === 'sulsafetreinamentos@gmail.com'
  const userName = localStorage.getItem('user_name') || (isAdmin ? 'Admin' : 'Aluno')
  
  dashboardDiv.innerHTML = `
    <div style="background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; border-radius: 16px; padding: 40px; margin-bottom: 30px;">
      <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 8px;">👋 Bem-vindo, ${userName}!</h1>
      <p style="opacity: 0.9; font-size: 16px;">${userEmail}</p>
      <p style="opacity: 0.8; margin-top: 8px; font-size: 14px;">${isAdmin ? '👑 Você tem acesso administrativo' : '📚 Aproveite seus cursos'}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px;">
      <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e8ecf1;">
        <div style="font-size: 36px;">📚</div>
        <h3 style="font-size: 24px; color: #2E7D32;">38</h3>
        <p style="color: #666;">NRs Disponíveis</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e8ecf1;">
        <div style="font-size: 36px;">🎓</div>
        <h3 style="font-size: 24px; color: #2E7D32;">+100</h3>
        <p style="color: #666;">Videoaulas</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e8ecf1;">
        <div style="font-size: 36px;">📜</div>
        <h3 style="font-size: 24px; color: #2E7D32;">+500</h3>
        <p style="color: #666;">Certificados Emitidos</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e8ecf1;">
        <div style="font-size: 36px;">🤖</div>
        <h3 style="font-size: 24px; color: #2E7D32;">24/7</h3>
        <p style="color: #666;">Assistente IA</p>
      </div>
    </div>
    
    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
      <a href="#nrs" style="background: #2E7D32; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-book"></i> Ver NRs
      </a>
      <a href="#planos" style="background: #C9B037; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-tags"></i> Ver Planos
      </a>
      <button onclick="window.logout()" style="background: #c0392b; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-sign-out-alt"></i> Sair
      </button>
    </div>
  `
  
  // Inserir depois do header
  const header = document.querySelector('.header')
  if (header) {
    header.after(dashboardDiv)
  } else {
    document.body.prepend(dashboardDiv)
  }
  
  // Atualizar o cabeçalho (mostrar "Sair" em vez de "Entrar")
  const headerActions = document.querySelector('.header-actions')
  if (headerActions) {
    headerActions.innerHTML = `
      <span style="color: #2E7D32; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-user-circle"></i> ${userEmail}
      </span>
      <button onclick="window.logout()" class="btn btn-outline" style="padding: 8px 16px; font-size: 13px;">
        <i class="fas fa-sign-out-alt"></i> Sair
      </button>
    `
  }
}

// ============================================================
// FUNÇÃO DE LOGOUT
// ============================================================
window.logout = async function() {
  console.log('🚪 Fazendo logout...')
  try {
    await sb.auth.signOut()
  } catch (e) {
    console.warn('Erro ao fazer logout no Supabase:', e)
  }
  localStorage.clear()
  sessionStorage.clear()
  window.location.reload()
}

// ============================================================
// FUNÇÃO PARA MOSTRAR TELA DE LOGIN
// ============================================================
function showLoginScreen() {
  console.log('🔓 Nenhuma sessão – redirecionando para login.html')
  // Se não estiver na página de login, redireciona
  if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html'
  }
}

// ============================================================
// INICIALIZAÇÃO - AUTO-LOGIN
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🔍 Iniciando auto-login...')
  
  // Se estiver na página de login, não faz nada (deixa o login.html gerenciar)
  if (window.location.pathname.includes('login.html')) {
    console.log('📄 Estamos na página de login, ignorando auto-login')
    return
  }
  
  try {
    // Verificar sessão no Supabase
    const { data: { session } } = await sb.auth.getSession()
    
    if (session) {
      console.log('✅ Sessão encontrada no Supabase:', session.user.email)
      
      // Salvar dados
      const user = session.user
      localStorage.setItem('user_id', user.id)
      localStorage.setItem('user_email', user.email)
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_role', user.email === 'sulsafetreinamentos@gmail.com' ? 'admin' : 'aluno')
      
      // Mostrar dashboard
      showDashboard()
      return
    }
    
    // Fallback: verificar localStorage
    const userLoggedIn = localStorage.getItem('user_logged_in')
    const userEmail = localStorage.getItem('user_email')
    const userId = localStorage.getItem('user_id')
    
    if (userLoggedIn === 'true' && userId) {
      console.log('📋 Sessão encontrada no localStorage:', userEmail)
      
      // Tentar recuperar usuário via Supabase
      try {
        const { data: { user } } = await sb.auth.getUser()
        if (user) {
          localStorage.setItem('user_email', user.email)
          showDashboard()
          return
        }
      } catch (e) {
        console.warn('⚠️ Não foi possível recuperar usuário:', e)
      }
      
      // Fallback: mostrar dashboard com dados do localStorage
      showDashboard()
      return
    }
    
    // Nenhuma sessão
    console.log('🔓 Nenhuma sessão encontrada')
    showLoginScreen()
    
  } catch (e) {
    console.error('❌ ERRO NO AUTO-LOGIN:', e)
    showLoginScreen()
  }
})

// ============================================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================================
window.showDashboard = showDashboard
window.showLoginScreen = showLoginScreen
window.toast = toast

console.log('✅ Main.js carregado com sucesso!')
