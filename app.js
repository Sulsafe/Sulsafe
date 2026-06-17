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
// ===== FUNÇÕES ADMIN RESTAURADAS =====
// ============================================================

// --- Modal Admin ---
window.abrirModalAdmin = () => {
    document.getElementById('modalAdmin')?.classList.add('active')
}

window.fecharModalAdmin = () => {
    document.getElementById('modalAdmin')?.classList.remove('active')
    document.getElementById('adminStatus').innerHTML = ''
    document.getElementById('aulaStatus').innerHTML = ''
}

window.trocarAbaAdmin = (aba) => {
    document.getElementById('abaAdminMaterial').style.display = aba === 'material' ? 'block' : 'none'
    document.getElementById('abaAdminAula').style.display = aba === 'aula' ? 'block' : 'none'
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'))
    document.getElementById(`tab${aba.charAt(0).toUpperCase() + aba.slice(1)}`)?.classList.add('active')
}

// --- Salvar Material (PDF) ---
window.salvarMaterial = async () => {
    const titulo = document.getElementById('matTitulo').value.trim()
    const nr = document.getElementById('matNR').value
    const descricao = document.getElementById('matDescricao').value.trim()
    const arquivo = document.getElementById('matArquivo').files[0]
    
    if (!titulo || !arquivo) {
        document.getElementById('adminStatus').innerHTML = '<span style="color:#D32F2F">❌ Preencha título e selecione um arquivo!</span>'
        return
    }
    
    document.getElementById('adminStatus').innerHTML = '<span style="color:#2E7D32">⏳ Enviando...</span>'
    
    try {
        const path = `materiais/${Date.now()}_${arquivo.name}`
        await supabase.storage.from('sulsafe-assets').upload(path, arquivo)
        const { data: { publicUrl } } = supabase.storage.from('sulsafe-assets').getPublicUrl(path)
        
        await supabase.from('materiais').insert({
            titulo,
            nr,
            descricao,
            url: publicUrl,
            path,
            criado_por: usuarioId,
            criado_em: new Date().toISOString()
        })
        
        document.getElementById('adminStatus').innerHTML = '<span style="color:#2E7D32">✅ Material publicado com sucesso!</span>'
        setTimeout(() => {
            window.fecharModalAdmin()
            window.carregarMateriais()
        }, 1000)
    } catch (err) {
        document.getElementById('adminStatus').innerHTML = `<span style="color:#D32F2F">❌ Erro: ${err.message}</span>`
    }
}

// --- Salvar Videoaula (YouTube) ---
window.salvarVideoaula = async () => {
    const titulo = document.getElementById('aulaTitulo').value.trim()
    const nr = document.getElementById('aulaNR').value
    const youtube_url = document.getElementById('aulaYoutube').value.trim()
    const descricao = document.getElementById('aulaDescricao').value.trim()
    
    if (!titulo || !youtube_url) {
        document.getElementById('aulaStatus').innerHTML = '<span style="color:#D32F2F">❌ Preencha título e link do YouTube!</span>'
        return
    }
    
    // Validar link do YouTube
    const ytId = youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
    if (!ytId) {
        document.getElementById('aulaStatus').innerHTML = '<span style="color:#D32F2F">❌ Link do YouTube inválido!</span>'
        return
    }
    
    document.getElementById('aulaStatus').innerHTML = '<span style="color:#2E7D32">⏳ Publicando...</span>'
    
    try {
        await supabase.from('videoaulas').insert({
            titulo,
            nr,
            descricao,
            youtube_url,
            criado_por: usuarioId,
            criado_em: new Date().toISOString()
        })
        
        document.getElementById('aulaStatus').innerHTML = '<span style="color:#2E7D32">✅ Videoaula publicada com sucesso!</span>'
        setTimeout(() => {
            window.fecharModalAdmin()
            window.carregarVideoaulas()
        }, 1000)
    } catch (err) {
        document.getElementById('aulaStatus').innerHTML = `<span style="color:#D32F2F">❌ Erro: ${err.message}</span>`
    }
}

// --- Deletar Videoaula ---
window.deletarVideoaula = async (id) => {
    if (!confirm('🗑️ Remover esta videoaula?')) return
    try {
        await supabase.from('videoaulas').delete().eq('id', id)
        mostrarSucesso('🗑️ Videoaula removida!')
        window.carregarVideoaulas()
    } catch (err) {
        mostrarErro(`❌ Erro: ${err.message}`)
    }
}

