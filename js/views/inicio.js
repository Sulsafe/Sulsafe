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

    // 2. Buscar dados em paralelo com tratamento individual
    const [notificacoesResult, salasResult] = await Promise.allSettled([
      buscarNotificacoes(user.id),
      buscarSalas(),
      buscarAlunosPendentes(user.id)
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

    if (salasResult.status === 'fulfilled') {
      // O terceiro resultado é o de alunos pendentes
      const pendentesResult = await Promise.allSettled([buscarAlunosPendentes(user.id)]);
      if (pendentesResult[0].status === 'fulfilled') {
        dadosDashboard.alunosPendentes = pendentesResult[0].value || 0;
      }
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
    // Primeiro, verificar se a tabela existe
    const { data: tabelaExiste, error: checkError } = await supabase
      .from('notificacoes')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.warn('⚠️ Tabela notificacoes não existe');
      return [];
    }

    // Buscar notificações não lidas
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', userId)
      .eq('lida', false)  // ← IMPORTANTE: booleano, não string
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
      .eq('ativa', true)  // ← IMPORTANTE: booleano
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
    // Ajuste conforme sua estrutura de dados
    const { count, error } = await supabase
      .from('alunos')  // ou 'provas', 'correcoes', etc.
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
// RENDERIZAÇÃO DO DASHBOARD
// ============================================

function renderizarDashboard() {
  // Atualizar estatísticas
  document.querySelector('.stat-videos')?.textContent = dadosDashboard.videos || 38;
  document.querySelector('.stat-salas')?.textContent = dadosDashboard.salas.length || 0;
  document.querySelector('.stat-pendentes')?.textContent = dadosDashboard.alunosPendentes || 0;
  document.querySelector('.stat-notificacoes')?.textContent = dadosDashboard.notificacoes.length || 0;

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
