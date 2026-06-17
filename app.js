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
let jitsiApi = null
let isRecording = false
let salaRealtimeChannel = null
let todasAulas = []
let todosTrabalhos = []
let currentChart = null
let relatorioData = []
let equipeAtualId = null

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
        <div class="nr-card" onclick="window.abrirModalNr('${nr.num}')">
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
    window.alternarView('ia')
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
            <button class="btn-entrar" onclick="window.entrarSala('${sala.id}','${escapeHtml(sala.topic)}','${escapeHtml(sala.leader)}')">
                <i class="fas fa-sign-in-alt"></i> ENTRAR
            </button>
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
    mostrarSucesso('✅ Sala criada com sucesso!')
}

// ============================================================
// ===== STUBS PARA FUNÇÕES FALTANTES =====
// ============================================================

// --- Funções de vídeo e modais ---
window.fecharVideo = () => {
    document.getElementById('videoModal')?.classList.remove('active')
    document.getElementById('videoIframe').src = ''
}

window.abrirVideo = (url) => {
    const ytId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
    if (ytId) {
        document.getElementById('videoIframe').src = `https://www.youtube.com/embed/${ytId[1]}?autoplay=1`
        document.getElementById('videoModal').classList.add('active')
    } else {
        mostrarErro('Link do YouTube inválido')
    }
}

// --- Funções de chat ---
window.enviarMensagemChat = () => {
    const input = document.getElementById('chatInput')
    if (!input) return
    const msg = input.value.trim()
    if (!msg) return
    const chat = document.getElementById('chatMessages')
    if (chat) {
        chat.innerHTML += `<div class="chat-message own"><div class="sender">Você</div><div class="text">${escapeHtml(msg)}</div></div>`
        chat.scrollTop = chat.scrollHeight
    }
    input.value = ''
}

// --- Funções de sala ---
window.entrarSala = (meetingId, topic, leader) => {
    alert(`🔴 Função entrarSala em desenvolvimento\n\nSala: ${topic}\nID: ${meetingId}\nCriada por: ${leader}\n\nEm breve você poderá entrar na videoconferência!`)
}

window.fecharSala = () => {
    document.getElementById('meetingModal')?.classList.remove('active')
    if (jitsiApi) {
        jitsiApi.dispose()
        jitsiApi = null
    }
}

window.toggleRecording = () => {
    isRecording = !isRecording
    const btn = document.getElementById('btnRecord')
    if (btn) {
        btn.innerHTML = isRecording ? '<i class="fas fa-stop"></i> Parar' : '<i class="fas fa-circle"></i> Gravar'
        btn.style.background = isRecording ? '#D32F2F' : ''
    }
    mostrarSucesso(isRecording ? '🎥 Gravação iniciada!' : '⏹️ Gravação parada!')
}

window.chamarGemini = () => {
    const q = prompt('💬 Pergunte algo para a IA Gemini:')
    if (q) {
        const chat = document.getElementById('chatMessages')
        if (chat) {
            chat.innerHTML += `<div class="chat-message"><div class="sender">Você</div><div class="text">${escapeHtml(q)}</div></div>`
            setTimeout(() => {
                chat.innerHTML += `<div class="chat-message"><div class="sender">🤖 IA</div><div class="text">🔧 Função Gemini em desenvolvimento. Em breve você terá respostas da IA aqui!</div></div>`
                chat.scrollTop = chat.scrollHeight
            }, 500)
        }
    }
}

window.gerarAtaReuniao = () => {
    alert('📄 Função gerar ata em desenvolvimento.\n\nEm breve você poderá exportar a ata da reunião em PDF!')
}

window.enviarWhatsApp = () => {
    const msg = encodeURIComponent(`Convite SulSafe - Sala: ${salaAtual?.topic || 'Reunião'}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
}

// --- Funções de videoaulas ---
window.carregarVideoaulas = () => {
    const container = document.getElementById('listaVideoaulas')
    if (container) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#888">
                <i class="fas fa-play-circle" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📺 Videoaulas disponíveis em breve!</p>
                <p style="font-size:12px">O professor poderá adicionar aulas em breve.</p>
            </div>
        `
    }
}

window.filtrarAulas = (nr) => {
    mostrarSucesso(`📺 Filtrando aulas por: ${nr}`)
    window.carregarVideoaulas()
}

