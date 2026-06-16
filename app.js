import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient('https://dhhvhiyoxadcwsfqlndw.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ')

const CONFIG = {nomeEmpresa:"SulSafe",logoUrl:"https://uwzbafqptjstqafsjhvp.supabase.co/storage/v1/object/public/sulsafe-assets/logo1.png",authRedirectUrl:window.location.origin + window.location.pathname}

// ============================================================
// ===== DADOS DAS NORMAS REGULAMENTADORAS =====
// ============================================================
const todasNrs = [
    { num:"NR-01", nome:"Disposições Gerais e Gerenciamento de Riscos", icon:"📋", cat:"geral", tag:"geral",
        desc:"Estabelece as disposições gerais, o campo de aplicação, os termos e definições das NRs, e o Programa de Gerenciamento de Riscos (PGR) para identificar e controlar riscos no ambiente de trabalho.",
        objs:["Gerenciar riscos ocupacionais","Elaborar o PGR","Definir responsabilidades de empregadores e empregados","Inventariar fontes de risco"]},
    { num:"NR-03", nome:"Embargo ou Interdição", icon:"🚫", cat:"geral", tag:"geral",
        desc:"Estabelece os critérios para embargo de obra e interdição de estabelecimento, setor de serviço, máquina ou equipamento quando houver risco grave e iminente.",
        objs:["Embargo de obras com risco grave","Interdição de máquinas perigosas","Ação fiscal do Auditor do Trabalho"]},
    { num:"NR-04", nome:"SESMT — Serviços Especializados em Eng. de Segurança", icon:"🏥", cat:"saude", tag:"saude",
        desc:"Obriga empresas com mais de 50 trabalhadores a manter o SESMT, composto por médico do trabalho, engenheiro de segurança, técnico de segurança, auxiliar de enfermagem e enfermeiro do trabalho.",
        objs:["Dimensionamento do SESMT por grau de risco","Médico e engenheiro de segurança obrigatórios","Prevenção de doenças e acidentes"]},
    { num:"NR-05", nome:"CIPA — Comissão Interna de Prevenção de Acidentes", icon:"🤝", cat:"geral", tag:"geral",
        desc:"Trata da CIPA, organismo paritário formado por representantes do empregador e dos empregados para prevenir acidentes e doenças do trabalho.",
        objs:["Eleição dos membros da CIPA","Mapas de riscos ambientais","Realização da SIPAT","Estabilidade do cipeiro eleito"]},
    { num:"NR-06", nome:"Equipamentos de Proteção Individual (EPI)", icon:"🦺", cat:"geral", tag:"geral",
        desc:"Define os EPIs como todo dispositivo de uso individual destinado a proteger a saúde e integridade física do trabalhador.",
        objs:["Fornecimento gratuito pelo empregador","Certificado de Aprovação (CA)","Treinamento para uso do EPI","Higienização e substituição"]},
    { num:"NR-07", nome:"PCMSO — Programa de Controle Médico de Saúde Ocupacional", icon:"🩺", cat:"saude", tag:"saude",
        desc:"Exige que os empregadores elaborem e implementem o PCMSO, com objetivo de promoção e preservação da saúde.",
        objs:["Exame admissional obrigatório","Exames periódicos","Emissão do ASO","Monitoramento de saúde"]},
    { num:"NR-08", nome:"Edificações", icon:"🏗️", cat:"especifico", tag:"especifico",
        desc:"Estabelece requisitos técnicos mínimos para garantir segurança nos locais de trabalho em edificações.",
        objs:["Pisos antiderrapantes","Altura mínima do pé-direito","Escadas e rampas seguras","Iluminação e ventilação"]},
    { num:"NR-09", nome:"Exposições Ocupacionais", icon:"⚗️", cat:"saude", tag:"saude",
        desc:"Estabelece a obrigatoriedade de identificar, avaliar e controlar as exposições a agentes físicos, químicos e biológicos.",
        objs:["Identificação de agentes nocivos","Avaliação quantitativa e qualitativa","Medidas de controle coletivo","Inventário de riscos"]},
    { num:"NR-10", nome:"Segurança em Eletricidade", icon:"⚡", cat:"especifico", tag:"especifico",
        desc:"Estabelece requisitos e condições mínimas para segurança e saúde de trabalhadores que interagem com instalações elétricas.",
        objs:["Treinamento obrigatório em eletricidade","Uso de EPE e EPI específicos","Prontuário de instalações elétricas","Sinalização de segurança"]},
    { num:"NR-11", nome:"Movimentação de Materiais", icon:"🏭", cat:"especifico", tag:"especifico",
        desc:"Estabelece requisitos de segurança para operações de transporte de cargas, incluindo equipamentos de elevação.",
        objs:["Habilitação para operadores de empilhadeiras","Capacidade máxima dos equipamentos","Armazenamento seguro de cargas","Manutenção periódica"]},
    { num:"NR-12", nome:"Máquinas e Equipamentos", icon:"⚙️", cat:"especifico", tag:"especifico",
        desc:"Define referências técnicas e medidas de proteção para garantir a saúde e integridade física dos trabalhadores que trabalham com máquinas.",
        objs:["Proteção de partes móveis","Distâncias seguras","Manual de instruções em português","Manutenção e inspeção"]},
    { num:"NR-13", nome:"Caldeiras e Vasos de Pressão", icon:"🔥", cat:"especifico", tag:"especifico",
        desc:"Estabelece requisitos de segurança para projeto, construção, instalação, operação, manutenção, inspeção de caldeiras e vasos de pressão.",
        objs:["Inspeção periódica obrigatória","Profissional Habilitado (PH)","Prontuário do equipamento","Válvulas de segurança"]},
    { num:"NR-15", nome:"Insalubridade", icon:"☣️", cat:"saude", tag:"saude",
        desc:"Define as atividades e operações insalubres que expõem os trabalhadores a agentes nocivos à saúde acima dos limites de tolerância.",
        objs:["Adicional de insalubridade de 10% a 40%","Limites de tolerância por agente","Eliminação ou neutralização","Laudo técnico (LTCAT)"]},
    { num:"NR-16", nome:"Periculosidade", icon:"💥", cat:"especifico", tag:"especifico",
        desc:"Define as atividades e operações perigosas que geram direito ao adicional de periculosidade de 30% sobre o salário-base.",
        objs:["Adicional de periculosidade de 30%","Inflamáveis e explosivos","Energia elétrica e radiações","Segurança pessoal e patrimonial"]},
    { num:"NR-17", nome:"Ergonomia", icon:"🪑", cat:"saude", tag:"saude",
        desc:"Estabelece parâmetros que permitem a adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores.",
        objs:["Peso máximo para levantamento manual","Altura e inclinação dos postos","Pausas e jornada de trabalho","Análise Ergonômica do Trabalho (AET)"]},
    { num:"NR-18", nome:"Construção Civil", icon:"🏚️", cat:"especifico", tag:"especifico",
        desc:"Estabelece diretrizes de ordem administrativa, de planejamento e de organização para implementação de medidas de controle nos canteiros de obras.",
        objs:["PCMAT — Programa de Condições de Trabalho","Andaimes e escadas seguras","EPI para trabalho em altura","Sinalização do canteiro"]},
    { num:"NR-20", nome:"Inflamáveis e Combustíveis", icon:"⛽", cat:"especifico", tag:"especifico",
        desc:"Estabelece os requisitos mínimos de segurança e saúde para atividades com inflamáveis e combustíveis.",
        objs:["Aterramento elétrico de tanques","Proibição de fontes de ignição","Treinamento para operadores","Plano de emergência"]},
    { num:"NR-23", nome:"Proteção Contra Incêndios", icon:"🔥", cat:"geral", tag:"geral",
        desc:"Estabelece as medidas de proteção contra incêndio que os locais de trabalho devem possuir.",
        objs:["Saídas de emergência sinalizadas","Extintores e hidrantes","Brigada de incêndio treinada","Plano de evacuação"]},
    { num:"NR-24", nome:"Condições Sanitárias", icon:"🚻", cat:"saude", tag:"saude",
        desc:"Determina os requisitos de higiene, conforto, instalações sanitárias, bebedouros, refeitórios e alojamentos nos locais de trabalho.",
        objs:["Banheiros por número de trabalhadores","Vestiários com armários individuais","Bebedouros e refeitórios","Alojamentos salubres"]},
    { num:"NR-26", nome:"Sinalização de Segurança", icon:"🚦", cat:"geral", tag:"geral",
        desc:"Fixa as cores a serem usadas nos locais de trabalho para identificação de equipamentos de segurança, delimitação de áreas e advertência de perigos.",
        objs:["Vermelho = combate a incêndio","Amarelo = atenção e risco","Verde = segurança e saídas","Azul = obrigação de usar EPI"]},
    { num:"NR-28", nome:"Fiscalização e Penalidades", icon:"⚖️", cat:"geral", tag:"geral",
        desc:"Estabelece os procedimentos de fiscalização do cumprimento das NRs, os critérios de autuação, as infrações e as penalidades.",
        objs:["Auditores Fiscais do Trabalho","Gradação das penalidades","Auto de infração","Recurso administrativo"]},
    { num:"NR-32", nome:"Serviços de Saúde", icon:"🏥", cat:"saude", tag:"saude",
        desc:"Estabelece as diretrizes básicas para a implementação de medidas de proteção à segurança e à saúde dos trabalhadores em serviços de saúde.",
        objs:["Prevenção de acidentes com perfurocortantes","Gestão de resíduos hospitalares","Proteção contra agentes biológicos","Vacinação dos profissionais"]},
    { num:"NR-33", nome:"Espaços Confinados", icon:"🕳️", cat:"especifico", tag:"especifico",
        desc:"Estabelece os requisitos mínimos para identificação de espaços confinados e trabalho nesses locais.",
        objs:["Permissão de Entrada e Trabalho (PET)","Supervisor, vigias e trabalhadores autorizados","Monitoramento da atmosfera","Resgate em espaço confinado"]},
    { num:"NR-35", nome:"Trabalho em Altura", icon:"🧗", cat:"especifico", tag:"especifico",
        desc:"Estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura acima de 2,0 m.",
        objs:["Altura mínima: acima de 2,0 m","Permissão de Trabalho em Altura (PTA)","Cinto de segurança tipo paraquedista","Treinamento teórico e prático obrigatório"]},
    { num:"NR-36", nome:"Frigoríficos", icon:"🥩", cat:"especifico", tag:"especifico",
        desc:"Estabelece os requisitos mínimos de segurança e saúde para os trabalhadores em atividades de abate e processamento de carnes.",
        objs:["Pausas para recuperação térmica","Rotação de tarefas","Proteção contra cortes","Monitoramento de DORT/LER"]}
];