// ============================================================
// ===== FUNÇÕES DE VIDEOAULAS =====
// ============================================================
window.carregarVideoaulas = async (filtroNR = 'todos') => {
    const container = document.getElementById('listaVideoaulas')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('videoaulas').select('*').order('criado_em', { ascending: true })
        if (error) throw error
        
        let aulas = data || []
        todasAulas = aulas
        const progresso = getProgressoLocal()
        
        const aulasFiltradas = filtroNR === 'todos' ? aulas : aulas.filter(a => a.nr === filtroNR)
        
        if (aulasFiltradas.length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#888">
                    <i class="fas fa-play-circle" style="font-size:48px;color:#2E7D32"></i>
                    <p style="margin-top:12px">📺 Nenhuma videoaula disponível.</p>
                    <p style="font-size:12px">O professor pode adicionar aulas em breve.</p>
                </div>
            `
            return
        }
        
        container.innerHTML = aulasFiltradas.map(aula => {
            const ytId = aula.youtube_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)?.[1]
            const concluida = !!progresso[aula.id]
            return `
                <div class="aula-card">
                    <div class="aula-thumb" onclick="window.abrirVideo('${escapeHtml(aula.youtube_url || '')}')">
                        ${ytId ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${escapeHtml(aula.titulo)}">` : 
                            '<div class="aula-thumb-placeholder"><i class="fas fa-play-circle"></i></div>'}
                        <div class="aula-play-btn"><i class="fas fa-play-circle"></i></div>
                        ${concluida ? '<div class="aula-concluida-badge"><i class="fas fa-check"></i> Concluída</div>' : ''}
                    </div>
                    <div class="aula-info">
                        <div class="aula-nr">${escapeHtml(aula.nr || '')}</div>
                        <div class="aula-titulo">${escapeHtml(aula.titulo)}</div>
                        <div class="aula-desc">${escapeHtml(aula.descricao || '')}</div>
                    </div>
                    <div class="aula-footer">
                        <button class="btn-concluir ${concluida ? 'concluida' : ''}" onclick="window.toggleConcluida('${aula.id}', event)">
                            ${concluida ? '✅ Concluída' : '📌 Marcar concluída'}
                        </button>
                        ${ehProfessor ? `<button class="btn-entrar" style="background:var(--erro)" onclick="window.deletarVideoaula('${aula.id}')">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
            `
        }).join('')
        
        renderizarProgressoAulas(aulas)
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro ao carregar videoaulas: ${err.message}</p>`
    }
}

window.filtrarAulas = (nr) => {
    window.carregarVideoaulas(nr)
}

window.toggleConcluida = async (aulaId, e) => {
    if (e) e.stopPropagation()
    const progresso = getProgressoLocal()
    if (progresso[aulaId]) {
        delete progresso[aulaId]
        if (usuarioId) {
            await supabase.from('progresso_aulas').delete().match({ user_id: usuarioId, aula_id: aulaId })
        }
    } else {
        progresso[aulaId] = Date.now()
        if (usuarioId) {
            await supabase.from('progresso_aulas').upsert({
                user_id: usuarioId,
                aula_id: aulaId,
                concluído: true,
                ultima_atualizacao: new Date().toISOString()
            })
        }
    }
    salvarProgressoLocal(progresso)
    window.carregarVideoaulas()
}

window.abrirVideo = (url) => {
    const ytId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)?.[1]
    if (!ytId) {
        mostrarErro('❌ Link do YouTube inválido!')
        return
    }
    document.getElementById('videoIframe').src = `https://www.youtube.com/embed/${ytId}?autoplay=1`
    document.getElementById('videoModal').classList.add('active')
}

window.fecharVideo = () => {
    document.getElementById('videoModal').classList.remove('active')
    document.getElementById('videoIframe').src = ''
}

window.gerarCertificado = () => {
    const aulas = todasAulas.length ? todasAulas : getAulasLocal()
    const progresso = getProgressoLocal()
    const nrsConcluidas = [...new Set(aulas.filter(a => progresso[a.id]).map(a => a.nr).filter(Boolean))]
    const nome = usuarioAtual || 'Aluno'
    
    if (nrsConcluidas.length === 0) {
        mostrarErro('❌ Você precisa concluir todas as videoaulas primeiro!')
        return
    }
    
    try {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        doc.setFillColor(27, 94, 32)
        doc.rect(0, 0, 297, 210, 'F')
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(15, 15, 267, 180, 8, 8, 'F')
        doc.setTextColor(46, 125, 50)
        doc.setFontSize(32)
        doc.text('SULSAFE', 148.5, 50, { align: 'center' })
        doc.setFontSize(15)
        doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 61, { align: 'center' })
        doc.setFontSize(13)
        doc.text('Certificamos que', 148.5, 80, { align: 'center' })
        doc.setFontSize(22)
        doc.setTextColor(27, 94, 32)
        doc.text(nome.toUpperCase(), 148.5, 94, { align: 'center' })
        doc.setFontSize(13)
        doc.setTextColor(30, 30, 30)
        doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.', 148.5, 108, { align: 'center' })
        if (nrsConcluidas.length) {
            doc.text(`Normas: ${nrsConcluidas.join(', ')}`, 148.5, 120, { align: 'center' })
        }
        doc.text(`Emitido em ${new Date().toLocaleDateString()}`, 148.5, 146, { align: 'center' })
        doc.save(`Certificado_${nome.replace(/\s+/g, '_')}.pdf`)
        mostrarSucesso('✅ Certificado gerado com sucesso!')
    } catch (err) {
        mostrarErro(`❌ Erro ao gerar certificado: ${err.message}`)
    }
}

function renderizarProgressoAulas(aulas) {
    if (!aulas || !aulas.length) return
    const progresso = getProgressoLocal()
    const concluidas = aulas.filter(a => progresso[a.id]).length
    const pct = Math.round((concluidas / aulas.length) * 100)
    const progressoEl = document.getElementById('progressoVideoaulas')
    if (progressoEl) {
        progressoEl.innerHTML = `
            <div class="progresso-container">
                <div class="progresso-header">
                    <span>📊 Seu progresso</span>
                    <span class="progresso-pct">${pct}%</span>
                </div>
                <div class="progresso-bar-wrap">
                    <div class="progresso-bar" style="width:${pct}%"></div>
                </div>
                <div style="font-size:12px;color:#888;margin-top:6px">
                    ${concluidas} de ${aulas.length} aulas concluídas
                </div>
            </div>
        `
    }
}

function renderizarProgressoHome() {
    const aulas = getAulasLocal()
    if (!aulas.length) return
    const progresso = getProgressoLocal()
    const concluidas = aulas.filter(a => progresso[a.id]).length
    const pct = Math.round((concluidas / aulas.length) * 100)
    const el = document.getElementById('progressoResumoHome')
    if (el) {
        el.innerHTML = `
            <div class="progresso-container" onclick="window.alternarView('videoaulas')" style="cursor:pointer">
                <div class="progresso-header">
                    <span>📊 Progresso</span>
                    <span class="progresso-pct">${pct}%</span>
                </div>
                <div class="progresso-bar-wrap">
                    <div class="progresso-bar" style="width:${pct}%"></div>
                </div>
                <div style="font-size:12px;color:#888;margin-top:6px">
                    ${concluidas} de ${aulas.length} aulas concluídas
                </div>
            </div>
        `
    }
}

