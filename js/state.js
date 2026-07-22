// ============================================================
// STATE - ESTADO GLOBAL DA APLICAÇÃO
// ============================================================

export const S = {
    user: null,
    cfg: {},
    currentView: 'inicio',
    prevView: null,
    views: {},
    sidebar: null
}

// Lista das 38 NRs
export const NRS = [
    { n: 1,  nome: 'Disposições Gerais e Gerenciamento de Riscos', cat: 'gerais', emoji: '📋' },
    { n: 2,  nome: 'Inspeção Prévia', cat: 'gerais', emoji: '📋' },
    { n: 3,  nome: 'Embargo ou Interdição', cat: 'gerais', emoji: '📋' },
    { n: 4,  nome: 'SESMT — Serviços Especializados', cat: 'gerais', emoji: '📋' },
    { n: 5,  nome: 'CIPA — Comissão Interna de Prevenção', cat: 'gerais', emoji: '📋' },
    { n: 6,  nome: 'EPI — Equipamento de Proteção Individual', cat: 'gerais', emoji: '🦺' },
    { n: 7,  nome: 'PCMSO — Saúde Ocupacional', cat: 'gerais', emoji: '⚕️' },
    { n: 8,  nome: 'Edificações', cat: 'gerais', emoji: '🏢' },
    { n: 9,  nome: 'Avaliação de Riscos Ambientais (PGR)', cat: 'gerais', emoji: '📋' },
    { n: 15, nome: 'Atividades e Operações Insalubres', cat: 'gerais', emoji: '⚠️' },
    { n: 16, nome: 'Atividades e Operações Perigosas', cat: 'gerais', emoji: '⚠️' },
    { n: 17, nome: 'Ergonomia', cat: 'gerais', emoji: '🎯' },
    { n: 24, nome: 'Condições Sanitárias e de Conforto', cat: 'gerais', emoji: '🚿' },
    { n: 25, nome: 'Resíduos Industriais', cat: 'gerais', emoji: '🗑️' },
    { n: 26, nome: 'Sinalização de Segurança', cat: 'gerais', emoji: '🚸' },
    { n: 28, nome: 'Fiscalização e Penalidades', cat: 'gerais', emoji: '📋' },
    { n: 10, nome: 'Segurança em Eletricidade', cat: 'especificas', emoji: '⚡' },
    { n: 11, nome: 'Movimentação e Armazenagem de Cargas', cat: 'especificas', emoji: '📦' },
    { n: 12, nome: 'Máquinas e Equipamentos', cat: 'especificas', emoji: '🏭' },
    { n: 13, nome: 'Vasos de Pressão e Caldeiras', cat: 'especificas', emoji: '🛢️' },
    { n: 14, nome: 'Fornos Industriais', cat: 'especificas', emoji: '🔥' },
    { n: 19, nome: 'Explosivos', cat: 'especificas', emoji: '💥' },
    { n: 20, nome: 'Inflamáveis e Combustíveis', cat: 'especificas', emoji: '🔥' },
    { n: 23, nome: 'Proteção Contra Incêndios', cat: 'especificas', emoji: '🧯' },
    { n: 33, nome: 'Espaços Confinados', cat: 'especificas', emoji: '🔬' },
    { n: 35, nome: 'Trabalho em Altura', cat: 'especificas', emoji: '🪜' },
    { n: 18, nome: 'Indústria da Construção Civil', cat: 'setoriais', emoji: '🏗️' },
    { n: 21, nome: 'Trabalho a Céu Aberto', cat: 'setoriais', emoji: '☀️' },
    { n: 22, nome: 'Mineração', cat: 'setoriais', emoji: '⛏️' },
    { n: 27, nome: 'Registro Profissional (Histórico)', cat: 'setoriais', emoji: '📜' },
    { n: 29, nome: 'Segurança e Saúde nos Portos', cat: 'setoriais', emoji: '🚢' },
    { n: 30, nome: 'Trabalho Aquaviário', cat: 'setoriais', emoji: '🚤' },
    { n: 31, nome: 'Agricultura, Pecuária e Florestal', cat: 'setoriais', emoji: '🌾' },
    { n: 32, nome: 'Serviços de Saúde', cat: 'setoriais', emoji: '⚕️' },
    { n: 34, nome: 'Construção, Reparação e Desmontagem', cat: 'setoriais', emoji: '🏗️' },
    { n: 36, nome: 'Abate e Processamento de Carnes', cat: 'setoriais', emoji: '🥩' },
    { n: 37, nome: 'Plataformas de Petróleo', cat: 'setoriais', emoji: '🛢️' },
    { n: 38, nome: 'Limpeza Urbana e Resíduos Sólidos', cat: 'setoriais', emoji: '🚛' }
]

export function registerView(name, fn) {
    S.views[name] = fn
}

export function setRenderSidebar(fn) {
    S.sidebar = fn
}

// Date format
export function fmtD(d) {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Exportar NRS como NRS para compatibilidade
export { NRS as NRS_LIST }

// Função de navegação global
export function nav(view) {
    S.prevView = S.currentView
    S.currentView = view
    if (S.sidebar) S.sidebar()
    renderView()
}

function renderView() {
    const viewFn = S.views[S.currentView]
    if (!viewFn) return
    const content = document.getElementById('appContent')
    if (content) {
        content.innerHTML = viewFn()
        // Re-attach event listeners if needed
    }
}

// Tornar nav global
window.nav = nav
