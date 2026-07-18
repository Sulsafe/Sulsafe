// ============================================
// DASHBOARD PRINCIPAL - VERSÃO CORRIGIDA
// ============================================

// Variáveis globais
let dadosDashboard = {
  notificacoes: [],
  salas: [],
  videos: 38,
  alunosPendentes: 0
};

// ============================================
// FUNÇÃO PRINCIPAL - CARREGAR DASHBOARD
// ============================================

async function carregarDashboard() {
  try {
    console.log('🚪 Entrando no dashboard...');
    
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado');
      window.location.href = '/login.html';
      return;
    }

    console.log('✅ Usuário autenticado:', user.id);

    // 2. Buscar dados em paralelo
    const [notificacoesResult, salasResult] = await Promise.allSettled([
      buscarNotificacoes(user.id),
      buscarSalas()
    ]);

    // 3. Processar resultados
    if (notificacoesResult.status === 'fulfilled') {
      dadosDashboard.notificacoes = notificacoesResult.value || [];
      console.log('✅ Notificações:', dadosDashboard.notificacoes.length);
    } else {
      console.warn('⚠️ Erro notificações:', notificacoesResult.reason);
      dadosDashboard.notificacoes = [];
    }

    if (salasResult.status === 'fulfilled') {
      dadosDashboard.salas = salasResult.value || [];
      console.log('✅ Salas ativas:', dadosDashboard.salas.length);
    } else {
      console.warn('⚠️ Erro salas:', salasResult.reason);
      dadosDashboard.salas = [];
    }

    // Buscar alunos pendentes
    try {
      dadosDashboard.alunosPendentes = await buscarAlunosPendentes(user.id) || 0;
    } catch (e) {
      console.warn('⚠️ Erro ao buscar pendentes:', e);
      dadosDashboard.alunosPendentes = 0;
    }

    // 4. Renderizar dashboard
    renderizarDashboard();
    
    // 5. Remover loading
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    mostrarErro('Não foi possível carregar o dashboard. Tente novamente.');
  }
}

// ============================================
// FUNÇÕES DE BUSCA INDIVIDUAIS
// ============================================

async function buscarNotificacoes(userId) {
  try {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', userId)
      .eq('lida', false)
      .order('criado_em', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na busca de notificações:', error);
    return [];
  }
}

async function buscarSalas() {
  try {
    // Tentar com join primeiro
    const { data, error } = await supabase
      .from('salas')
      .select(`
        *,
        profiles!left(nome_completo)
      `)
      .eq('ativa', true)
      .order('criado_em', { ascending: false });

    if (error) {
      console.warn('⚠️ Erro no join de salas:', error);
      
      // Fallback: buscar sem join
      const { data: salasSimples, error: errorSimples } = await supabase
        .from('salas')
        .select('*')
        .eq('ativa', true)
        .order('criado_em', { ascending: false });

      if (errorSimples) {
        console.error('Erro ao buscar salas:', errorSimples);
        return [];
      }

      return salasSimples || [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na busca de salas:', error);
    return [];
  }
}

async function buscarAlunosPendentes(userId) {
  try {
    const { count, error } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')
      .eq('professor_id', userId);

    if (error) {
      console.warn('⚠️ Erro ao contar pendentes:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    return 0;
  }
}

// ============================================
// RENDERIZAÇÃO DO DASHBOARD - CORRIGIDA
// ============================================

function renderizarDashboard() {
  console.log('📊 Renderizando dashboard...');
  
  // Função para atualizar ou criar elementos estatísticos
  function atualizarStat(seletor, valor, label) {
    let elemento = document.querySelector(seletor);
    let container = document.querySelector('.stats-container');
    
    // Se não houver container, criar um
    if (!container) {
      container = document.createElement('div');
      container.className = 'stats-container';
      container.style.cssText = 'display:flex; gap:15px; padding:20px; flex-wrap:wrap; justify-content:center;';
      
      const dashboardContent = document.querySelector('.dashboard-content') || document.body;
      dashboardContent.prepend(container);
    }
    
    // Se o elemento não existir, criar
    if (!elemento) {
      const item = document.createElement('div');
      item.className = 'stat-item';
      item.style.cssText = 'background:white; padding:15px 25px; border-radius:10px; text-align:center; min-width:100px; box-shadow:0 2px 4px rgba(0,0,0,0.1);';
      
      const valorSpan = document.createElement('span');
      valorSpan.className = seletor.replace('.', '');
      valorSpan.textContent = valor;
      valorSpan.style.cssText = 'display:block; font-size:28px; font-weight:bold; color:#2c3e50;';
      
      const labelSpan = document.createElement('label');
      labelSpan.textContent = label || seletor.replace('.', '').replace('stat-', '').toUpperCase();
      labelSpan.style.cssText = 'display:block; font-size:12px; color:#7f8c8d; margin-top:5px;';
      
      item.appendChild(valorSpan);
      item.appendChild(labelSpan);
      container.appendChild(item);
      
      return valorSpan;
    }
    
    // Atualizar existente
    elemento.textContent = valor;
    return elemento;
  }

  // Atualizar estatísticas
  atualizarStat('.stat-videos', dadosDashboard.videos || 38, 'Vídeos HD');
  atualizarStat('.stat-salas', dadosDashboard.salas.length || 0, 'Salas Ativas');
  atualizarStat('.stat-pendentes', dadosDashboard.alunosPendentes || 0, 'Pendentes');
  atualizarStat('.stat-notificacoes', dadosDashboard.notificacoes.length || 0, 'Notificações');

  // Se houver notificações, mostrar
  const notifContainer = document.getElementById('notificacoes-container');
  if (notifContainer && dadosDashboard.notificacoes.length > 0) {
    notifContainer.innerHTML = dadosDashboard.notificacoes.map(n => `
      <div class="notificacao-item">
        <span class="notif-dot"></span>
        ${n.mensagem || 'Nova notificação'}
        <small>${new Date(n.criado_em).toLocaleDateString()}</small>
      </div>
    `).join('');
  }
  
  console.log('✅ Dashboard atualizado!');
}

// ============================================
// UTILITÁRIOS
// ============================================

function mostrarErro(mensagem) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.innerHTML = `
      <div style="color: #e74c3c; padding: 20px;">
        <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
        <p>${mensagem}</p>
        <button onclick="carregarDashboard()" class="btn-retry">
          🔄 Tentar Novamente
        </button>
      </div>
    `;
  }
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO (existentes)
// ============================================

function stC(v, l, ic) { 
  return `<div class="st"><div class="st-v">${v}</div><div class="st-l"><i class="fas ${ic}" style="margin-right:4px"></i>${l}</div></div>` 
}

function cCard(ic, t, d, v) { 
  return `<div class="card" onclick="window.nav('${v}')"><div class="card-ic"><i class="fas ${ic}"></i></div><div class="card-t">${t}</div><div class="card-d">${d}</div></div>` 
}

// ============================================
// INICIALIZAR
// ============================================

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o #appWrap existe, se não, criar
  let appWrap = document.getElementById('appWrap');
  if (!appWrap) {
    console.warn('⚠️ #appWrap não encontrado, criando um container');
    appWrap = document.createElement('div');
    appWrap.id = 'appWrap';
    document.body.appendChild(appWrap);
  }

  // Carregar dashboard após pequeno delay
  setTimeout(() => {
    carregarDashboard();
  }, 100);
});

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================

window.carregarDashboard = carregarDashboard;
window.stC = stC;
window.cCard = cCard;