// ============================================================
// ===== FUNÇÕES DE MATERIAIS =====
// ============================================================
window.carregarMateriais = async () => {
    const container = document.getElementById('listaMateriais')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('materiais').select('*').order('criado_em', { ascending: false })
        if (error) throw error
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 0;color:#888">
                    <i class="fas fa-book" style="font-size:48px;color:#2E7D32"></i>
                    <p style="margin-top:12px">📚 Nenhum material disponível.</p>
                    <p style="font-size:12px">O professor pode adicionar PDFs e apostilas.</p>
                </div>
            `
            return
        }
        
        container.innerHTML = data.map(m => `
            <div class="material-item">
                <div>
                    <h4>${escapeHtml(m.titulo)}</h4>
                    <p>${escapeHtml(m.descricao || '')}</p>
                    <span class="badge-nr">${escapeHtml(m.nr || 'Geral')}</span>
                    <small style="display:block;font-size:10px;color:#888;margin-top:4px">
                        📅 ${new Date(m.criado_em).toLocaleDateString()}
                    </small>
                </div>
                <button class="btn-entrar" onclick="window.baixarArquivo('${m.url}')">
                    <i class="fas fa-download"></i> Baixar
                </button>
            </div>
        `).join('')
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro ao carregar materiais: ${err.message}</p>`
    }
}

window.baixarArquivo = (url) => {
    window.open(url, '_blank')
}

// ============================================================
// ===== FUNÇÕES DE TRABALHOS =====
// ============================================================
window.carregarTrabalhos = async () => {
    if (!ehProfessor) return
    const container = document.getElementById('listaTrabalhos')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('trabalhos').select('*').order('data_envio', { ascending: false })
        if (error) throw error
        
        todosTrabalhos = data || []
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 0;color:#888;grid-column:1/-1">
                    <i class="fas fa-tasks" style="font-size:48px;color:#2E7D32"></i>
                    <p style="margin-top:12px">📋 Nenhum trabalho enviado.</p>
                </div>
            `
            return
        }
        
        container.innerHTML = data.map(t => `
            <div class="meeting-card">
                <div>
                    <strong>${escapeHtml(t.aluno_email)}</strong>
                    <br>Status: ${t.status === 'pendente' ? '📤 Pendente' : '✅ Corrigido - Nota: ' + t.nota}
                    ${t.comentario ? `<br>💬 ${escapeHtml(t.comentario)}` : ''}
                    <br><small>📅 ${new Date(t.data_envio).toLocaleString()}</small>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <button class="btn-entrar" onclick="window.baixarArquivo('${t.arquivo_url}')">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn-criar-sala" onclick="window.abrirModalCorrecao('${t.id}')">
                        <i class="fas fa-edit"></i> Corrigir
                    </button>
                </div>
            </div>
        `).join('')
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

window.filtrarTrabalhos = (filtro) => {
    if (!todosTrabalhos || !todosTrabalhos.length) {
        mostrarErro('❌ Carregue os trabalhos primeiro!')
        return
    }
    const filtrados = filtro === 'todos' ? todosTrabalhos : todosTrabalhos.filter(t => t.status === filtro)
    renderizarListaTrabalhos(filtrados)
}

function renderizarListaTrabalhos(trabalhos) {
    const container = document.getElementById('listaTrabalhos')
    if (!container) return
    
    if (!trabalhos || trabalhos.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;color:#888">📋 Nenhum trabalho encontrado.</p>'
        return
    }
    
    container.innerHTML = trabalhos.map(t => `
        <div class="meeting-card">
            <div>
                <strong>${escapeHtml(t.aluno_email)}</strong>
                <br>Status: ${t.status === 'pendente' ? '📤 Pendente' : '✅ Corrigido - Nota: ' + t.nota}
                ${t.comentario ? `<br>💬 ${escapeHtml(t.comentario)}` : ''}
                <br><small>📅 ${new Date(t.data_envio).toLocaleString()}</small>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn-entrar" onclick="window.baixarArquivo('${t.arquivo_url}')">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button class="btn-criar-sala" onclick="window.abrirModalCorrecao('${t.id}')">
                    <i class="fas fa-edit"></i> Corrigir
                </button>
            </div>
        </div>
    `).join('')
}

window.abrirModalCorrecao = async (id) => {
    const nota = prompt('📝 Digite a nota (0-10):')
    if (nota === null) return
    const notaNum = parseFloat(nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
        mostrarErro('❌ Nota inválida! Digite um valor entre 0 e 10.')
        return
    }
    try {
        await supabase.from('trabalhos').update({ 
            nota: notaNum, 
            status: 'corrigido',
            data_correcao: new Date().toISOString()
        }).eq('id', id)
        mostrarSucesso(`✅ Nota ${notaNum} atribuída!`)
        window.carregarTrabalhos()
        window.carregarMeusTrabalhos()
    } catch (err) {
        mostrarErro(`❌ Erro: ${err.message}`)
    }
}

window.enviarTrabalho = async (input) => {
    const file = input?.files?.[0]
    if (!file || file.type !== 'application/pdf') {
        mostrarErro('❌ Envie um arquivo PDF válido!')
        return
    }
    
    if (!usuarioId) {
        mostrarErro('❌ Faça login primeiro!')
        return
    }
    
    document.getElementById('uploadStatus').innerHTML = '<span style="color:#2E7D32">⏳ Enviando...</span>'
    
    try {
        const filePath = `${usuarioId}/${Date.now()}_${file.name}`
        await supabase.storage.from('trabalhos-sulsafe').upload(filePath, file)
        const { data: { publicUrl } } = supabase.storage.from('trabalhos-sulsafe').getPublicUrl(filePath)
        
        await supabase.from('trabalhos').insert({
            aluno_id: usuarioId,
            aluno_email: usuarioAtual,
            arquivo_url: publicUrl,
            disciplina: 'Segurança do Trabalho',
            status: 'pendente',
            data_envio: new Date().toISOString()
        })
        
        document.getElementById('uploadStatus').innerHTML = '<span style="color:#2E7D32">✅ Trabalho enviado com sucesso!</span>'
        window.carregarMeusTrabalhos()
    } catch (err) {
        document.getElementById('uploadStatus').innerHTML = `<span style="color:#D32F2F">❌ Erro: ${err.message}</span>`
    }
}

window.carregarMeusTrabalhos = async () => {
    if (!usuarioId) return
    const container = document.getElementById('meusTrabalhosList')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('trabalhos').select('*').eq('aluno_id', usuarioId).order('data_envio', { ascending: false })
        if (error) throw error
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#888">
                    <i class="fas fa-file-pdf" style="font-size:24px;color:#2E7D32"></i>
                    <p style="margin-top:8px">📄 Nenhum trabalho enviado.</p>
                </div>
            `
            return
        }
        
        container.innerHTML = data.map(t => `
            <div class="meeting-card">
                <div>
                    <strong>${escapeHtml(t.disciplina || 'Segurança do Trabalho')}</strong>
                    <br>Status: ${t.status === 'pendente' ? '📤 Pendente' : '✅ Corrigido - Nota: ' + t.nota}
                    ${t.comentario ? `<br>💬 ${escapeHtml(t.comentario)}` : ''}
                    <br><small>📅 ${new Date(t.data_envio).toLocaleString()}</small>
                </div>
                <button class="btn-entrar" onclick="window.baixarArquivo('${t.arquivo_url}')">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </div>
        `).join('')
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

