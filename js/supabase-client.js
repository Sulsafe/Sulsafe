
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://dhhvhiyoxadcwsfqlndw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ'
const isDevelopment = import.meta.env?.DEV || false

if (isDevelopment) {
    console.log('🔑 Chave ANON carregada:', SUPABASE_ANON_KEY.substring(0, 20) + '...')
}

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token'
    }
})

if (isDevelopment) {
    console.log('✅ Supabase client inicializado')
}

export async function testConnection() {
    try {
        if (isDevelopment) console.log('🔄 Testando conexão com Supabase...')
        const { data, error } = await sb.auth.getSession()
        if (error) {
            console.error('❌ Erro:', error)
            return false
        }
        if (isDevelopment) console.log('✅ Conexão OK!')
        return true
    } catch (e) {
        console.error('❌ Falha:', e.message)
        return false
    }
}

// ============================================================
// FUNÇÕES DE ACESSO AO BANCO - CORRIGIDAS
// ============================================================

// ---------- PROFILES ----------
export async function sbGetUser(id) {
    if (isDevelopment) console.log('🔍 Buscando usuário na tabela profiles:', id)
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export async function sbUpdateUser(id, updates) {
    const { data, error } = await sb
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function sbGetAllUsers() {
    const { data, error } = await sb.from('profiles').select('*')
    if (error) throw error
    return { data }
}

export async function sbGetAlunos() {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('role', 'aluno')
    if (error) throw error
    return { data }
}

export async function sbGetPendentes() {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('status', 'pendente')
    if (error) throw error
    return { data }
}

export async function sbLiberarUsuario(id) {
    const { data, error } = await sb
        .from('profiles')
        .update({ status: 'ativo' })
        .eq('id', id)
    if (error) throw error
    return { data }
}

// ---------- DASHBOARD ----------
export async function sbGetDashboardMetrics() {
    return { 
        data: { 
            total_usuarios: 0, 
            total_alunos: 0, 
            total_professores: 0, 
            pendentes: 0, 
            provas_pendentes: 0, 
            total_concluidas: 0 
        } 
    }
}

export async function sbGetRankingAlunos() {
    return { data: [] }
}

// ---------- VIDEOAULAS ----------
export async function sbGetVideoaulas() {
    const { data, error } = await sb
        .from('videoaulas')
        .select('*')
        .order('ordem', { ascending: true })
    if (error) throw error
    return { data }
}

export async function sbCriarVideoaula({ nr_id, titulo, descricao, url_video, duracao, ordem, criado_por }) {
    const { data, error } = await sb
        .from('videoaulas')
        .insert({ nr_id, titulo, descricao, url_video, duracao, ordem, criado_por })
    if (error) throw error
    return { data }
}

// ---------- PROGRESSO ----------
export async function sbGetProgressoUsuario(usuario_id) {
    const { data, error } = await sb
        .from('progresso_aulas')
        .select('*')
        .eq('usuario_id', usuario_id)
    if (error) throw error
    return { data }
}

export async function sbSalvarProgresso(usuario_id, aula_id, tempo_assistido, concluido) {
    const { data: existing } = await sb
        .from('progresso_aulas')
        .select('*')
        .eq('usuario_id', usuario_id)
        .eq('aula_id', aula_id)
        .single()

    if (existing) {
        const { data, error } = await sb
            .from('progresso_aulas')
            .update({ tempo_assistido, concluido })
            .eq('id', existing.id)
        if (error) throw error
        return { data }
    } else {
        const { data, error } = await sb
            .from('progresso_aulas')
            .insert({ usuario_id, aula_id, tempo_assistido, concluido })
        if (error) throw error
        return { data }
    }
}

// ---------- MATERIAIS ----------
export async function sbGetMateriais() {
    const { data, error } = await sb
        .from('materiais')
        .select('*')
        .order('id', { ascending: false })
    if (error) throw error
    return { data }
}

export async function sbCriarMaterial({ nr_id, titulo, descricao, url, tipo, criado_por }) {
    const { data, error } = await sb
        .from('materiais')
        .insert({ nr_id, titulo, descricao, url, tipo, criado_por })
    if (error) throw error
    return { data }
}

// ---------- NOTIFICAÇÕES ----------
export async function sbCriarNotificacao(usuario_id, titulo, mensagem, link) {
    const { data, error } = await sb
        .from('notificacoes')
        .insert({ usuario_id, titulo, mensagem, link, lida: false })
    if (error) throw error
    return { data }
}

// ---------- PROVAS ----------
export async function sbEnviarProva(usuario_id, nr_id, titulo, url_arquivo) {
    const { data, error } = await sb
        .from('provas')
        .insert({ usuario_id, nr_id, titulo, url_arquivo, status: 'pendente' })
    if (error) throw error
    return { data }
}

export async function sbGetProvasPendentes() {
    const { data, error } = await sb
        .from('provas')
        .select('*, profiles(nome_completo)')
        .eq('status', 'pendente')
    if (error) throw error
    return { data }
}

export async function sbCorrigirProva(id, nota, status) {
    const { data, error } = await sb
        .from('provas')
        .update({ nota, status })
        .eq('id', id)
    if (error) throw error
    return { data }
}

export async function sbGetProvasAluno(usuario_id) {
    const { data, error } = await sb
        .from('provas')
        .select('*')
        .eq('usuario_id', usuario_id)
    if (error) throw error
    return { data }
}

// ---------- SALAS ----------
export async function sbGetSalasAtivas() {
    const { data, error } = await sb
        .from('salas')
        .select('*, profiles(nome_completo)')
        .eq('ativa', true)
        .order('criado_em', { ascending: false })
    if (error) throw error
    return { data }
}

export async function sbCriarSala(topico, meet_id, criado_por) {
    const { data, error } = await sb
        .from('salas')
        .insert({ topico, meet_id, criado_por, ativa: true })
    if (error) throw error
    return { data }
}

// ---------- NOTAS - CORRIGIDO (usando usuario_id) ----------
export async function sbGetNotasAluno(usuario_id) {
    const { data, error } = await sb
        .from('notas')
        .select('*')
        .eq('usuario_id', usuario_id)  // 🔧 CORRIGIDO: era aluno_id
    if (error) throw error
    return { data }
}

export async function sbLancarNota(usuario_id, nr_id, nota, obs, professor_id) {
    const { data, error } = await sb
        .from('notas')
        .insert({ usuario_id, nr_id, nota, obs, professor_id })  // 🔧 CORRIGIDO: era aluno_id
    if (error) throw error
    return { data }
}

export async function sbGetMediasNRs() {
    return { data: [] }
}

// ---------- STORAGE ----------
export const STORAGE_BUCKET = 'sulsafe-arquivos'

export async function sbUploadArquivo(bucket, path, file) {
    const { data, error } = await sb.storage.from(bucket).upload(path, file)
    if (error) throw error
    return { data }
}

// ---------- CERTIFICADOS ----------
export async function sbGetCertificados(userId) {
    const { data, error } = await sb
        .from('certificados')
        .select('*')
        .eq('usuario_id', userId)  // 🔧 CORRIGIDO: era user_id
        .eq('revogado', false)
        .order('emitido_em', { ascending: false })
    if (error) throw error
    return { data }
}

export async function sbGerarCertificado(userId, nrId, titulo) {
    const { data, error } = await sb
        .from('certificados')
        .insert({
            usuario_id: userId,  // 🔧 CORRIGIDO: era user_id
            nr_id: nrId,
            titulo: titulo,
            emitido_em: new Date().toISOString(),
            revogado: false
        })
    if (error) throw error
    return { data }
}

// ---------- UTILITÁRIO: Limpar logs em produção ----------
export function isDev() {
    return isDevelopment
}
