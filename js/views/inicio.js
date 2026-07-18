// ============================================
// VIEW INÍCIO - DASHBOARD PRINCIPAL
// ============================================

import { supabase, appState, navigateTo, showToast, showModal, closeModal } from '../js/main.js';

// ============================================
// DADOS DO DASHBOARD
// ============================================
const state = {
    videos: 38,
    salas: [],
    notificacoes: [],
    alunosPendentes: 0,
    loading: true
};

// ============================================
// RENDERIZAÇÃO DA VIEW
// ============================================
export const vInicio = {
    render: function() {
        console.log('📄 Renderizando Início...');
        
        const container = document.getElementById('mc');
        if (!container) {
            console.error('❌ #mc não encontrado');
            return;
        }

        // HTML do Dashboard
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Olá, Administrador</h1>
                    <p class="page-subtitle">Painel Administrativo — ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    <div class="quick-card" onclick="window.navigateTo('assistente')">
                        <i class="fas fa-robot"></i>
                        <h4>Assistente IA</h4>
                        <p>Dúvidas sobre NRS 24/7</p>
                    </div>
                    <div class="quick-card" onclick="window.navigateTo('corrigir')">
                        <i class="fas fa-check-double"></i>
                        <h4>Corrigir Provas</h4>
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

    carregarDados: async function() {
        try {
            const user = appState.user;
            if (!user) {
                console.warn('⚠️ Usuário não autenticado');
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

            // Renderizar
            this.atualizarDashboard();

        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
            document.getElementById('dashLoading').innerHTML = `
                <div style="color:#e74c3c;">
                    <i class="fas fa-exclamation-circle" style="font-size:32px;"></i>
                    <p>Erro ao carregar dados</p>
                    <button class="btn btn-sm btn-p" onclick="location.reload()">Tentar Novamente</button>
                </div>
            `;
        }
    },

    buscarNotificacoes: async function(userId) {
        try {
            const { data, error } = await supabase
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
            return [];
        }
    },

    buscarSalas: async function() {
        try {
            const { data, error } = await supabase
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
            return [];
        }
    },

    atualizarDashboard: function() {
        console.log('📊 Atualizando dashboard...');

        // Esconder loading, mostrar conteúdo
        document.getElementById('dashLoading').style.display = 'none';
        document.getElementById('dashContent').style.display = 'block';

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
            }
        }

        console.log('✅ Dashboard atualizado!');
    }
};

// ============================================
// FUNÇÕES GLOBAIS (para onclick)
// ============================================

window.navigateTo = navigateTo;
window.salvarAlteracoes = function() {
    showToast('✅ Alterações salvas com sucesso!', 'success');
};

// ============================================
// EXPORTAR VIEW
// ============================================

export default vInicio;