// ============================================================
// ===== FUNÇÕES DE TRANSAÇÕES =====
// ============================================================
window.carregarMinhasTransacoes = async () => {
    const container = document.getElementById('minhasTransacoesContainer')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('transacoes').select('*').eq('aluno_id', usuarioId).order('data_criacao', { ascending: false })
        if (error) throw error
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#888">
                    <i class="fas fa-credit-card" style="font-size:24px;color:#2E7D32"></i>
                    <p style="margin-top:8px">💳 Nenhuma transação encontrada.</p>
                </div>
            `
            return
        }
        
        let html = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#2E7D32;color:white;"><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead><tbody>`
        
        data.forEach(t => {
            const statusStyle = t.status === 'PAGO' ? 'background:#4CAF50;color:white;padding:4px 12px;border-radius:20px' : 'background:#FF9800;color:white;padding:4px 12px;border-radius:20px'
            html += `<tr><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}">${t.status}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td></tr>`
        })
        html += '</tbody></table></div>'
        container.innerHTML = html
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

window.carregarTodasTransacoes = async () => {
    if (perfilUsuario !== 'admin') return
    const container = document.getElementById('todasTransacoesContainer')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data, error } = await supabase.from('transacoes').select('*').order('data_criacao', { ascending: false })
        if (error) throw error
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#888">
                    <i class="fas fa-chart-line" style="font-size:24px;color:#2E7D32"></i>
                    <p style="margin-top:8px">📊 Nenhuma transação registrada.</p>
                </div>
            `
            return
        }
        
        let html = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#2E7D32;color:white;"><th>Aluno</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead><tbody>`
        
        data.forEach(t => {
            const statusStyle = t.status === 'PAGO' ? 'background:#4CAF50;color:white;padding:4px 12px;border-radius:20px' : 'background:#FF9800;color:white;padding:4px 12px;border-radius:20px'
            html += `<tr><td>${escapeHtml(t.aluno_email)}</td><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}">${t.status}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td></tr>`
        })
        html += '</tbody></table></div>'
        container.innerHTML = html
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

// ============================================================
// ===== FUNÇÕES DE BOLETIM =====
// ============================================================
window.carregarBoletimAdmin = async () => {
    const container = document.getElementById('boletimContainer')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data: alunos } = await supabase.from('profiles').select('id,email')
        const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true)
        const { data: notas } = await supabase.from('notas').select('*')
        
        const notasPorAluno = {}
        notas?.forEach(nota => {
            if (!notasPorAluno[nota.aluno_id]) notasPorAluno[nota.aluno_id] = {}
            notasPorAluno[nota.aluno_id][nota.disciplina_id] = nota
        })
        
        let html = `<div style="overflow-x:auto;"><table style="min-width:600px;width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;"><thead><tr style="background:#f5f5f5;border-bottom:2px solid #2E7D32;"><th style="padding:12px;text-align:center;color:#2E7D32;">Aluno</th>`
        
        disciplinas?.forEach(d => {
            html += `<th style="padding:12px;text-align:center;color:#2E7D32;">${escapeHtml(d.nome)}</th>`
        })
        
        html += `<th style="padding:12px;text-align:center;color:#2E7D32;">Média Final</th><th style="padding:12px;text-align:center;color:#2E7D32;">Situação</th></tr></thead><tbody>`
        
        for (const aluno of alunos) {
            let somaMedias = 0, disciplinasContadas = 0
            html += `<tr style="border-bottom:1px solid #e0e0e0;"><td style="padding:12px;text-align:center;color:#333;">${escapeHtml(aluno.email)}</td>`
            
            for (const disc of disciplinas || []) {
                const nota = notasPorAluno[aluno.id]?.[disc.id]
                let media = '-'
                if (nota) {
                    const n1 = parseFloat(nota.nota1)||0, n2 = parseFloat(nota.nota2)||0, n3 = parseFloat(nota.nota3)||0
                    let m = (n1+n2+n3)/3
                    if (nota.recuperacao > m) m = (m + parseFloat(nota.recuperacao))/2
                    media = m.toFixed(1)
                    somaMedias += m
                    disciplinasContadas++
                }
                html += `<td style="padding:12px;text-align:center;font-weight:bold;color:#2E7D32;">${media}</td>`
            }
            
            const mediaFinal = disciplinasContadas > 0 ? (somaMedias/disciplinasContadas).toFixed(1) : '-'
            let situacaoClass = 'status-pendente', situacaoText = '⏳ PENDENTE'
            if (mediaFinal !== '-') {
                const mf = parseFloat(mediaFinal)
                if (mf >= 6) { situacaoClass = 'status-aprovado'; situacaoText = '✅ APROVADO' }
                else if (mf >= 4) { situacaoClass = 'status-recuperacao'; situacaoText = '🟡 RECUPERAÇÃO' }
                else { situacaoClass = 'status-reprovado'; situacaoText = '❌ REPROVADO' }
            }
            html += `<td style="padding:12px;text-align:center;font-weight:bold;color:#2E7D32;">${mediaFinal}</td>`
            html += `<td style="padding:12px;text-align:center;color:${situacaoClass === 'status-aprovado' ? '#2E7D32' : (situacaoClass === 'status-recuperacao' ? '#FF9800' : '#D32F2F')};font-weight:bold;">${situacaoText}</td>`
            html += `</tr>`
        }
        
        html += '</tbody></table></div>'
        container.innerHTML = html
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