let filtroNrAtivo = 'todos';
let termoBuscaNr = '';
let nrSelecionadaAtual = null;

// ===== FUNÇÕES DAS NRS =====
function renderizarNrs() {
    const grid = document.getElementById('gridNrs');
    const noRes = document.getElementById('noResultsNrs');
    if (!grid) return;
    
    let filtradas = todasNrs.filter(nr => {
        const matchFilter = filtroNrAtivo === 'todos' || nr.cat === filtroNrAtivo;
        const matchSearch = termoBuscaNr === '' ||
            nr.nome.toLowerCase().includes(termoBuscaNr) ||
            nr.num.toLowerCase().includes(termoBuscaNr) ||
            nr.desc.toLowerCase().includes(termoBuscaNr);
        return matchFilter && matchSearch;
    });
    
    if (filtradas.length === 0) {
        grid.innerHTML = '';
        if (noRes) noRes.style.display = 'block';
        return;
    }
    if (noRes) noRes.style.display = 'none';
    
    grid.innerHTML = filtradas.map(nr => `
        <div class="nr-card" onclick="abrirModalNr('${nr.num}')">
            <span class="tag tag-${nr.tag}">${nr.tag === 'geral' ? 'Geral' : nr.tag === 'saude' ? 'Saúde' : 'Setorial'}</span>
            <span class="card-icon">${nr.icon}</span>
            <span class="nr-num">${nr.num}</span>
            <h3>${escapeHtml(nr.nome)}</h3>
            <p>${escapeHtml(nr.desc.substring(0,80))}...</p>
        </div>
    `).join('');
}

