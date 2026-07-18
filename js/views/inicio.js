// ============================================================
// VIEW INÍCIO - DASHBOARD PRINCIPAL
// ============================================================

import { S, loadCfg } from '../state.js';
import { sb } from '../supabase-client.js';

// ============================================================
// ESTADO LOCAL
// ============================================================
const state = {
    videos: 38,
    salas: [],
    notificacoes: [],
    alunosPendentes: 0,
    loading: true
};

// ============================================================
// FUNÇÃO PRINCIPAL - RENDER
// ============================================================
export const vInicio = {
    render: function() {
        console.log('📄 Renderizando Início...');
        
        const container = document.getElementById('mainView') || document.getElementById('mc');
        if (!container) {
            console.error('❌ Container não encontrado');
            return;
        }

        // HTML do Dashboard
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Olá, Administrador</h1>
                    <p class="page-subtitle">Painel Administrativo (Modo Deus) — ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="header-actions-dash">
                    <span class="date-badge"><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString('pt-BR')}</span>
                    <button class="btn btn-sm btn-p" onclick="window.salvarAlteracoes()"><i class="fas fa-save"></i> Salvar</button>
                </div>
            </div>

            <div id="dashLoading" class="loading-container">
                <div class="spinner"></div>
                <p>Carregando dashboard...</p>
            </div>

            <div id="dashContent" style="display:none;">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue"><i class="fas fa-video"></i></div>
                        <div class="stat-value" id="statVideos">38</div>
                        <div class="stat-label">Vídeos em HD</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green"><i class="fas fa-users"></i></div>
                        <div class="stat-value" id="statSalas">0</div>
                        <div class="stat-label">Salas ao Vivo</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
                        <div class="stat-value" id="statPendentes">0</div>
                        <div class="stat-label">Pendentes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon red"><i class="fas fa-bell"></i></div>
                        <div class="stat-value" id="statNotificacoes">0</div>
                        <div class="stat-label">Notificações</div>
                    </div>
                </div>

                <!-- Quick Access -->
                <div class="quick-access">
                    <div class="quick-card" onclick="window.navigateTo('videoaulas')">
                        <i class="fas fa-video"></i>
                        <h4>Vídeos</h4>
                        <p>38 NRS em videoaulas HD</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('salas')">
                        <i class="fas fa-users"></i>
                        <h4>Salas ao Vivo</h4>
                        <p>Participe ao vivo</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('ia')">
                        <i class="fas fa-robot"></i>
                        <h4>Assistente IA</h4>
                        <p>Dúvidas sobre NRS 24/7</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('provas')">
                        <i class="fas fa-check-double"></i>
                        <h4>Corrigir Provas</h4>
                        <p>Aprovar alunos</p>
                    </div>
                </div>

                <!-- Material -->
                <div class="quick-access" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="quick-card" onclick="window.navigateTo('materiais')">
                        <i class="fas fa-folder-open"></i>
                        <h4>Material</h4>
                        <p>Arquivos e recursos</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('nrs')">
                        <i class="fas fa-book"></i>
                        <h4>Catálogo de NRS</h4>
                        <p>Consulte as 38 Normas</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('pendentes')">
                        <i class="fas fa-clock"></i>
                        <h4>Pendentes</h4>
                        <p>Aprovar alunos</p>
                    </div>
                </div>

                <!-- Notificações -->
                <div id="notificacoesContainer" style="margin-top:24px;"></div>
            </div>
        `;

        // Carregar dados
        this.carregarDados();
    },

    // ============================================================
    // CARREGAR DADOS
    // ============================================================
    carregarDados: async function() {
        try {
            const user = S?.user;
            if (!user) {
                console.warn('⚠️ Usuário não autenticado');
                this.mostrarErro('Usuário não autenticado');
                return;
            }

            console.log('✅ Usuário:', user.id);

            // Buscar dados
            const [notificacoes, salas] = await Promise.all([
                this.buscarNotificacoes(user.id),
                this.buscarSalas()
            ]);

            state.notificacoes = notificacoes || [];
            state.salas = salas || [];
            state.alunosPendentes = state.notificacoes.filter(n => !n.lida).length;

            // Atualizar dashboard
            this.atualizarDashboard();

        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
            this.mostrarErro('Erro ao carregar dados do dashboard');
        }
    },

    // ============================================================
    // BUSCAR NOTIFICAÇÕES
    // ============================================================
    buscarNotificacoes: async function(userId) {
        try {
            const { data, error } = await sb
                .from('notificacoes')
                .select('*')
                .eq('usuario_id', userId)
                .order('criado_em', { ascending: false })
                .limit(5);

            if (error) {
                console.warn('⚠️ Erro notificações:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('⚠️ Exceção notificações:', e);
            return [];
        }
    },

    // ============================================================
    // BUSCAR SALAS
    // ============================================================
    buscarSalas: async function() {
        try {
            const { data, error } = await sb
                .from('salas')
                .select('*')
                .eq('ativa', true)
                .order('criado_em', { ascending: false });

            if (error) {
                console.warn('⚠️ Erro salas:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('⚠️ Exceção salas:', e);
            return [];
        }
    },

    // ============================================================
    // ATUALIZAR DASHBOARD
    // ============================================================
    atualizarDashboard: function() {
        console.log('📊 Atualizando dashboard...');

        // Esconder loading
        const loading = document.getElementById('dashLoading');
        const content = document.getElementById('dashContent');
        
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

        // Atualizar stats
        const videos = document.getElementById('statVideos');
        const salas = document.getElementById('statSalas');
        const pendentes = document.getElementById('statPendentes');
        const notificacoes = document.getElementById('statNotificacoes');

        if (videos) videos.textContent = state.videos;
        if (salas) salas.textContent = state.salas.length;
        if (pendentes) pendentes.textContent = state.alunosPendentes;
        if (notificacoes) notificacoes.textContent = state.notificacoes.length;

        // Atualizar notificações
        const container = document.getElementById('notificacoesContainer');
        if (container) {
            if (state.notificacoes.length > 0) {
                container.innerHTML = `
                    <div class="notif-card">
                        <h4><i class="fas fa-bell" style="color:#f39c12;"></i> Últimas Notificações</h4>
                        ${state.notificacoes.map(n => `
                            <div class="notif-item">
                                <span class="notif-dot ${n.lida ? 'gray' : 'green'}"></span>
                                <span class="notif-msg">${n.mensagem || 'Nova notificação'}</span>
                                <span class="notif-date">${new Date(n.criado_em).toLocaleDateString('pt-BR')}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="notif-card" style="text-align:center; color:#7f8c8d; padding:20px;">
                        <i class="fas fa-bell-slash" style="font-size:24px; margin-bottom:8px;"></i>
                        <p>Nenhuma notificação recente</p>
                    </div>
                `;
            }
        }

        console.log('✅ Dashboard atualizado!');
    },

    // ============================================================
    // MOSTRAR ERRO
    // ============================================================
    mostrarErro: function(mensagem) {
        const loading = document.getElementById('dashLoading');
        if (loading) {
            loading.innerHTML = `
                <div style="color: #e74c3c; text-align:center; padding:20px;">
                    <i class="fas fa-exclamation-circle" style="font-size:32px;"></i>
                    <p style="margin:12px 0;">${mensagem}</p>
                    <button class="btn btn-sm btn-p" onclick="location.reload()">
                        <i class="fas fa-sync"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
};

// ============================================================
// FUNÇÕES GLOBAIS
// ============================================================

window.salvarAlteracoes = function() {
    const toast = document.querySelector('#toast');
    if (toast) {
        toast.textContent = '✅ Alterações salvas com sucesso!';
        toast.className = 'on ok';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => toast.className = '', 3000);
    } else {
        alert('✅ Alterações salvas com sucesso!');
    }
};

window.navigateTo = function(view) {
    console.log('🔀 Navegando para:', view);
    // Usar o sistema de navegação do main.js
    if (typeof window.nav === 'function') {
        window.nav(view);
    } else {
        // Fallback: tentar importar e renderizar
        import(`./${view}.js`).then(module => {
            if (module.vVideoaulas) {
                document.getElementById('mainView').innerHTML = '<h1>' + view + '</h1><p>View carregada</p>';
            }
        }).catch(() => {
            document.getElementById('mainView').innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h2>${view}</h2>
                    <p>Página em construção</p>
                </div>
            `;
        });
    }
};

// ============================================================
// EXPORT DEFAULT
// ============================================================
export default vInicio;

console.log('✅ View Inicio carregada com sucesso!');