window.carregarBoletimAluno = async () => {
    const container = document.getElementById('boletimAlunoContainer')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true)
        const { data: notas } = await supabase.from('notas').select('*').eq('aluno_id', usuarioId)
        
        if (!disciplinas?.length) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#888">📊 Nenhuma disciplina disponível.</p>'
            return
        }
        
        let html = `<div style="overflow-x:auto;"><table class="boletim-tabela" style="min-width:600px;"><thead><tr><th>Disciplina</th><th>Nota 1</th><th>Nota 2</th><th>Nota 3</th><th>Média</th><th>Faltas</th><th>Situação</th></tr></thead><tbody>`
        let somaMedias = 0, disciplinasContadas = 0
        
        for (const disc of disciplinas) {
            const nota = notas?.find(n => n.disciplina_id === disc.id)
            let n1 = '-', n2 = '-', n3 = '-', media = '-', faltas = '-'
            let situacaoClass = 'status-pendente', situacaoText = '⏳ Pendente'
            
            if (nota && nota.media_final) {
                n1 = nota.nota1 || '-'
                n2 = nota.nota2 || '-'
                n3 = nota.nota3 || '-'
                faltas = nota.faltas || 0
                media = nota.media_final.toFixed(1)
                somaMedias += nota.media_final
                disciplinasContadas++
                
                if (nota.media_final >= 6) { situacaoClass = 'status-aprovado'; situacaoText = '✅ Aprovado' }
                else if (nota.media_final >= 4) { situacaoClass = 'status-recuperacao'; situacaoText = '🟡 Recuperação' }
                else { situacaoClass = 'status-reprovado'; situacaoText = '❌ Reprovado' }
            }
            html += `<tr><td>${escapeHtml(disc.nome)}</td><td>${n1}</td><td>${n2}</td><td>${n3}</td><td><strong>${media}</strong></td><td>${faltas}</td><td class="${situacaoClass}">${situacaoText}</td></tr>`
        }
        
        const mediaGeral = disciplinasContadas > 0 ? (somaMedias / disciplinasContadas).toFixed(1) : '-'
        html += `<tr style="background:#f5f5f5"><td colspan="4"><strong>Média Geral:</strong></td><td><strong>${mediaGeral}</strong></td><td colspan="2"></td></tr>`
        html += '</tbody></table></div>'
        container.innerHTML = html
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

window.abrirModalLancarNotas = async () => {
    const selectAluno = document.getElementById('notaAlunoId')
    const { data: perfis } = await supabase.from('profiles').select('id,email')
    selectAluno.innerHTML = '<option value="">Selecione...</option>'
    perfis.forEach(p => {
        selectAluno.innerHTML += `<option value="${p.id}">${p.email}</option>`
    })
    
    const { data: disciplinas } = await supabase.from('disciplinas').select('id,nome').eq('ativa', true)
    const selectDisc = document.getElementById('notaDisciplinaId')
    selectDisc.innerHTML = '<option value="">Selecione...</option>'
    disciplinas.forEach(d => {
        selectDisc.innerHTML += `<option value="${d.id}">${d.nome}</option>`
    })
    
    document.getElementById('modalLancarNotas').style.display = 'flex'
}

window.fecharModalLancarNotas = () => {
    document.getElementById('modalLancarNotas').style.display = 'none'
}

window.salvarNotas = async () => {
    try {
        const alunoId = document.getElementById('notaAlunoId').value
        const disciplinaId = document.getElementById('notaDisciplinaId').value
        const semestre = document.getElementById('notaSemestre').value
        const nota1 = parseFloat(document.getElementById('nota1').value) || 0
        const nota2 = parseFloat(document.getElementById('nota2').value) || 0
        const nota3 = parseFloat(document.getElementById('nota3').value) || 0
        const recuperacao = parseFloat(document.getElementById('notaRec').value) || 0
        const faltas = parseInt(document.getElementById('notaFaltas').value) || 0
        
        if (!alunoId || !disciplinaId) {
            mostrarErro('Selecione aluno e disciplina!')
            return
        }
        
        let media = (nota1 + nota2 + nota3) / 3
        if (recuperacao > media) media = (media + recuperacao) / 2
        
        let situacao
        if (media >= 6) situacao = 'APROVADO'
        else if (media >= 4) situacao = 'RECUPERACAO'
        else situacao = 'REPROVADO'
        
        const { data: aluno, error: alunoError } = await supabase.from('profiles').select('email').eq('id', alunoId).single()
        if (alunoError) { mostrarErro('Erro ao buscar aluno: ' + alunoError.message); return }
        if (!aluno) { mostrarErro('Aluno não encontrado!'); return }
        
        const { error } = await supabase.from('notas').upsert({
            aluno_id: alunoId,
            aluno_email: aluno.email,
            disciplina_id: parseInt(disciplinaId),
            nota1, nota2, nota3, recuperacao, faltas,
            media_final: media,
            situacao, semestre
        }, { onConflict: 'aluno_id,disciplina_id,semestre' })
        
        if (error) { mostrarErro('Erro ao salvar notas: ' + error.message); return }
        
        mostrarSucesso('✅ Notas salvas com sucesso!')
        window.fecharModalLancarNotas()
        window.carregarBoletimAdmin()
    } catch (err) {
        console.error('Erro em salvarNotas:', err)
        mostrarErro('Erro: ' + err.message)
    }
}