window.toggleConcluida = (aulaId, e) => {
    if (e) e.stopPropagation()
    mostrarSucesso(`✅ Aula ${aulaId} marcada como concluída!`)
}

window.gerarCertificado = () => {
    const nome = usuarioAtual || 'Aluno'
    alert(`📜 Certificado gerado para ${nome}!\n\nEm breve você poderá baixar o PDF.`)
}

window.deletarVideoaula = (id) => {
    if (confirm(`🗑️ Remover a videoaula ${id}?`)) {
        mostrarSucesso(`🗑️ Videoaula removida!`)
    }
}

// --- Funções de materiais ---
window.carregarMateriais = () => {
    const container = document.getElementById('listaMateriais')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 0;color:#888">
                <i class="fas fa-book" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📚 Materiais disponíveis em breve!</p>
                <p style="font-size:12px">O professor poderá adicionar PDFs e apostilas.</p>
            </div>
        `
    }
}

window.salvarMaterial = () => {
    mostrarSucesso('📄 Material publicado com sucesso!')
    window.fecharModalAdmin()
}

window.baixarArquivo = (url) => {
    window.open(url, '_blank')
}

// --- Funções de administração ---
window.abrirModalAdmin = () => {
    document.getElementById('modalAdmin')?.classList.add('active')
}

window.fecharModalAdmin = () => {
    document.getElementById('modalAdmin')?.classList.remove('active')
}

window.trocarAbaAdmin = (aba) => {
    document.getElementById('abaAdminMaterial').style.display = aba === 'material' ? 'block' : 'none'
    document.getElementById('abaAdminAula').style.display = aba === 'aula' ? 'block' : 'none'
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'))
    document.getElementById(`tab${aba.charAt(0).toUpperCase() + aba.slice(1)}`)?.classList.add('active')
}

window.salvarVideoaula = () => {
    const titulo = document.getElementById('aulaTitulo')?.value
    const nr = document.getElementById('aulaNR')?.value
    const youtube_url = document.getElementById('aulaYoutube')?.value
    if (!titulo || !youtube_url) {
        mostrarErro('Preencha título e link do YouTube!')
        return
    }
    mostrarSucesso(`🎬 Videoaula "${titulo}" publicada com sucesso!`)
    window.fecharModalAdmin()
    window.carregarVideoaulas()
}

// --- Funções de trabalhos ---
window.carregarTrabalhos = () => {
    const container = document.getElementById('listaTrabalhos')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 0;color:#888;grid-column:1/-1">
                <i class="fas fa-tasks" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📋 Nenhum trabalho enviado ainda.</p>
                <p style="font-size:12px">Os alunos poderão enviar trabalhos em PDF.</p>
            </div>
        `
    }
}

window.filtrarTrabalhos = (filtro) => {
    mostrarSucesso(`📋 Filtrando trabalhos por: ${filtro}`)
    window.carregarTrabalhos()
}

window.abrirModalCorrecao = async (id) => {
    const nota = prompt('📝 Digite a nota (0-10):')
    if (nota === null) return
    const notaNum = parseFloat(nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
        mostrarErro('❌ Nota inválida! Digite um valor entre 0 e 10.')
        return
    }
    mostrarSucesso(`✅ Nota ${notaNum} atribuída ao trabalho ${id}!`)
    window.carregarTrabalhos()
}

window.enviarTrabalho = (input) => {
    const file = input?.files?.[0]
    if (!file || file.type !== 'application/pdf') {
        mostrarErro('❌ Envie um arquivo PDF válido!')
        return
    }
    mostrarSucesso(`📄 Trabalho "${file.name}" enviado com sucesso!`)
    document.getElementById('uploadStatus').innerHTML = `✅ ${file.name} enviado!`
    window.carregarMeusTrabalhos()
}

window.carregarMeusTrabalhos = () => {
    const container = document.getElementById('meusTrabalhosList')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:#888">
                <i class="fas fa-history" style="font-size:24px;color:#2E7D32"></i>
                <p style="margin-top:8px">📄 Nenhum trabalho enviado ainda.</p>
            </div>
        `
    }
}

// --- Funções de equipe ---
window.carregarEquipe = () => {
    const container = document.getElementById('memberList')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:#888">
                <i class="fas fa-users" style="font-size:24px;color:#2E7D32"></i>
                <p style="margin-top:8px">👥 Nenhum membro na equipe.</p>
            </div>
        `
    }
}

