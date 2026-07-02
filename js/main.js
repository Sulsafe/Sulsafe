// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO
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
const ZAP_NUMBER = '5553997060864' // ← apenas números

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
// TELA DE PENDÊNCIA (balão do WhatsApp)
// ============================================================
function showPendenciaScreen(email, motivo = 'cadastro') {
  const authWrap = document.getElementById('authWrap')
  if (!authWrap) {
    console.error('❌ #authWrap não encontrado')
    return
  }
  const msg = motivo === 'cadastro'
    ? 'Para liberar seu acesso à plataforma, fale com nosso time comercial no WhatsApp.'
    : 'Sua conta ainda não foi liberada. Fale com nosso comercial:'

  authWrap.innerHTML = `
    <div class="auth-card" style="text-align:center; max-width: 420px; margin: 0 auto;">
      <div style="font-size:56px; margin-bottom:16px;">${motivo === 'cadastro' ? '🔒' : '⏳'}</div>
      <h2 style="color:var(--p, #10B981); font-size:24px; font-weight:800; margin-bottom:8px;">
        ${motivo === 'cadastro' ? 'Conta criada com sucesso!' : 'Acesso Pendente'}
      </h2>
      <p style="color:var(--tx2, #666); margin-bottom:24px; line-height:1.6;">${msg}</p>
      <a href="https://wa.me/${ZAP_NUMBER}?text=Olá, me cadastrei na Sulsafe com o email ${encodeURIComponent(email)}${motivo === 'login' ? ' e quero liberar meu acesso' : ''}" 
         target="_blank"
         class="btn btn-p btn-block" 
         style="background:#25D366; border-color:#25D366; color:#fff; margin-bottom:16px; display:inline-block; padding:12px 24px; border-radius:8px; text-decoration:none;">
         <i class="fab fa-whatsapp"></i> Chamar no WhatsApp
      </a>
      <p style="font-size:12px; color:var(--tx3, #999);">Atendimento: Segunda a Sexta, 8h às 18h</p>
    </div>
  `
  authWrap.classList.remove('off')
  const appWrap = document.getElementById('appWrap')
  if (appWrap) appWrap.style.display = 'none'
}

// ============================================================
// FUNÇÃO PARA ENTRAR NO DASHBOARD (com fallback)
// ============================================================
function showDashboard() {
  console.log('🚪 Entrando no dashboard...')
  
  // Oculta autenticação
  const authWrap = document.getElementById('authWrap')
  if (authWrap) {
    authWrap.classList.add('off')
    authWrap.style.display = 'none'
  }
  
  // Mostra o app principal
  const appWrap = document.getElementById('appWrap')
  if (appWrap) {
    appWrap.style.display = '' // ou 'flex' / 'block' conforme seu layout
  } else {
    console.warn('⚠️ #appWrap não encontrado, criando um container')
    const newApp = document.createElement('div')
    newApp.id = 'appWrap'
    newApp.style.display = 'block'
    document.body.prepend(newApp)
  }
  
  // Tenta usar enterDash se existir, senão faz manual
  try {
    if (typeof enterDash === 'function') {
      enterDash()
    } else {
      console.warn('enterDash não está definido, renderizando manualmente')
      // Manual: renderizar sidebar e view inicial
      if (typeof renderSB === 'function') renderSB()
      if (typeof renderV === 'function') renderV('inicio')
    }
  } catch (e) {
    console.error('Erro ao renderizar dashboard:', e)
    // Fallback mínimo: mostra a view de início em um container simples
    const main = document.getElementById('mainView') || document.createElement('div')
    main.id = 'mainView'
    main.innerHTML = '<h1>Bem-vindo</h1><p>Dashboard carregado (fallback)</p>'
    if (!document.getElementById('mainView')) document.body.appendChild(main)
  }
}

