// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO
// ============================================================
import { S, registerView, setRenderSidebar, nav, loadCfg } from './state.js'
import { sb, sbGetUser } from './supabase-client.js'
import { handleLogin, handleCadastro } from './auth.js'

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

// Views que estão na raiz de js/ (por enquanto)
import { vVideoaulas } from './videoaulas.js'
import { vMateriais } from './materiais.js'

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
        // Fallback para sessão antiga
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