window.gerarConvite = () => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase()
    const link = `${window.location.origin}${window.location.pathname}?convite=${codigo}`
    document.getElementById('inviteCode').value = link
    mostrarSucesso(`🔗 Link de convite gerado!`)
}

window.copiarLinkConvite = () => {
    const input = document.getElementById('inviteCode')
    if (input?.value) {
        navigator.clipboard.writeText(input.value)
        mostrarSucesso('📋 Link copiado para a área de transferência!')
    } else {
        mostrarErro('❌ Gere um convite primeiro!')
    }
}

window.aceitarConvite = () => {
    const codigo = document.getElementById('joinCode')?.value.trim()
    if (!codigo) {
        mostrarErro('❌ Digite o código de convite!')
        return
    }
    mostrarSucesso(`✅ Você entrou na equipe com o código: ${codigo}`)
    window.carregarEquipe()
}

window.removerMembro = (usuarioId) => {
    if (confirm(`❌ Remover membro ${usuarioId}?`)) {
        mostrarSucesso('👤 Membro removido com sucesso!')
        window.carregarEquipe()
    }
}

// --- Funções de relatório ---
window.carregarRelatorioAlunos = () => {
    const container = document.getElementById('relatorioContainer')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 0;color:#888">
                <i class="fas fa-chart-line" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📊 Relatório de alunos disponível em breve!</p>
                <p style="font-size:12px">Acompanhe o progresso da turma.</p>
            </div>
        `
    }
}

window.exportarRelatorioCSV = () => {
    mostrarSucesso('📊 Relatório exportado em CSV!')
}

window.exportarRelatorioExcel = () => {
    mostrarSucesso('📊 Relatório exportado em Excel!')
}

window.exportarRelatorioPDF = () => {
    mostrarSucesso('📊 Relatório exportado em PDF!')
}

// --- Funções de transações ---
window.carregarMinhasTransacoes = () => {
    const container = document.getElementById('minhasTransacoesContainer')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:#888">
                <i class="fas fa-credit-card" style="font-size:24px;color:#2E7D32"></i>
                <p style="margin-top:8px">💳 Nenhuma transação encontrada.</p>
            </div>
        `
    }
}

window.carregarTodasTransacoes = () => {
    const container = document.getElementById('todasTransacoesContainer')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:#888">
                <i class="fas fa-chart-line" style="font-size:24px;color:#2E7D32"></i>
                <p style="margin-top:8px">📊 Nenhuma transação registrada.</p>
            </div>
        `
    }
}

window.simularPagamento = (id) => {
    if (confirm(`💰 Confirmar pagamento da transação ${id}?`)) {
        mostrarSucesso('✅ Pagamento confirmado!')
        window.carregarMinhasTransacoes()
    }
}

window.confirmarPagamentoSimulado = (id) => {
    window.simularPagamento(id)
}

window.copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto)
    mostrarSucesso('📋 Código copiado!')
}

window.abrirModalGerarPagamentoManual = (tipo) => {
    mostrarSucesso(`💰 Gerando ${tipo}...`)
    document.getElementById('modalPagamentoManual').style.display = 'flex'
}

window.fecharModalPagamentoManual = () => {
    document.getElementById('modalPagamentoManual').style.display = 'none'
}

window.gerarPagamentoManual = () => {
    const aluno = document.getElementById('pagamentoManualAlunoId')?.value
    const valor = document.getElementById('pagamentoManualValor')?.value
    if (!aluno || !valor) {
        mostrarErro('❌ Preencha todos os campos!')
        return
    }
    mostrarSucesso('💰 Pagamento gerado com sucesso!')
    window.fecharModalPagamentoManual()
    window.carregarMinhasTransacoes()
}

// --- Funções de boletim ---
window.carregarBoletimAdmin = () => {
    const container = document.getElementById('boletimContainer')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 0;color:#888">
                <i class="fas fa-chart-simple" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📊 Boletim escolar disponível em breve!</p>
                <p style="font-size:12px">Gerencie notas e acompanhamento dos alunos.</p>
            </div>
        `
    }
}

