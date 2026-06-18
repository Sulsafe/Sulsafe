    import { createClient } from '@supabase/supabase-js';

    // ================================================================
    //  SUPABASE CONFIG
    // ================================================================
    const supabase = createClient(
        'https://dhhvhiyoxadcwsfqlndw.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ'
    );

    const CONFIG = {
        nomeEmpresa: "SulSafe",
        logoUrl: "https://uwzbafqptjstqafsjhvp.supabase.co/storage/v1/object/public/sulsafe-assets/logo1.png",
        authRedirectUrl: window.location.origin + window.location.pathname
    };

    // ================================================================
    //  VARIÁVEIS GLOBAIS
    // ================================================================
    let usuarioAtual = null,
        usuarioId = null,
        perfilUsuario = null,
        ehProfessor = false,
        salaAtual = null,
        jitsiApi = null,
        isRecording = false,
        todasAulas = [],
        todosTrabalhos = [],
        currentChart = null,
        relatorioData = [];
    let salaRealtimeChannel = null;
    let equipeAtualId = null;
    let tipoPagamentoManualAtual = '';

    // ================================================================
    //  DADOS DAS NRS
    // ================================================================
    const NRS_DATA = [
        { nr: "NR-01", titulo: "Disposições Gerais", categoria: "geral", icone: "📋", descricao: "Estabelece as disposições gerais, diretrizes e conceitos fundamentais para a aplicação das Normas Regulamentadoras.", objetivos: ["Definir os objetivos e campo de aplicação das NRs", "Estabelecer a hierarquia das normas", "Dispor sobre a atualização e revisão das NRs", "Determinar as obrigações do empregador e dos trabalhadores"] },
        { nr: "NR-05", titulo: "Comissão Interna de Prevenção de Acidentes - CIPA", categoria: "geral", icone: "👥", descricao: "Dispõe sobre a constituição, organização e funcionamento da CIPA, com o objetivo de prevenir acidentes e doenças decorrentes do trabalho.", objetivos: ["Estabelecer a obrigatoriedade da CIPA em empresas com mais de 20 empregados", "Definir a composição e mandato dos membros", "Estabelecer as atribuições da CIPA", "Determinar a periodicidade das reuniões e treinamentos"] },
        { nr: "NR-06", titulo: "Equipamentos de Proteção Individual - EPI", categoria: "especifico", icone: "🛡️", descricao: "Regulamenta a seleção, fornecimento e uso de Equipamentos de Proteção Individual, definindo responsabilidades do empregador e do empregado.", objetivos: ["Definir o que são EPIs e suas finalidades", "Estabelecer critérios para seleção e aquisição", "Determinar a obrigatoriedade do fornecimento gratuito", "Dispor sobre a fiscalização e certificação dos EPIs"] },
        { nr: "NR-07", titulo: "Programa de Controle Médico de Saúde Ocupacional - PCMSO", categoria: "saude", icone: "🏥", descricao: "Estabelece a obrigatoriedade de elaboração e implementação do PCMSO, visando à promoção e preservação da saúde dos trabalhadores.", objetivos: ["Definir os exames médicos obrigatórios (admissional, periódico, retorno ao trabalho, etc.)", "Estabelecer a periodicidade dos exames", "Determinar a guarda e confidencialidade dos registros", "Dispor sobre a atuação do médico coordenador"] },
        { nr: "NR-09", titulo: "Programa de Prevenção de Riscos Ambientais - PPRA", categoria: "saude", icone: "🌿", descricao: "Estabelece a obrigatoriedade de elaboração e implementação do PPRA, visando à preservação da saúde e integridade dos trabalhadores.", objetivos: ["Definir a metodologia para identificação e avaliação dos riscos", "Estabelecer medidas de controle dos riscos", "Determinar a periodicidade de revisão do programa", "Dispor sobre a documentação e registro das ações"] },
        { nr: "NR-10", titulo: "Segurança em Instalações e Serviços em Eletricidade", categoria: "especifico", icone: "⚡", descricao: "Regulamenta as condições de segurança em instalações elétricas e serviços com eletricidade, visando à proteção dos trabalhadores.", objetivos: ["Estabelecer medidas de controle para riscos elétricos", "Definir requisitos para projeto e construção de instalações", "Determinar a qualificação e treinamento dos profissionais", "Dispor sobre procedimentos de emergência e primeiros socorros"] },
        { nr: "NR-12", titulo: "Segurança no Trabalho em Máquinas e Equipamentos", categoria: "especifico", icone: "⚙️", descricao: "Estabelece requisitos mínimos para prevenção de acidentes em máquinas e equipamentos, desde a fase de projeto até a operação.", objetivos: ["Definir requisitos de segurança para projeto e fabricação", "Estabelecer medidas de proteção (guardas, dispositivos)", "Determinar procedimentos de manutenção e operação", "Dispor sobre treinamento e sinalização"] },
        { nr: "NR-17", titulo: "Ergonomia", categoria: "saude", icone: "🧘", descricao: "Estabelece parâmetros para adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores.", objetivos: ["Definir critérios para mobiliário e postos de trabalho", "Estabelecer limites para levantamento e transporte de peso", "Determinar pausas e organização do trabalho", "Dispor sobre condições ambientais (ruído, iluminação, temperatura)"] },
        { nr: "NR-18", titulo: "Construção Civil", categoria: "especifico", icone: "🏗️", descricao: "Regulamenta as condições de segurança e saúde no trabalho na indústria da construção civil, desde o canteiro de obras até a entrega da obra.", objetivos: ["Estabelecer requisitos para canteiros de obras", "Definir medidas de proteção em escavações e demolições", "Determinar a obrigatoriedade de treinamento e capacitação", "Dispor sobre segurança em andaimes, escadas e plataformas"] },
        { nr: "NR-20", titulo: "Inflamáveis e Combustíveis", categoria: "especifico", icone: "🔥", descricao: "Regulamenta as condições de segurança no manuseio, armazenamento e transporte de líquidos inflamáveis e combustíveis.", objetivos: ["Definir requisitos para instalações e áreas de risco", "Estabelecer medidas de prevenção contra incêndios e explosões", "Determinar procedimentos de emergência", "Dispor sobre treinamento e uso de EPIs específicos"] },
        { nr: "NR-23", titulo: "Proteção Contra Incêndios", categoria: "geral", icone: "🚒", descricao: "Estabelece medidas de prevenção e combate a incêndios nos locais de trabalho, incluindo equipamentos, treinamento e procedimentos.", objetivos: ["Definir a obrigatoriedade de equipamentos de combate a incêndio", "Estabelecer requisitos para sinalização e rotas de fuga", "Determinar a realização de treinamentos e simulados", "Dispor sobre planos de emergência"] },
        { nr: "NR-31", titulo: "Trabalho Rural", categoria: "especifico", icone: "🌾", descricao: "Regulamenta as condições de segurança e saúde no trabalho na agricultura, pecuária, silvicultura, exploração florestal e aquicultura.", objetivos: ["Estabelecer requisitos para uso de agrotóxicos e defensivos", "Definir medidas de segurança em máquinas agrícolas", "Determinar proteção contra exposição solar e intempéries", "Dispor sobre alojamentos e condições sanitárias"] },
        { nr: "NR-33", titulo: "Espaços Confinados", categoria: "especifico", icone: "🚧", descricao: "Regulamenta a segurança no trabalho em espaços confinados, definindo critérios para entrada, monitoramento e resgate.", objetivos: ["Definir o que são espaços confinados", "Estabelecer procedimentos de permissão de entrada", "Determinar o monitoramento contínuo da atmosfera", "Dispor sobre treinamento e equipe de resgate"] },
        { nr: "NR-35", titulo: "Trabalho em Altura", categoria: "especifico", icone: "🧗", descricao: "Estabelece requisitos mínimos para trabalho em altura, incluindo planejamento, análise de riscos, EPIs e treinamento.", objetivos: ["Definir o que é trabalho em altura (acima de 2m)", "Estabelecer a obrigatoriedade de análise de risco", "Determinar o uso de sistemas de ancoragem e EPIs", "Dispor sobre treinamento obrigatório e capacitação"] },
        { nr: "NR-36", titulo: "Abate e Processamento de Carnes", categoria: "especifico", icone: "🥩", descricao: "Regulamenta as condições de segurança e saúde no trabalho em empresas de abate e processamento de carnes e derivados.", objetivos: ["Estabelecer requisitos para instalações e equipamentos", "Definir medidas de controle de riscos (físicos, químicos, biológicos)", "Determinar a obrigatoriedade de treinamento", "Dispor sobre ergonomia e saúde dos trabalhadores"] }
    ];

    // ================================================================
    //  FUNÇÕES AUXILIARES
    // ================================================================
    function escapeHtml(s) {
        return String(s || '').replace(/[&<>\"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } [m] || m));
    }

    function mostrarErro(msg) {
        const el = document.getElementById('errorTooltip');
        el.innerText = msg;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 4000);
    }

    function traduzirErroAuth(msg) {
        const m = (msg || '').toLowerCase();
        if (m.includes('invalid login')) return 'E-mail ou senha incorreto...';
        if (m.includes('not confirmed')) return 'Confirme seu e-mail antes de entrar.';
        if (m.includes('already registered')) return 'E-mail já cadastrado.';
        return msg;
    }

    function getSalas() {
        return JSON.parse(localStorage.getItem('sulsafe_salas') || '[]');
    }

    function getAulasLocal() {
        return JSON.parse(localStorage.getItem('sulsafe_videoaulas') || '[]');
    }

    function getProgressoLocal() {
        return JSON.parse(localStorage.getItem(`sulsafe_progresso_${usuarioId || 'anon'}`) || '{}');
    }

    function salvarProgressoLocal(obj) {
        localStorage.setItem(`sulsafe_progresso_${usuarioId || 'anon'}`, JSON.stringify(obj));
    }

    function extrairYoutubeId(url) {
        if (!url) return null;
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    // ================================================================
    //  NRS EXPANSÍVEIS
    // ================================================================
    let nrExpandidos = {};

    function renderizarNrs() {
        const container = document.getElementById('nrListContainer');
        if (!container) return;
        
        // Atualizar estatísticas
        const total = NRS_DATA.length;
        const especificas = NRS_DATA.filter(n => n.categoria === 'especifico').length;
        const gerais = NRS_DATA.filter(n => n.categoria === 'geral').length;
        
        document.getElementById('nrTotalCount').textContent = total;
        document.getElementById('nrEspecificasCount').textContent = especificas;
        document.getElementById('nrGeraisCount').textContent = gerais;
        
        // Renderizar lista expansível
        renderizarNrsLista(NRS_DATA);
    }

    function renderizarNrsLista(nrs) {
        const container = document.getElementById('nrListContainer');
        if (!container) return;
        
        if (nrs.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--texto-sec);">
                    <i class="fas fa-search" style="font-size:32px; display:block; margin-bottom:12px;"></i>
                    <p>Nenhuma NR encontrada com esse filtro.</p>
                </div>
            `;
            return;
        }
        
        // Inicializar estado de expansão para novas NRs
        nrs.forEach(nr => {
            if (!(nr.nr in nrExpandidos)) {
                nrExpandidos[nr.nr] = false;
            }
        });
        
        container.innerHTML = nrs.map(nr => {
            const isOpen = nrExpandidos[nr.nr] || false;
            const categoriaLabel = nr.categoria === 'geral' ? 'Geral' : 
                                  nr.categoria === 'especifico' ? 'Específica' : 'Saúde';
            const categoriaClass = `nr-categoria-${nr.categoria}`;
            
            return `
                <div class="nr-expand-item" id="nr-item-${nr.nr}">
                    <div class="nr-expand-header" onclick="toggleNrExpand('${nr.nr}')">
                        <div class="left">
                            <span class="nr-icon">${nr.icone}</span>
                            <div class="nr-info">
                                <span class="nr-num">${nr.nr}</span>
                                <span class="nr-titulo">${escapeHtml(nr.titulo)}</span>
                            </div>
                            <span class="nr-categoria ${categoriaClass}">${categoriaLabel}</span>
                        </div>
                        <span class="arrow ${isOpen ? 'open' : ''}">
                            <i class="fas fa-chevron-down"></i>
                        </span>
                    </div>
                    <div class="nr-expand-content ${isOpen ? 'open' : ''}">
                        <div class="desc">
                            <strong>📋 Descrição:</strong> ${escapeHtml(nr.descricao)}
                        </div>
                        <div class="objetivos-title">
                            <i class="fas fa-bullseye"></i> Objetivos principais
                        </div>
                        <ul class="objetivos-list">
                            ${nr.objetivos.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
                        </ul>
                        <div class="actions">
                            <button class="btn-ver" onclick="abrirModalNr('${nr.nr}')">
                                <i class="fas fa-external-link-alt"></i> Ver detalhes
                            </button>
                            <button class="btn-perguntar" onclick="perguntarSobreNrEspecifica('${nr.nr}')">
                                <i class="fas fa-robot"></i> Perguntar sobre esta NR
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.toggleNrExpand = (nrNum) => {
        nrExpandidos[nrNum] = !nrExpandidos[nrNum];
        const item = document.getElementById(`nr-item-${nrNum}`);
        if (!item) return;
        const content = item.querySelector('.nr-expand-content');
        const arrow = item.querySelector('.arrow');
        if (nrExpandidos[nrNum]) {
            content.classList.add('open');
            arrow.classList.add('open');
        } else {
            content.classList.remove('open');
            arrow.classList.remove('open');
        }
    };

    window.filtrarNrs = (filtro = null) => {
        const searchInput = document.getElementById('nrSearchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (filtro) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filtro);
            });
        } else {
            const activeBtn = document.querySelector('.filter-btn.active');
            filtro = activeBtn ? activeBtn.dataset.filter : 'todos';
        }
        let nrsFiltradas = NRS_DATA.filter(nr => {
            if (filtro !== 'todos' && nr.categoria !== filtro) return false;
            if (searchTerm) {
                const nrMatch = nr.nr.toLowerCase().includes(searchTerm);
                const tituloMatch = nr.titulo.toLowerCase().includes(searchTerm);
                const descMatch = nr.descricao.toLowerCase().includes(searchTerm);
                if (!nrMatch && !tituloMatch && !descMatch) return false;
            }
            return true;
        });
        renderizarNrsLista(nrsFiltradas);
    };

    window.perguntarSobreNrEspecifica = (nrNum) => {
        const nr = NRS_DATA.find(n => n.nr === nrNum);
        if (!nr) return;
        window.alternarView('ia');
        const input = document.getElementById('iaChatInput');
        if (input) {
            input.value = `Explique a ${nr.nr} - ${nr.titulo} de forma detalhada e prática, com exemplos do dia a dia`;
            window.enviarPerguntaIA();
        }
    };

    // ================================================================
    //  NRS - FUNÇÕES DO MODAL
    // ================================================================

    window.abrirModalNr = (nrNum) => {
        console.log('📖 Abrindo modal para:', nrNum);
        const nr = NRS_DATA.find(n => n.nr === nrNum);
        if (!nr) {
            console.error('NR não encontrada:', nrNum);
            mostrarErro('NR não encontrada');
            return;
        }

        try {
            document.getElementById('modalNrIcon').textContent = nr.icone;
            document.getElementById('modalNrNum').textContent = nr.nr;
            document.getElementById('modalNrTitle').textContent = nr.titulo;
            document.getElementById('modalNrDesc').textContent = nr.descricao;

            const listContainer = document.getElementById('modalNrList');
            listContainer.innerHTML = nr.objetivos.map(obj => `<li>${escapeHtml(obj)}</li>`).join('');

            // Salvar a NR atual para uso no botão "Perguntar"
            document.getElementById('modalNrNum').dataset.nrAtual = nr.nr;

            // Abrir o modal
            const modal = document.getElementById('nrModal');
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevenir scroll
            console.log('✅ Modal aberto com sucesso');
        } catch (err) {
            console.error('Erro ao abrir modal:', err);
            mostrarErro('Erro ao abrir detalhes da NR');
        }
    };

    window.fecharModalNr = () => {
        const modal = document.getElementById('nrModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Fechar modal clicando fora
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('nrModal');
        if (modal && e.target === modal) {
            window.fecharModalNr();
        }
    });

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.fecharModalNr();
        }
    });

    window.perguntarSobreNr = () => {
        const nrNum = document.getElementById('modalNrNum').dataset.nrAtual || '';
        if (nrNum) {
            window.fecharModalNr();
            window.alternarView('ia');
            const input = document.getElementById('iaChatInput');
            if (input) {
                const nr = NRS_DATA.find(n => n.nr === nrNum);
                input.value = `Explique a ${nrNum} - ${nr?.titulo || ''} de forma detalhada e prática, com exemplos do dia a dia`;
                setTimeout(() => window.enviarPerguntaIA(), 300);
            }
        }
    };

    // ================================================================
    //  FUNÇÕES DE AUTENTICAÇÃO
    // ================================================================
    async function garantirPerfil(user) {
        try {
            const { data: existing } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
            if (existing) return existing.role;
            const ADMIN_EMAILS = ['sulsafetreinamentos@gmail.com'];
            const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'aluno';
            await supabase.from('profiles').insert({ id: user.id, email: user.email, role: role, nome_completo: user.user_metadata?.nome_completo || user.email });
            return role;
        } catch (err) {
            console.error('Erro ao garantir perfil:', err);
            return 'aluno';
        }
    }

    window.fazerLogin = async () => {
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
            if (error) { alert(traduzirErroAuth(error.message)); return; }
            usuarioAtual = data.user.email;
            usuarioId = data.user.id;
            const role = await garantirPerfil(data.user);
            perfilUsuario = role;
            ehProfessor = (role === 'admin' || role === 'professor');
            document.getElementById('dashUserName').innerHTML = usuarioAtual;
            atualizarPainelProfessor();
            entrarDashboard();
        } catch (err) {
            alert('Erro ao fazer login: ' + err.message);
        }
    };

    window.fazerCadastro = async () => {
        try {
            const nome = document.getElementById('cadNome').value;
            const email = document.getElementById('cadEmail').value;
            const senha = document.getElementById('cadSenha').value;
            const senha2 = document.getElementById('cadSenha2').value;
            if (senha !== senha2) { alert('Senhas não coincidem'); return; }
            if (senha.length < 6) { alert('Senha mínimo 6 caracteres'); return; }
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password: senha,
                options: {
                    data: { nome_completo: nome, role: 'aluno' },
                    emailRedirectTo: CONFIG.authRedirectUrl
                }
            });
            if (error) { alert(traduzirErroAuth(error.message)); return; }
            alert('✅ Conta criada! Confirme seu e-mail para ativar.');
            mostrarTela('login');
        } catch (err) {
            alert('Erro ao criar conta: ' + err.message);
        }
    };

    window.recuperarSenha = async () => {
        try {
            const email = document.getElementById('recEmail').value;
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: CONFIG.authRedirectUrl });
            if (error) { alert(traduzirErroAuth(error.message)); return; }
            document.getElementById('msgSucessoRec').style.display = 'block';
            setTimeout(() => {
                document.getElementById('msgSucessoRec').style.display = 'none';
                mostrarTela('login');
            }, 3000);
        } catch (err) {
            alert('Erro ao recuperar senha: ' + err.message);
        }
    };

    window.fazerLogout = async () => {
        try {
            await supabase.auth.signOut();
            if (jitsiApi) jitsiApi.dispose();
            if (salaRealtimeChannel) await supabase.removeChannel(salaRealtimeChannel);
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
    };

    // ================================================================
    //  FUNÇÕES DE TELA E NAVEGAÇÃO
    // ================================================================
    window.mostrarTela = (tela) => {
        document.querySelectorAll('.tela').forEach(t => t.classList.remove('active'));
        document.getElementById(`tela${tela.charAt(0).toUpperCase() + tela.slice(1)}`).classList.add('active');
    };

    window.alternarView = (viewId) => {
        const views = ['Home', 'Videoaulas', 'Salas', 'Materiais', 'Aluno', 'Ia', 'Equipe', 'Config', 'Trabalhos', 'Relatorio', 'Financeiro', 'Boletim', 'BoletimAluno', 'Nrs'];
        views.forEach(v => { const el = document.getElementById(`view${v}`); if (el) el.style.display = 'none'; });
        const target = document.getElementById(`view${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`);
        if (target) target.style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');
        
        if (viewId === 'salas') atualizarListaSalas();
        if (viewId === 'equipe') carregarEquipe();
        if (viewId === 'materiais') carregarMateriais();
        if (viewId === 'financeiro') { carregarMinhasTransacoes(); if (perfilUsuario === 'admin') carregarTodasTransacoes(); }
        if (viewId === 'videoaulas') carregarVideoaulas();
        if (viewId === 'trabalhos' && ehProfessor) carregarTrabalhos();
        if (viewId === 'aluno') carregarMeusTrabalhos();
        if (viewId === 'relatorio' && ehProfessor) carregarRelatorioAlunos();
        if (viewId === 'boletim') { if (ehProfessor) carregarBoletimAdmin(); else carregarBoletimAluno(); }
        if (viewId === 'nrs') { renderizarNrs(); }
    };

    // ================================================================
    //  DASHBOARD
    // ================================================================
    function entrarDashboard() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('heroContainer').classList.add('hidden');
        document.getElementById('heroTexto').classList.add('hidden');
        document.getElementById('overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.add('active');
        atualizarListaSalas();
        carregarEquipe();
        renderizarProgressoHome();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            mostrarErro('✅ Pagamento realizado!');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('payment') === 'cancel') {
            mostrarErro('❌ Pagamento cancelado.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    function atualizarPainelProfessor() {
        const isAdmin = perfilUsuario === 'admin';
        const isProfessor = perfilUsuario === 'professor' || perfilUsuario === 'admin';
        const isAluno = perfilUsuario === 'aluno';
        document.getElementById('navFinanceiro').style.display = 'flex';
        document.getElementById('navConfig').style.display = isAdmin ? 'flex' : 'none';
        document.getElementById('navRelatorio').style.display = isProfessor ? 'flex' : 'none';
        document.getElementById('navTrabalhos').style.display = isProfessor ? 'flex' : 'none';
        document.getElementById('btnLancarNotas').style.display = isProfessor ? 'inline-block' : 'none';
        const btn = document.getElementById('btnPainelProfessor');
        if (btn) btn.style.display = isProfessor ? 'inline-block' : 'none';
        const alunoItem = document.getElementById('navAreaAluno');
        if (alunoItem) alunoItem.style.display = isAluno ? 'flex' : 'none';
        const adminPagamentoCard = document.getElementById('adminPagamentoCard');
        if (adminPagamentoCard) adminPagamentoCard.style.display = isAdmin ? 'block' : 'none';
        const adminTransacoesCard = document.getElementById('adminTransacoesCard');
        if (adminTransacoesCard) adminTransacoesCard.style.display = isAdmin ? 'block' : 'none';
        const assinaturaCard = document.getElementById('assinaturaStripeCard');
        if (assinaturaCard) assinaturaCard.style.display = !isAdmin ? 'block' : 'none';
        const btnCriarSala = document.getElementById('btnCriarSala');
        if (btnCriarSala) {
            btnCriarSala.style.display = isProfessor ? 'inline-flex' : 'none';
        }
    }

    // ================================================================
    //  SALAS
    // ================================================================
    window.atualizarListaSalas = () => {
        const container = document.getElementById('meetingList');
        if (!container) return;
        const salas = getSalas();
        if (!salas.length) {
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
        if (!ehProfessor) {
            mostrarErro('Apenas professores e administradores podem criar salas.');
            return;
        }
        const nome = document.getElementById('meetingName').value.trim();
        if (!nome) {
            mostrarErro('Digite um nome para a sala');
            return;
        }
        if (!usuarioAtual) {
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

    window.entrarSala = async (meetingId, topic, leader) => {
        if (!usuarioAtual) { mostrarErro('Faça login primeiro'); return; }
        salaAtual = { id: meetingId, topic, leader };
        document.getElementById('roomTitle').innerText = topic;
        carregarHistoricoLocal(meetingId);
        await iniciarRealtimeChat(meetingId);
        document.getElementById('meetingModal').classList.add('active');
        setTimeout(() => {
            try {
                document.getElementById('videoPlaceholder').style.display = 'none';
                jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
                    roomName: meetingId,
                    width: '100%',
                    height: '100%',
                    parentNode: document.querySelector('#jitsiContainer'),
                    userInfo: { displayName: usuarioAtual },
                    configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false }
                });
            } catch (err) {
                console.error('Erro Jitsi:', err);
                mostrarErro('Erro ao carregar Jitsi. Verifique sua conexão.');
            }
        }, 500);
    };

    window.fecharSala = () => {
        if (jitsiApi) jitsiApi.dispose();
        if (salaRealtimeChannel) supabase.removeChannel(salaRealtimeChannel);
        document.getElementById('meetingModal').classList.remove('active');
        document.getElementById('jitsiContainer').innerHTML = '';
        salaAtual = null;
    };

    // ================================================================
    //  CHAT
    // ================================================================
    async function iniciarRealtimeChat(salaId) {
        if (salaRealtimeChannel) {
            await supabase.removeChannel(salaRealtimeChannel);
        }
        salaRealtimeChannel = supabase.channel(`chat:${salaId}`);
        salaRealtimeChannel
            .on('broadcast', { event: 'mensagem' }, (payload) => {
                const { sender, message, timestamp } = payload.payload;
                adicionarMensagemChatDOM(sender, message, sender === usuarioAtual, timestamp);
            })
            .subscribe();
    }

    function enviarMensagemRealtime(salaId, mensagem) {
        if (!salaRealtimeChannel) return;
        salaRealtimeChannel.send({
            type: 'broadcast',
            event: 'mensagem',
            payload: { sender: usuarioAtual, message: mensagem, timestamp: new Date().toISOString() }
        });
    }

    function adicionarMensagemChatDOM(sender, msg, own, timestamp = null) {
        const div = document.getElementById('chatMessages');
        const m = document.createElement('div');
        m.className = `chat-message ${own ? 'own' : ''}`;
        const hora = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        m.innerHTML = `<div class="sender">${escapeHtml(sender)} • ${hora}</div><div class="text">${escapeHtml(msg)}</div>`;
        div.appendChild(m);
        div.scrollTop = div.scrollHeight;
    }

    function carregarHistoricoLocal(id) {
        const h = JSON.parse(localStorage.getItem(`sulsafe_chat_${id}`) || '[]');
        const div = document.getElementById('chatMessages');
        div.innerHTML = '<div class="chat-message"><div class="sender">Sistema</div><div class="text">Bem-vindo!</div></div>';
        h.forEach(m => adicionarMensagemChatDOM(m.sender, m.message, m.sender === usuarioAtual, m.timestamp));
    }

    window.enviarMensagemChat = () => {
        const input = document.getElementById('chatInput');
        const txt = input.value.trim();
        if (!txt || !salaAtual) return;
        enviarMensagemRealtime(salaAtual.id, txt);
        input.value = '';
    };

    window.toggleRecording = () => {
        if (!jitsiApi) return;
        if (isRecording) jitsiApi.executeCommand('stopRecording', { mode: 'file' });
        else jitsiApi.executeCommand('startRecording', { mode: 'file' });
        isRecording = !isRecording;
    };

    window.chamarGemini = async () => {
        const q = prompt('Pergunta:');
        if (!q || !salaAtual) return;
        adicionarMensagemChatDOM('Você', q, true);
        try {
            const { data } = await supabase.functions.invoke('gemini-chat-import', { body: { prompt: q } });
            adicionarMensagemChatDOM('IA', data?.response || data?.text || 'Sem resposta', false);
        } catch (err) {
            adicionarMensagemChatDOM('IA', 'Erro ao chamar IA.', false);
        }
    };

    window.gerarAtaReuniao = () => {
        const hist = JSON.parse(localStorage.getItem(`sulsafe_chat_${salaAtual?.id}`) || '[]');
        let ata = `ATA ${new Date().toLocaleString()}\nSala: ${salaAtual?.topic}\n\n`;
        hist.slice(-20).forEach(m => ata += `${m.sender}: ${m.message}\n`);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(doc.splitTextToSize(ata, 180), 10, 20);
            doc.save('ata.pdf');
            mostrarErro('✅ Ata gerada com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao gerar ata: ' + err.message);
        }
    };

    window.enviarWhatsApp = () => {
        const msg = encodeURIComponent(`Convite SulSafe. Sala: ${salaAtual?.id}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    // ================================================================
    //  EQUIPE
    // ================================================================
    async function carregarEquipe() {
        if (!usuarioId) { console.log("Usuário não logado"); return; }
        const container = document.getElementById('memberList');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando equipe...</p>';
        try {
            const { data: membroAtual, error: membroError } = await supabase
                .from('membros_equipe')
                .select('equipe_id')
                .eq('usuario_id', usuarioId)
                .maybeSingle();
            if (membroError && membroError.code !== 'PGRST116') {
                console.error('Erro ao buscar membro:', membroError);
            }
            if (!membroAtual || !membroAtual.equipe_id) {
                await criarEquipeInicial();
                return;
            }
            equipeAtualId = membroAtual.equipe_id;
            const { data: todosMembros, error: membrosError } = await supabase
                .from('membros_equipe')
                .select('usuario_id, papel, convite_pendente')
                .eq('equipe_id', equipeAtualId);
            if (membrosError) throw membrosError;
            if (!todosMembros || todosMembros.length === 0) {
                container.innerHTML = '<p style="text-align:center; padding:20px">Nenhum membro na equipe.</p>';
                return;
            }
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
        } catch (err) {
            console.error('Erro ao carregar equipe:', err);
            container.innerHTML = '<p style="color:red">Erro ao carregar equipe: ' + err.message + '</p>';
        }
    }

    async function criarEquipeInicial() {
        try {
            const { data: existing } = await supabase
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
            if (eError) throw eError;
            equipeAtualId = equipe.id;
            await supabase
                .from('membros_equipe')
                .insert({ equipe_id: equipe.id, usuario_id: usuarioId, papel: 'admin' });
            mostrarErro('✅ Equipe criada com sucesso!');
            await carregarEquipe();
        } catch (err) {
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
        if (error) {
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
        if (!container) return;
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
        if (error) {
            console.error('Erro ao carregar convites:', error);
            container.innerHTML = '<p>Erro ao carregar convites</p>';
            return;
        }
        if (!data || data.length === 0) {
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
        if (!confirm('Cancelar este convite?')) return;
        await supabase
            .from('membros_equipe')
            .delete()
            .eq('codigo_convite', codigo)
            .eq('convite_pendente', true);
        mostrarErro('Convite cancelado!');
        await carregarEquipe();
    }

    async function removerMembro(usuarioIdRemover) {
        if (!confirm('Remover este membro da equipe?')) return;
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
        if (!codigo) {
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
        if (error) {
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
        if (!input || !input.value) {
            mostrarErro('Nenhum convite gerado ainda.');
            return;
        }
        navigator.clipboard.writeText(input.value);
        mostrarErro('✅ Link copiado!');
    };

    document.getElementById('generateInviteBtn')?.addEventListener('click', gerarConvite);
    document.getElementById('copyInviteBtn')?.addEventListener('click', window.copiarLinkConvite);
    document.getElementById('joinTeamBtn')?.addEventListener('click', aceitarConvite);

    window.removerMembro = removerMembro;
    window.cancelarConvite = cancelarConvite;

    // ================================================================
    //  VIDEOAULAS
    // ================================================================
    window.carregarVideoaulas = async (filtroNR = 'todos') => {
        const container = document.getElementById('listaVideoaulas');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></p>';
        let aulas = [];
        try {
            const { data } = await supabase.from('videoaulas').select('*').order('criado_em', { ascending: true });
            if (data?.length) aulas = data;
            else aulas = getAulasLocal();
        } catch { aulas = getAulasLocal(); }
        todasAulas = aulas;
        const aulasFiltradas = filtroNR === 'todos' ? aulas : aulas.filter(a => a.nr === filtroNR);
        if (!aulasFiltradas.length) {
            container.innerHTML = '<p>Nenhuma videoaula.</p>';
            renderizarProgressoAulas(aulas);
            return;
        }
        const progresso = getProgressoLocal();
        container.innerHTML = aulasFiltradas.map(aula => {
            const ytId = extrairYoutubeId(aula.youtube_url);
            const concluida = !!progresso[aula.id];
            return `
                <div class="aula-card">
                    <div class="aula-thumb" onclick="abrirVideo('${escapeHtml(aula.youtube_url || '')}')">
                        ${ytId ? `<img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${escapeHtml(aula.titulo)}">` : '<div class="aula-thumb-placeholder"><i class="fas fa-play-circle"></i></div>'}
                        <div class="aula-play-btn"><i class="fas fa-play-circle"></i></div>
                        ${concluida ? '<div class="aula-concluida-badge"><i class="fas fa-check"></i> Concluída</div>' : ''}
                    </div>
                    <div class="aula-info">
                        <div class="aula-nr">${escapeHtml(aula.nr || '')}</div>
                        <div class="aula-titulo">${escapeHtml(aula.titulo)}</div>
                        <div class="aula-desc">${escapeHtml(aula.descricao || '')}</div>
                    </div>
                    <div class="aula-footer">
                        <button class="btn-concluir ${concluida ? 'concluida' : ''}" onclick="toggleConcluida('${aula.id}',event)">${concluida ? 'Concluída' : 'Marcar concluída'}</button>
                        ${ehProfessor ? `<button class="btn-entrar" style="background:var(--erro)" onclick="deletarVideoaula('${aula.id}')"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        renderizarProgressoAulas(aulas);
    };

    window.filtrarAulas = (nr) => carregarVideoaulas(nr);
    window.abrirVideo = (url) => {
        const ytId = extrairYoutubeId(url);
        if (!ytId) { mostrarErro('Link inválido'); return; }
        document.getElementById('videoIframe').src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        document.getElementById('videoModal').classList.add('active');
    };

    window.fecharVideo = () => {
        document.getElementById('videoModal').classList.remove('active');
        document.getElementById('videoIframe').src = '';
    };

    window.toggleConcluida = async (aulaId, e) => {
        if (e) e.stopPropagation();
        const progresso = getProgressoLocal();
        if (progresso[aulaId]) delete progresso[aulaId];
        else progresso[aulaId] = Date.now();
        salvarProgressoLocal(progresso);
        if (usuarioId) {
            if (progresso[aulaId]) {
                await supabase.from('progresso_aulas').upsert({
                    user_id: usuarioId,
                    aula_id: aulaId,
                    concluído: true,
                    ultima_atualizacao: new Date().toISOString()
                });
            } else {
                await supabase.from('progresso_aulas').delete().match({ user_id: usuarioId, aula_id: aulaId });
            }
        }
        carregarVideoaulas();
    };

    window.deletarVideoaula = async (id) => {
        if (!confirm('Remover esta aula?')) return;
        await supabase.from('videoaulas').delete().eq('id', id);
        carregarVideoaulas();
    };

    function renderizarProgressoAulas(aulas) {
        if (!aulas.length) return;
        const progresso = getProgressoLocal();
        const concluidas = aulas.filter(a => progresso[a.id]).length;
        const pct = aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0;
        const progressoEl = document.getElementById('progressoVideoaulas');
        if (progressoEl) {
            progressoEl.innerHTML = `
                <div class="progresso-container">
                    <div class="progresso-header">
                        <span>Seu progresso</span>
                        <span class="progresso-pct">${pct}%</span>
                    </div>
                    <div class="progresso-bar-wrap">
                        <div class="progresso-bar" style="width:${pct}%"></div>
                    </div>
                    <div>${concluidas} de ${aulas.length} aulas</div>
                </div>
            `;
        }
    }

    function renderizarProgressoHome() {
        const aulas = getAulasLocal();
        if (!aulas.length) return;
        const progresso = getProgressoLocal();
        const concluidas = aulas.filter(a => progresso[a.id]).length;
        const pct = Math.round((concluidas / aulas.length) * 100);
        document.getElementById('progressoResumoHome').innerHTML = `
            <div class="progresso-container" onclick="alternarView('videoaulas')" style="cursor:pointer">
                <div class="progresso-header">
                    <span>Progresso</span>
                    <span class="progresso-pct">${pct}%</span>
                </div>
                <div class="progresso-bar-wrap">
                    <div class="progresso-bar" style="width:${pct}%"></div>
                </div>
                <div>${concluidas} de ${aulas.length} aulas</div>
            </div>
        `;
    }

    window.gerarCertificado = () => {
        const aulas = getAulasLocal();
        const progresso = getProgressoLocal();
        const nrsConcluidas = [...new Set(aulas.filter(a => progresso[a.id]).map(a => a.nr).filter(Boolean))];
        const nome = usuarioAtual || 'Aluno';
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            doc.setFillColor(27, 94, 32);
            doc.rect(0, 0, 297, 210, 'F');
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(15, 15, 267, 180, 8, 8, 'F');
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(32);
            doc.text('SULSAFE', 148.5, 50, { align: 'center' });
            doc.setFontSize(15);
            doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 61, { align: 'center' });
            doc.setFontSize(13);
            doc.text('Certificamos que', 148.5, 80, { align: 'center' });
            doc.setFontSize(22);
            doc.setTextColor(27, 94, 32);
            doc.text(nome.toUpperCase(), 148.5, 94, { align: 'center' });
            doc.setFontSize(13);
            doc.setTextColor(30, 30, 30);
            doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.', 148.5, 108, { align: 'center' });
            if (nrsConcluidas.length) doc.text(`Normas: ${nrsConcluidas.join(', ')}`, 148.5, 120, { align: 'center' });
            doc.text(`Emitido em ${new Date().toLocaleDateString()}`, 148.5, 146, { align: 'center' });
            doc.save(`Certificado_${nome.replace(/\s+/g, '_')}.pdf`);
            mostrarErro('✅ Certificado gerado com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao gerar certificado: ' + err.message);
        }
    };

    window.salvarVideoaula = async () => {
        try {
            const titulo = document.getElementById('aulaTitulo').value.trim();
            const nr = document.getElementById('aulaNR').value;
            const youtube_url = document.getElementById('aulaYoutube').value.trim();
            const descricao = document.getElementById('aulaDescricao').value.trim();
            if (!titulo || !youtube_url) { mostrarErro('Preencha título e link'); return; }
            if (!extrairYoutubeId(youtube_url)) { mostrarErro('Link do YouTube inválido'); return; }
            await supabase.from('videoaulas').insert({
                titulo,
                nr,
                descricao,
                youtube_url,
                criado_por: usuarioId,
                criado_em: new Date().toISOString()
            });
            fecharModalAdmin();
            carregarVideoaulas();
            mostrarErro('✅ Aula publicada com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao salvar aula: ' + err.message);
        }
    };

    // ================================================================
    //  MATERIAIS
    // ================================================================
    window.carregarMateriais = async () => {
        const lista = document.getElementById('listaMateriais');
        try {
            const { data } = await supabase.from('materiais').select('*').order('criado_em', { ascending: false });
            if (!data?.length) { lista.innerHTML = '<p>Nenhum material disponível.</p>'; return; }
            lista.innerHTML = data.map(m => `
                <div class="material-item">
                    <div>
                        <h4>${escapeHtml(m.titulo)}</h4>
                        <p>${escapeHtml(m.descricao || '')}</p>
                        <span class="badge-nr">${escapeHtml(m.nr || '')}</span>
                    </div>
                    <button class="btn-entrar" onclick="baixarArquivo('${m.url}')">Baixar</button>
                </div>
            `).join('');
        } catch (err) {
            lista.innerHTML = '<p>Erro ao carregar materiais.</p>';
        }
    };

    window.salvarMaterial = async () => {
        try {
            const titulo = document.getElementById('matTitulo').value;
            const nr = document.getElementById('matNR').value;
            const descricao = document.getElementById('matDescricao').value;
            const arquivo = document.getElementById('matArquivo').files[0];
            if (!titulo || !arquivo) { mostrarErro('Preencha título e selecione um arquivo'); return; }
            const path = `materiais/${Date.now()}_${arquivo.name}`;
            await supabase.storage.from('sulsafe-assets').upload(path, arquivo);
            const { data: { publicUrl } } = supabase.storage.from('sulsafe-assets').getPublicUrl(path);
            await supabase.from('materiais').insert({
                titulo,
                nr,
                descricao,
                url: publicUrl,
                path,
                criado_por: usuarioId
            });
            fecharModalAdmin();
            carregarMateriais();
            mostrarErro('✅ Material publicado com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao salvar material: ' + err.message);
        }
    };

    window.baixarArquivo = (url) => { window.open(url, '_blank'); };

    // ================================================================
    //  TRABALHOS
    // ================================================================
    async function carregarMeusTrabalhos() {
        if (!usuarioId) return;
        const container = document.getElementById('meusTrabalhosList');
        try {
            const { data } = await supabase.from('trabalhos').select('*').eq('aluno_id', usuarioId).order('data_envio', { ascending: false });
            if (!data?.length) { container.innerHTML = '<p>Nenhum trabalho enviado.</p>'; return; }
            container.innerHTML = data.map(t => `
                <div class="meeting-card">
                    <div>
                        <strong>${escapeHtml(t.disciplina)}</strong><br>
                        Status: ${t.status === 'pendente' ? '📤 Pendente' : '✅ Corrigido - Nota: ' + t.nota}<br>
                        ${t.comentario ? `Comentário: ${escapeHtml(t.comentario)}` : ''}
                    </div>
                    <button class="btn-entrar" onclick="baixarArquivo('${t.arquivo_url}')">Baixar PDF</button>
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = '<p>Erro ao carregar trabalhos.</p>';
        }
    }

    window.enviarTrabalho = async (input) => {
        const file = input.files[0];
        if (!file || file.type !== 'application/pdf') { mostrarErro('Envie um arquivo PDF'); return; }
        try {
            const filePath = `${usuarioId}/${Date.now()}_${file.name}`;
            await supabase.storage.from('trabalhos-sulsafe').upload(filePath, file);
            const { data: { publicUrl } } = supabase.storage.from('trabalhos-sulsafe').getPublicUrl(filePath);
            await supabase.from('trabalhos').insert({
                aluno_id: usuarioId,
                aluno_email: usuarioAtual,
                arquivo_url: publicUrl,
                disciplina: 'Segurança do Trabalho',
                status: 'pendente'
            });
            mostrarErro('✅ Trabalho enviado com sucesso!');
            carregarMeusTrabalhos();
        } catch (err) {
            mostrarErro('Erro ao enviar trabalho: ' + err.message);
        }
    };

    async function carregarTrabalhos() {
        if (!ehProfessor) return;
        const container = document.getElementById('listaTrabalhos');
        try {
            const { data } = await supabase.from('trabalhos').select('*').order('data_envio', { ascending: false });
            todosTrabalhos = data || [];
            renderizarListaTrabalhos(todosTrabalhos);
        } catch (err) {
            container.innerHTML = '<p>Erro ao carregar trabalhos.</p>';
        }
    }

    function renderizarListaTrabalhos(trabalhos) {
        const container = document.getElementById('listaTrabalhos');
        if (!trabalhos.length) { container.innerHTML = '<p>Nenhum trabalho.</p>'; return; }
        container.innerHTML = trabalhos.map(t => `
            <div class="meeting-card">
                <div>
                    <strong>${escapeHtml(t.aluno_email)}</strong><br>
                    Status: ${t.status}<br>
                    ${t.nota ? `Nota: ${t.nota}` : ''}
                </div>
                <button class="btn-entrar" onclick="baixarArquivo('${t.arquivo_url}')">PDF</button>
                <button class="btn-criar-sala" onclick="abrirModalCorrecao('${t.id}')">Corrigir</button>
            </div>
        `).join('');
    }

    window.abrirModalCorrecao = async (id) => {
        const nota = prompt('Nota (0-10):');
        if (nota === null) return;
        try {
            await supabase.from('trabalhos').update({ nota: parseFloat(nota), status: 'corrigido' }).eq('id', id);
            carregarTrabalhos();
            carregarMeusTrabalhos();
            mostrarErro('✅ Nota registrada!');
        } catch (err) {
            mostrarErro('Erro ao corrigir: ' + err.message);
        }
    };

    window.filtrarTrabalhos = (filtro) => {
        const filtrados = filtro === 'todos' ? todosTrabalhos : todosTrabalhos.filter(t => t.status === filtro);
        renderizarListaTrabalhos(filtrados);
    };

    // ================================================================
    //  IA - COM FALLBACK
    // ================================================================
    window.enviarPerguntaIA = async () => {
        const input = document.getElementById('iaChatInput');
        const pergunta = input.value.trim();
        if (!pergunta) {
            mostrarErro('Digite uma pergunta');
            return;
        }

        const box = document.getElementById('iaChatMessages');
        box.innerHTML += `<div class="ia-msg user">${escapeHtml(pergunta)}</div>`;
        input.value = '';

        const loading = document.createElement('div');
        loading.className = 'ia-msg bot';
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pensando...';
        box.appendChild(loading);
        box.scrollTop = box.scrollHeight;

        try {
            // Tentar chamar a IA do Supabase
            const { data, error } = await supabase.functions.invoke('gemini-chat-import', {
                body: { prompt: `Você é especialista em Segurança do Trabalho. Pergunta: ${pergunta}` }
            });

            loading.remove();

            if (error) {
                throw new Error(error.message);
            }

            const resposta = data?.response || data?.text || 'Sem resposta';
            box.innerHTML += `<div class="ia-msg bot">${escapeHtml(resposta)}</div>`;

        } catch (err) {
            loading.remove();
            console.error('Erro na IA:', err);

            // Fallback: respostas pré-definidas
            const respostaFallback = gerarRespostaFallback(pergunta);
            box.innerHTML += `<div class="ia-msg bot">${respostaFallback}</div>`;
        }

        box.scrollTop = box.scrollHeight;
    };

    // ================================================================
    //  FALLBACK PARA IA (caso a Edge Function não esteja disponível)
    // ================================================================
    function gerarRespostaFallback(pergunta) {
        const p = pergunta.toUpperCase();

        // Respostas pré-definidas
        const respostas = {
            'NR-18': '📋 A NR-18 estabelece diretrizes para garantir condições de segurança e saúde no trabalho na indústria da construção civil. Ela abrange desde canteiros de obras até atividades como demolição, escavações, estruturas, etc. Principais pontos: <br>• Canteiro de obras organizado <br>• Proteção contra quedas <br>• Escavações e fundações <br>• Andaimes e plataformas <br>• Equipamentos de proteção',

            'NR-31': '🌾 A NR-31 trata da segurança e saúde no trabalho na agricultura, pecuária, silvicultura, exploração florestal e aquicultura. Aborda: <br>• Uso seguro de agrotóxicos <br>• Máquinas agrícolas <br>• Exposição solar <br>• Alojamentos <br>• Transporte de trabalhadores',

            'NR-33': '🚧 A NR-33 regulamenta o trabalho em espaços confinados. Exige: <br>• Treinamento obrigatório <br>• Permissão de entrada <br>• Monitoramento contínuo <br>• Equipe de resgate <br>• Equipamentos de comunicação',

            'NR-35': '🧗 A NR-35 estabelece requisitos para trabalho em altura (acima de 2m). Inclui: <br>• Planejamento e análise de risco <br>• Uso de EPIs (cinto, trava-queda) <br>• Sistemas de ancoragem <br>• Treinamento obrigatório <br>• Procedimentos de emergência',

            'NR-10': '⚡ A NR-10 trata da segurança em instalações e serviços com eletricidade. Exige: <br>• Treinamento específico <br>• Medidas de controle <br>• Sistema de segurança <br>• Documentação <br>• Procedimentos de emergência',

            'EPI': '🛡️ Equipamentos de Proteção Individual (EPIs) são dispositivos de uso pessoal para proteção contra riscos. Exemplos: <br>• Capacete (proteção da cabeça) <br>• Óculos (proteção dos olhos) <br>• Protetor auricular (audição) <br>• Luvas (mãos) <br>• Botas (pés) <br>• Cinto de segurança (quedas)',

            'CIPA': '👥 A CIPA (Comissão Interna de Prevenção de Acidentes) é obrigatória em empresas com mais de 20 empregados. Funções: <br>• Identificar riscos <br>• Promover treinamentos <br>• Investigar acidentes <br>• Elaborar planos de prevenção'
        };

        // Buscar resposta específica
        for (const [key, value] of Object.entries(respostas)) {
            if (p.includes(key)) {
                return value;
            }
        }

        // Resposta genérica
        return `📋 <strong>Sobre sua pergunta sobre Segurança do Trabalho</strong><br><br>Ainda estou aprendendo sobre este assunto específico.<br><br><strong>NRs disponíveis para consulta:</strong><br>- NR-10: Segurança em eletricidade<br>- NR-18: Construção civil<br>- NR-31: Trabalho rural<br>- NR-33: Espaços confinados<br>- NR-35: Trabalho em altura<br><br>💡 <strong>Dica:</strong> Seja específico na pergunta para obter uma resposta mais precisa!<br><br>🔧 <strong>Para usar IA real</strong>, configure a chave Gemini no Supabase e faça o deploy da Edge Function.`;
    }

    // ================================================================
    //  RELATÓRIO
    // ================================================================
    function renderizarGraficoProgresso(alunos, progressos) {
        const ctx = document.getElementById('progressoChart')?.getContext('2d');
        if (!ctx) return;
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: alunos,
                datasets: [{ label: 'Progresso (%)', data: progressos, backgroundColor: '#2E7D32', borderRadius: 8 }]
            },
            options: { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }

    window.carregarRelatorioAlunos = async () => {
        const container = document.getElementById('relatorioContainer');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
        try {
            const { data: alunos } = await supabase.from('profiles').select('id,email,role');
            const alunosList = alunos?.filter(p => p.role === 'aluno') || [];
            const { data: aulas } = await supabase.from('videoaulas').select('id');
            const totalAulas = aulas?.length || 0;
            const { data: progresso } = await supabase.from('progresso_aulas').select('user_id,aula_id').eq("concluído", true);
            const progressoPorAluno = {};
            progresso?.forEach(p => {
                if (!progressoPorAluno[p.user_id]) progressoPorAluno[p.user_id] = [];
                progressoPorAluno[p.user_id].push(p.aula_id);
            });
            relatorioData = [];
            const alunosNomes = [],
                alunosProgressos = [];
            for (const aluno of alunosList) {
                const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0;
                const percentual = totalAulas > 0 ? Math.round((aulasAssistidas / totalAulas) * 100) : 0;
                alunosNomes.push(aluno.email.split('@')[0]);
                alunosProgressos.push(percentual);
                relatorioData.push({
                    aluno: aluno.email.split('@')[0],
                    aulasAssistidas,
                    totalAulas,
                    percentual,
                    status: percentual === 100 ? 'Concluído' : (percentual > 0 ? 'Em andamento' : 'Não iniciado')
                });
            }
            renderizarGraficoProgresso(alunosNomes, alunosProgressos);
            let html = '<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Aluno</th><th>Aulas</th><th>Progresso</th><th>Status</th><th>Certificado</th></tr></thead><tbody>';
            for (const aluno of alunosList) {
                const aulasAssistidas = progressoPorAluno[aluno.id]?.length || 0;
                const percentual = totalAulas > 0 ? Math.round((aulasAssistidas / totalAulas) * 100) : 0;
                const botaoCertificado = percentual === 100 ?
                    `<button class="btn-criar-sala" onclick="gerarCertificadoAluno('${aluno.id}','${aluno.email}')" style="padding:4px 8px">Certificado</button>` :
                    '<span style="color:gray">⏳ 100%</span>';
                html += `<tr><td>${aluno.email}</td><td style="text-align:center">${aulasAssistidas}/${totalAulas}</td><td><div style="background:#e0e0e0; border-radius:20px; height:8px"><div style="background:#2E7D32; border-radius:20px; height:8px; width:${percentual}%"></div></div>${percentual}%</td><td>${percentual===100?'✅ Concluído':(percentual>0?'🟡 Em andamento':'🔴 Não iniciado')}</td><td style="text-align:center">${botaoCertificado}</td></tr>`;
            }
            html += '</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarRelatorioAlunos()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>';
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>';
        }
    };

    window.gerarCertificadoAluno = async (alunoId, alunoEmail) => {
        try {
            const { data: progresso } = await supabase.from('progresso_aulas').select('aula_id').eq('user_id', alunoId).eq("concluído", true);
            if (!progresso?.length) { mostrarErro('Aluno não concluiu nenhuma aula.'); return; }
            const { data: aulas } = await supabase.from('videoaulas').select('nr').in('id', progresso.map(p => p.aula_id));
            const nrs = [...new Set(aulas.map(a => a.nr).filter(Boolean))];
            const nome = alunoEmail.split('@')[0];
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            doc.setFillColor(27, 94, 32);
            doc.rect(0, 0, 297, 210, 'F');
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(15, 15, 267, 180, 8, 8, 'F');
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(32);
            doc.text('SULSAFE', 148.5, 50, { align: 'center' });
            doc.setFontSize(15);
            doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 61, { align: 'center' });
            doc.setFontSize(13);
            doc.text('Certificamos que', 148.5, 80, { align: 'center' });
            doc.setFontSize(22);
            doc.setTextColor(27, 94, 32);
            doc.text(nome.toUpperCase(), 148.5, 94, { align: 'center' });
            doc.setFontSize(13);
            doc.setTextColor(30, 30, 30);
            doc.text('concluiu as videoaulas de Segurança do Trabalho da plataforma SulSafe.', 148.5, 108, { align: 'center' });
            if (nrs.length) doc.text(`Normas: ${nrs.join(', ')}`, 148.5, 120, { align: 'center' });
            doc.text(`Emitido em ${new Date().toLocaleDateString()}`, 148.5, 146, { align: 'center' });
            doc.save(`Certificado_${nome}.pdf`);
            mostrarErro(`✅ Certificado gerado!`);
        } catch (err) {
            mostrarErro('Erro ao gerar certificado: ' + err.message);
        }
    };

    // ================================================================
    //  EXPORTAÇÕES RELATÓRIO
    // ================================================================
    window.exportarRelatorioCSV = () => {
        if (!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return; }
        let csv = 'Aluno,Aulas Assistidas,Total Aulas,Progresso (%),Status\n';
        relatorioData.forEach(r => { csv += `"${r.aluno}",${r.aulasAssistidas},${r.totalAulas},${r.percentual},${r.status}\n`; });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        mostrarErro('✅ CSV exportado com sucesso!');
    };

    window.exportarRelatorioExcel = () => {
        if (!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return; }
        const wsData = [['Aluno', 'Aulas Assistidas', 'Total Aulas', 'Progresso (%)', 'Status']];
        relatorioData.forEach(r => { wsData.push([r.aluno, r.aulasAssistidas, r.totalAulas, r.percentual, r.status]); });
        try {
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Relatório SulSafe');
            XLSX.writeFile(wb, `relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.xlsx`);
            mostrarErro('✅ Excel exportado com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao exportar Excel: ' + err.message);
        }
    };

    window.exportarRelatorioPDF = async () => {
        if (!relatorioData.length) { mostrarErro('Nenhum dado para exportar'); return; }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            doc.setFillColor(46, 125, 50);
            doc.rect(0, 0, 297, 210, 'F');
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(10, 10, 277, 190, 5, 5, 'F');
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(22);
            doc.text('Relatório de Alunos - SulSafe', 148.5, 25, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            let y = 40;
            doc.text('Aluno', 20, y);
            doc.text('Aulas Assistidas', 100, y);
            doc.text('Total Aulas', 150, y);
            doc.text('Progresso', 190, y);
            doc.text('Status', 230, y);
            y += 8;
            relatorioData.forEach(r => {
                if (y > 180) { doc.addPage();
                    y = 20; }
                doc.text(r.aluno.substring(0, 30), 20, y);
                doc.text(r.aulasAssistidas.toString(), 110, y);
                doc.text(r.totalAulas.toString(), 160, y);
                doc.text(r.percentual + '%', 195, y);
                doc.text(r.status, 235, y);
                y += 7;
            });
            doc.save(`relatorio_sulsafe_${new Date().toISOString().split('T')[0]}.pdf`);
            mostrarErro('✅ PDF exportado com sucesso!');
        } catch (err) {
            mostrarErro('Erro ao exportar PDF: ' + err.message);
        }
    };

    // ================================================================
    //  FINANCEIRO
    // ================================================================
    window.iniciarAssinaturaStripe = async () => {
        const PRICE_ID = 'price_1TiQI7KY6XfInCdDFDG5XKKJ';
        const statusDiv = document.getElementById('stripeStatus');
        if (statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecionando...';
        try {
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    priceId: PRICE_ID,
                    userId: usuarioId,
                    userEmail: usuarioAtual,
                    successUrl: window.location.origin + window.location.pathname + '?payment=success',
                    cancelUrl: window.location.origin + window.location.pathname + '?payment=cancel'
                }
            });
            if (error) throw new Error(error.message);
            if (data?.url) window.location.href = data.url;
            else throw new Error('Resposta inválida');
        } catch (err) {
            if (statusDiv) statusDiv.innerHTML = `<span style="color:var(--erro)">❌ Erro: ${err.message}</span>`;
            mostrarErro('Erro: ' + err.message);
        }
    };

    async function carregarMinhasTransacoes() {
        const container = document.getElementById('minhasTransacoesContainer');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
        try {
            const { data, error } = await supabase.from('transacoes').select('*').eq('aluno_id', usuarioId).order('data_criacao', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                container.innerHTML = '<p style="text-align:center; padding:20px">Nenhuma transação encontrada.</p>';
                return;
            }
            let html = `<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead><tbody>`;
            for (const t of data) {
                let statusStyle = '',
                    statusText = '';
                if (t.status === 'PAGO') { statusStyle = 'background:#4CAF50; color:white';
                    statusText = '✅ PAGO'; } else if (t.status === 'PENDENTE') { statusStyle = 'background:#FF9800; color:white';
                    statusText = '⏳ PENDENTE'; } else { statusStyle = 'background:#F44336; color:white';
                    statusText = '❌ ' + t.status; }
                let acoes = '';
                if (t.status === 'PENDENTE') {
                    if (t.tipo === 'BOLETO' && t.boleto_linha_digitavel) {
                        acoes = `<button class="btn-entrar" onclick="copiarTexto('${t.boleto_linha_digitavel}')" style="background:#1565C0; padding:4px 12px"><i class="fas fa-barcode"></i> Copiar Boleto</button>`;
                    } else if (t.tipo === 'PIX' && t.qr_code) {
                        acoes = `<button class="btn-entrar" onclick="copiarTexto('${t.qr_code}')" style="background:#25D366; padding:4px 12px"><i class="fab fa-pix"></i> Copiar PIX</button>`;
                    } else {
                        acoes = `<button class="btn-entrar" onclick="simularPagamento('${t.id}')" style="background:#4CAF50; padding:4px 12px">Simular Pagamento</button>`;
                    }
                } else {
                    acoes = `<span style="color:green"><i class="fas fa-check-circle"></i> Pago</span>`;
                }
                html += `<tr><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}; padding:4px 12px; border-radius:20px">${statusText}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td><td>${acoes}</td></tr>`;
            }
            html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarMinhasTransacoes()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>';
        }
    }

    async function carregarTodasTransacoes() {
        if (perfilUsuario !== 'admin') return;
        const container = document.getElementById('todasTransacoesContainer');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:20px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
        try {
            const { data, error } = await supabase.from('transacoes').select('*').order('data_criacao', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                container.innerHTML = '<p style="text-align:center; padding:20px">Nenhuma transação.</p>';
                return;
            }
            let html = `<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;"><thead><tr style="background: #2E7D32; color: white;"><th>Aluno</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th><tr></thead><tbody>`;
            for (const t of data) {
                let statusStyle = '',
                    statusText = '';
                if (t.status === 'PAGO') { statusStyle = 'background:#4CAF50; color:white';
                    statusText = '✅ PAGO'; } else if (t.status === 'PENDENTE') { statusStyle = 'background:#FF9800; color:white';
                    statusText = '⏳ PENDENTE'; } else { statusStyle = 'background:#F44336; color:white';
                    statusText = '❌ ' + t.status; }
                let acoes = '';
                if (t.status === 'PENDENTE') {
                    acoes = `<button class="btn-entrar" onclick="confirmarPagamentoSimulado('${t.id}')" style="background:#4CAF50; padding:4px 12px">Confirmar</button>`;
                }
                html += `<tr><td>${escapeHtml(t.aluno_email)}</td><td>${t.tipo}</td><td>R$ ${t.valor.toFixed(2)}</td><td><span style="${statusStyle}; padding:4px 12px; border-radius:20px">${statusText}</span></td><td>${new Date(t.data_criacao).toLocaleString()}</td><td>${acoes}</td></tr>`;
            }
            html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarTodasTransacoes()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>';
        }
    }

    window.simularPagamento = async (transacaoId) => {
        if (!confirm('Simular pagamento?')) return;
        try {
            const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId);
            if (error) throw error;
            mostrarErro('✅ Pagamento simulado!');
            carregarMinhasTransacoes();
            if (perfilUsuario === 'admin') carregarTodasTransacoes();
        } catch (err) {
            mostrarErro('Erro: ' + err.message);
        }
    };

    window.confirmarPagamentoSimulado = async (transacaoId) => {
        if (perfilUsuario !== 'admin') { mostrarErro('Apenas admin'); return; }
        if (!confirm('Confirmar pagamento?')) return;
        try {
            const { error } = await supabase.from('transacoes').update({ status: 'PAGO', data_pagamento: new Date().toISOString() }).eq('id', transacaoId);
            if (error) throw error;
            mostrarErro('✅ Pagamento confirmado!');
            carregarMinhasTransacoes();
            carregarTodasTransacoes();
        } catch (err) {
            mostrarErro('Erro: ' + err.message);
        }
    };

    window.copiarTexto = (texto) => {
        navigator.clipboard.writeText(texto);
        mostrarErro('📋 Código copiado!');
    };

    window.abrirModalGerarPagamentoManual = async (tipo) => {
        if (perfilUsuario !== 'admin') { mostrarErro('Apenas admin'); return; }
        tipoPagamentoManualAtual = tipo;
        document.getElementById('modalPagamentoManualTitulo').innerHTML = tipo === 'PIX' ? '💰 Gerar PIX' : '📄 Gerar Boleto';
        const select = document.getElementById('pagamentoManualAlunoId');
        const { data: alunos } = await supabase.from('profiles').select('id,email').eq('role', 'aluno');
        select.innerHTML = '<option value="">Selecione...</option>';
        alunos.forEach(aluno => { select.innerHTML += `<option value="${aluno.id}">${escapeHtml(aluno.email)}</option>`; });
        document.getElementById('modalPagamentoManual').style.display = 'flex';
    };

    window.fecharModalPagamentoManual = () => {
        document.getElementById('modalPagamentoManual').style.display = 'none';
    };

    window.gerarPagamentoManual = async () => {
        const alunoId = document.getElementById('pagamentoManualAlunoId')?.value;
        const valor = parseFloat(document.getElementById('pagamentoManualValor')?.value || '0');
        const descricao = document.getElementById('pagamentoManualDescricao')?.value || `${tipoPagamentoManualAtual} - ${new Date().toLocaleString()}`;
        if (!alunoId || !valor) { mostrarErro('Preencha os campos'); return; }
        try {
            const { data: aluno } = await supabase.from('profiles').select('email').eq('id', alunoId).single();
            const codigoSimulado = `${tipoPagamentoManualAtual}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
            const dadosInserir = {
                aluno_id: alunoId,
                aluno_email: aluno.email,
                tipo: tipoPagamentoManualAtual,
                valor: valor,
                status: 'PENDENTE',
                descricao: descricao,
                data_criacao: new Date().toISOString()
            };
            if (tipoPagamentoManualAtual === 'PIX') dadosInserir.qr_code = codigoSimulado;
            else dadosInserir.boleto_linha_digitavel = codigoSimulado;
            const { error } = await supabase.from('transacoes').insert(dadosInserir);
            if (error) throw error;
            mostrarErro(`✅ ${tipoPagamentoManualAtual} gerado!`);
            window.fecharModalPagamentoManual();
            carregarMinhasTransacoes();
            carregarTodasTransacoes();
        } catch (err) {
            mostrarErro('Erro: ' + err.message);
        }
    };

    document.getElementById('btnAssinarPlano')?.addEventListener('click', window.iniciarAssinaturaStripe);

    // ================================================================
    //  BOLETIM
    // ================================================================
    window.carregarBoletimAdmin = async () => {
        const container = document.getElementById('boletimContainer');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
        try {
            const { data: alunos } = await supabase.from('profiles').select('id,email');
            const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true);
            const { data: notas } = await supabase.from('notas').select('*');
            const notasPorAluno = {};
            notas?.forEach(nota => {
                if (!notasPorAluno[nota.aluno_id]) notasPorAluno[nota.aluno_id] = {};
                notasPorAluno[nota.aluno_id][nota.disciplina_id] = nota;
            });
            let html = `<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;"><table style="min-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;"><thead><tr style="background: #f5f5f5; border-bottom: 2px solid #2E7D32;"><th style="padding:12px; text-align:center; color: #2E7D32;">Aluno</th>${disciplinas?.map(d => `<th style="padding:12px; text-align:center; color: #2E7D32;">${escapeHtml(d.nome)}</th>`).join('')}<th style="padding:12px; text-align:center; color: #2E7D32;">Média Final</th><th style="padding:12px; text-align:center; color: #2E7D32;">Situação</th></tr></thead><tbody>`;
            for (const aluno of alunos) {
                let somaMedias = 0,
                    disciplinasContadas = 0;
                html += `<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding:12px; text-align:center; color: #333;">${escapeHtml(aluno.email)}</td>`;
                for (const disc of disciplinas || []) {
                    const nota = notasPorAluno[aluno.id]?.[disc.id];
                    let media = '-';
                    if (nota) {
                        const n1 = parseFloat(nota.nota1) || 0,
                            n2 = parseFloat(nota.nota2) || 0,
                            n3 = parseFloat(nota.nota3) || 0;
                        let m = (n1 + n2 + n3) / 3;
                        if (nota.recuperacao > m) m = (m + parseFloat(nota.recuperacao)) / 2;
                        media = m.toFixed(1);
                        somaMedias += m;
                        disciplinasContadas++;
                    }
                    html += `<td style="padding:12px; text-align:center; font-weight: bold; color: #2E7D32;">${media}</td>`;
                }
                const mediaFinal = disciplinasContadas > 0 ? (somaMedias / disciplinasContadas).toFixed(1) : '-';
                let situacaoClass = 'status-pendente',
                    situacaoText = '⏳ PENDENTE';
                if (mediaFinal !== '-') {
                    const mf = parseFloat(mediaFinal);
                    if (mf >= 6) { situacaoClass = 'status-aprovado';
                        situacaoText = '✅ APROVADO'; } else if (mf >= 4) { situacaoClass = 'status-recuperacao';
                        situacaoText = '🟡 RECUPERAÇÃO'; } else { situacaoClass = 'status-reprovado';
                        situacaoText = '❌ REPROVADO'; }
                }
                html += `<td style="padding:12px; text-align:center; font-weight: bold; color: #2E7D32;">${mediaFinal}</td>`;
                html += `<td style="padding:12px; text-align:center; color: ${situacaoClass === 'status-aprovado' ? '#2E7D32' : (situacaoClass === 'status-recuperacao' ? '#FF9800' : '#D32F2F')}; font-weight: bold;">${situacaoText}</td>`;
                html += `</tr>`;
            }
            html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarBoletimAdmin()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>';
        }
    };

    window.carregarBoletimAluno = async () => {
        const container = document.getElementById('boletimAlunoContainer');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:40px"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
        try {
            const { data: disciplinas } = await supabase.from('disciplinas').select('*').eq('ativa', true);
            const { data: notas } = await supabase.from('notas').select('*').eq('aluno_id', usuarioId);
            if (!disciplinas?.length) { container.innerHTML = '<p>Nenhuma disciplina.</p>'; return; }
            let html = `<div style="overflow-x: auto;"><table class="boletim-tabela" style="min-width: 600px;"><thead><tr><th>Disciplina</th><th>Nota 1</th><th>Nota 2</th><th>Nota 3</th><th>Média</th><th>Faltas</th><th>Situação</th></tr></thead><tbody>`;
            let somaMedias = 0,
                disciplinasContadas = 0;
            for (const disc of disciplinas) {
                const nota = notas?.find(n => n.disciplina_id === disc.id);
                let n1 = '-',
                    n2 = '-',
                    n3 = '-',
                    media = '-',
                    faltas = '-';
                let situacaoClass = 'status-pendente',
                    situacaoText = '⏳ Pendente';
                if (nota && nota.media_final) {
                    n1 = nota.nota1 || '-';
                    n2 = nota.nota2 || '-';
                    n3 = nota.nota3 || '-';
                    faltas = nota.faltas || 0;
                    media = nota.media_final.toFixed(1);
                    somaMedias += nota.media_final;
                    disciplinasContadas++;
                    if (nota.media_final >= 6) { situacaoClass = 'status-aprovado';
                        situacaoText = '✅ Aprovado'; } else if (nota.media_final >= 4) { situacaoClass = 'status-recuperacao';
                        situacaoText = '🟡 Recuperação'; } else { situacaoClass = 'status-reprovado';
                        situacaoText = '❌ Reprovado'; }
                }
                html += `<tr><td>${escapeHtml(disc.nome)}</td><td>${n1}</td><td>${n2}</td><td>${n3}</td><td><strong>${media}</strong></td><td>${faltas}</td><td class="${situacaoClass}">${situacaoText}</td></tr>`;
            }
            const mediaGeral = disciplinasContadas > 0 ? (somaMedias / disciplinasContadas).toFixed(1) : '-';
            html += `<tr style="background:#f5f5f5"><td colspan="4"><strong>Média Geral:</strong></td><td><strong>${mediaGeral}</strong></td><td colspan="2"></td></tr>`;
            html += `</tbody></table></div><div style="margin-top:15px; text-align:center"><button class="btn-criar-sala" onclick="carregarBoletimAluno()" style="padding:5px 12px"><i class="fas fa-sync-alt"></i> Atualizar</button></div>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:red">Erro: ' + err.message + '</p>';
        }
    };

    window.abrirModalLancarNotas = async () => {
        try {
            const selectAluno = document.getElementById('notaAlunoId');
            const { data: perfis } = await supabase.from('profiles').select('id,email');
            selectAluno.innerHTML = '<option value="">Selecione...</option>';
            perfis.forEach(p => { selectAluno.innerHTML += `<option value="${p.id}">${p.email}</option>`; });
            const { data: disciplinas } = await supabase.from('disciplinas').select('id,nome').eq('ativa', true);
            const selectDisc = document.getElementById('notaDisciplinaId');
            selectDisc.innerHTML = '<option value="">Selecione...</option>';
            disciplinas.forEach(d => { selectDisc.innerHTML += `<option value="${d.id}">${d.nome}</option>`; });
            document.getElementById('modalLancarNotas').style.display = 'flex';
        } catch (err) {
            mostrarErro('Erro ao carregar dados: ' + err.message);
        }
    };

    window.fecharModalLancarNotas = () => {
        document.getElementById('modalLancarNotas').style.display = 'none';
    };

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
            if (!alunoId || !disciplinaId) { mostrarErro('Selecione aluno e disciplina'); return; }
            let media = (nota1 + nota2 + nota3) / 3;
            if (recuperacao > media) media = (media + recuperacao) / 2;
            const situacao = media >= 6 ? 'APROVADO' : (media >= 4 ? 'RECUPERACAO' : 'REPROVADO');
            const { data: aluno } = await supabase.from('profiles').select('email').eq('id', alunoId).single();
            await supabase.from('notas').upsert({
                aluno_id: alunoId,
                aluno_email: aluno.email,
                disciplina_id: parseInt(disciplinaId),
                nota1,
                nota2,
                nota3,
                recuperacao,
                faltas,
                media_final: media,
                situacao,
                semestre
            }, { onConflict: 'aluno_id,disciplina_id,semestre' });
            mostrarErro('✅ Notas salvas com sucesso!');
            window.fecharModalLancarNotas();
            carregarBoletimAdmin();
        } catch (err) {
            mostrarErro('Erro ao salvar notas: ' + err.message);
        }
    };

    // ================================================================
    //  ADMIN
    // ================================================================
    window.abrirModalAdmin = () => document.getElementById('modalAdmin').classList.add('active');
    window.fecharModalAdmin = () => document.getElementById('modalAdmin').classList.remove('active');
    window.trocarAbaAdmin = (aba) => {
        document.getElementById('abaAdminMaterial').style.display = aba === 'material' ? 'block' : 'none';
        document.getElementById('abaAdminAula').style.display = aba === 'aula' ? 'block' : 'none';
    };

    // ================================================================
    //  CONFIG
    // ================================================================
    async function loadDevices() {
        try { await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); } catch (e) {}
    }
    loadDevices();

    document.getElementById('testMic')?.addEventListener('click', async () => {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        alert('Microfone OK');
    });

    document.getElementById('testSpeaker')?.addEventListener('click', () => {
        const a = new AudioContext();
        const o = a.createOscillator();
        o.connect(a.destination);
        o.start();
        setTimeout(() => o.stop(), 400);
    });

    document.getElementById('testCamera')?.addEventListener('click', async () => {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('cameraPreview').srcObject = s;
        document.getElementById('cameraPreview').style.display = 'block';
    });

    const temaSelect = document.getElementById('temaSelect');

    function applyTheme(t) {
        if (t === 'claro') document.body.classList.add('tema-claro');
        else document.body.classList.remove('tema-claro');
        localStorage.setItem('sulsafe_tema', t);
    }
    temaSelect?.addEventListener('change', e => applyTheme(e.target.value));
    applyTheme(localStorage.getItem('sulsafe_tema') || 'escuro');
    if (temaSelect) temaSelect.value = localStorage.getItem('sulsafe_tema') || 'escuro';

    document.querySelectorAll('.color-option').forEach(opt => opt.addEventListener('click', () => {
        const c = opt.dataset.color;
        document.documentElement.style.setProperty('--primaria', c);
        localStorage.setItem('sulsafe_corDestaque', c);
    }));
    const savedColor = localStorage.getItem('sulsafe_corDestaque');
    if (savedColor) document.documentElement.style.setProperty('--primaria', savedColor);

    document.getElementById('limparDados')?.addEventListener('click', () => {
        localStorage.clear();
        document.getElementById('clearMsg').style.display = 'inline';
        setTimeout(() => document.getElementById('clearMsg').style.display = 'none', 2000);
    });

    document.querySelectorAll('.config-tab').forEach(tab => tab.addEventListener('click', () => {
        const t = tab.dataset.config;
        document.querySelectorAll('.config-tab').forEach(x => x.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.config-section').forEach(x => x.classList.remove('active-section'));
        document.getElementById(`config-${t}`)?.classList.add('active-section');
    }));

    // ================================================================
    //  MASCOTE
    // ================================================================
    const mascoteDiv = document.getElementById('mascoteAssistente');
    const balao = document.getElementById('balaoAjuda');

    window.fecharAssistente = () => { balao.classList.remove('active'); };
    mascoteDiv.addEventListener('click', (e) => {
        if (e.target.closest('.mascote-avatar')) {
            balao.classList.toggle('active');
        }
    });

    window.ajudaEnvioTrabalho = () => { alert("📄 Acesse 'Área do aluno'");
        balao.classList.remove('active'); };
    window.ajudaVideoaula = () => { alert("🎬 Acesse 'Videoaulas'");
        balao.classList.remove('active'); };
    window.ajudaSala = () => { alert("🎥 Acesse 'Aulas ao vivo'");
        balao.classList.remove('active'); };
    window.ajudaMateriais = () => { alert("📚 Acesse 'Materiais'");
        balao.classList.remove('active'); };
    window.abrirAssistenteNR = () => { window.alternarView('ia');
        balao.classList.remove('active'); };

    // ================================================================
    //  NAVEGAÇÃO
    // ================================================================
    document.querySelectorAll('.nav-item').forEach(el => el.addEventListener('click', () => window.alternarView(el.getAttribute('data-view'))));
    document.getElementById('chatInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') window.enviarMensagemChat(); });

    // ================================================================
    //  CANVAS HERO
    // ================================================================
    const canvas = document.getElementById('canvas-hero');
    const ctx2 = canvas.getContext('2d');
    let w2, h2,
        mx2 = 0,
        my2 = 0,
        tx2 = 0,
        ty2 = 0;

    function resizeCanvas2() {
        w2 = canvas.width = window.innerWidth;
        h2 = canvas.height = window.innerHeight;
    }
    resizeCanvas2();
    window.addEventListener('resize', resizeCanvas2);

    document.addEventListener('mousemove', e => {
        mx2 = (e.clientX / w2 - 0.5) * 2;
        my2 = (e.clientY / h2 - 0.5) * 2;
    });

    const stars2 = Array.from({ length: 80 }, () => ({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        z: Math.random() * 1000,
        size: Math.random() * 1.2
    }));

    function draw2() {
        ctx2.fillStyle = '#F4F7F6';
        ctx2.fillRect(0, 0, w2, h2);
        tx2 += (mx2 - tx2) * 0.05;
        ty2 += (my2 - ty2) * 0.05;
        ctx2.fillStyle = '#2E7D32';
        stars2.forEach(s => {
            s.z -= 1.2;
            if (s.z <= 0) {
                s.z = 1000;
                s.x = Math.random() * w2;
                s.y = Math.random() * h2;
            }
            let scale = 1000 / (1000 - s.z);
            let x = (s.x - w2 / 2) * scale + w2 / 2 + tx2 * 30;
            let y = (s.y - h2 / 2) * scale + h2 / 2 + ty2 * 15;
            ctx2.globalAlpha = scale * 0.5;
            ctx2.beginPath();
            ctx2.arc(x, y, s.size * scale, 0, Math.PI * 2);
            ctx2.fill();
        });
        requestAnimationFrame(draw2);
    }
    draw2();

    // ================================================================
    //  INICIALIZAÇÃO
    // ================================================================
    console.log('🚀 SulSafe carregado com sucesso!');
    console.log('📊 NRS_DATA:', NRS_DATA.length, 'normas');

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            console.log('✅ Usuário logado:', session.user.email);
            usuarioAtual = session.user.email;
            usuarioId = session.user.id;
            garantirPerfil(session.user).then(role => {
                perfilUsuario = role;
                ehProfessor = (role === 'admin' || role === 'professor');
                document.getElementById('dashUserName').innerHTML = usuarioAtual;
                atualizarPainelProfessor();
                entrarDashboard();
            });
        } else {
            console.log('🔑 Nenhum usuário logado.');
        }
    });

    window.fazerLogin = window.fazerLogin;
    window.fazerCadastro = window.fazerCadastro;
    window.recuperarSenha = window.recuperarSenha;
    window.fazerLogout = window.fazerLogout;
    window.mostrarTela = window.mostrarTela;
    window.alternarView = window.alternarView;
    window.carregarVideoaulas = window.carregarVideoaulas;
    window.carregarMateriais = window.carregarMateriais;
    window.carregarEquipe = carregarEquipe;
    window.carregarRelatorioAlunos = window.carregarRelatorioAlunos;
    window.renderizarNrs = renderizarNrs;
    window.atualizarListaSalas = window.atualizarListaSalas;