// ============================================================
// ===== FUNÇÕES DE RELATÓRIO =====
// ============================================================
window.carregarRelatorioAlunos = async () => {
    const container = document.getElementById('relatorioContainer')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    
    try {
        const { data: alunos } = await supabase.from('profiles').select('id,email,role')
        const alunosList = alunos?.filter(p => p.role === 'aluno') || []
        const { data: aulas } = await supabase.from('videoaulas').select('id')
        const totalAulas = aulas?.length || 0
        const { data: progresso } = await supabase.from('progresso_aulas').select('user_id,aula_id').eq('concluído', true)
        
        const progressoPorAluno = {}
        progresso?.forEach(p => {
            if (!progressoPorAluno[p.user_id]) progressoPorAluno[p.user_id] = []
            progressoPorAluno[p.user_id].push(p.aula_id)
        })
        
        relatorioData = []
        const alunosNomes = [], alunosProgressos = []
        
        for (const aluno of alunosList) {
            const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0
            const percentual = totalAulas > 0 ? Math.round((aulasAssistidas/totalAulas)*100) : 0
            alunosNomes.push(aluno.email.split('@')[0])
            alunosProgressos.push(percentual)
            relatorioData.push({
                aluno: aluno.email.split('@')[0],
                aulasAssistidas,
                totalAulas,
                percentual,
                status: percentual === 100 ? 'Concluído' : (percentual > 0 ? 'Em andamento' : 'Não iniciado')
            })
        }
        
        renderizarGraficoProgresso(alunosNomes, alunosProgressos)
        
        let html = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#2E7D32;color:white;"><th>Aluno</th><th>Aulas</th><th>Progresso</th><th>Status</th><th>Certificado</th></tr></thead><tbody>`
        
        for (const aluno of alunosList) {
            const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0
            const percentual = totalAulas > 0 ? Math.round((aulasAssistidas/totalAulas)*100) : 0
            const botaoCertificado = percentual === 100 ? 
                `<button class="btn-criar-sala" onclick="window.gerarCertificadoAluno('${aluno.id}','${aluno.email}')" style="padding:4px 8px">Certificado</button>` : 
                '<span style="color:gray">⏳ 100%</span>'
            html += `<tr><td>${aluno.email}</td><td style="text-align:center">${aulasAssistidas}/${totalAulas}</td><td><div style="background:#e0e0e0;border-radius:20px;height:8px"><div style="background:#2E7D32;border-radius:20px;height:8px;width:${percentual}%"></div></div>${percentual}%</td><td>${percentual===100?'✅ Concluído':(percentual>0?'🟡 Em andamento':'🔴 Não iniciado')}</td><td style="text-align:center">${botaoCertificado}</td></tr>`
        }
        
        html += '</tbody></table></div>'
        container.innerHTML = html
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

function renderizarGraficoProgresso(alunos, progressos) {
    const ctx = document.getElementById('progressoChart')?.getContext('2d')
    if (!ctx) return
    if (currentChart) currentChart.destroy()
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: alunos,
            datasets: [{ label: 'Progresso (%)', data: progressos, backgroundColor: '#2E7D32', borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }
    })
}

window.gerarCertificadoAluno = async (alunoId, alunoEmail) => {
    try {
        const { data: progresso } = await supabase.from('progresso_aulas').select('aula_id').eq('user_id', alunoId).eq('concluído', true)
        if (!progresso?.length) { mostrarErro('Aluno não concluiu nenhuma aula.'); return }
        
        const { data: aulas } = await supabase.from('videoaulas').select('nr').in('id', progresso.map(p => p.aula_id))
        const nrs = [...new Set(aulas.map(a => a.nr).filter(Boolean))]
        const nome = alunoEmail.split('@')[0]
        
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        doc.setFillColor(27, 94, 32)
        doc.rect(0, 0, 297, 210, 'F')
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(15, 15, 267, 180, 8, 8, 'F')
        doc.setTextColor(46, 125, 50)
        doc.setFontSize(32)
        doc.text('SULSAFE', 148.5, 50, { align: 'center' })
        doc.setFontSize(15)
        doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 61, { align: 'center' })
        doc.setFontSize(13)
        doc.text('Certificamos que', 148.5, 80, { align: 'center' })
        doc.setFontSize(22)
        doc.setTextColor(27, 94, 32)
        doc.text(nome.toUpperCase(), 148.5, 94, { align: 'center' })
        doc.setFontSize(13)
        doc.setTextColor(30, 30, 30)
        doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.', 148.5, 108, { align: 'center' })
        if (nrs.length) doc.text(`Normas: ${nrs.join(', ')}`, 148.5, 120, { align: 'center' })
        doc.text(`Emitido em ${new Date().toLocaleDateString()}`, 148.5, 146, { align: 'center' })
        doc.save(`Certificado_${nome}.pdf`)
        mostrarSucesso('✅ Certificado gerado!')
    } catch (err) {
        mostrarErro('❌ Erro ao gerar certificado: ' + err.message)
    }
}

// ============================================================
// ===== FUNÇÕES DE SALA (CHAT) =====
// ============================================================
window.entrarSala = (meetingId, topic, leader) => {
    if (!usuarioAtual) return
    salaAtual = { id: meetingId, topic, leader }
    document.getElementById('roomTitle').textContent = topic
    document.getElementById('meetingModal').classList.add('active')
    mostrarSucesso('🎥 Entrando na sala...')
}

window.fecharSala = () => {
    document.getElementById('meetingModal').classList.remove('active')
    if (jitsiApi) {
        jitsiApi.dispose()
        jitsiApi = null
    }
    salaAtual = null
}

window.toggleRecording = () => {
    if (!jitsiApi) return
    if (isRecording) {
        jitsiApi.executeCommand('stopRecording', { mode: 'file' })
        isRecording = false
        document.getElementById('btnRecord').innerHTML = '<i class="fas fa-circle"></i> Gravar'
    } else {
        jitsiApi.executeCommand('startRecording', { mode: 'file' })
        isRecording = true
        document.getElementById('btnRecord').innerHTML = '<i class="fas fa-stop"></i> Parar'
    }
}

window.chamarGemini = async () => {
    const q = prompt('💬 Pergunte algo para a IA Gemini:')
    if (!q || !salaAtual) return
    
    try {
        const { data } = await supabase.functions.invoke('gemini-chat-import', {
            body: { prompt: q }
        })
        adicionarMensagemChatDOM('IA', data?.response || data?.text || 'Sem resposta', false)
    } catch (err) {
        adicionarMensagemChatDOM('IA', '❌ Erro ao chamar Gemini', false)
    }
}