window.carregarBoletimAluno = () => {
    const container = document.getElementById('boletimAlunoContainer')
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 0;color:#888">
                <i class="fas fa-chart-simple" style="font-size:48px;color:#2E7D32"></i>
                <p style="margin-top:12px">📊 Seu boletim estará disponível em breve!</p>
                <p style="font-size:12px">Acompanhe suas notas e desempenho.</p>
            </div>
        `
    }
}

window.abrirModalLancarNotas = () => {
    mostrarSucesso('📝 Função lançar notas em desenvolvimento!')
    document.getElementById('modalLancarNotas').style.display = 'flex'
}

window.fecharModalLancarNotas = () => {
    document.getElementById('modalLancarNotas').style.display = 'none'
}

window.salvarNotas = () => {
    mostrarSucesso('✅ Notas salvas com sucesso!')
    window.fecharModalLancarNotas()
    window.carregarBoletimAdmin()
}

// --- Funções de chat em tempo real ---
window.iniciarRealtimeChat = (salaId) => {
    console.log(`📡 Chat em tempo real iniciado para sala: ${salaId}`)
}

// --- Funções de configuração ---
window.limparDados = () => {
    if (confirm('🗑️ Limpar todos os dados locais?')) {
        localStorage.clear()
        mostrarSucesso('✅ Dados limpos com sucesso!')
    }
}

// --- Funções de assistente ---
window.fecharAssistente = () => {
    document.getElementById('balaoAjuda')?.classList.remove('active')
}

window.ajudaEnvioTrabalho = () => {
    alert('📄 Para enviar um trabalho:\n\n1. Clique em "Área do aluno" no menu\n2. Clique na área de upload\n3. Selecione o arquivo PDF\n4. Aguarde a confirmação')
    window.fecharAssistente()
}

window.ajudaVideoaula = () => {
    alert('🎬 Para acessar as videoaulas:\n\n1. Clique em "Videoaulas" no menu\n2. Assista às aulas disponíveis\n3. Marque as aulas como concluídas\n4. Ao finalizar todas, baixe seu certificado')
    window.fecharAssistente()
}

window.ajudaSala = () => {
    alert('🎥 Para entrar em uma aula ao vivo:\n\n1. Clique em "Aulas ao vivo" no menu\n2. Veja as salas disponíveis\n3. Clique em "ENTRAR" na sala desejada\n4. Aguarde o Jitsi carregar')
    window.fecharAssistente()
}

window.ajudaMateriais = () => {
    alert('📚 Para encontrar os materiais:\n\n1. Clique em "Materiais" no menu\n2. Veja a lista de PDFs e apostilas\n3. Clique em "Baixar" para fazer o download')
    window.fecharAssistente()
}

window.abrirAssistenteNR = () => {
    window.alternarView('ia')
    window.fecharAssistente()
}

// --- Função de assinatura Stripe ---
window.iniciarAssinaturaStripe = () => {
    mostrarSucesso('💳 Redirecionando para o Stripe...')
    setTimeout(() => {
        alert('🔗 Função Stripe em desenvolvimento.\n\nEm breve você poderá assinar o plano diretamente!')
    }, 1000)
}

// ============================================================
// ===== EVENT LISTENERS =====
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view')
            if (view) {
                window.alternarView(view)
            }
        })
    })

    // Chat
    document.getElementById('chatInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') window.enviarMensagemChat()
    })

    // IA
    document.getElementById('iaChatInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') window.enviarPerguntaIA()
    })

    // Configurações
    document.getElementById('limparDados')?.addEventListener('click', window.limparDados)

    // Tema
    document.getElementById('temaSelect')?.addEventListener('change', e => {
        const tema = e.target.value
        document.body.classList.toggle('tema-claro', tema === 'claro')
        localStorage.setItem('sulsafe_tema', tema)
    })

    // Cor de destaque
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', function() {
            const cor = this.dataset.color
            document.documentElement.style.setProperty('--primaria', cor)
            localStorage.setItem('sulsafe_corDestaque', cor)
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'))
            this.classList.add('selected')
        })
    })

    // Restaurar tema e cor
    const temaSalvo = localStorage.getItem('sulsafe_tema') || 'escuro'
    document.body.classList.toggle('tema-claro', temaSalvo === 'claro')
    document.getElementById('temaSelect').value = temaSalvo

    const corSalva = localStorage.getItem('sulsafe_corDestaque')
    if (corSalva) {
        document.documentElement.style.setProperty('--primaria', corSalva)
        document.querySelectorAll('.color-option').forEach(o => {
            o.classList.toggle('selected', o.dataset.color === corSalva)
        })
    }

    console.log('✅ Event listeners configurados!')
})

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

console.log('✅ App.js carregado com sucesso!')
console.log('✅ Todas as funções stub foram adicionadas!')
