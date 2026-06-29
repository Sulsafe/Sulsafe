// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO
// ============================================================
import { S, registerView, setRenderSidebar, nav, loadCfg } from './state.js'
import { sb, sbGetUser } from './supabase-client.js'
import { handleLogin, handleCadastro } from './auth.js'   // ← importe as funções
import { vInicio } from './inicio.js'
import { vVideoaulas } from './videoaulas.js'
import { vMateriais } from './materiais.js'
import { vSalas } from './salas.js'
import { vNRs } from './nrs.js'
import { vIA } from './ia.js'
import { vBoletim } from './boletim.js'
import { vProvas } from './provas.js'
import { vCerts } from './certificados.js'
import { vAdmin } from './admin.js'
import { vConfig } from './config.js'
import { vPendentes } from './pendentes.js'
import { renderSB, renderV, enterDash, checkNotifs } from './app.js'

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

setRenderSidebar(renderSB)

// ============================================================
// CONFIGURAR EVENT LISTENERS DOS FORMULÁRIOS DE LOGIN/CADASTRO
// ============================================================
document.getElementById('frmLogin').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('lEmail').value.trim().toLowerCase()
    const password = document.getElementById('lPass').value
    await handleLogin(email, password)
})

document.getElementById('frmCad').addEventListener('submit', async (e) => {
    e.preventDefault()
    const nome = document.getElementById('cNome').value.trim()
    const email = document.getElementById('cEmail').value.trim().toLowerCase()
    const password = document.getElementById('cPass').value
    const confirm = document.getElementById('cPass2').value
    const termos = document.getElementById('cTermos').checked
    await handleCadastro(nome, email, password, confirm, termos)
})

// ============================================================
// INICIALIZAÇÃO (auto-login)
// ============================================================
;(async function() {
    try {
        const { data: { session } } = await sb.auth.getSession()
        if (session) {
            const { data: user } = await sbGetUser(session.user.id)
            if (user) {
                S.user = user
                localStorage.setItem('ss_user', JSON.stringify(user))
                loadCfg()
                enterDash()
                return
            }
        }
        // Fallback
        const sessionData = localStorage.getItem('ss_session')
        if (sessionData) {
            const { id } = JSON.parse(sessionData)
            const { data: user } = await sbGetUser(id)
            if (user) {
                S.user = user
                localStorage.setItem('ss_user', JSON.stringify(user))
                loadCfg()
                enterDash()
                return
            }
        }
        // Se não logado, mostrar auth
        document.getElementById('authWrap').classList.remove('off')
    } catch (e) {
        console.log('Erro no auto-login:', e)
    }
})()