// ============================================================
// EVENTO: CADASTRO (FORÇA INSERT E NÃO LOGA AUTOMATICAMENTE)
// ============================================================
document.querySelector('#frmCad')?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nome = document.querySelector('#cNome').value.trim()
  const email = document.querySelector('#cEmail').value.trim().toLowerCase()
  const pass = document.querySelector('#cPass').value
  const pass2 = document.querySelector('#cPass2')?.value
  const termos = document.querySelector('#cTermos')?.checked

  if (!nome || !email || !pass) return toast('Preencha todos os campos', 'error')
  if (pass2 !== undefined && pass !== pass2) return toast('As senhas não coincidem', 'error')
  if (termos !== undefined && !termos) return toast('Aceite os termos de uso', 'error')

  // 1. Cria no Auth
  const { data, error } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { nome_completo: nome } }
  })
  if (error) return toast('Erro: ' + error.message, 'error')
  if (!data.user) return toast('Erro ao criar usuário', 'error')

  // 2. FORÇA O INSERT NA TABELA profiles
  const { error: profileErr } = await sb
    .from('profiles')
    .insert({
      id: data.user.id,
      email: email,
      nome_completo: nome,
      status: 'pendente',
      role: 'aluno'
    })

  if (profileErr) {
    console.error('DEU RUIM NO INSERT:', profileErr)
    await sb.auth.admin.deleteUser(data.user.id).catch(() => {})
    return toast('Erro ao criar perfil: ' + profileErr.message, 'error')
  }

  // 3. Desloga e limpa storages
  await sb.auth.signOut()
  localStorage.removeItem('ss_user')
  localStorage.removeItem('ss_session')

  // 4. Mostra balão do Zap
  showPendenciaScreen(email, 'cadastro')
})

// ============================================================
// EVENTO: LOGIN (BLOQUEIA SE PENDENTE)
// ============================================================
document.querySelector('#frmLogin')?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.querySelector('#lEmail').value.trim().toLowerCase()
  const pass = document.querySelector('#lPass').value

  if (!email || !pass) return toast('Preencha todos os campos', 'error')

  const { data: auth, error } = await sb.auth.signInWithPassword({ email, password: pass })
  if (error) return toast(error.message, 'error')

  // Busca o perfil
  const { data: profile } = await sb
    .from('profiles')
    .select('status, role')
    .eq('id', auth.user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || email === 'sulsafetreinamentos@gmail.com'
  if (!profile || (profile.status === 'pendente' && !isAdmin)) {
    await sb.auth.signOut()
    localStorage.removeItem('ss_user')
    localStorage.removeItem('ss_session')
    showPendenciaScreen(email, 'login')
    return
  }

  // Se ativo, recarrega para o auto-login
  window.location.reload()
})

// ============================================================
// INICIALIZAÇÃO (auto-login com verificação de status)
// ============================================================
;(async function() {
  console.log('🔍 Iniciando auto-login...')
  try {
    // 1. Tenta obter sessão ativa do Supabase
    const { data: { session } } = await sb.auth.getSession()
    if (session) {
      const { data: user } = await sbGetUser(session.user.id)
      if (user) {
        const isAdmin = user.role === 'admin' || user.email === 'sulsafetreinamentos@gmail.com'
        if (!isAdmin && user.status === 'pendente') {
          console.log('⛔ Usuário pendente – bloqueando')
          await sb.auth.signOut()
          localStorage.removeItem('ss_user')
          showPendenciaScreen(user.email, 'login')
          return
        }

        console.log('✅ Usuário liberado:', user.email)
        S.user = user
        localStorage.setItem('ss_user', JSON.stringify(user))
        loadCfg()
        showDashboard() // ← usando nossa função robusta
        return
      }
    }

    // 2. Fallback: localStorage
    const sessionData = localStorage.getItem('ss_session')
    if (sessionData) {
      const { id } = JSON.parse(sessionData)
      const { data: user } = await sbGetUser(id)
      if (user) {
        const isAdmin = user.role === 'admin' || user.email === 'sulsafetreinamentos@gmail.com'
        if (!isAdmin && user.status === 'pendente') {
          await sb.auth.signOut()
          localStorage.removeItem('ss_user')
          localStorage.removeItem('ss_session')
          showPendenciaScreen(user.email, 'login')
          return
        }
        S.user = user
        localStorage.setItem('ss_user', JSON.stringify(user))
        loadCfg()
        showDashboard()
        return
      }
    }

    // 3. Se não logado, exibe tela de autenticação
    console.log('🔓 Nenhuma sessão – mostrando login')
    const authWrap = document.getElementById('authWrap')
    if (authWrap) {
      authWrap.classList.remove('off')
      authWrap.style.display = '' // remove inline style caso exista
      const appWrap = document.getElementById('appWrap')
      if (appWrap) appWrap.style.display = 'none'
    } else {
      console.error('❌ #authWrap não encontrado no DOM!')
    }
  } catch (e) {
    console.error('❌ Erro no auto-login:', e)
    const authWrap = document.getElementById('authWrap')
    if (authWrap) {
      authWrap.classList.remove('off')
      authWrap.style.display = ''
    }
  }
})()