function setFiltroNr(f, btn) {
    filtroNrAtivo = f;
    document.querySelectorAll('#filterBarNrs .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderizarNrs();
}

function filtrarNrs() {
    const input = document.getElementById('searchNrs');
    termoBuscaNr = input ? input.value.toLowerCase().trim() : '';
    renderizarNrs();
}

function abrirModalNr(num) {
    const nr = todasNrs.find(n => n.num === num);
    if (!nr) return;
    nrSelecionadaAtual = nr;
    document.getElementById('mNrIcon').textContent = nr.icon;
    document.getElementById('mNrNum').textContent = nr.num;
    document.getElementById('mNrTitle').textContent = nr.nome;
    document.getElementById('mNrDesc').textContent = nr.desc;
    document.getElementById('mNrObjs').innerHTML = nr.objs.map(o => `<li>${escapeHtml(o)}</li>`).join('');
    document.getElementById('modalNrBg').classList.add('open');
}

function fecharModalNr(e) {
    if (e.target === document.getElementById('modalNrBg')) {
        document.getElementById('modalNrBg').classList.remove('open');
        nrSelecionadaAtual = null;
    }
}

function perguntarSobreNR() {
    if (!nrSelecionadaAtual) return;
    const { num, nome } = nrSelecionadaAtual;
    document.getElementById('modalNrBg').classList.remove('open');
    alternarView('ia');
    setTimeout(() => {
        const input = document.getElementById('iaChatInput');
        if (input) {
            input.value = `Explique a ${num} - ${nome} de forma resumida e dê exemplos práticos para estudantes de segurança do trabalho.`;
            enviarPerguntaIA();
        }
    }, 400);
}
// ============================================================
// ===== FIM DAS FUNÇÕES DAS NRS =====
// ============================================================

let usuarioAtual = null, usuarioId = null, perfilUsuario = null, ehProfessor = false, salaAtual = null, jitsiApi = null, isRecording = false, todasAulas = [], todosTrabalhos = [], currentChart = null, relatorioData = []
let salaRealtimeChannel = null
let equipeAtualId = null

// ========== FUNÇÕES DE EQUIPE COM SUPABASE (CORRIGIDA) ==========
async function carregarEquipe() {
    if(!usuarioId) {
        console.log("Usuário não logado");
        return;
    }
    
    const container = document.getElementById('memberList');
    if(!container) return;
    
    container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando equipe...</p>';
    
    try {
        // Buscar o ID da equipe do usuário atual (query simples, sem joins recursivos)
        const { data: membroAtual, error: membroError } = await supabase
            .from('membros_equipe')
            .select('equipe_id')
            .eq('usuario_id', usuarioId)
            .limit(1)
            .single();
        
        if (membroError && membroError.code !== 'PGRST116') {
            console.error('Erro ao buscar membro:', membroError);
        }
        
        // Se não está em nenhuma equipe, criar uma
        if (!membroAtual || !membroAtual.equipe_id) {
            await criarEquipeInicial();
            return;
        }
        
        equipeAtualId = membroAtual.equipe_id;
        
        // Buscar todos os membros da equipe (query separada para evitar recursão)
        const { data: todosMembros, error: membrosError } = await supabase
            .from('membros_equipe')
            .select('usuario_id, papel, convite_pendente')
            .eq('equipe_id', equipeAtualId);
        
        if (membrosError) throw membrosError;
        
        if (!todosMembros || todosMembros.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px">Nenhum membro na equipe.</p>';
            return;
        }
        
        // Buscar os dados dos usuários separadamente (para evitar recursão)
        const userIds = todosMembros.map(m => m.usuario_id).filter(id => id);
        let userProfiles = {};
        
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, nome_completo')
                .in('id', userIds);
            
            if (profiles) {
                profiles.forEach(p => { userProfiles[p.id] = p; });
            }
        }
        
        // Renderizar lista de membros
        container.innerHTML = todosMembros.map(m => {
            const profile = userProfiles[m.usuario_id];
            const nomeExibicao = profile?.nome_completo || profile?.email || m.usuario_id?.substring(0, 8);
            const isCurrentUser = m.usuario_id === usuarioId;
            
            return `
                <div class="member-item">
                    <div class="member-info">
                        <i class="fas fa-user-circle"></i>
                        <span>${escapeHtml(nomeExibicao)}</span>
                        <span class="member-role">${m.papel === 'admin' ? '👑 Admin' : '👤 Membro'}</span>
                        ${m.convite_pendente ? '<span class="status-badge" style="background:#FF9800">Convite pendente</span>' : ''}
                    </div>
                    ${ehProfessor && m.papel !== 'admin' && !m.convite_pendente && !isCurrentUser ? `
                        <button class="test-button" style="background:#D32F2F" onclick="removerMembro('${m.usuario_id}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        await carregarConvitesPendentes();
        
    } catch(err) {
        console.error('Erro ao carregar equipe:', err);
        container.innerHTML = '<p style="color:red">Erro ao carregar equipe: ' + err.message + '</p>';
    }
}

async function criarEquipeInicial() {
    try {
        const { data: existing, error: checkError } = await supabase
            .from('membros_equipe')
            .select('equipe_id')
            .eq('usuario_id', usuarioId)
            .limit(1);
        
        if (existing && existing.length > 0) {
            equipeAtualId = existing[0].equipe_id;
            await carregarEquipe();
            return;
        }
        
        const { data: equipe, error: eError } = await supabase
            .from('equipes')
            .insert({ nome: `Equipe de ${usuarioAtual?.split('@')[0] || 'Usuário'}`, criado_por: usuarioId })
            .select()
            .single();
        
        if(eError) throw eError;
        
        equipeAtualId = equipe.id;
        
        await supabase
            .from('membros_equipe')
            .insert({ equipe_id: equipe.id, usuario_id: usuarioId, papel: 'admin' });
        
        mostrarErro('✅ Equipe criada com sucesso!');
        await carregarEquipe();
        
    } catch(err) {
        console.error('Erro ao criar equipe:', err);
        mostrarErro('Erro ao criar equipe: ' + err.message);
    }
}

async function gerarConvite() {
    if (!equipeAtualId) {
        mostrarErro('Carregando equipe... Aguarde um momento.');
        return;
    }
    
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { data, error } = await supabase
        .from('membros_equipe')
        .insert({
            equipe_id: equipeAtualId,
            codigo_convite: codigo,
            convite_pendente: true,
            convidado_por: usuarioId
        })
        .select()
        .single();
    
    if(error) {
        mostrarErro('Erro ao gerar convite: ' + error.message);
        return;
    }
    
    const linkConvite = `${window.location.origin}${window.location.pathname}?convite=${codigo}`;
    document.getElementById('inviteCode').value = linkConvite;
    mostrarErro('✅ Convite gerado! Copie o link e envie.');
    await carregarConvitesPendentes();
}

async function carregarConvitesPendentes() {
    const container = document.getElementById('pendingInvitesList');
    if(!container) return;
    
    if (!equipeAtualId) {
        container.innerHTML = '<p style="color:gray">Nenhum convite pendente</p>';
        return;
    }
    
    const { data, error } = await supabase
        .from('membros_equipe')
        .select('codigo_convite, data_convite')
        .eq('equipe_id', equipeAtualId)
        .eq('convite_pendente', true)
        .is('usuario_id', null);
    
    if(error) {
        console.error('Erro ao carregar convites:', error);
        container.innerHTML = '<p>Erro ao carregar convites</p>';
        return;
    }
    
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="color:gray">Nenhum convite pendente</p>';
        return;
    }
    
    container.innerHTML = data.map(inv => `
        <div class="pending-invite">
            <span><i class="fas fa-link"></i> Código: ${inv.codigo_convite}</span>
            <button onclick="cancelarConvite('${inv.codigo_convite}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

async function cancelarConvite(codigo) {
    if(!confirm('Cancelar este convite?')) return;
    
    await supabase
        .from('membros_equipe')
        .delete()
        .eq('codigo_convite', codigo)
        .eq('convite_pendente', true);
    
    mostrarErro('Convite cancelado!');
    await carregarEquipe();
}

async function removerMembro(usuarioIdRemover) {
    if(!confirm('Remover este membro da equipe?')) return;
    
    await supabase
        .from('membros_equipe')
        .delete()
        .eq('equipe_id', equipeAtualId)
        .eq('usuario_id', usuarioIdRemover);
    
    mostrarErro('Membro removido!');
    await carregarEquipe();
}

async function aceitarConvite() {
    const codigo = document.getElementById('joinCode').value.trim();
    if(!codigo) {
        mostrarErro('Digite o código de convite');
        return;
    }
    
    const { data: convite, error: findError } = await supabase
        .from('membros_equipe')
        .select('*')
        .eq('codigo_convite', codigo)
        .eq('convite_pendente', true)
        .is('usuario_id', null)
        .single();
    
    if (findError || !convite) {
        mostrarErro('Convite inválido ou expirado!');
        return;
    }
    
    const { error } = await supabase
        .from('membros_equipe')
        .update({ 
            usuario_id: usuarioId, 
            convite_pendente: false, 
            data_aceite: new Date().toISOString(),
            papel: 'membro'
        })
        .eq('id', convite.id);
    
    if(error) {
        mostrarErro('Erro ao aceitar convite: ' + error.message);
        return;
    }
    
    mostrarErro('✅ Você entrou na equipe com sucesso!');
    document.getElementById('joinCode').value = '';
    equipeAtualId = convite.equipe_id;
    await carregarEquipe();
}

window.copiarLinkConvite = () => {
    const input = document.getElementById('inviteCode');
    if(!input || !input.value) {
        mostrarErro('Nenhum convite gerado ainda.');
        return;
    }
    navigator.clipboard.writeText(input.value);
    mostrarErro('✅ Link copiado!');
};
        
// ========== FUNÇÕES DE CHAT EM TEMPO REAL ==========
        
async function iniciarRealtimeChat(salaId) {
    if(salaRealtimeChannel) {
        await supabase.removeChannel(salaRealtimeChannel)
    }
    salaRealtimeChannel = supabase.channel(`chat:${salaId}`)
    salaRealtimeChannel
        .on('broadcast', { event: 'mensagem' }, (payload) => {
            const { sender, message, timestamp } = payload.payload
            adicionarMensagemChatDOM(sender, message, sender === usuarioAtual, timestamp)
        })
        .subscribe()
}
        
function enviarMensagemRealtime(salaId, mensagem) {
    if(!salaRealtimeChannel) return
    salaRealtimeChannel.send({
        type: 'broadcast',
        event: 'mensagem',
        payload: { sender: usuarioAtual, message: mensagem, timestamp: new Date().toISOString() }
    })
}
        
function adicionarMensagemChatDOM(sender, msg, own, timestamp = null) {
    const div = document.getElementById('chatMessages')
    const m = document.createElement('div')
    m.className = `chat-message ${own ? 'own' : ''}`
    const hora = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
    m.innerHTML = `<div class="sender">${escapeHtml(sender)} • ${hora}</div><div class="text">${escapeHtml(msg)}</div>`
    div.appendChild(m)
    div.scrollTop = div.scrollHeight
}
        
window.enviarMensagemChat = () => {
    const input = document.getElementById('chatInput')
    const txt = input.value.trim()
    if(!txt || !salaAtual) return
    enviarMensagemRealtime(salaAtual.id, txt)
    input.value = ''
}
        
// ========== FUNÇÕES DE RELATÓRIO COM GRÁFICOS E EXPORTAÇÃO ==========
        
function renderizarGraficoProgresso(alunos, progressos) {
    const ctx = document.getElementById('progressoChart')?.getContext('2d')
    if(!ctx) return
    if(currentChart) currentChart.destroy()
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: alunos, datasets: [{ label: 'Progresso (%)', data: progressos, backgroundColor: '#2E7D32', borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }
    })
}
        
window.exportarRelatorioCSV = () => {
    if(!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return }
    let csv = 'Aluno,Aulas Assistidas,Total Aulas,Progresso (%),Status\n'
    relatorioData.forEach(r => { csv += `"${r.aluno}",${r.aulasAssistidas},${r.totalAulas},${r.percentual},${r.status}\n` })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    mostrarErro('✅ CSV exportado com sucesso!')
}
        
window.exportarRelatorioExcel = () => {
    if(!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return }
    const wsData = [['Aluno', 'Aulas Assistidas', 'Total Aulas', 'Progresso (%)', 'Status']]
    relatorioData.forEach(r => { wsData.push([r.aluno, r.aulasAssistidas, r.totalAulas, r.percentual, r.status]) })
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório SulSafe')
    XLSX.writeFile(wb, `relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.xlsx`)
    mostrarErro('✅ Excel exportado com sucesso!')
}
        
window.exportarRelatorioPDF = async () => {
    if(!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return }
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFillColor(46, 125, 50)
    doc.rect(0, 0, 297, 210, 'F')
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(10, 10, 277, 190, 5, 5, 'F')
    doc.setTextColor(46, 125, 50)
    doc.setFontSize(22)
    doc.text('Relatório de Alunos - SulSafe', 148.5, 25, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    let y = 40
    doc.text('Aluno', 20, y)
    doc.text('Aulas Assistidas', 100, y)
    doc.text('Total Aulas', 150, y)
    doc.text('Progresso', 190, y)
    doc.text('Status', 230, y)
    y += 8
    relatorioData.forEach(r => {
        if(y > 180) { doc.addPage(); y = 20 }
        doc.text(r.aluno.substring(0, 30), 20, y)
        doc.text(r.aulasAssistidas.toString(), 110, y)
        doc.text(r.totalAulas.toString(), 160, y)
        doc.text(r.percentual + '%', 195, y)
        doc.text(r.status, 235, y)
        y += 7
    })
    doc.save(`relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.pdf`)
    mostrarErro('✅ PDF exportado com sucesso!')
}
        
// ========== FUNÇÕES DE PAGAMENTO ==========
        
window.iniciarAssinaturaStripe = async () => {
    const PRICE_ID = 'price_1TiQI7KY6XfInCdDFDG5XKKJ'
    const statusDiv = document.getElementById('stripeStatus')
    if(statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecionando...'
    try {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
            body: { priceId: PRICE_ID, userId: usuarioId, userEmail: usuarioAtual, successUrl: window.location.origin + window.location.pathname + '?payment=success', cancelUrl: window.location.origin + window.location.pathname + '?payment=cancel' }
        })
        if (error) throw new Error(error.message)
        if (data?.url) window.location.href = data.url
        else throw new Error('Resposta inválida')
    } catch (err) {
        if(statusDiv) statusDiv.innerHTML = `<span style="color:var(--erro)">❌ Erro: ${err.message}</span>`
        mostrarErro('Erro: ' + err.message)
    }
}
        
// ========== TRANSAÇÕES ==========
        
async function carregarMinhasTransacoes() {
    const container = document.getElementById('minhasTransacoesContainer')
    if(!container) return
    container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    try {
        const { data, error } = await supabase.from('transacoes').select('*').eq('aluno_id', usuarioId).order('data_criacao', { ascending: false })
        if(error) throw error
        if(!data || data.length === 0) { container.innerHTML = '<p style="text-align:center; padding:20px">Nenhuma transação encontrada.</p>'; return }
        
        let html = `<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead><tbody>`
        
        for(const t of data) {
            let statusStyle = '', statusText = ''
            if(t.status === 'PAGO') { statusStyle = 'background:#4CAF50; color:white'; statusText = '✅ PAGO' }
            else if(t.status === 'PENDENTE') { statusStyle = 'background:#FF9800; color:white'; statusText = '⏳ PENDENTE' }
            else { statusStyle = 'background:#F44336; color:white'; statusText = '❌ ' + t.status }
            
            let acoes = ''
            if(t.status === 'PENDENTE') {
                if(t.tipo === 'BOLETO' && t.boleto_linha_digitavel) {
                    acoes = `<button class="btn-entrar" onclick="copiarTexto('${t.boleto_linha_digitavel}')" style="background:#1565C0; padding:4px 12px"><i class="fas fa-barcode"></i> Copiar Boleto</button>`
                } else if(t.tipo === 'PIX' && t.qr_code) {
                    acoes = `<button class="btn-entrar" onclick="copiarTexto('${t.qr_code}')" style="background:#25D366; padding:4px 12px"><i class="fab fa-pix"></i> Copiar PIX</button>`
                } else {
                    acoes = `<button class="btn-entrar" onclick="simularPagamento('${t.id}')" style="background:#4CAF50; padding:4px 12px">Simular Pagamento</button>`
                }
            } else {
                acoes = `<span style="color:green"><i class="fas fa-check-circle"></i> Pago</span>`
            }
            
            html += `<tr><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}; padding:4px 12px; border-radius:20px">${statusText}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td><td>${acoes}</td></tr>`
        }
        html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarMinhasTransacoes()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`
        container.innerHTML = html
    } catch(err) { container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>' }
}
        
async function carregarTodasTransacoes() {
    if(perfilUsuario !== 'admin') return
    const container = document.getElementById('todasTransacoesContainer')
    if(!container) return
    container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    try {
        const { data, error } = await supabase.from('transacoes').select('*').order('data_criacao', { ascending: false })
        if(error) throw error
        if(!data || data.length === 0) { container.innerHTML = '<p style="text-align:center; padding:20px">Nenhuma transação.</p>'; return }
        
        let html = `<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Aluno</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th><tr></thead><tbody>`
        
        for(const t of data) {
            let statusStyle = '', statusText = ''
            if(t.status === 'PAGO') { statusStyle = 'background:#4CAF50; color:white'; statusText = '✅ PAGO' }
            else if(t.status === 'PENDENTE') { statusStyle = 'background:#FF9800; color:white'; statusText = '⏳ PENDENTE' }
            else { statusStyle = 'background:#F44336; color:white'; statusText = '❌ ' + t.status }
            
            let acoes = ''
            if(t.status === 'PENDENTE') {
                acoes = `<button class="btn-entrar" onclick="confirmarPagamentoSimulado('${t.id}')" style="background:#4CAF50; padding:4px 12px">Confirmar</button>`
            }
            
            html += `<tr><td>${escapeHtml(t.aluno_email)}</td><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}; padding:4px 12px; border-radius:20px">${statusText}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td><td>${acoes}</td></tr>`
        }
        html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarTodasTransacoes()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`
        container.innerHTML = html
    } catch(err) { container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>' }
}
        
window.simularPagamento = async (transacaoId) => {
    if(!confirm('Simular pagamento?')) return
    const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId)
    if(error) mostrarErro('Erro: ' + error.message)
    else { mostrarErro('✅ Pagamento simulado!'); carregarMinhasTransacoes(); if(perfilUsuario === 'admin') carregarTodasTransacoes() }
}
        
window.confirmarPagamentoSimulado = async (transacaoId) => {
    if(perfilUsuario !== 'admin') { mostrarErro('Apenas admin'); return }
    if(!confirm('Confirmar pagamento?')) return
    const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId)
    if(error) mostrarErro('Erro: ' + error.message)
    else { mostrarErro('✅ Pagamento confirmado!'); carregarMinhasTransacoes(); carregarTodasTransacoes() }
}
        
window.copiarTexto = (texto) => { navigator.clipboard.writeText(texto); mostrarErro('📋 Código copiado!') }
        
let tipoPagamentoManualAtual = ''
window.abrirModalGerarPagamentoManual = async (tipo) => {
    if(perfilUsuario !== 'admin') { mostrarErro('Apenas admin'); return; }
    tipoPagamentoManualAtual = tipo
    document.getElementById('modalPagamentoManualTitulo').innerHTML = tipo === 'PIX' ? '💰 Gerar PIX' : '📄 Gerar Boleto'
    const select = document.getElementById('pagamentoManualAlunoId')
    const { data: alunos } = await supabase.from('profiles').select('id,email').eq('role', 'aluno')
    select.innerHTML = '<option value="">Selecione...</option>'
    alunos.forEach(aluno => { select.innerHTML += `<option value="${aluno.id}">${escapeHtml(aluno.email)}</option>` })
    document.getElementById('modalPagamentoManual').style.display = 'flex'
}
window.fecharModalPagamentoManual = () => { document.getElementById('modalPagamentoManual').style.display = 'none' }
window.gerarPagamentoManual = async () => {
    const alunoId = document.getElementById('pagamentoManualAlunoId')?.value
    const valor = parseFloat(document.getElementById('pagamentoManualValor')?.value || '0')
    const descricao = document.getElementById('pagamentoManualDescricao')?.value || `${tipoPagamentoManualAtual} - ${new Date().toLocaleString()}`
    if(!alunoId || !valor) { mostrarErro('Preencha os campos'); return }
    const { data: aluno } = await supabase.from('profiles').select('email').eq('id', alunoId).single()
    const codigoSimulado = `${tipoPagamentoManualAtual}-${Date.now()}-${Math.random().toString(36).substring(2,8)}`.toUpperCase()
    const dadosInserir = { aluno_id: alunoId, aluno_email: aluno.email, tipo: tipoPagamentoManualAtual, valor: valor, status: 'PENDENTE', descricao: descricao, data_criacao: new Date().toISOString() }
    if(tipoPagamentoManualAtual === 'PIX') dadosInserir.qr_code = codigoSimulado
    else dadosInserir.boleto_linha_digitavel = codigoSimulado
    const { error } = await supabase.from('transacoes').insert(dadosInserir)
    if(error) mostrarErro('Erro: ' + error.message)
    else { mostrarErro(`✅ ${tipoPagamentoManualAtual} gerado!`); window.fecharModalPagamentoManual(); carregarMinhasTransacoes(); carregarTodasTransacoes() }
}
        
// ========== FUNÇÕES DE BOLETIM ==========
        
async function carregarBoletimAdmin() {
    const container = document.getElementById('boletimContainer')
    if(!container) return
    container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    try {
        const { data: alunos } = await supabase.from('profiles').select('id,email')
        const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true)
        const { data: notas } = await supabase.from('notas').select('*')
        const notasPorAluno = {}
        notas?.forEach(nota => { if(!notasPorAluno[nota.aluno_id]) notasPorAluno[nota.aluno_id] = {}; notasPorAluno[nota.aluno_id][nota.disciplina_id] = nota })
        
        let html = `<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;"><table style="min-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;"><thead><tr style="background: #f5f5f5; border-bottom: 2px solid #2E7D32;"><th style="padding:12px; text-align:center; color: #2E7D32;">Aluno</th>${disciplinas?.map(d => `<th style="padding:12px; text-align:center; color: #2E7D32;">${escapeHtml(d.nome)}</th>`).join('')}<th style="padding:12px; text-align:center; color: #2E7D32;">Média Final</th><th style="padding:12px; text-align:center; color: #2E7D32;">Situação</th></tr></thead><tbody>`
        
        for(const aluno of alunos) {
            let somaMedias = 0, disciplinasContadas = 0
            html += `<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding:12px; text-align:center; color: #333;">${escapeHtml(aluno.email)}</td>`
            
            for(const disc of disciplinas || []) {
                const nota = notasPorAluno[aluno.id]?.[disc.id]
                let media = '-'
                if(nota) {
                    const n1 = parseFloat(nota.nota1)||0, n2 = parseFloat(nota.nota2)||0, n3 = parseFloat(nota.nota3)||0
                    let m = (n1+n2+n3)/3
                    if(nota.recuperacao > m) m = (m + parseFloat(nota.recuperacao))/2
                    media = m.toFixed(1); somaMedias += m; disciplinasContadas++
                }
                html += `<td style="padding:12px; text-align:center; font-weight: bold; color: #2E7D32;">${media}</td>`
            }
            
            const mediaFinal = disciplinasContadas > 0 ? (somaMedias/disciplinasContadas).toFixed(1) : '-'
            let situacaoClass = 'status-pendente', situacaoText = '⏳ PENDENTE'
            if(mediaFinal !== '-') {
                const mf = parseFloat(mediaFinal)
                if(mf >= 6) { situacaoClass = 'status-aprovado'; situacaoText = '✅ APROVADO' }
                else if(mf >= 4) { situacaoClass = 'status-recuperacao'; situacaoText = '🟡 RECUPERAÇÃO' }
                else { situacaoClass = 'status-reprovado'; situacaoText = '❌ REPROVADO' }
            }
            html += `<td style="padding:12px; text-align:center; font-weight: bold; color: #2E7D32;">${mediaFinal}</td>`
            html += `<td style="padding:12px; text-align:center; color: ${situacaoClass === 'status-aprovado' ? '#2E7D32' : (situacaoClass === 'status-recuperacao' ? '#FF9800' : '#D32F2F')}; font-weight: bold;">${situacaoText}</td>`
            html += `</tr>`
        }
        
        html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarBoletimAdmin()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`
        container.innerHTML = html
    } catch(err) { container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>' }
}
        
async function carregarBoletimAluno() {
    const container = document.getElementById('boletimAlunoContainer')
    if(!container) return
    container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    try {
        const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true)
        const { data: notas } = await supabase.from('notas').select('*').eq('aluno_id', usuarioId)
        if(!disciplinas?.length) { container.innerHTML = '<p>Nenhuma disciplina.</p>'; return }
        
        let html = `<div style="overflow-x: auto;"><table class="boletim-tabela" style="min-width: 600px;"><thead><tr><th>Disciplina</th><th>Nota 1</th><th>Nota 2</th><th>Nota 3</th><th>Média</th><th>Faltas</th><th>Situação</th></tr></thead><tbody>`
        let somaMedias = 0, disciplinasContadas = 0
        for(const disc of disciplinas) {
            const nota = notas?.find(n => n.disciplina_id === disc.id)
            let n1 = '-', n2 = '-', n3 = '-', media = '-', faltas = '-'
            let situacaoClass = 'status-pendente', situacaoText = '⏳ Pendente'
            if(nota && nota.media_final) {
                n1 = nota.nota1 || '-'; n2 = nota.nota2 || '-'; n3 = nota.nota3 || '-'
                faltas = nota.faltas || 0
                media = nota.media_final.toFixed(1)
                somaMedias += nota.media_final; disciplinasContadas++
                if(nota.media_final >= 6) { situacaoClass = 'status-aprovado'; situacaoText = '✅ Aprovado' }
                else if(nota.media_final >= 4) { situacaoClass = 'status-recuperacao'; situacaoText = '🟡 Recuperação' }
                else { situacaoClass = 'status-reprovado'; situacaoText = '❌ Reprovado' }
            }
            html += `<tr><td>${escapeHtml(disc.nome)}</td><td>${n1}</td><td>${n2}</td><td>${n3}</td><td><strong>${media}</strong></td><td>${faltas}</td><td class="${situacaoClass}">${situacaoText}</td></tr>`
        }
        const mediaGeral = disciplinasContadas > 0 ? (somaMedias / disciplinasContadas).toFixed(1) : '-'
        html += `<tr style="background:#f5f5f5"><td colspan="4"><strong>Média Geral:</strong></td><td><strong>${mediaGeral}</strong></td><td colspan="2"></td></tr>`
        html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarBoletimAluno()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`
        container.innerHTML = html
    } catch(err) { container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>' }
}
        
