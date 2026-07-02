// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO
// ============================================================
import { S, registerView, setRenderSidebar, loadCfg } from './state.js'
import { sb, sbGetUser } from './supabase-client.js'

// Views que estão em js/views/
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

// Views que estão na raiz de js/
import { vVideoaulas } from './videoaulas.js'
import { vMateriais } from './materiais.js'

import { renderSB, renderV, enterDash } from './app.js'

// Registrar todas as views
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

// Configura a função de renderização da sidebar (usada em app.js)
setRenderSidebar(renderSB)

// ============================================================
// CONSTANTES
// ============================================================
const ZAP_NUMBER = '53 997060864' // ← substitua pelo número comercial real

// ============================================================
// TOAST (feedback rápido)
// ============================================================
function toast(msg, tipo = 'ok') {
  const t = document.querySelector('#toast')
  if (!t) {
    console.warn('Toast element not found:', msg)
    return
  }
  t.textContent = msg
  t.className = `on ${tipo}`
  clearTimeout(t._timeout)
  t._timeout = setTimeout(() => t.className = '', 3000)
}

// ============================================================
// BLOQUEAR TELA DE AUTENTICAÇÃO (exibe mensagem de pendência)
// ============================================================
function showPendenciaScreen(email, motivo = 'cadastro') {
  const authWrap = document.getElementById('authWrap')
  if (!authWrap) return
  const msg = motivo === 'cadastro'
    ? 'Para liberar seu acesso à plataforma, fale com nosso time comercial no WhatsApp.'
    : 'Sua conta ainda não foi liberada. Fale com nosso comercial:'

  authWrap.innerHTML = `
    <div class="auth-card" style="text-align:center; max-width: 420px;">
      <div style="font-size: 56px; margin-bottom: 16px;">${motivo === 'cadastro' ? '🔒' : '⏳'}</div>
      <h2 style="color: var(--p); font-size: 24px; font-weight: 800; margin-bottom: 8px;">
        ${motivo === 'cadastro' ? 'Conta criada com sucesso!' : 'Acesso Pendente'}
      </h2>
      <p style="color: var(--tx2); margin-bottom: 24px; line-height: 1.6;">${msg}</p>
      <a href="https://wa.me/${ZAP_NUMBER}?text=Olá, me cadastrei na Sulsafe com o email ${encodeURIComponent(email)}${motivo === 'login' ? ' e quero liberar meu acesso' : ''}" 
         target="_blank"
         class="btn btn-p btn-block" 
         style="background: #25D366; border-color: #25D366; margin-bottom: 16px;">
         <i class="fab fa-whatsapp"></i> Chamar no WhatsApp
      </a>
      <p style="font-size: 12px; color: var(--tx3);">
        Atendimento: Segunda a Sexta, 8h às 18h
      </p>
    </div>
  `
  authWrap.classList.remove('off')
}

// ============================================================
// EVENTO: CADASTRO
// ============================================================
document.querySelector('#frmCad')?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nome = document.querySelector('#cNome').value.trim()
  const email = document.querySelector('#cEmail').value.trim().toLowerCase()
  const pass = document.querySelector('#cPass').value
  const pass2 = document.querySelector('#cPass2').value
  const termos = document.querySelector('#cTermos').checked

  if (!nome || !email || !pass) return toast('Preencha todos os campos', 'error')
  if (pass !== pass2) return toast('As senhas não coincidem', 'error')
  if (!termos) return toast('Aceite os termos de uso', 'error')

  // 1. Cria conta no Auth
  const { data: auth, error: authErr } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { nome_completo: nome } }
  })

  if (authErr) return toast(authErr.message, 'error')
  if (!auth.user) return toast('Erro ao criar usuário', 'error')

  // 2. Cria profile como PENDENTE
  const { error: profileErr } = await sb
    .from('profiles')
    .insert({
      id: auth.user.id,
      email: email,
      nome: nome,
      status: 'pendente',
      plano: null,
      role: 'aluno'
    })

  if (profileErr) {
    // Se falhar, tenta deletar o usuário criado (opcional)
    await sb.auth.admin.deleteUser(auth.user.id).catch(() => {})
    return toast('Erro ao criar perfil: ' + profileErr.message, 'error')
  }

  // 3. Trava tudo e mostra balão do Zap
  showPendenciaScreen(email, 'cadastro')
})

// ============================================================
// EVENTO: LOGIN
// ============================================================
document.querySelector('#frmLogin')?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.querySelector('#lEmail').value.trim().toLowerCase()
  const pass = document.querySelector('#lPass').value

  if (!email || !pass) return toast('Preencha todos os campos', 'error')

  const { data: auth, error } = await sb.auth.signInWithPassword({ email, password: pass })
  if (error) return toast(error.message, 'error')

  // Busca perfil
  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('status')
    .eq('id', auth.user.id)
    .single()

  if (profileError || !profile) {
    await sb.auth.signOut()
    return toast('Perfil não encontrado', 'error')
  }

  // Se pendente, bloqueia
  if (profile.status === 'pendente') {
    await sb.auth.signOut()
    showPendenciaScreen(email, 'login')
    return
  }

  // Se não for pendente, recarrega a página para o auto-login entrar no dashboard
  window.location.reload()
})

// ============================================================
// INICIALIZAÇÃO (auto-login com verificação de status)
// ============================================================
;(async function() {
  try {
    // 1. Tenta obter sessão ativa do Supabase
    const { data: { session } } = await sb.auth.getSession()
    if (session) {
      const { data: user } = await sbGetUser(session.user.id)
      if (user) {
        // Verifica se o perfil está pendente
        if (user.status === 'pendente') {
          // Se pendente, faz logout e mostra tela de pendência
          await sb.auth.signOut()
          localStorage.removeItem('ss_user')
          showPendenciaScreen(user.email, 'login')
          return
        }

        // Usuário ativo → entra no dashboard
        S.user = user
        localStorage.setItem('ss_user', JSON.stringify(user))
        loadCfg()
        enterDash()
        return
      }
    }

    // 2. Fallback: sessão salva em localStorage (versão antiga)
    const sessionData = localStorage.getItem('ss_session')
    if (sessionData) {
      const { id } = JSON.parse(sessionData)
      const { data: user } = await sbGetUser(id)
      if (user) {
        if (user.status === 'pendente') {
          await sb.auth.signOut()
          localStorage.removeItem('ss_user')
          localStorage.removeItem('ss_session')
          showPendenciaScreen(user.email, 'login')
          return
        }
        S.user = user
        localStorage.setItem('ss_user', JSON.stringify(user))
        loadCfg()
        enterDash()
        return
      }
    }

    // 3. Se não logado, exibe tela de autenticação
    const authWrap = document.getElementById('authWrap')
    if (authWrap) authWrap.classList.remove('off')
  } catch (e) {
    console.warn('Erro no auto-login:', e)
    // Em caso de erro, mostra a tela de auth
    const authWrap = document.getElementById('authWrap')
    if (authWrap) authWrap.classList.remove('off')
  }
})()
