// ============================================================
// VIEW INÍCIO - DASHBOARD INSTITUCIONAL SULSAFE v2
// ============================================================

import { S } from '../state.js';
import { sb } from '../supabase-client.js';

console.log('📄 Carregando view Inicio - Versão Institucional v2...');

let userCheckInterval = null;

// ============================================================
// FUNÇÃO PRINCIPAL - RETORNA HTML
// ============================================================
export function vInicio() {
    console.log('🎯 Renderizando Dashboard Institucional...');
    
    // Limpa interval antigo se existir
    if(userCheckInterval) clearInterval(userCheckInterval);

    // Aguarda o S.user carregar antes de buscar dados
    userCheckInterval = setInterval(() => {
        if (S?.user?.id) {
            clearInterval(userCheckInterval);
            console.log('✅ Usuário detectado:', S.user.id);
            carregarDados();
        }
    }, 100);

    // Timeout de segurança: para de tentar depois de 5s
    setTimeout(() => {
        if(userCheckInterval) {
            clearInterval(userCheckInterval);
            document.getElementById('dashStatus').textContent = '⚠️ Timeout de sessão';
        }
    }, 5000);

    return `
    <style>
        /* ==========================================
           DASHBOARD INSTITUCIONAL SULSAFE
           ========================================== */
        .dash-institutional {
            padding: 0;
            max-width: 100%;
            overflow-x: hidden;
        }

        /* Hero Banner */
        .dash-hero {
            background: linear-gradient(135deg, #0F1F0F 0%, #1B5E20 50%, #2E7D32 100%);
            border-radius: 20px;
            padding: 48px 40px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
            color: #fff;
        }
        .dash-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(201,176,55,0.15) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .dash-hero::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(46,125,50,0.2) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }
        .dash-hero-content {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
        }
        .dash-hero-text h1 {
            font-size: 36px;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 12px;
            letter-spacing: -1px;
        }
        .dash-hero-text h1 span {
            background: linear-gradient(135deg, #E8D77A, #C9B037);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dash-hero-text p {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.6;
            margin-bottom: 20px;
            max-width: 500px;
        }
        .dash-hero-illustration {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .dash-hero-illustration .ilustra {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.08);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }
        .dash-hero-illustration .ilustra:hover {
            transform: translateY(-4px) scale(1.05);
            background: rgba(255,255,255,0.15);
            border-color: #E8D77A;
        }

        /* Cards de Boas-Vindas */
        .welcome-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 32px;
        }
        .welcome-card {
            background: #fff;
            border-radius: 16px;
            padding: 24px 20px;
            border: 1px solid #e8ecf1;
            text-align: center;
            transition: all 0.3s;
            cursor: default;
        }
        .welcome-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.08);
            border-color: #2E7D32;
        }
        .welcome-card .icon {
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
        }
        .welcome-card h4 {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .welcome-card p {
            font-size: 13px;
            color: #7f8c8d;
        }

        /* Seção de Destaques */
        .destaques-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }
        .destaques-main {
            background: #fff;
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #e8ecf1;
        }
        .destaques-main h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .destaques-main h3 i {
            color: #C9B037;
        }
        .destaque-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid #f0f2f5;
        }
        .destaque-item:last-child {
            border-bottom: none;
        }
        .destaque-item .emoji {
            font-size: 28px;
            width: 48px;
            height: 48px;
            background: #f0f4f0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .destaque-item .info h4 {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a2e;
        }
        .destaque-item .info p {
            font-size: 13px;
            color: #7f8c8d;
        }
        .destaque-item .badge {
            margin-left: auto;
            background: #2E7D32;
            color: #fff;
            font-size: 11px;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
        }

        .destaques-side {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .destaques-side .card {
            background: #fff;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e8ecf1;
            flex: 1;
            text-align: center;
        }
        .destaques-side .card .big-icon {
            font-size: 36px;
            margin-bottom: 8px;
        }
        .destaques-side .card h4 {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a2e;
        }
        .destaques-side .card p {
            font-size: 12px;
            color: #7f8c8d;
        }
        .destaques-side .card .btn-mini {
            margin-top: 10px;
            padding: 6px 16px;
            background: #2E7D32;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .destaques-side .card .btn-mini:hover {
            background: #1B5E20;
        }

        /* Loading */
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            gap: 12px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e8ecf1;
            border-top: 4px solid #2E7D32;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Responsivo */
        @media (max-width: 1024px) {
            .dash-hero-content {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .dash-hero-text p {
                margin: 0 auto 20px;
            }
            .welcome-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .destaques-section {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 640px) {
            .dash-hero {
                padding: 32px 20px;
            }
            .dash-hero-text h1 {
                font-size: 26px;
            }
            .welcome-grid {
                grid-template-columns: 1fr;
            }
            .dash-hero-illustration .ilustra {
                width: 60px;
                height: 60px;
                font-size: 28px;
            }
        }
    </style>

    <div class="dash-institutional">
        <!-- HERO BANNER -->
        <div class="dash-hero">
            <div class="dash-hero-content">
                <div class="dash-hero-text">
                    <h1>Bem-vindo à <span>SulSafe</span></h1>
                    <p>
                        Aqui você encontra os melhores materiais e os profissionais mais qualificados 
                        da área de <strong>Segurança do Trabalho</strong>. Conte com nossa equipe para 
                        transformar sua carreira e garantir a segurança da sua equipe.
                    </p>
                </div>
                <div class="dash-hero-illustration">
                    <div class="ilustra">👷</div>
                    <div class="ilustra">🦺</div>
                    <div class="ilustra">⛑️</div>
                    <div class="ilustra">🔧</div>
                    <div class="ilustra">📋</div>
                    <div class="ilustra">🎯</div>
                </div>
            </div>
        </div>

        <!-- CARDS DE BOAS-VINDAS -->
        <div class="welcome-grid">
            <div class="welcome-card">
                <span class="icon">📚</span>
                <h4>38 NRs Completas</h4>
                <p>Todo o conteúdo das Normas Regulamentadoras em um só lugar</p>
            </div>
            <div class="welcome-card">
                <span class="icon">🎓</span>
                <h4>Profissionais Qualificados</h4>
                <p>Instrutores especialistas em Segurança do Trabalho</p>
            </div>
            <div class="welcome-card">
                <span class="icon">📹</span>
                <h4>Videoaulas em HD</h4>
                <p>Aulas gravadas com alta qualidade e didática</p>
            </div>
            <div class="welcome-card">
                <span class="icon">🤖</span>
                <h4>Assistente IA 24/7</h4>
                <p>Tire dúvidas a qualquer momento com nossa IA</p>
            </div>
        </div>

        <!-- SEÇÃO DESTAQUES -->
        <div class="destaques-section">
            <div class="destaques-main">
                <h3><i class="fas fa-star"></i> Destaques da Semana</h3>
                <div id="destaquesList">
                    <div class="destaque-item">
                        <div class="emoji">🆕</div>
                        <div class="info">
                            <h4>Nova NR-35 atualizada</h4>
                            <p>Trabalho em Altura - versão 2024 disponível</p>
                        </div>
                        <span class="badge">Novo</span>
                    </div>
                    <div class="destaque-item">
                        <div class="emoji">🎯</div>
                        <div class="info">
                            <h4>Curso de CIPA</h4>
                            <p>Comissão Interna de Prevenção de Acidentes</p>
                        </div>
                        <span class="badge">Em alta</span>
                    </div>
                    <div class="destaque-item">
                        <div class="emoji">⚡</div>
                        <div class="info">
                            <h4>NR-10 - Segurança em Eletricidade</h4>
                            <p>Treinamento com simulações práticas</p>
                        </div>
                        <span class="badge">Popular</span>
                    </div>
                    <div class="destaque-item">
                        <div class="emoji">🛡️</div>
                        <div class="info">
                            <h4>EPIs - Equipamentos de Proteção</h4>
                            <p>Guia completo de uso e conservação</p>
                        </div>
                        <span class="badge">Essencial</span>
                    </div>
                </div>
            </div>

            <div class="destaques-side">
                <div class="card" style="background: linear-gradient(135deg, #0F1F0F, #1B5E20); color: #fff; border: none;">
                    <div class="big-icon">🎓</div>
                    <h4 style="color: #fff;">Certificado Reconhecido</h4>
                    <p style="color: rgba(255,255,255,0.8);">Válido em todo o território nacional</p>
                    <button class="btn-mini" onclick="window.nav('certificados')">Ver meus certificados</button>
                </div>
                <div class="card" style="background: linear-gradient(135deg, #C9B037, #E8D77A); border: none;">
                    <div class="big-icon">💬</div>
                    <h4>Fale com a Equipe</h4>
                    <p>Suporte dedicado para você</p>
                    <button class="btn-mini" style="background: #1a1a2e;" onclick="window.open('https://wa.me/5553997060864', '_blank')">
                        <i class="fab fa-whatsapp"></i> Chamar no WhatsApp
                    </button>
                </div>
            </div>
        </div>

        <!-- LOADING -->
        <div id="dashLoading" class="loading-container">
            <div class="spinner"></div>
            <p style="color: #7f8c8d; font-size: 14px;">Carregando suas informações...</p>
        </div>

        <!-- NOTIFICAÇÕES -->
        <div id="notificacoesContainer" style="margin-top: 16px;"></div>

        <!-- STATUS -->
        <div style="margin-top: 24px; padding: 12px 16px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e8ecf1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 12px; color: #7f8c8d;">
                <i class="fas fa-circle" style="color: #2ecc71; font-size: 8px;"></i> 
                Sistema operacional — <span id="dashStatus">Aguardando sessão...</span>
            </span>
            <span style="font-size: 12px; color: #7f8c8d;">
                <i class="fas fa-code"></i> v2.0 - Institucional
            </span>
        </div>
    </div>
    `;
}