// ========== FUNÇÕES DE RELATÓRIO ==========
        
window.carregarRelatorioAlunos = async () => {
    const container = document.getElementById('relatorioContainer')
    if(!container) return
    container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>'
    try {
        const { data: alunos } = await supabase.from('profiles').select('id,email,role')
        const alunosList = alunos?.filter(p => p.role === 'aluno') || []
        const { data: aulas } = await supabase.from('videoaulas').select('id')
        const totalAulas = aulas?.length || 0
        const { data: progresso } = await supabase.from('progresso_aulas').select('user_id,aula_id').eq("concluído", true)
        const progressoPorAluno = {}
        progresso?.forEach(p => { if(!progressoPorAluno[p.user_id]) progressoPorAluno[p.user_id] = []; progressoPorAluno[p.user_id].push(p.aula_id) })
        
        relatorioData = []
        const alunosNomes = [], alunosProgressos = []
        for(const aluno of alunosList) {
            const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0
            const percentual = totalAulas > 0 ? Math.round((aulasAssistidas/totalAulas)*100) : 0
            alunosNomes.push(aluno.email.split('@')[0])
            alunosProgressos.push(percentual)
            relatorioData.push({ aluno: aluno.email.split('@')[0], aulasAssistidas, totalAulas, percentual, status: percentual === 100 ? 'Concluído' : (percentual > 0 ? 'Em andamento' : 'Não iniciado') })
        }
        renderizarGraficoProgresso(alunosNomes, alunosProgressos)
        
        let html = '<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Aluno</th><th>Aulas</th><th>Progresso</th><th>Status</th><th>Certificado</th></tr></thead><tbody>'
        for(const aluno of alunosList) {
            const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0
            const percentual = totalAulas > 0 ? Math.round((aulasAssistidas/totalAulas)*100) : 0
            const botaoCertificado = percentual === 100 ? `<button class="btn-criar-sala" onclick="gerarCertificadoAluno('${aluno.id}','${aluno.email}')" style="padding:4px 8px">Certificado</button>` : '<span style="color:gray">⏳ 100%</span>'
            html += `<tr><td>${aluno.email}</td><td style="text-align:center">${aulasAssistidas}/${totalAulas}</td><td><div style="background:#e0e0e0; border-radius:20px; height:8px"><div style="background:#2E7D32; border-radius:20px; height:8px; width:${percentual}%"></div></div>${percentual}%</td><td>${percentual===100?'✅ Concluído':(percentual>0?'🟡 Em andamento':'🔴 Não iniciado')}</td><td style="text-align:center">${botaoCertificado}</td></tr>`
        }
        html += '</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarRelatorioAlunos()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>'
        container.innerHTML = html
    } catch(err) { container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>' }
}
        
window.gerarCertificadoAluno = async (alunoId, alunoEmail) => {
    const { data: progresso } = await supabase.from('progresso_aulas').select('aula_id').eq('user_id', alunoId).eq("concluído", true)
    if(!progresso?.length) { mostrarErro('Aluno não concluiu nenhuma aula.'); return }
    const { data: aulas } = await supabase.from('videoaulas').select('nr').in('id', progresso.map(p => p.aula_id))
    const nrs = [...new Set(aulas.map(a => a.nr).filter(Boolean))]
    const nome = alunoEmail.split('@')[0]
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFillColor(27,94,32); doc.rect(0,0,297,210,'F')
    doc.setFillColor(255,255,255); doc.roundedRect(15,15,267,180,8,8,'F')
    doc.setTextColor(46,125,50); doc.setFontSize(32); doc.text('SULSAFE', 148.5, 50, { align: 'center' })
    doc.setFontSize(15); doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 61, { align: 'center' })
    doc.setFontSize(13); doc.text('Certificamos que', 148.5, 80, { align: 'center' })
    doc.setFontSize(22); doc.setTextColor(27,94,32); doc.text(nome.toUpperCase(), 148.5, 94, { align: 'center' })
    doc.setFontSize(13); doc.setTextColor(30,30,30); doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.', 148.5, 108, { align: 'center' })
    if(nrs.length) doc.text(`Normas: ${nrs.join(', ')}`, 148.5, 120, { align: 'center' })
    doc.text(`Emitido em ${new Date().toLocaleDateString()}`, 148.5, 146, { align: 'center' })
    doc.save(`Certificado_${nome}.pdf`)
    mostrarErro(`✅ Certificado gerado!`)
}
        
