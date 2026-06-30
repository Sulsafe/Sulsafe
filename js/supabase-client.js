// ============================================================
// SUPABASE CLIENT - CONFIGURAÇÃO E EXPORTAÇÕES
// ============================================================
// Importa o createClient diretamente da CDN (URL absoluta)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/module/index.js'

// Configure com suas credenciais
const SUPABASE_URL = 'https://seu-projeto.supabase.co' // ← substitua pelo seu URL
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui' // ← substitua pela sua chave

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================================
// FUNÇÕES DE ACESSO AO BANCO
// ============================================================

// Usuários
export async function sbGetUser(id) {
    const { data, error } = await sb
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export async function sbUpdateUser(id, updates) {
    const { data, error } = await sb
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function sbGetAllUsers() {
    return await sb.from('usuarios').select('*')
}

export async function sbGetAlunos() {
    return await sb.from('usuarios').select('*').eq('role', 'aluno')
}

export async function sbGetPendentes() {
    return await sb.from('usuarios').select('*').eq('status', 'pendente')
}

export async function sbLiberarUsuario(id) {
    return await sb.from('usuarios').update({ status: 'ativo' }).eq('id', id)
}

// Dashboard
export async function sbGetDashboardMetrics() {
    // Implementar conforme necessidade
    return { data: { total_usuarios: 0, total_alunos: 0, total_professores: 0, pendentes: 0, provas_pendentes: 0, total_concluidas: 0 } }
}

export async function sbGetRankingAlunos() {
    return { data: [] }
}

// Videoaulas
export async function sbGetVideoaulas() {
    return await sb.from('videoaulas').select('*').order('ordem', { ascending: true })
}

export async function sbCriarVideoaula({ nr_id, titulo, descricao, url_video, duracao, ordem, criado_por }) {
    return await sb.from('videoaulas').insert({ nr_id, titulo, descricao, url_video, duracao, ordem, criado_por })
}

// Progresso
export async function sbGetProgressoUsuario(usuario_id) {
    return await sb.from('progresso_aulas').select('*').eq('usuario_id', usuario_id)
}

export async function sbSalvarProgresso(usuario_id, aula_id, tempo_assistido, concluido) {
    const { data: existing } = await sb
        .from('progresso_aulas')
        .select('*')
        .eq('usuario_id', usuario_id)
        .eq('aula_id', aula_id)
        .single()
    if (existing) {
        return await sb.from('progresso_aulas').update({ tempo_assistido, concluido }).eq('id', existing.id)
    } else {
        return await sb.from('progresso_aulas').insert({ usuario_id, aula_id, tempo_assistido, concluido })
    }
}

// Materiais
export async function sbGetMateriais() {
    return await sb.from('materiais').select('*').order('criado_em', { ascending: false })
}

export async function sbCriarMaterial({ nr_id, titulo, descricao, url, tipo, criado_por }) {
    return await sb.from('materiais').insert({ nr_id, titulo, descricao, url, tipo, criado_por })
}

// Notificações
export async function sbCriarNotificacao(usuario_id, titulo, mensagem, link) {
    return await sb.from('notificacoes').insert({ usuario_id, titulo, mensagem, link, lida: false })
}

// Provas
export async function sbEnviarProva(usuario_id, nr_id, titulo, url_arquivo) {
    return await sb.from('provas').insert({ usuario_id, nr_id, titulo, url_arquivo, status: 'pendente' })
}

export async function sbGetProvasPendentes() {
    return await sb.from('provas').select('*, profiles(nome_completo)').eq('status', 'pendente')
}

export async function sbCorrigirProva(id, nota, status) {
    return await sb.from('provas').update({ nota, status }).eq('id', id)
}

// Salas
export async function sbGetSalasAtivas() {
    return await sb.from('salas').select('*, profiles(nome_completo)').eq('ativa', true).order('criado_em', { ascending: false })
}

export async function sbCriarSala(topico, meet_id, criado_por) {
    return await sb.from('salas').insert({ topico, meet_id, criado_por, ativa: true })
}

// Notas
export async function sbGetNotasAluno(aluno_id) {
    return await sb.from('notas').select('*').eq('aluno_id', aluno_id)
}

export async function sbLancarNota(aluno_id, nr_id, nota, obs, professor_id) {
    return await sb.from('notas').insert({ aluno_id, nr_id, nota, obs, professor_id })
}

export async function sbGetMediasNRs() {
    // Exemplo: retorna média por NR
    return { data: [] }
}

// Upload de arquivos (Storage)
export const STORAGE_BUCKET = 'seu-bucket' // substitua pelo nome do seu bucket
export async function sbUploadArquivo(bucket, path, file) {
    return await sb.storage.from(bucket).upload(path, file)
}
