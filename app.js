import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient('https://dhhvhiyoxadcwsfqlndw.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ')

const CONFIG = {
    nomeEmpresa: "SulSafe",
    logoUrl: "https://uwzbafqptjstqafsjhvp.supabase.co/storage/v1/object/public/sulsafe-assets/logo1.png",
    authRedirectUrl: window.location.origin + window.location.pathname
}

// ============================================================
// ===== FUNÇÕES DE UTILIDADE =====
// ============================================================
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
        el.style.background = '#D32F2F'
        setTimeout(() => el.style.display = 'none', 4000)
    }
}

function mostrarSucesso(msg) {
    const el = document.getElementById('errorTooltip')
    if (el) {
        el.innerText = msg
        el.style.display = 'block'
        el.style.background = '#2E7D32'
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

// ============================================================
// ===== VARIÁVEIS GLOBAIS =====
// ============================================================
let usuarioAtual = null
let usuarioId = null
let perfilUsuario = null
let ehProfessor = false
let salaAtual = null
// Nota: jitsiApi, isRecording, salaRealtimeChannel são usados nas funções de sala/reunião (implementação futura)
let jitsiApi = null
let isRecording = false
let salaRealtimeChannel = null

// ============================================================
// ===== DADOS DAS NORMAS REGULAMENTADORAS =====
// ============================================================
const todasNrs = [
    { num: "NR-01", nome: "Disposições Gerais e Gerenciamento de Riscos", icon: "📋", cat: "geral", tag: "geral",
        desc: "Estabelece as disposições gerais, o campo de aplicação, os termos e definições das NRs, e o Programa de Gerenciamento de Riscos (PGR) para identificar e controlar riscos no ambiente de trabalho.",
        objs: ["Gerenciar riscos ocupacionais", "Elaborar o PGR", "Definir responsabilidades de empregadores e empregados", "Inventariar fontes de risco"] },
    { num: "NR-03", nome: "Embargo ou Interdição", icon: "🚫", cat: "geral", tag: "geral",
        desc: "Estabelece os critérios para embargo de obra e interdição de estabelecimento, setor de serviço, máquina ou equipamento quando houver risco grave e iminente.",
        objs: ["Embargo de obras com risco grave", "Interdição de máquinas perigosas", "Ação fiscal do Auditor do Trabalho"] },
    { num: "NR-04", nome: "SESMT — Serviços Especializados em Eng. de Segurança", icon: "🏥", cat: "saude", tag: "saude",
        desc: "Obriga empresas com mais de 50 trabalhadores a manter o SESMT, composto por médico do trabalho, engenheiro de segurança, técnico de segurança, auxiliar de enfermagem e enfermeiro do trabalho.",
        objs: ["Dimensionamento do SESMT por grau de risco", "Médico e engenheiro de segurança obrigatórios", "Prevenção de doenças e acidentes"] },
    { num: "NR-05", nome: "CIPA — Comissão Interna de Prevenção de Acidentes", icon: "🤝", cat: "geral", tag: "geral",
        desc: "Trata da CIPA, organismo paritário formado por representantes do empregador e dos empregados para prevenir acidentes e doenças do trabalho.",
        objs: ["Eleição dos membros da CIPA", "Mapas de riscos ambientais", "Realização da SIPAT", "Estabilidade do cipeiro eleito"] },
    { num: "NR-06", nome: "Equipamentos de Proteção Individual (EPI)", icon: "🦺", cat: "geral", tag: "geral",
        desc: "Define os EPIs como todo dispositivo de uso individual destinado a proteger a saúde e integridade física do trabalhador.",
        objs: ["Fornecimento gratuito pelo empregador", "Certificado de Aprovação (CA)", "Treinamento para uso do EPI", "Higienização e substituição"] },
    { num: "NR-07", nome: "PCMSO — Programa de Controle Médico de Saúde Ocupacional", icon: "🩺", cat: "saude", tag: "saude",
        desc: "Exige que os empregadores elaborem e implementem o PCMSO, com objetivo de promoção e preservação da saúde.",
        objs: ["Exame admissional obrigatório", "Exames periódicos", "Emissão do ASO", "Monitoramento de saúde"] },
    { num: "NR-08", nome: "Edificações", icon: "🏗️", cat: "especifico", tag: "especifico",
        desc: "Estabelece requisitos técnicos mínimos para garantir segurança nos locais de trabalho em edificações.",
        objs: ["Pisos antiderrapantes", "Altura mínima do pé-direito", "Escadas e rampas seguras", "Iluminação e ventilação"] },
    { num: "NR-09", nome: "Exposições Ocupacionais", icon: "⚗️", cat: "saude", tag: "saude",
        desc: "Estabelece a obrigatoriedade de identificar, avaliar e controlar as exposições a agentes físicos, químicos e biológicos.",
        objs: ["Identificação de agentes nocivos", "Avaliação quantitativa e qualitativa", "Medidas de controle coletivo", "Inventário de riscos"] },
    { num: "NR-10", nome: "Segurança em Eletricidade", icon: "⚡", cat: "especifico", tag: "especifico",
        desc: "Estabelece requisitos e condições mínimas para segurança e saúde de trabalhadores que interagem com instalações elétricas.",
        objs: ["Treinamento obrigatório em eletricidade", "Uso de EPE e EPI específicos", "Prontuário de instalações elétricas", "Sinalização de segurança"] },
    { num: "NR-11", nome: "Movimentação de Materiais", icon: "🏭", cat: "especifico", tag: "especifico",
        desc: "Estabelece requisitos de segurança para operações de transporte de cargas, incluindo equipamentos de elevação.",
        objs: ["Habilitação para operadores de empilhadeiras", "Capacidade máxima dos equipamentos", "Armazenamento seguro de cargas", "Manutenção periódica"] },
    { num: "NR-12", nome: "Máquinas e Equipamentos", icon: "⚙️", cat: "especifico", tag: "especifico",
        desc: "Define referências técnicas e medidas de proteção para garantir a saúde e integridade física dos trabalhadores que trabalham com máquinas.",
        objs: ["Proteção de partes móveis", "Distâncias seguras", "Manual de instruções em português", "Manutenção e inspeção"] },
    { num: "NR-13", nome: "Caldeiras e Vasos de Pressão", icon: "♨️", cat: "especifico", tag: "especifico",
        desc: "Estabelece requisitos de segurança para projeto, construção, instalação, operação, manutenção, inspeção de caldeiras e vasos de pressão.",
        objs: ["Inspeção periódica obrigatória", "Profissional Habilitado (PH)", "Prontuário do equipamento", "Válvulas de segurança"] },
    { num: "NR-15", nome: "Insalubridade", icon: "☣️", cat: "saude", tag: "saude",
        desc: "Define as atividades e operações insalubres que expõem os trabalhadores a agentes nocivos à saúde acima dos limites de tolerância.",
        objs: ["Adicional de insalubridade de 10% a 40%", "Limites de tolerância por agente", "Eliminação ou neutralização", "Laudo técnico (LTCAT)"] },
    { num: "NR-16", nome: "Periculosidade", icon: "💥", cat: "especifico", tag: "especifico",
        desc: "Define as atividades e operações perigosas que geram direito ao adicional de periculosidade de 30% sobre o salário-base.",
        objs: ["Adicional de periculosidade de 30%", "Inflamáveis e explosivos", "Energia elétrica e radiações", "Segurança pessoal e patrimonial"] },
    { num: "NR-17", nome: "Ergonomia", icon: "🪑", cat: "saude", tag: "saude",
        desc: "Estabelece parâmetros que permitem a adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores.",
        objs: ["Peso máximo para levantamento manual", "Altura e inclinação dos postos", "Pausas e jornada de trabalho", "Análise Ergonômica do Trabalho (AET)"] },
    { num: "NR-18", nome: "Construção Civil", icon: "🏚️", cat: "especifico", tag: "especifico",
        desc: "Estabelece diretrizes de ordem administrativa, de planejamento e de organização para implementação de medidas de controle nos canteiros de obras.",
        objs: ["PCMAT — Programa de Condições de Trabalho", "Andaimes e escadas seguras", "EPI para trabalho em altura", "Sinalização do canteiro"] },
    { num: "NR-20", nome: "Inflamáveis e Combustíveis", icon: "⛽", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos de segurança e saúde para atividades com inflamáveis e combustíveis.",
        objs: ["Aterramento elétrico de tanques", "Proibição de fontes de ignição", "Treinamento para operadores", "Plano de emergência"] },
    { num: "NR-23", nome: "Proteção Contra Incêndios", icon: "🔥", cat: "geral", tag: "geral",
        desc: "Estabelece as medidas de proteção contra incêndio que os locais de trabalho devem possuir.",
        objs: ["Saídas de emergência sinalizadas", "Extintores e hidrantes", "Brigada de incêndio treinada", "Plano de evacuação"] },
    { num: "NR-24", nome: "Condições Sanitárias", icon: "🚻", cat: "saude", tag: "saude",
        desc: "Determina os requisitos de higiene, conforto, instalações sanitárias, bebedouros, refeitórios e alojamentos nos locais de trabalho.",
        objs: ["Banheiros por número de trabalhadores", "Vestiários com armários individuais", "Bebedouros e refeitórios", "Alojamentos salubres"] },
    { num: "NR-26", nome: "Sinalização de Segurança", icon: "🚦", cat: "geral", tag: "geral",
        desc: "Fixa as cores a serem usadas nos locais de trabalho para identificação de equipamentos de segurança, delimitação de áreas e advertência de perigos.",
        objs: ["Vermelho = combate a incêndio", "Amarelo = atenção e risco", "Verde = segurança e saídas", "Azul = obrigação de usar EPI"] },
    { num: "NR-28", nome: "Fiscalização e Penalidades", icon: "⚖️", cat: "geral", tag: "geral",
        desc: "Estabelece os procedimentos de fiscalização do cumprimento das NRs, os critérios de autuação, as infrações e as penalidades.",
        objs: ["Auditores Fiscais do Trabalho", "Gradação das penalidades", "Auto de infração", "Recurso administrativo"] },
    { num: "NR-32", nome: "Serviços de Saúde", icon: "🏥", cat: "saude", tag: "saude",
        desc: "Estabelece as diretrizes básicas para a implementação de medidas de proteção à segurança e à saúde dos trabalhadores em serviços de saúde.",
        objs: ["Prevenção de acidentes com perfurocortantes", "Gestão de resíduos hospitalares", "Proteção contra agentes biológicos", "Vacinação dos profissionais"] },
    { num: "NR-33", nome: "Espaços Confinados", icon: "🕳️", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos para identificação de espaços confinados e trabalho nesses locais.",
        objs: ["Permissão de Entrada e Trabalho (PET)", "Supervisor, vigias e trabalhadores autorizados", "Monitoramento da atmosfera", "Resgate em espaço confinado"] },
    { num: "NR-35", nome: "Trabalho em Altura", icon: "🧗", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura acima de 2,0 m.",
        objs: ["Altura mínima: acima de 2,0 m", "Permissão de Trabalho em Altura (PTA)", "Cinto de segurança tipo paraquedista", "Treinamento teórico e prático obrigatório"] },
    { num: "NR-36", nome: "Frigoríficos", icon: "🥩", cat: "especifico", tag: "especifico",
        desc: "Estabelece os requisitos mínimos de segurança e saúde para os trabalhadores em atividades de abate e processamento de carnes.",
        objs: ["Pausas para recuperação térmica", "Rotação de tarefas", "Proteção contra cortes", "Monitoramento de DORT/LER"] }
]

let filtroNrAtivo = 'todos'
let termoBuscaNr = ''
let nrSelecionadaAtual = null

// ============================================================
// ===== FUNÇÕES DAS NRS =====
// ============================================================
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
            window.enviarPerguntaIA()
        }
    }, 400)
}