// ============================================================
// CARREGAR DADOS
// ============================================================
async function carregarDados() {
    try {
        const user = S?.user;
        if (!user) {
            console.warn('⚠️ Usuário não autenticado');
            document.getElementById('dashStatus').textContent = '⚠️ Não autenticado';
            return;
        }

        console.log('✅ Carregando dados para:', user.id);

        // Buscar notificações
        const notificacoes = await buscarNotificacoes(user.id);
        
        // Atualizar dashboard
        atualizarDashboard(notificacoes);

    } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        document.getElementById('dashStatus').textContent = '⚠️ Erro ao carregar';
    }
}

// ============================================================
// BUSCAR NOTIFICAÇÕES
// ============================================================
async function buscarNotificacoes(userId) {
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
}

// ============================================================
// ATUALIZAR DASHBOARD
// ============================================================
function atualizarDashboard(notificacoes) {
    console.log('📊 Atualizando dashboard...');

    // Esconder loading
    const loading = document.getElementById('dashLoading');
    if (loading) loading.style.display = 'none';

    // Atualizar status
    const status = document.getElementById('dashStatus');
    if (status) status.textContent = '✅ Pronto!';

    // Atualizar notificações
    const container = document.getElementById('notificacoesContainer');
    if (container) {
        if (notificacoes && notificacoes.length > 0) {
            container.innerHTML = `
                <div style="background: #fff; border-radius: 16px; padding: 16px 20px; border: 1px solid #e8ecf1;">
                    <h4 style="font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-bell" style="color: #f39c12;"></i> 
                        Últimas Notificações
                    </h4>
                    ${notificacoes.map(n => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f2f5;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${n.lida ? '#bdc3c7' : '#2ecc71'};"></span>
                            <span style="flex: 1; font-size: 14px;">${n.mensagem || 'Nova notificação'}</span>
                            <span style="font-size: 12px; color: #7f8c8d;">${new Date(n.criado_em).toLocaleDateString('pt-BR')}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="background: #fff; border-radius: 16px; padding: 16px 20px; border: 1px solid #e8ecf1; text-align: center; color: #7f8c8d;">
                    <i class="fas fa-bell-slash" style="font-size: 20px; margin-bottom: 8px;"></i>
                    <p style="font-size: 14px;">Nenhuma notificação recente</p>
                </div>
            `;
        }
    }

    console.log('✅ Dashboard atualizado!');
}

// ============================================================
// EXPORT DEFAULT
// ============================================================
export default vInicio;

console.log('✅ View Inicio Institucional v2 carregado com sucesso!');