// ========== FUNÇÕES EXISTENTES ==========
        
function escapeHtml(s){return String(s||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function mostrarErro(msg){const el=document.getElementById('errorTooltip');el.innerText=msg;el.style.display='block';setTimeout(()=>el.style.display='none',4000)}
function traduzirErroAuth(msg){const m=(msg||'').toLowerCase();if(m.includes('invalid login'))return 'E-mail ou senha incorreto...';if(m.includes('not confirmed'))return 'Confirme seu e-mail antes de entrar.';if(m.includes('already registered'))return 'E-mail já cadastrado.';return msg}
        
async function garantirPerfil(user){
    const {data:existing}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle()
    if(existing) return existing.role
    const ADMIN_EMAILS=['sulsafetreinamentos@gmail.com']
    const role=ADMIN_EMAILS.includes(user.email)?'admin':'aluno'
    await supabase.from('profiles').insert({id:user.id,email:user.email,role:role})
    return role
}
        
window.mostrarTela=(tela)=>{document.querySelectorAll('.tela').forEach(t=>t.classList.remove('active'));document.getElementById(`tela${tela.charAt(0).toUpperCase()+tela.slice(1)}`).classList.add('active')}
        
window.alternarView=(viewId)=>{
    const views=['Home','Videoaulas','Salas','Materiais','Aluno','Ia','Equipe','Config','Trabalhos','Relatorio','Financeiro','Boletim','BoletimAluno','Nrs']
    views.forEach(v=>{const el=document.getElementById(`view${v}`);if(el)el.style.display='none'})
    const target=document.getElementById(`view${viewId.charAt(0).toUpperCase()+viewId.slice(1)}`)
    if(target)target.style.display='block'
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'))
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active')
    if(viewId==='salas')atualizarListaSalas()
    if(viewId==='equipe')carregarEquipe()
    if(viewId==='materiais')carregarMateriais()
    if(viewId==='financeiro') { carregarMinhasTransacoes(); if(perfilUsuario === 'admin') carregarTodasTransacoes() }
    if(viewId==='videoaulas')carregarVideoaulas()
    if(viewId==='trabalhos'&&ehProfessor)carregarTrabalhos()
    if(viewId==='aluno')carregarMeusTrabalhos()
    if(viewId==='relatorio'&&ehProfessor)carregarRelatorioAlunos()
    if(viewId==='boletim') { if(ehProfessor) carregarBoletimAdmin(); else carregarBoletimAluno() }
    if(viewId==='nrs') { renderizarNrs() }
}
        
window.fazerLogin=async()=>{
    const email=document.getElementById('loginEmail').value,senha=document.getElementById('loginSenha').value
    const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:senha})
    if(error){alert(traduzirErroAuth(error.message));return}
    usuarioAtual=data.user.email;usuarioId=data.user.id
    const role=await garantirPerfil(data.user)
    perfilUsuario=role;ehProfessor=(role==='admin'||role==='professor')
    document.getElementById('dashUserName').innerHTML=usuarioAtual
    atualizarPainelProfessor();entrarDashboard()
}
        
function atualizarPainelProfessor(){
    const isAdmin = perfilUsuario === 'admin'
    const isProfessor = perfilUsuario === 'professor' || perfilUsuario === 'admin'
    const isAluno = perfilUsuario === 'aluno'
    document.getElementById('navFinanceiro').style.display = 'flex'
    document.getElementById('navConfig').style.display = isAdmin ? 'flex' : 'none'
    document.getElementById('navRelatorio').style.display = isProfessor ? 'flex' : 'none'
    document.getElementById('navTrabalhos').style.display = isProfessor ? 'flex' : 'none'
    document.getElementById('btnLancarNotas').style.display = isProfessor ? 'inline-block' : 'none'
    const btn = document.getElementById('btnPainelProfessor')
    if(btn) btn.style.display = isProfessor ? 'inline-block' : 'none'
    const alunoItem = document.getElementById('navAreaAluno')
    if(alunoItem) alunoItem.style.display = isAluno ? 'flex' : 'none'
    const adminPagamentoCard = document.getElementById('adminPagamentoCard')
    if(adminPagamentoCard) adminPagamentoCard.style.display = isAdmin ? 'block' : 'none'
    const adminTransacoesCard = document.getElementById('adminTransacoesCard')
    if(adminTransacoesCard) adminTransacoesCard.style.display = isAdmin ? 'block' : 'none'
    const assinaturaCard = document.getElementById('assinaturaStripeCard')
    if(assinaturaCard) assinaturaCard.style.display = !isAdmin ? 'block' : 'none'
            
    // Ocultar botão criar sala para alunos
    const btnCriarSala = document.getElementById('btnCriarSala');
    if(btnCriarSala) {
        btnCriarSala.style.display = isProfessor ? 'inline-flex' : 'none';
    }
}
        
window.fazerCadastro=async()=>{
    const nome=document.getElementById('cadNome').value,email=document.getElementById('cadEmail').value,senha=document.getElementById('cadSenha').value,senha2=document.getElementById('cadSenha2').value
    if(senha!==senha2){alert('Senhas não coincidem');return}
    if(senha.length<6){alert('Senha mínimo 6 caracteres');return}
    const {error}=await supabase.auth.signUp({email:email.trim(),password:senha,options:{data:{nome_completo:nome,role:'aluno'},emailRedirectTo:CONFIG.authRedirectUrl}})
    if(error){alert(traduzirErroAuth(error.message));return}
    alert('Conta criada! Confirme seu e-mail.');mostrarTela('login')
}
        
window.recuperarSenha=async()=>{
    const email=document.getElementById('recEmail').value
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:CONFIG.authRedirectUrl})
    if(error){alert(traduzirErroAuth(error.message));return}
    document.getElementById('msgSucessoRec').style.display='block'
    setTimeout(()=>{document.getElementById('msgSucessoRec').style.display='none';mostrarTela('login')},3000)
}
        
window.fazerLogout=async()=>{await supabase.auth.signOut();if(jitsiApi)jitsiApi.dispose();if(salaRealtimeChannel)await supabase.removeChannel(salaRealtimeChannel);window.location.href='index.html'}
        
function entrarDashboard(){
    document.getElementById('authContainer').classList.add('hidden')
    document.getElementById('heroContainer').classList.add('hidden')
    document.getElementById('heroTexto').classList.add('hidden')
    document.getElementById('overlay').classList.add('hidden')
    document.getElementById('dashboard').classList.add('active')
    atualizarListaSalas()
    carregarEquipe()
    renderizarProgressoHome()
    const urlParams = new URLSearchParams(window.location.search)
    if(urlParams.get('payment') === 'success') { mostrarErro('✅ Pagamento realizado!'); window.history.replaceState({}, document.title, window.location.pathname) }
    else if(urlParams.get('payment') === 'cancel') { mostrarErro('❌ Pagamento cancelado.'); window.history.replaceState({}, document.title, window.location.pathname) }
}
        
