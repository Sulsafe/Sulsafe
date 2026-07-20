// ============================================================
// MAIN - VERSÃO CORRIGIDA COM FORÇA BRUTA
// ============================================================
import { sb } from './supabase-client.js'

console.log('🚀 MAIN.JS CARREGADO!')

// ============================================================
// FUNÇÃO PARA MOSTRAR O DASHBOARD (COM FORÇA BRUTA)
// ============================================================
function showDashboard() {
  console.log('🚪 Entrando no dashboard...')
  
  // ========================================
  // FORÇA BRUTA: REMOVER TUDO E MOSTRAR SÓ O DASHBOARD
  // ========================================
  
  // 1. Esconder TUDO que não seja o header
  document.querySelectorAll('body > *').forEach(el => {
    if (!el.classList.contains('header') && el.id !== 'dashboardContainer') {
      el.style.display = 'none'
    }
  })
  
  // 2. Remover dashboard antigo se existir
  const oldDashboard = document.getElementById('dashboardContainer')
  if (oldDashboard) oldDashboard.remove()
  
  // 3. Criar o dashboard
  const userEmail = localStorage.getItem('user_email') || 'sulsafetreinamentos@gmail.com'
  const isAdmin = userEmail === 'sulsafetreinamentos@gmail.com'
  
  const dashboardDiv = document.createElement('div')
  dashboardDiv.id = 'dashboardContainer'
  dashboardDiv.style.cssText = `
    padding: 30px 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 70vh;
    display: block !important;
    position: relative;
    z-index: 1000;
    background: white;
  `
  
  dashboardDiv.innerHTML = `
    <div style="background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; border-radius: 16px; padding: 40px; margin-bottom: 30px;">
      <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 8px;">👋 Bem-vindo, ${isAdmin ? 'Admin' : 'Aluno'}!</h1>
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
      <a href="#nrs" style="background: #2E7D32; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" onclick="event.preventDefault(); document.querySelector('#nrs')?.scrollIntoView({behavior:'smooth'});">
        <i class="fas fa-book"></i> Ver NRs
      </a>
      <a href="#planos" style="background: #C9B037; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" onclick="event.preventDefault(); document.querySelector('#planos')?.scrollIntoView({behavior:'smooth'});">
        <i class="fas fa-tags"></i> Ver Planos
      </a>
      <button onclick="window.logout()" style="background: #c0392b; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-sign-out-alt"></i> Sair
      </button>
    </div>
  `
  
  // 4. Inserir depois do header
  const header = document.querySelector('.header')
  if (header) {
    header.after(dashboardDiv)
  } else {
    document.body.prepend(dashboardDiv)
  }
  
  // 5. Atualizar o cabeçalho
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
  
  // 6. Esconder o footer
  const footer = document.querySelector('.footer')
  if (footer) footer.style.display = 'none'
  
  console.log('✅ Dashboard exibido com sucesso!')
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
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🔍 Iniciando auto-login...')
  
  // Se estiver na página de login, não faz nada
  if (window.location.pathname.includes('login.html')) {
    console.log('📄 Estamos na página de login, ignorando')
    return
  }
  
  // Verificar se já está logado
  const userLoggedIn = localStorage.getItem('user_logged_in')
  const userEmail = localStorage.getItem('user_email')
  
  if (userLoggedIn === 'true' && userEmail) {
    console.log('✅ Usuário logado via localStorage:', userEmail)
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(showDashboard, 100)
    return
  }
  
  // Verificar sessão no Supabase
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (session) {
      console.log('✅ Sessão encontrada no Supabase:', session.user.email)
      localStorage.setItem('user_id', session.user.id)
      localStorage.setItem('user_email', session.user.email)
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_role', session.user.email === 'sulsafetreinamentos@gmail.com' ? 'admin' : 'aluno')
      setTimeout(showDashboard, 100)
      return
    }
  } catch (e) {
    console.error('❌ Erro ao verificar sessão:', e)
  }
  
  console.log('🔓 Nenhuma sessão encontrada')
})

console.log('✅ Main.js inicializado!')