// ============================================================
// ===== FUNÇÃO DA IA =====
// ============================================================
window.enviarPerguntaIA = async () => {
    const input = document.getElementById('iaChatInput')
    const pergunta = input.value.trim()
    if (!pergunta) return

    const box = document.getElementById('iaChatMessages')
    box.innerHTML += `<div class="ia-msg user">${escapeHtml(pergunta)}</div>`
    input.value = ''

    const loading = document.createElement('div')
    loading.className = 'ia-msg bot'
    loading.textContent = 'Buscando resposta...'
    box.appendChild(loading)
    box.scrollTop = box.scrollHeight

    try {
        console.log('Enviando pergunta para a Edge Function...')

        const { data, error } = await supabase.functions.invoke('gemini-chat-import', {
            body: { prompt: `Você é especialista em Segurança do Trabalho. ${pergunta}` }
        })

        console.log('Resposta recebida:', data)

        loading.remove()

        if (data && data.response) {
            box.innerHTML += `<div class="ia-msg bot">${escapeHtml(data.response)}</div>`
            box.scrollTop = box.scrollHeight
            return
        }

        if (data && data.error) {
            box.innerHTML += `
                <div class="ia-msg bot">
                    <strong>Erro na IA</strong><br><br>
                    ${escapeHtml(data.error)}
                </div>
            `
            box.scrollTop = box.scrollHeight
            return
        }

        box.innerHTML += `
            <div class="ia-msg bot">
                <strong>Não foi possivel obter uma resposta da IA</strong><br><br>
                Tente novamente mais tarde.
            </div>
        `
        box.scrollTop = box.scrollHeight

    } catch (err) {
        console.error('Erro ao chamar a Edge Function:', err)
        loading.remove()
        box.innerHTML += `
            <div class="ia-msg bot">
                <strong>Erro ao conectar com a IA</strong><br><br>
                ${escapeHtml(err.message || 'Erro desconhecido')}
            </div>
        `
        box.scrollTop = box.scrollHeight
    }
}