window.abrirModalAdmin=()=>document.getElementById('modalAdmin').classList.add('active')
window.fecharModalAdmin=()=>document.getElementById('modalAdmin').classList.remove('active')
window.trocarAbaAdmin=(aba)=>{document.getElementById('abaAdminMaterial').style.display=aba==='material'?'block':'none';document.getElementById('abaAdminAula').style.display=aba==='aula'?'block':'none'}
        
function extrairYoutubeId(url){if(!url)return null;const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);return m?m[1]:null}
function getAulasLocal(){return JSON.parse(localStorage.getItem('sulsafe_videoaulas')||'[]')}
function getProgressoLocal(){return JSON.parse(localStorage.getItem(`sulsafe_progresso_${usuarioId||'anon'}`)||'{}')}
function salvarProgressoLocal(obj){localStorage.setItem(`sulsafe_progresso_${usuarioId||'anon'}`,JSON.stringify(obj))}
        
window.carregarVideoaulas=async(filtroNR='todos')=>{
    const container=document.getElementById('listaVideoaulas');if(!container)return
    container.innerHTML='<p style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></p>'
    let aulas=[]
    try{const{data}=await supabase.from('videoaulas').select('*').order('criado_em',{ascending:true});if(data?.length)aulas=data;else aulas=getAulasLocal()}catch{aulas=getAulasLocal()}
    todasAulas=aulas
    const aulasFiltradas=filtroNR==='todos'?aulas:aulas.filter(a=>a.nr===filtroNR)
    if(!aulasFiltradas.length){container.innerHTML='<p>Nenhuma videoaula.</p>';renderizarProgressoAulas(aulas);return}
    const progresso=getProgressoLocal()
    container.innerHTML=aulasFiltradas.map(aula=>{const ytId=extrairYoutubeId(aula.youtube_url);const concluida=!!progresso[aula.id];return`
        <div class="aula-card"><div class="aula-thumb" onclick="abrirVideo('${escapeHtml(aula.youtube_url||'')}')">
        ${ytId?`<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${escapeHtml(aula.titulo)}">`:'<div class="aula-thumb-placeholder"><i class="fas fa-play-circle"></i></div>'}
        <div class="aula-play-btn"><i class="fas fa-play-circle"></i></div>
        ${concluida?'<div class="aula-concluida-badge"><i class="fas fa-check"></i> Concluída</div>':''}</div>
        <div class="aula-info"><div class="aula-nr">${escapeHtml(aula.nr||'')}</div>
        <div class="aula-titulo">${escapeHtml(aula.titulo)}</div>
        <div class="aula-desc">${escapeHtml(aula.descricao||'')}</div></div>
        <div class="aula-footer"><button class="btn-concluir ${concluida?'concluida':''}" onclick="toggleConcluida('${aula.id}',event)">${concluida?'Concluída':'Marcar concluída'}</button>
        ${ehProfessor?`<button class="btn-entrar" style="background:var(--erro)" onclick="deletarVideoaula('${aula.id}')"><i class="fas fa-trash"></i></button>`:''}</div></div>`}).join('')
    renderizarProgressoAulas(aulas)
}
        
window.filtrarAulas=(nr)=>carregarVideoaulas(nr)
window.abrirVideo=(url)=>{const ytId=extrairYoutubeId(url);if(!ytId){mostrarErro('Link inválido');return};document.getElementById('videoIframe').src=`https://www.youtube.com/embed/${ytId}?autoplay=1`;document.getElementById('videoModal').classList.add('active')}
window.fecharVideo=()=>{document.getElementById('videoModal').classList.remove('active');document.getElementById('videoIframe').src=''}
        
window.toggleConcluida=async(aulaId,e)=>{if(e)e.stopPropagation();const progresso=getProgressoLocal();if(progresso[aulaId])delete progresso[aulaId];else progresso[aulaId]=Date.now();salvarProgressoLocal(progresso);if(usuarioId){if(!progresso[aulaId])await supabase.from('progresso_aulas').upsert({user_id:usuarioId,aula_id:aulaId,concluído:true,ultima_atualizacao:new Date().toISOString()});else await supabase.from('progresso_aulas').delete().match({user_id:usuarioId,aula_id:aulaId})}carregarVideoaulas()}
        
function renderizarProgressoAulas(aulas){if(!aulas.length)return;const progresso=getProgressoLocal();const concluidas=aulas.filter(a=>progresso[a.id]).length;const pct=aulas.length>0?Math.round((concluidas/aulas.length)*100):0;const progressoEl=document.getElementById('progressoVideoaulas');if(progressoEl)progressoEl.innerHTML=`<div class="progresso-container"><div class="progresso-header"><span>Seu progresso</span><span class="progresso-pct">${pct}%</span></div><div class="progresso-bar-wrap"><div class="progresso-bar" style="width:${pct}%"></div></div><div>${concluidas} de ${aulas.length} aulas</div></div>`}
function renderizarProgressoHome(){const aulas=getAulasLocal();if(!aulas.length)return;const progresso=getProgressoLocal();const concluidas=aulas.filter(a=>progresso[a.id]).length;const pct=Math.round((concluidas/aulas.length)*100);document.getElementById('progressoResumoHome').innerHTML=`<div class="progresso-container" onclick="alternarView('videoaulas')" style="cursor:pointer"><div class="progresso-header"><span>Progresso</span><span class="progresso-pct">${pct}%</span></div><div class="progresso-bar-wrap"><div class="progresso-bar" style="width:${pct}%"></div></div><div>${concluidas} de ${aulas.length} aulas</div></div>`}
        
window.gerarCertificado=()=>{const aulas=getAulasLocal();const progresso=getProgressoLocal();const nrsConcluidas=[...new Set(aulas.filter(a=>progresso[a.id]).map(a=>a.nr).filter(Boolean))];const nome=usuarioAtual||'Aluno';const{jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});doc.setFillColor(27,94,32);doc.rect(0,0,297,210,'F');doc.setFillColor(255,255,255);doc.roundedRect(15,15,267,180,8,8,'F');doc.setTextColor(46,125,50);doc.setFontSize(32);doc.text('SULSAFE',148.5,50,{align:'center'});doc.setFontSize(15);doc.text('CERTIFICADO DE CONCLUSÃO',148.5,61,{align:'center'});doc.setFontSize(13);doc.text('Certificamos que',148.5,80,{align:'center'});doc.setFontSize(22);doc.setTextColor(27,94,32);doc.text(nome.toUpperCase(),148.5,94,{align:'center'});doc.setFontSize(13);doc.setTextColor(30,30,30);doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.',148.5,108,{align:'center'});if(nrsConcluidas.length)doc.text(`Normas: ${nrsConcluidas.join(', ')}`,148.5,120,{align:'center'});doc.text(`Emitido em ${new Date().toLocaleDateString()}`,148.5,146,{align:'center'});doc.save(`Certificado_${nome.replace(/\s+/g,'_')}.pdf`)}
        
window.salvarVideoaula=async()=>{const titulo=document.getElementById('aulaTitulo').value.trim();const nr=document.getElementById('aulaNR').value;const youtube_url=document.getElementById('aulaYoutube').value.trim();const descricao=document.getElementById('aulaDescricao').value.trim();if(!titulo||!youtube_url){mostrarErro('Preencha título e link');return}if(!extrairYoutubeId(youtube_url)){mostrarErro('Link inválido');return}await supabase.from('videoaulas').insert({titulo,nr,descricao,youtube_url,criado_por:usuarioId,criado_em:new Date().toISOString()});fecharModalAdmin();carregarVideoaulas()}
window.deletarVideoaula=async(id)=>{if(!confirm('Remover?'))return;await supabase.from('videoaulas').delete().eq('id',id);carregarVideoaulas()}
window.carregarMateriais=async()=>{const lista=document.getElementById('listaMateriais');const{data}=await supabase.from('materiais').select('*').order('criado_em',{ascending:false});if(!data?.length){lista.innerHTML='<p>Nenhum material.</p>';return}lista.innerHTML=data.map(m=>`<div class="material-item"><div><h4>${escapeHtml(m.titulo)}</h4><p>${escapeHtml(m.descricao||'')}</p><span class="badge-nr">${escapeHtml(m.nr||'')}</span></div><button class="btn-entrar" onclick="baixarArquivo('${m.url}')">Baixar</button></div>`).join('')}
window.salvarMaterial=async()=>{const titulo=document.getElementById('matTitulo').value;const nr=document.getElementById('matNR').value;const descricao=document.getElementById('matDescricao').value;const arquivo=document.getElementById('matArquivo').files[0];if(!titulo||!arquivo){mostrarErro('Preencha título e arquivo');return}const path=`materiais/${Date.now()}_${arquivo.name}`;await supabase.storage.from('sulsafe-assets').upload(path,arquivo);const{data:{publicUrl}}=supabase.storage.from('sulsafe-assets').getPublicUrl(path);await supabase.from('materiais').insert({titulo,nr,descricao,url:publicUrl,path,criado_por:usuarioId});fecharModalAdmin();carregarMateriais()}
window.baixarArquivo=async(url)=>{window.open(url,'_blank')}
async function carregarMeusTrabalhos(){if(!usuarioId)return;const container=document.getElementById('meusTrabalhosList');const{data}=await supabase.from('trabalhos').select('*').eq('aluno_id',usuarioId).order('data_envio',{ascending:false});if(!data?.length){container.innerHTML='<p>Nenhum trabalho enviado.</p>';return}container.innerHTML=data.map(t=>`<div class="meeting-card"><div><strong>${escapeHtml(t.disciplina)}</strong><br>Status: ${t.status==='pendente'?'📤 Pendente':'✅ Corrigido - Nota: '+t.nota}<br>${t.comentario?`Comentário: ${escapeHtml(t.comentario)}`:''}</div><button class="btn-entrar" onclick="baixarArquivo('${t.arquivo_url}')">Baixar PDF</button></div>`).join('')}
window.enviarTrabalho=async(input)=>{const file=input.files[0];if(!file||file.type!=='application/pdf'){mostrarErro('Envie um PDF');return}const filePath=`${usuarioId}/${Date.now()}_${file.name}`;await supabase.storage.from('trabalhos-sulsafe').upload(filePath,file);const{data:{publicUrl}}=supabase.storage.from('trabalhos-sulsafe').getPublicUrl(filePath);await supabase.from('trabalhos').insert({aluno_id:usuarioId,aluno_email:usuarioAtual,arquivo_url:publicUrl,disciplina:'Segurança do Trabalho',status:'pendente'});mostrarErro('Trabalho enviado!');carregarMeusTrabalhos()}
async function carregarTrabalhos(){if(!ehProfessor)return;const{data}=await supabase.from('trabalhos').select('*').order('data_envio',{ascending:false});todosTrabalhos=data||[];renderizarListaTrabalhos(todosTrabalhos)}
function renderizarListaTrabalhos(trabalhos){const container=document.getElementById('listaTrabalhos');if(!trabalhos.length){container.innerHTML='<p>Nenhum trabalho.</p>';return}container.innerHTML=trabalhos.map(t=>`<div class="meeting-card"><div><strong>${escapeHtml(t.aluno_email)}</strong><br>Status: ${t.status}<br>${t.nota?`Nota: ${t.nota}`:''}</div><button class="btn-entrar" onclick="baixarArquivo('${t.arquivo_url}')">PDF</button><button class="btn-criar-sala" onclick="abrirModalCorrecao('${t.id}')">Corrigir</button></div>`).join('')}
window.abrirModalCorrecao=async(id)=>{const nota=prompt('Nota (0-10):');if(nota===null)return;await supabase.from('trabalhos').update({nota:parseFloat(nota),status:'corrigido'}).eq('id',id);carregarTrabalhos();carregarMeusTrabalhos()}
window.filtrarTrabalhos=(filtro)=>{const filtrados=filtro==='todos'?todosTrabalhos:todosTrabalhos.filter(t=>t.status===filtro);renderizarListaTrabalhos(filtrados)}
window.enviarPerguntaIA = async () => {
    const input = document.getElementById('iaChatInput');
    const pergunta = input.value.trim();
    if (!pergunta) return;
    
    const box = document.getElementById('iaChatMessages');
    box.innerHTML += `<div class="ia-msg user">${escapeHtml(pergunta)}</div>`;
    input.value = '';
    
    const loading = document.createElement('div');
    loading.className = 'ia-msg bot';
    loading.textContent = '⏳ Buscando resposta...';
    box.appendChild(loading);
    box.scrollTop = box.scrollHeight;
    
    try {
        // Tenta usar a Edge Function do Supabase
        const { data, error } = await supabase.functions.invoke('gemini-chat-import', {
            body: { prompt: `Você é especialista em Segurança do Trabalho. Pergunta: ${pergunta}` }
        });
        
        loading.remove();
        
        if (data?.response) {
            box.innerHTML += `<div class="ia-msg bot">${escapeHtml(data.response)}</div>`;
        } else if (data?.text) {
            box.innerHTML += `<div class="ia-msg bot">${escapeHtml(data.text)}</div>`;
        } else {
            // Fallback com informações úteis
            box.innerHTML += `
                <div class="ia-msg bot">
                    <strong>📚 Assistente SulSafe</strong><br><br>
                    <em>"${escapeHtml(pergunta)}"</em><br><br>
                    <strong>📖 Recursos para encontrar sua resposta:</strong><br><br>
                    🔗 <strong>Texto oficial das NRs:</strong><br>
                    <a href="https://www.gov.br/trabalho-e-previdencia/pt-br/assuntos/seguranca-e-saude-no-trabalho/normas-regulamentadoras" target="_blank">Ministério do Trabalho - NRs</a><br><br>
                    📚 <strong>Materiais da plataforma:</strong><br>
                    👉 Clique em <strong>"Materiais"</strong> no menu lateral<br><br>
                    🎬 <strong>Videoaulas:</strong><br>
                    👉 Clique em <strong>"Videoaulas"</strong> no menu lateral<br><br>
                    💬 <strong>Pergunte ao professor:</strong><br>
                    👉 Utilize o chat durante as <strong>aulas ao vivo</strong><br><br>
                    <hr>
                    <small>🔧 Dica: Configure a chave da API Gemini no Supabase para respostas automáticas!</small>
                </div>
            `;
        }
        box.scrollTop = box.scrollHeight;
        
    } catch (err) {
        loading.remove();
        box.innerHTML += `
            <div class="ia-msg bot">
                <strong>❌ Erro ao conectar com a IA</strong><br><br>
                <em>"${escapeHtml(pergunta)}"</em><br><br>
                <strong>📖 Recursos para encontrar sua resposta:</strong><br><br>
                🔗 <strong>Texto oficial das NRs:</strong><br>
                <a href="https://www.gov.br/trabalho-e-previdencia/pt-br/assuntos/seguranca-e-saude-no-trabalho/normas-regulamentadoras" target="_blank">Ministério do Trabalho - NRs</a><br><br>
                📚 <strong>Materiais da plataforma:</strong><br>
                👉 Clique em <strong>"Materiais"</strong> no menu lateral<br><br>
                🎬 <strong>Videoaulas:</strong><br>
                👉 Clique em <strong>"Videoaulas"</strong> no menu lateral<br><br>
                <hr>
                <small>🔧 Dica: Configure a chave da API Gemini no Supabase para respostas automáticas!</small>
            </div>
        `;
        box.scrollTop = box.scrollHeight;
    }
};

window.atualizarListaSalas = () => {
    const container = document.getElementById('meetingList');
    if(!container) return;
    
    const salas = getSalas();
    
    if(!salas.length) {
        container.innerHTML = '<li style="color:var(--texto-sec); text-align:center; padding:28px; list-style:none;">📭 Nenhuma sala ativa no momento. Aguarde o professor criar uma sala!</li>';
        return;
    }
    
    container.innerHTML = '';
    salas.forEach(sala => {
        const li = document.createElement('li');
        li.className = 'meeting-card';
        li.innerHTML = `
            <div>
                <div class="meeting-topic">${escapeHtml(sala.topic)}</div>
                <div class="meeting-id">ID: ${escapeHtml(sala.id)}</div>
                <div><small>Criada por: ${escapeHtml(sala.leader || 'Professor')}</small></div>
            </div>
            <button class="btn-entrar" onclick="entrarSala('${sala.id}','${escapeHtml(sala.topic)}','${escapeHtml(sala.leader)}')">
                <i class="fas fa-sign-in-alt"></i> ENTRAR
            </button>
        `;
        container.appendChild(li);
    });
};

window.criarReuniaoLocal = () => {
    if(!ehProfessor) {
        mostrarErro('Apenas professores e administradores podem criar salas.');
        return;
    }
    const nome = document.getElementById('meetingName').value.trim();
    if(!nome) {
        mostrarErro('Digite um nome para a sala');
        return;
    }
    if(!usuarioAtual) {
        mostrarErro('Usuário não logado');
        return;
    }
    const salas = getSalas();
    salas.push({ id: 'ss-' + Date.now(), topic: nome, leader: usuarioAtual });
    localStorage.setItem('sulsafe_salas', JSON.stringify(salas));
    document.getElementById('meetingName').value = '';
    atualizarListaSalas();
    mostrarErro('✅ Sala criada com sucesso!');
};
        
function carregarHistoricoLocal(id){const h=JSON.parse(localStorage.getItem(`sulsafe_chat_${id}`)||'[]');const div=document.getElementById('chatMessages');div.innerHTML='<div class="chat-message"><div class="sender">Sistema</div><div class="text">Bem-vindo!</div></div>';h.forEach(m=>adicionarMensagemChatDOM(m.sender,m.message,m.sender===usuarioAtual,m.timestamp))}
        
window.entrarSala=async(meetingId,topic,leader)=>{if(!usuarioAtual)return;salaAtual={id:meetingId,topic,leader};document.getElementById('roomTitle').innerText=topic;carregarHistoricoLocal(meetingId);await iniciarRealtimeChat(meetingId);document.getElementById('meetingModal').classList.add('active');setTimeout(()=>{try{document.getElementById('videoPlaceholder').style.display='none';jitsiApi=new JitsiMeetExternalAPI('meet.jit.si',{roomName:meetingId,width:'100%',height:'100%',parentNode:document.querySelector('#jitsiContainer'),userInfo:{displayName:usuarioAtual},configOverwrite:{startWithAudioMuted:false,startWithVideoMuted:false}})}catch(err){mostrarErro('Erro Jitsi')}},500)}
window.fecharSala=()=>{if(jitsiApi)jitsiApi.dispose();if(salaRealtimeChannel)supabase.removeChannel(salaRealtimeChannel);document.getElementById('meetingModal').classList.remove('active');document.getElementById('jitsiContainer').innerHTML='';salaAtual=null}
window.toggleRecording=()=>{if(!jitsiApi)return;if(isRecording)jitsiApi.executeCommand('stopRecording',{mode:'file'});else jitsiApi.executeCommand('startRecording',{mode:'file'});isRecording=!isRecording}
window.chamarGemini=async()=>{const q=prompt('Pergunta:');if(!q||!salaAtual)return;adicionarMensagemChatDOM('Você',q,true);const{data}=await supabase.functions.invoke('gemini-chat-import',{body:{prompt:q}});adicionarMensagemChatDOM('IA',data?.response||data?.text||'Sem resposta',false)}
window.gerarAtaReuniao=()=>{const hist=JSON.parse(localStorage.getItem(`sulsafe_chat_${salaAtual?.id}`)||'[]');let ata=`ATA ${new Date().toLocaleString()}\nSala: ${salaAtual?.topic}\n\n`;hist.slice(-20).forEach(m=>ata+=`${m.sender}: ${m.message}\n`);const{jsPDF}=window.jspdf;const doc=new jsPDF();doc.text(doc.splitTextToSize(ata,180),10,20);doc.save('ata.pdf')}
window.enviarWhatsApp=()=>{const msg=encodeURIComponent(`Convite SulSafe. Sala: ${salaAtual?.id}`);window.open(`https://wa.me/?text=${msg}`,'_blank')}
        
async function loadDevices(){try{await navigator.mediaDevices.getUserMedia({audio:true,video:true})}catch(e){}}
loadDevices()
document.getElementById('testMic')?.addEventListener('click',async()=>{await navigator.mediaDevices.getUserMedia({audio:true});alert('Microfone OK')})
document.getElementById('testSpeaker')?.addEventListener('click',()=>{const a=new AudioContext();const o=a.createOscillator();o.connect(a.destination);o.start();setTimeout(()=>o.stop(),400)})
document.getElementById('testCamera')?.addEventListener('click',async()=>{const s=await navigator.mediaDevices.getUserMedia({video:true});document.getElementById('cameraPreview').srcObject=s;document.getElementById('cameraPreview').style.display='block'})
        
const temaSelect=document.getElementById('temaSelect')
function applyTheme(t){if(t==='claro')document.body.classList.add('tema-claro');else document.body.classList.remove('tema-claro');localStorage.setItem('sulsafe_tema',t)}
temaSelect?.addEventListener('change',e=>applyTheme(e.target.value))
applyTheme(localStorage.getItem('sulsafe_tema')||'escuro')
if(temaSelect)temaSelect.value=localStorage.getItem('sulsafe_tema')||'escuro'
        
document.querySelectorAll('.color-option').forEach(opt=>opt.addEventListener('click',()=>{const c=opt.dataset.color;document.documentElement.style.setProperty('--primaria',c);localStorage.setItem('sulsafe_corDestaque',c)}))
const savedColor=localStorage.getItem('sulsafe_corDestaque');if(savedColor)document.documentElement.style.setProperty('--primaria',savedColor)
document.getElementById('limparDados')?.addEventListener('click',()=>{localStorage.clear();document.getElementById('clearMsg').style.display='inline';setTimeout(()=>document.getElementById('clearMsg').style.display='none',2000)})
        
document.querySelectorAll('.config-tab').forEach(tab=>tab.addEventListener('click',()=>{const t=tab.dataset.config;document.querySelectorAll('.config-tab').forEach(x=>x.classList.remove('active'));tab.classList.add('active');document.querySelectorAll('.config-section').forEach(x=>x.classList.remove('active-section'));document.getElementById(`config-${t}`)?.classList.add('active-section')}))
        
const mascoteDiv=document.getElementById('mascoteAssistente');const balao=document.getElementById('balaoAjuda')
window.fecharAssistente=()=>{balao.classList.remove('active')}
mascoteDiv.addEventListener('click',(e)=>{if(e.target.closest('.mascote-avatar')){balao.classList.toggle('active')}})
window.ajudaEnvioTrabalho=()=>{alert("📄 Acesse 'Área do aluno'");balao.classList.remove('active')}
window.ajudaVideoaula=()=>{alert("🎬 Acesse 'Videoaulas'");balao.classList.remove('active')}
window.ajudaSala=()=>{alert("🎥 Acesse 'Aulas ao vivo'");balao.classList.remove('active')}
window.ajudaMateriais=()=>{alert("📚 Acesse 'Materiais'");balao.classList.remove('active')}
window.abrirAssistenteNR=()=>{alternarView('ia');balao.classList.remove('active')}
        
document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>alternarView(el.getAttribute('data-view'))))
document.getElementById('chatInput')?.addEventListener('keypress',e=>{if(e.key==='Enter')enviarMensagemChat()})
        
// Botões da equipe (corrigidos)
document.getElementById('generateInviteBtn')?.addEventListener('click', gerarConvite)
document.getElementById('copyInviteBtn')?.addEventListener('click', window.copiarLinkConvite)
document.getElementById('joinTeamBtn')?.addEventListener('click', aceitarConvite)
        
const btnAssinar = document.getElementById('btnAssinarPlano');
if(btnAssinar) btnAssinar.addEventListener('click', iniciarAssinaturaStripe);
        
const canvas=document.getElementById('canvas-hero');const ctx=canvas.getContext('2d');let w,h,mx=0,my=0,tx=0,ty=0
function resizeCanvas(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight}
resizeCanvas();window.addEventListener('resize',resizeCanvas)
document.addEventListener('mousemove',e=>{mx=(e.clientX/w-0.5)*2;my=(e.clientY/h-0.5)*2})
const stars=Array.from({length:80},()=>({x:Math.random()*1920,y:Math.random()*1080,z:Math.random()*1000,size:Math.random()*1.2}))
function draw(){ctx.fillStyle='#F4F7F6';ctx.fillRect(0,0,w,h);tx+=(mx-tx)*0.05;ty+=(my-ty)*0.05;ctx.fillStyle='#2E7D32';stars.forEach(s=>{s.z-=1.2;if(s.z<=0){s.z=1000;s.x=Math.random()*w;s.y=Math.random()*h}let scale=1000/(1000-s.z);let x=(s.x-w/2)*scale+w/2+tx*30;let y=(s.y-h/2)*scale+h/2+ty*15;ctx.globalAlpha=scale*0.5;ctx.beginPath();ctx.arc(x,y,s.size*scale,0,Math.PI*2);ctx.fill()});requestAnimationFrame(draw)}
draw()
        
document.getElementById('nomeEmpresa').innerText=CONFIG.nomeEmpresa
document.getElementById('dashEmpresaNome').innerText=CONFIG.nomeEmpresa
document.getElementById('logoText').innerText=CONFIG.nomeEmpresa
if(CONFIG.logoUrl){['logoIcon','logoIconCad','logoIconRec','dashLogoIcon'].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('has-img');el.innerHTML=`<img src="${CONFIG.logoUrl}" alt="logo">`}})}
        
