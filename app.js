import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient('https://dhhvhiyoxadcwsfqlndw.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ')

const CONFIG = {
    nomeEmpresa: "SulSafe",
    logoUrl: "https://uwzbafqptjstqafsjhvp.supabase.co/storage/v1/object/public/sulsafe-assets/logo1.png",
    authRedirectUrl: window.location.origin + window.location.pathname
}

// ===== FUNÇÕES DE UTILIDADE =====
function escapeHtml(s) {
    return String(s || '').replace(/[&<>\"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]))
}

function mostrarErro(msg) {
    const el = document.getElementById('errorTooltip')
    if (el) {
        el.innerText = msg
        el.style.display = 'block'
        setTimeout(() => el.style.display = 'none', 4000)
    }
}

function traduzirErroAuth(msg) {
    const m = (msg || '').toLowerCase()
    if (m.includes('invalid login')) return 'E-mail ou senha incorreto.'
    if (m.includes('not confirmed')) return 'Confirme seu e-mail antes de entrar.'
    if (m.includes('already registered')) return 'E-mail já cadastrado.'
    return msg
}

// ===== VARIÁVEIS GLOBAIS =====
let usuarioAtual = null
let usuarioId = null
let perfilUsuario = null
let ehProfessor = false
let salaAtual = null
let jitsiApi = null
let isRecording = false
let todasAulas = []
let todosTrabalhos = []
let currentChart = null
let relatorioData = []
let salaRealtimeChannel = null
let equipeAtualId = null

// ===== DADOS DAS NORMAS REGULAMENTADORAS =====
const todasNrs = [
    { num: "NR-01", nome: "Disposições Gerais e Gerenciamento de Riscos", icon: "📋", cat: "geral", tag: "geral",
        desc: "Estabelece as disposições gerais, o campo de aplicação, os termos e definições das NRs, e o Programa de Gerenciamento de Riscos (PGR) para identificar e controlar riscos no ambiente de trabalho.",
        objs: ["Gerenciar riscos ocupacionais", "Elaborar o PGR", "Definir responsabilidades de empregadores e empregados", "Inventariar fontes de risco"] },
    { num: "NR-03", nome: "Embargo ou Interdição", icon: "🚫", cat: "geral", tag: "geral",
        desc: "Estabelece os critérios para embargo de obra e interdição de estabelecimento, setor de serviço, máquina ou equipamento quando houver risco grave e iminente.",
        objs: ["Embargo de obras com risco grave", "Interdição de máquinas perigosas", "Ação fiscal do Auditor do Trabalho"] },
    { num: "NR-05", nome: "CIPA", icon: "🤝", cat: "geral", tag: "geral",
        desc: "Trata da CIPA, organismo paritário formado por representantes do empregador e dos empregados para prevenir acidentes e doenças do trabalho.",
        objs: ["Eleição dos membros da CIPA", "Mapas de riscos ambientais", "Realização da SIPAT", "Estabilidade do cipeiro eleito"] },
    { num: "NR-06", nome: "Equipamentos de Proteção Individual (EPI)", icon: "🦺", cat: "geral", tag: "geral",
        desc: "Define os EPIs como todo dispositivo de uso individual destinado a proteger a saúde e integridade física do trabalhador.",
        objs: ["Fornecimento gratuito pelo empregador", "Certificado de Aprovação (CA)", "Treinamento para uso do EPI", "Higienização e substituição"] },
    { num: "NR-35", nome: "Trabalho em Altura", icon: "🧗", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura acima de 2,0 m.",
        objs: ["Altura mínima: acima de 2,0 m", "Permissão de Trabalho em Altura (PTA)", "Cinto de segurança tipo paraquedista", "Treinamento teórico e prático obrigatório"] },
    { num: "NR-33", nome: "Espaços Confinados", icon: "🕳️", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos para identificação de espaços confinados e trabalho nesses locais.",
        objs: ["Permissão de Entrada e Trabalho (PET)", "Supervisor, vigias e trabalhadores autorizados", "Monitoramento da atmosfera", "Resgate em espaço confinado"] }
]

let filtroNrAtivo = 'todos'
let termoBuscaNr = ''
let nrSelecionadaAtual = null

// ===== FUNÇÕES DAS NRS =====
function renderizarNrs() {
    const grid = document.getElementById('gridNrs')
    const noRes = document.getElementById('noResultsNrs')
    if (!grid) return

    let filtradas = todasNrs.filter(nr => {
        const matchFilter = filtroNrAtivo === 'todos' || nr.cat === filtroNrAtivo
        const matchSearch = termoBuscaNr === '' ||
            nr.nome.toLowerCase().includes(termoBuscaNr) ||
            nr.num.toLowerCase().includes(termoBuscaNr) ||
            nr.desc.toLowerCase().includes(termoBuscaNr)
        return matchFilter && matchSearch
    })

    if (filtradas.length === 0) {
        grid.innerHTML = ''
        if (noRes) noRes.style.display = 'block'
        return
    }
    if (noRes) noRes.style.display = 'none'

    grid.innerHTML = filtradas.map(nr => `
        <div class="nr-card" onclick="abrirModalNr('${nr.num}')">
            <span class="tag tag-${nr.tag}">${nr.tag === 'geral' ? 'Geral' : nr.tag === 'saude' ? 'Saúde' : 'Setorial'}</span>
            <span class="card-icon">${nr.icon}</span>
            <span class="nr-num">${nr.num}</span>
            <h3>${escapeHtml(nr.nome)}</h3>
            <p>${escapeHtml(nr.desc.substring(0, 80))}...</p>
        </div>
    `).join('')
}

function setFiltroNr(f, btn) {
    filtroNrAtivo = f
    document.querySelectorAll('#filterBarNrs .filter-btn').forEach(b => b.classList.remove('active'))
    if (btn) btn.classList.add('active')
    renderizarNrs()
}

function filtrarNrs() {
    const input = document.getElementById('searchNrs')
    termoBuscaNr = input ? input.value.toLowerCase().trim() : ''
    renderizarNrs()
}

function abrirModalNr(num) {
    const nr = todasNrs.find(n => n.num === num)
    if (!nr) return
    nrSelecionadaAtual = nr
    document.getElementById('mNrIcon').textContent = nr.icon
    document.getElementById('mNrNum').textContent = nr.num
    document.getElementById('mNrTitle').textContent = nr.nome
    document.getElementById('mNrDesc').textContent = nr.desc
    document.getElementById('mNrObjs').innerHTML = nr.objs.map(o => `<li>${escapeHtml(o)}</li>`).join('')
    document.getElementById('modalNrBg').classList.add('open')
}

function fecharModalNr(e) {
    if (e.target === document.getElementById('modalNrBg')) {
        document.getElementById('modalNrBg').classList.remove('open')
        nrSelecionadaAtual = null
    }
}

function perguntarSobreNR() {
    if (!nrSelecionadaAtual) return
    const { num, nome } = nrSelecionadaAtual
    document.getElementById('modalNrBg').classList.remove('open')
    alternarView('ia')
    setTimeout(() => {
        const input = document.getElementById('iaChatInput')
        if (input) {
            input.value = `Explique a ${num} - ${nome} de forma resumida e dê exemplos práticos para estudantes de segurança do trabalho.`
            enviarPerguntaIA()
        }
    }, 400)
}

// ===== FUNÇÃO DA IA =====
window.enviarPerguntaIA = async () => {
    const input = document.getElementById('iaChatInput')
    const pergunta = input.value.trim()
    if (!pergunta) return

    const box = document.getElementById('iaChatMessages')
    box.innerHTML += `<div class="ia-msg user">${escapeHtml(pergunta)}</div>`
    input.value = ''

    const loading = document.createElement('div')
    loading.className = 'ia-msg bot'
    loading.textContent = '⏳ Buscando resposta...'
    box.appendChild(loading)
    box.scrollTop = box.scrollHeight

    try {
        console.log('📤 Enviando pergunta para a Edge Function...')

        const { data, error } = await supabase.functions.invoke('gemini-chat-import', {
            body: { prompt: `Você é especialista em Segurança do Trabalho. ${pergunta}` }
        })

        console.log('📥 Resposta recebida:', data)

        loading.remove()

        if (data && data.response) {
            box.innerHTML += `<div class="ia-msg bot">${escapeHtml(data.response)}</div>`
            box.scrollTop = box.scrollHeight
            return
        }

        if (data && data.error) {
            box.innerHTML += `
                <div class="ia-msg bot">
                    <strong>❌ Erro na IA</strong><br><br>
                    ${escapeHtml(data.error)}
                </div>
            `
            box.scrollTop = box.scrollHeight
            return
        }

        box.innerHTML += `
            <div class="ia-msg bot">
                <strong>⚠️ Não foi possível obter uma resposta da IA</strong><br><br>
                Tente novamente mais tarde.
            </div>
        `
        box.scrollTop = box.scrollHeight

    } catch (err) {
        console.error('❌ Erro ao chamar a Edge Function:', err)
        loading.remove()
        box.innerHTML += `
            <div class="ia-msg bot">
                <strong>❌ Erro ao conectar com a IA</strong><br><br>
                ${escapeHtml(err.message || 'Erro desconhecido')}
            </div>
        `
        box.scrollTop = box.scrollHeight
    }
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
window.fazerLogin = async () => {
    const email = document.getElementById('loginEmail').value
    const senha = document.getElementById('loginSenha').value
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) { alert(traduzirErroAuth(error.message)); return }
    usuarioAtual = data.user.email
    usuarioId = data.user.id
    document.getElementById('dashUserName').innerHTML = usuarioAtual
    entrarDashboard()
}

window.fazerCadastro = async () => {
    const nome = document.getElementById('cadNome').value
    const email = document.getElementById('cadEmail').value
    const senha = document.getElementById('cadSenha').value
    const senha2 = document.getElementById('cadSenha2').value
    if (senha !== senha2) { alert('Senhas não coincidem'); return }
    if (senha.length < 6) { alert('Senha mínimo 6 caracteres'); return }
    const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: { data: { nome_completo: nome, role: 'aluno' }, emailRedirectTo: CONFIG.authRedirectUrl }
    })
    if (error) { alert(traduzirErroAuth(error.message)); return }
    alert('Conta criada! Confirme seu e-mail.')
    window.mostrarTela('login')
}