window.gerarAtaReuniao = () => {
    const hist = JSON.parse(localStorage.getItem(`sulsafe_chat_${salaAtual?.id}`) || '[]')
    let ata = `ATA ${new Date().toLocaleString()}\nSala: ${salaAtual?.topic}\n\n`
    hist.slice(-20).forEach(m => ata += `${m.sender}: ${m.message}\n`)
    
    try {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF()
        doc.text(doc.splitTextToSize(ata, 180), 10, 20)
        doc.save('ata.pdf')
        mostrarSucesso('📄 Ata gerada com sucesso!')
    } catch (err) {
        mostrarErro('❌ Erro ao gerar ata: ' + err.message)
    }
}

window.enviarWhatsApp = () => {
    const msg = encodeURIComponent(`Convite SulSafe. Sala: ${salaAtual?.id}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
}

function adicionarMensagemChatDOM(sender, msg, own, timestamp = null) {
    const div = document.getElementById('chatMessages')
    if (!div) return
    const m = document.createElement('div')
    m.className = `chat-message ${own ? 'own' : ''}`
    const hora = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
    m.innerHTML = `<div class="sender">${escapeHtml(sender)} • ${hora}</div><div class="text">${escapeHtml(msg)}</div>`
    div.appendChild(m)
    div.scrollTop = div.scrollHeight
}

window.enviarMensagemChat = () => {
    const input = document.getElementById('chatInput')
    const txt = input?.value.trim()
    if (!txt || !salaAtual) return
    
    const chat = document.getElementById('chatMessages')
    if (chat) {
        adicionarMensagemChatDOM(usuarioAtual, txt, true)
    }
    input.value = ''
}

// ============================================================
// ===== FUNÇÕES DE VIDEOAULAS (UTILIDADES) =====
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
// ===== FUNÇÕES DE EQUIPE =====
// ============================================================
window.carregarEquipe = async () => {
    if (!usuarioId) return
    const container = document.getElementById('memberList')
    if (!container) return
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888"><i class="fas fa-spinner fa-spin"></i> Carregando equipe...</p>'
    
    try {
        const { data: membroAtual } = await supabase.from('membros_equipe').select('equipe_id').eq('usuario_id', usuarioId).maybeSingle()
        
        if (!membroAtual?.equipe_id) {
            await criarEquipeInicial()
            return
        }
        
        equipeAtualId = membroAtual.equipe_id
        
        const { data: todosMembros } = await supabase.from('membros_equipe').select('usuario_id, papel, convite_pendente').eq('equipe_id', equipeAtualId)
        
        if (!todosMembros || todosMembros.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#888">👥 Nenhum membro na equipe.</p>'
            return
        }
        
        const userIds = todosMembros.map(m => m.usuario_id).filter(id => id)
        let userProfiles = {}
        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('id, email, nome_completo').in('id', userIds)
            if (profiles) profiles.forEach(p => { userProfiles[p.id] = p })
        }
        
        container.innerHTML = todosMembros.map(m => {
            const profile = userProfiles[m.usuario_id]
            const nomeExibicao = profile?.nome_completo || profile?.email || m.usuario_id?.substring(0, 8)
            const isCurrentUser = m.usuario_id === usuarioId
            
            return `
                <div class="member-item">
                    <div class="member-info">
                        <i class="fas fa-user-circle"></i>
                        <span>${escapeHtml(nomeExibicao)}</span>
                        <span class="member-role">${m.papel === 'admin' ? '👑 Admin' : '👤 Membro'}</span>
                        ${m.convite_pendente ? '<span class="status-badge" style="background:#FF9800">Convite pendente</span>' : ''}
                    </div>
                    ${ehProfessor && m.papel !== 'admin' && !m.convite_pendente && !isCurrentUser ? `
                        <button class="test-button" style="background:#D32F2F" onclick="window.removerMembro('${m.usuario_id}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    ` : ''}
                </div>
            `
        }).join('')
        
        await carregarConvitesPendentes()
    } catch (err) {
        container.innerHTML = `<p style="color:#D32F2F">❌ Erro: ${err.message}</p>`
    }
}

async function criarEquipeInicial() {
    try {
        const { data: equipe, error } = await supabase.from('equipes').insert({
            nome: `Equipe de ${usuarioAtual?.split('@')[0] || 'Usuário'}`,
            criado_por: usuarioId
        }).select().single()
        
        if (error) throw error
        
        equipeAtualId = equipe.id
        await supabase.from('membros_equipe').insert({ equipe_id: equipe.id, usuario_id: usuarioId, papel: 'admin' })
        
        mostrarSucesso('✅ Equipe criada com sucesso!')
        window.carregarEquipe()
    } catch (err) {
        mostrarErro('❌ Erro ao criar equipe: ' + err.message)
    }
}

async function carregarConvitesPendentes() {
    const container = document.getElementById('pendingInvitesList')
    if (!container) return
    
    if (!equipeAtualId) {
        container.innerHTML = '<p style="color:gray">Nenhum convite pendente</p>'
        return
    }
    
    const { data, error } = await supabase.from('membros_equipe').select('codigo_convite').eq('equipe_id', equipeAtualId).eq('convite_pendente', true).is('usuario_id', null)
    
    if (error || !data || data.length === 0) {
        container.innerHTML = '<p style="color:gray">Nenhum convite pendente</p>'
        return
    }
    
    container.innerHTML = data.map(inv => `
        <div class="pending-invite">
            <span><i class="fas fa-link"></i> Código: ${inv.codigo_convite}</span>
            <button onclick="window.cancelarConvite('${inv.codigo_convite}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('')
}

window.cancelarConvite = async (codigo) => {
    if (!confirm('Cancelar este convite?')) return
    await supabase.from('membros_equipe').delete().eq('codigo_convite', codigo).eq('convite_pendente', true)
    mostrarSucesso('Convite cancelado!')
    window.carregarEquipe()
}

window.removerMembro = async (usuarioIdRemover) => {
    if (!confirm('Remover este membro da equipe?')) return
    await supabase.from('membros_equipe').delete().eq('equipe_id', equipeAtualId).eq('usuario_id', usuarioIdRemover)
    mostrarSucesso('Membro removido!')
    window.carregarEquipe()
}

window.gerarConvite = async () => {
    if (!equipeAtualId) {
        mostrarErro('Carregando equipe... Aguarde um momento.')
        return
    }
    
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const { error } = await supabase.from('membros_equipe').insert({
        equipe_id: equipeAtualId,
        codigo_convite: codigo,
        convite_pendente: true,
        convidado_por: usuarioId
    })
    
    if (error) { mostrarErro('Erro ao gerar convite: ' + error.message); return }
    
    const linkConvite = `${window.location.origin}${window.location.pathname}?convite=${codigo}`
    document.getElementById('inviteCode').value = linkConvite
    mostrarSucesso('✅ Convite gerado! Copie o link e envie.')
    window.carregarEquipe()
}

window.copiarLinkConvite = () => {
    const input = document.getElementById('inviteCode')
    if (!input?.value) { mostrarErro('Gere um convite primeiro!'); return }
    navigator.clipboard.writeText(input.value)
    mostrarSucesso('✅ Link copiado!')
}

window.aceitarConvite = async () => {
    const codigo = document.getElementById('joinCode').value.trim()
    if (!codigo) { mostrarErro('Digite o código de convite'); return }
    
    const { data: convite } = await supabase.from('membros_equipe').select('*').eq('codigo_convite', codigo).eq('convite_pendente', true).is('usuario_id', null).single()
    
    if (!convite) { mostrarErro('Convite inválido ou expirado!'); return }
    
    await supabase.from('membros_equipe').update({
        usuario_id: usuarioId,
        convite_pendente: false,
        data_aceite: new Date().toISOString(),
        papel: 'membro'
    }).eq('id', convite.id)
    
    mostrarSucesso('✅ Você entrou na equipe com sucesso!')
    document.getElementById('joinCode').value = ''
    equipeAtualId = convite.equipe_id
    window.carregarEquipe()
}

// ============================================================
// ===== FUNÇÕES DE ASSISTENTE (MASCOTE) =====
// ============================================================
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

// ============================================================
// ===== FUNÇÕES DE PAGAMENTO (STRIPE) =====
// ============================================================
window.iniciarAssinaturaStripe = async () => {
    const statusDiv = document.getElementById('stripeStatus')
    if (statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecionando...'
    
    try {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
            body: {
                priceId: 'price_1TiQI7KY6XfInCdDFDG5XKKJ',
                userId: usuarioId,
                userEmail: usuarioAtual,
                successUrl: window.location.origin + window.location.pathname + '?payment=success',
                cancelUrl: window.location.origin + window.location.pathname + '?payment=cancel'
            }
        })
        if (error) throw new Error(error.message)
        if (data?.url) window.location.href = data.url
        else throw new Error('Resposta inválida')
    } catch (err) {
        if (statusDiv) statusDiv.innerHTML = `<span style="color:#D32F2F">❌ Erro: ${err.message}</span>`
        mostrarErro('Erro: ' + err.message)
    }
}