supabase.auth.getSession().then(({data:{session}})=>{if(session?.user){usuarioAtual=session.user.email;usuarioId=session.user.id;garantirPerfil(session.user).then(role=>{perfilUsuario=role;ehProfessor=(role==='admin'||role==='professor');document.getElementById('dashUserName').innerHTML=usuarioAtual;atualizarPainelProfessor();entrarDashboard()})}})
        
window.abrirModalLancarNotas=async()=>{
    const selectAluno=document.getElementById('notaAlunoId')
    const{data:perfis}=await supabase.from('profiles').select('id,email')
    selectAluno.innerHTML='<option value="">Selecione...</option>'
    perfis.forEach(p=>{selectAluno.innerHTML+=`<option value="${p.id}">${p.email}</option>`})
    const{data:disciplinas}=await supabase.from('disciplinas').select('id,nome').eq('ativa',true)
    const selectDisc=document.getElementById('notaDisciplinaId')
    selectDisc.innerHTML='<option value="">Selecione...</option>'
    disciplinas.forEach(d=>{selectDisc.innerHTML+=`<option value="${d.id}">${d.nome}</option>`})
    document.getElementById('modalLancarNotas').style.display='flex'
}
window.fecharModalLancarNotas=()=>{document.getElementById('modalLancarNotas').style.display='none'}

