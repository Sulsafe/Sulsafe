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
const ZAP_NUMBER = '(55)53997060864' 
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
    <div class="auth-card" style="text-align:center; max-width: 420px;">
      <div style="font-size:56px; margin-bottom:16px;">${motivo === 'cadastro' ? '🔒' : '⏳'}</div>
      <h2 style="color:var(--p); font-size:24px; font-weight:800; margin-bottom:8px;">
        ${motivo === 'cadastro' ? 'Conta criada com sucesso!' : 'Acesso Pendente'}
      </h2>
      <p style="color:var(--tx2); margin-bottom:24px; line-height:1.6;">${msg}</p>
      <a href="https://wa.me/${ZAP_NUMBER}?text=Olá, me cadastrei na Sulsafe com o email ${encodeURIComponent(email)}${motivo === 'login' ? ' e quero liberar meu acesso' : ''}" 
         target="_blank"
         class="btn btn-p btn-block" 
         style="background:#25D366; border-color:#25D366; margin-bottom:16px;">
         <i class="fab fa-whatsapp"></i> Chamar no WhatsApp
      </a>
      <p style="font-size:12px; color:var(--tx3);">Atendimento: Segunda a Sexta, 8h às 18h</p>
    </div>
  `
  authWrap.classList.remove('off')
  const appWrap = document.getElementById('appWrap')
  if (appWrap) appWrap.style.display = 'none'
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

  // Validações básicas
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
  return toast('Erro ao criar perfil: ' + profileErr.message, 'error')
}

  await sb.auth.signOut()
  localStorage.removeItem('ss_user')
  localStorage.removeItem('ss_session')

  showPendenciaScreen(email, 'cadastro')
})

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
    .select('status')
    .eq('id', auth.user.id)
    .single()

  // Se pendente ou sem perfil, bloqueia
  if (!profile || profile.status === 'pendente') {
    await sb.auth.signOut()
    localStorage.removeItem('ss_user')
    localStorage.removeItem('ss_session')
    showPendenciaScreen(email, 'login')
    return
  }

  // Se ativo, recarrega para o auto-login entrar
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
        // REGRA: Só bloqueia se NÃO for admin E estiver pendente
        const isAdmin = user.role === 'admin' || user.email === 'sulsafetreinamentos@gmail.com'
        
        if (!isAdmin && user.status === 'pendente') {
          console.log('⛔ Usuário pendente – bloqueando')
          await sb.auth.signOut()
          localStorage.removeItem('ss_user')
          showPendenciaScreen(user.email, 'login')
          return
        }

        // Se chegou aqui, está liberado
        console.log('✅ Usuário liberado:', user.email)
        localStorage.setItem('ss_user', JSON.stringify(user))
        showView('main-view') 
        return
      } // fecha if (user)
    } // fecha if (session)
    
    // 2. Se não tem sessão, mostra tela de login
    console.log('🔓 Nenhuma sessão – mostrando login')
    showView('login-view')
    
  } catch (e) {
    console.error('Erro no auto-login:', e)
    showView('login-view')
  }
})() // fecha async function
        // Se chegou aqui, está liberado
        console.log('✅ Usuário liberado:', user.email)
        localStorage.setItem('ss_user', JSON.stringify(user))
        showView('main-view') // ou window.location.href = '/dashboard.html'
        return // IMPORTANTE: para não cair no login
      }
    }
    
    // 2. Se não tem sessão, mostra tela de login
    console.log('🔓 Nenhuma sessão – mostrando login')
    showView('login-view')
    
  } catch (e) {
    console.error('Erro no auto-login:', e)
    showView('login-view')
  }
})()
    
    // Se chegou aqui, pode logar
    console.log('✅ Usuário liberado:', user.email)
  }
}
        // Ativo – entra no dashboard
        console.log('✅ Usuário ativo – acessando dashboard')
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
    console.log('🔓 Nenhuma sessão – mostrando login')
    const authWrap = document.getElementById('authWrap')
    if (authWrap) {
      authWrap.classList.remove('off')
      const appWrap = document.getElementById('appWrap')
      if (appWrap) appWrap.style.display = 'none'
    } else {
      console.error('❌ #authWrap não encontrado no DOM!')
    }
  } catch (e) {
    console.error('❌ Erro no auto-login:', e)
    const authWrap = document.getElementById('authWrap')
    if (authWrap) authWrap.classList.remove('off')
  }
})()