window.recuperarSenha = async () => {
    const email = document.getElementById('recEmail').value
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: CONFIG.authRedirectUrl })
    if (error) { alert(traduzirErroAuth(error.message)); return }
    document.getElementById('msgSucessoRec').style.display = 'block'
    setTimeout(() => {
        document.getElementById('msgSucessoRec').style.display = 'none'
        window.mostrarTela('login')
    }, 3000)
}

window.fazerLogout = async () => {
    await supabase.auth.signOut()
    if (jitsiApi) jitsiApi.dispose()
    if (salaRealtimeChannel) await supabase.removeChannel(salaRealtimeChannel)
    window.location.href = 'index.html'
}

function entrarDashboard() {
    document.getElementById('authContainer').classList.add('hidden')
    document.getElementById('heroContainer').classList.add('hidden')
    document.getElementById('heroTexto').classList.add('hidden')
    document.getElementById('overlay').classList.add('hidden')
    document.getElementById('dashboard').classList.add('active')
    window.atualizarListaSalas()
}

// ===== FUNÇÃO MOSTRAR TELA =====
window.mostrarTela = (tela) => {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('active'))
    document.getElementById(`tela${tela.charAt(0).toUpperCase() + tela.slice(1)}`).classList.add('active')
}

// ===== FUNÇÃO ALTERNAR VIEW =====
window.alternarView = (viewId) => {
    const views = ['Home', 'Videoaulas', 'Salas', 'Materiais', 'Aluno', 'Ia', 'Equipe', 'Config', 'Trabalhos', 'Relatorio', 'Financeiro', 'Boletim', 'BoletimAluno', 'Nrs']
    views.forEach(v => { const el = document.getElementById(`view${v}`); if (el) el.style.display = 'none' })
    const target = document.getElementById(`view${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`)
    if (target) target.style.display = 'block'
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active')
    if (viewId === 'nrs') { renderizarNrs() }
    if (viewId === 'salas') { window.atualizarListaSalas() }
}