window.abrirModalGerarPagamentoManual = (tipo) => {
    tipoPagamentoManualAtual = tipo
    document.getElementById('modalPagamentoManualTitulo').textContent = tipo === 'PIX' ? '💰 Gerar PIX' : '📄 Gerar Boleto'
    document.getElementById('modalPagamentoManual').style.display = 'flex'
}

window.fecharModalPagamentoManual = () => {
    document.getElementById('modalPagamentoManual').style.display = 'none'
}

window.gerarPagamentoManual = async () => {
    const alunoId = document.getElementById('pagamentoManualAlunoId')?.value
    const valor = parseFloat(document.getElementById('pagamentoManualValor')?.value || 0)
    const descricao = document.getElementById('pagamentoManualDescricao')?.value || `${tipoPagamentoManualAtual} - ${new Date().toLocaleString()}`
    
    if (!alunoId || !valor) { mostrarErro('Preencha os campos'); return }
    
    const { data: aluno } = await supabase.from('profiles').select('email').eq('id', alunoId).single()
    const codigoSimulado = `${tipoPagamentoManualAtual}-${Date.now()}-${Math.random().toString(36).substring(2,8)}`.toUpperCase()
    const dadosInserir = {
        aluno_id: alunoId,
        aluno_email: aluno.email,
        tipo: tipoPagamentoManualAtual,
        valor,
        status: 'PENDENTE',
        descricao,
        data_criacao: new Date().toISOString()
    }
    if (tipoPagamentoManualAtual === 'PIX') dadosInserir.qr_code = codigoSimulado
    else dadosInserir.boleto_linha_digitavel = codigoSimulado
    
    const { error } = await supabase.from('transacoes').insert(dadosInserir)
    if (error) { mostrarErro('Erro: ' + error.message); return }
    
    mostrarSucesso(`✅ ${tipoPagamentoManualAtual} gerado!`)
    window.fecharModalPagamentoManual()
    window.carregarMinhasTransacoes()
    window.carregarTodasTransacoes()
}

// ============================================================
// ===== FUNÇÕES DE ASSINATURA (UTILIDADES) =====
// ============================================================
let tipoPagamentoManualAtual = ''

window.copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto)
    mostrarSucesso('📋 Código copiado!')
}

window.simularPagamento = async (transacaoId) => {
    if (!confirm('Simular pagamento?')) return
    const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId)
    if (error) { mostrarErro('Erro: ' + error.message); return }
    mostrarSucesso('✅ Pagamento simulado!')
    window.carregarMinhasTransacoes()
    window.carregarTodasTransacoes()
}

window.confirmarPagamentoSimulado = async (transacaoId) => {
    if (perfilUsuario !== 'admin') { mostrarErro('Apenas admin'); return }
    if (!confirm('Confirmar pagamento?')) return
    const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId)
    if (error) { mostrarErro('Erro: ' + error.message); return }
    mostrarSucesso('✅ Pagamento confirmado!')
    window.carregarMinhasTransacoes()
    window.carregarTodasTransacoes()
}

// ============================================================
// ===== FUNÇÕES DE CONFIGURAÇÃO =====
// ============================================================
window.limparDados = () => {
    if (!confirm('🗑️ Limpar todos os dados locais?')) return
    localStorage.clear()
    mostrarSucesso('✅ Dados locais limpos!')
    setTimeout(() => window.location.reload(), 1000)
}

// ============================================================
// ===== EVENT LISTENERS =====
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view')
            if (view) window.alternarView(view)
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
console.log('✅ Todas as funções Admin foram restauradas!')