// ============================================================
// ===== FUNÇÕES DE AUTENTICAÇÃO =====
// ============================================================
window.fazerLogin = async () => {
    const email = document.getElementById('loginEmail').value
    const senha = document.getElementById('loginSenha').value
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) { alert(traduzirErroAuth(error.message)); return }
    usuarioAtual = data.user.email
    usuarioId = data.user.id
    document.getElementById('dashUserName').textContent = usuarioAtual
    entrarDashboard()
}

window.fazerCadastro = async () => {
    const nome = document.getElementById('cadNome').value
    const email = document.getElementById('cadEmail').value
    const senha = document.getElementById('cadSenha').value
    const senha2 = document.getElementById('cadSenha2').value
    if (senha !== senha2) { alert('Senhas não coincidem'); return }
    if (senha.length < 6) { alert('Senha minimo 6 caracteres'); return }
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
    const dash = document.getElementById('dashboard')
    dash.classList.remove('visible')
    dash.classList.remove('active')
    window.location.href = 'index.html'
}

function entrarDashboard() {
    document.getElementById('authContainer').classList.add('hidden')
    document.getElementById('heroContainer').classList.add('hidden')
    document.getElementById('heroTexto').classList.add('hidden')
    document.getElementById('overlay').classList.add('hidden')
    const dash = document.getElementById('dashboard')
    dash.classList.add('active')
    // requestAnimationFrame garante que display:flex já foi aplicado pelo browser
    // antes de adicionar .visible, disparando a transição de opacity corretamente
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            dash.classList.add('visible')
        })
    })
    window.atualizarListaSalas()
}