// ===== FUNÇÕES DE SALAS =====
function getSalas() {
    return JSON.parse(localStorage.getItem('sulsafe_salas') || '[]')
}

window.atualizarListaSalas = () => {
    const container = document.getElementById('meetingList')
    if (!container) return
    const salas = getSalas()
    if (!salas.length) {
        container.innerHTML = '<li style="color:var(--texto-sec); text-align:center; padding:28px; list-style:none;">📭 Nenhuma sala ativa no momento.</li>'
        return
    }
    container.innerHTML = ''
    salas.forEach(sala => {
        const li = document.createElement('li')
        li.className = 'meeting-card'
        li.innerHTML = `
            <div>
                <div class="meeting-topic">${escapeHtml(sala.topic)}</div>
                <div class="meeting-id">ID: ${escapeHtml(sala.id)}</div>
                <div><small>Criada por: ${escapeHtml(sala.leader || 'Professor')}</small></div>
            </div>
            <button class="btn-entrar" onclick="alert('Função entrarSala em desenvolvimento')">ENTRAR</button>
        `
        container.appendChild(li)
    })
}

window.criarReuniaoLocal = () => {
    if (!ehProfessor) {
        mostrarErro('Apenas professores e administradores podem criar salas.')
        return
    }
    const nome = document.getElementById('meetingName').value.trim()
    if (!nome) { mostrarErro('Digite um nome para a sala'); return }
    const salas = getSalas()
    salas.push({ id: 'ss-' + Date.now(), topic: nome, leader: usuarioAtual || 'Professor' })
    localStorage.setItem('sulsafe_salas', JSON.stringify(salas))
    document.getElementById('meetingName').value = ''
    window.atualizarListaSalas()
    mostrarErro('✅ Sala criada com sucesso!')
}

// ===== FUNÇÕES DE VIDEOAULAS =====
function getAulasLocal() {
    return JSON.parse(localStorage.getItem('sulsafe_videoaulas') || '[]')
}

function getProgressoLocal() {
    return JSON.parse(localStorage.getItem(`sulsafe_progresso_${usuarioId || 'anon'}`) || '{}')
}

function salvarProgressoLocal(obj) {
    localStorage.setItem(`sulsafe_progresso_${usuarioId || 'anon'}`, JSON.stringify(obj))
}

// ===== EXPORTA FUNÇÕES =====
window.setFiltroNr = setFiltroNr
window.filtrarNrs = filtrarNrs
window.abrirModalNr = abrirModalNr
window.fecharModalNr = fecharModalNr
window.perguntarSobreNR = perguntarSobreNR
window.renderizarNrs = renderizarNrs
window.enviarPerguntaIA = window.enviarPerguntaIA
window.getSalas = getSalas
window.atualizarListaSalas = window.atualizarListaSalas
window.criarReuniaoLocal = window.criarReuniaoLocal
window.getAulasLocal = getAulasLocal
window.getProgressoLocal = getProgressoLocal
window.salvarProgressoLocal = salvarProgressoLocal

console.log('✅ App.js carregado com sucesso!')
