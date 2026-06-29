// ============================================================
// MAIN - PONTO DE ENTRADA DA APLICAÇÃO
// ============================================================
import { S, registerView, setRenderSidebar, nav, loadCfg } from './state.js'
import { sb, sbGetUser } from './supabase-client.js'
import { vInicio } from './views/inicio.js'
import { vVideoaulas } from './views/videoaulas.js'
import { vMateriais } from './views/materiais.js'
import { vSalas } from './views/salas.js'
import { vNRs } from './views/nrs.js'
import { vIA } from './views/ia.js'
import { vBoletim } from './views/boletim.js'
import { vProvas } from './views/provas.js'
import { vCerts } from './views/certificados.js'
import { vAdmin } from './views/admin.js'
import { vConfig } from './views/config.js'
import { vPendentes } from './views/pendentes.js'
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

// (A view 'subir' foi removida intencionalmente)

// Configurar referência para renderSidebar
setRenderSidebar(renderSB)

// Inicialização
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