// ============================================================
// ===== FUNÇÃO MOSTRAR TELA =====
// ============================================================
window.mostrarTela = (tela) => {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('active'))
    document.getElementById(`tela${tela.charAt(0).toUpperCase() + tela.slice(1)}`).classList.add('active')
}

// ============================================================
// ===== FUNÇÃO ALTERNAR VIEW =====
// ============================================================
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

// ============================================================
// ===== FUNÇÕES DE SALAS =====
// ============================================================
function getSalas() {
    return JSON.parse(localStorage.getItem('sulsafe_salas') || '[]')
}

window.atualizarListaSalas = () => {
    const container = document.getElementById('meetingList')
    if (!container) return
    const salas = getSalas()
    if (!salas.length) {
        container.innerHTML = '<li style="color:var(--texto-sec); text-align:center; padding:28px; list-style:none;">Nenhuma sala ativa no momento.</li>'
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
            <button class="btn-entrar" onclick="alert('Funcao entrarSala em desenvolvimento')">ENTRAR</button>
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
    mostrarSucesso('Sala criada com sucesso!')
}

// ============================================================
// ===== FUNÇÕES DE VIDEOAULAS =====
// ============================================================
function getAulasLocal() {
    return JSON.parse(localStorage.getItem('sulsafe_videoaulas') || '[]')
}

function getProgressoLocal() {
    return JSON.parse(localStorage.getItem(`sulsafe_progresso_${usuarioId || 'anon'}`) || '{}')
}

function salvarProgressoLocal(obj) {
    localStorage.setItem(`sulsafe_progresso_${usuarioId || 'anon'}`, JSON.stringify(obj))
}

// ============================================================
// ===== EXPORTA FUNÇÕES PARA O ESCOPO GLOBAL =====
// ============================================================
window.setFiltroNr = setFiltroNr
window.filtrarNrs = filtrarNrs
window.abrirModalNr = abrirModalNr
window.fecharModalNr = fecharModalNr
window.perguntarSobreNR = perguntarSobreNR
window.renderizarNrs = renderizarNrs
window.getSalas = getSalas
window.getAulasLocal = getAulasLocal
window.getProgressoLocal = getProgressoLocal
window.salvarProgressoLocal = salvarProgressoLocal

console.log('App.js carregado com sucesso!')