// ===== FUNÇÃO SALVAR NOTAS CORRIGIDA =====
// ===== FUNÇÃO SALVAR NOTAS CORRIGIDA =====
window.salvarNotas = async () => {
    try {
        const alunoId = document.getElementById('notaAlunoId').value;
        const disciplinaId = document.getElementById('notaDisciplinaId').value;
        const semestre = document.getElementById('notaSemestre').value;
        const nota1 = parseFloat(document.getElementById('nota1').value) || 0;
        const nota2 = parseFloat(document.getElementById('nota2').value) || 0;
        const nota3 = parseFloat(document.getElementById('nota3').value) || 0;
        const recuperacao = parseFloat(document.getElementById('notaRec').value) || 0;
        const faltas = parseInt(document.getElementById('notaFaltas').value) || 0;
        
        // Validar campos obrigatórios
        if (!alunoId || !disciplinaId) {
            mostrarErro('Selecione aluno e disciplina!');
            return;
        }
        
        // Calcular média
        let media = (nota1 + nota2 + nota3) / 3;
        if (recuperacao > media) {
            media = (media + recuperacao) / 2;
        }
        
        // Definir situação
        let situacao;
        if (media >= 6) {
            situacao = 'APROVADO';
        } else if (media >= 4) {
            situacao = 'RECUPERACAO';
        } else {
            situacao = 'REPROVADO';
        }
        
        // Buscar dados do aluno
        const { data: aluno, error: alunoError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', alunoId)
            .single();
        
        if (alunoError) {
            mostrarErro('Erro ao buscar aluno: ' + alunoError.message);
            return;
        }
        
        if (!aluno) {
            mostrarErro('Aluno não encontrado!');
            return;
        }
        
        // Salvar notas
        const { error } = await supabase
            .from('notas')
            .upsert({
                aluno_id: alunoId,
                aluno_email: aluno.email,
                disciplina_id: parseInt(disciplinaId),
                nota1: nota1,
                nota2: nota2,
                nota3: nota3,
                recuperacao: recuperacao,
                faltas: faltas,
                media_final: media,
                situacao: situacao,
                semestre: semestre
            }, {
                onConflict: 'aluno_id,disciplina_id,semestre'
            });
        
        if (error) {
            mostrarErro('Erro ao salvar notas: ' + error.message);
            return;
        }
        
        mostrarErro('✅ Notas salvas com sucesso!'); // <- CORRIGIDO: usar mostrarErro
        fecharModalLancarNotas();
        carregarBoletimAdmin();
        
    } catch (err) {
        console.error('Erro em salvarNotas:', err);
        mostrarErro('Erro: ' + err.message);
    }
};

// ============================================================
// ===== EXPORTA FUNÇÕES PARA O ESCOPO GLOBAL =====
// ============================================================
// ============================================================
// ===== EXPORTA FUNÇÕES PARA O ESCOPO GLOBAL =====
// ============================================================
window.setFiltroNr = setFiltroNr;
window.filtrarNrs = filtrarNrs;
window.abrirModalNr = abrirModalNr;
window.fecharModalNr = fecharModalNr;
window.perguntarSobreNR = perguntarSobreNR;
window.renderizarNrs = renderizarNrs;

console.log('✅ Funções das NRs exportadas globalmente!');
console.log('✅ setFiltroNr:', typeof setFiltroNr);
console.log('✅ abrirModalNr:', typeof abrirModalNr);
console.log('✅ filtrarNrs:', typeof filtrarNrs);
