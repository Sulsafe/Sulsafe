// ============================================================
// SUPABASE CLIENT - CONFIGURAÇÃO E FUNÇÕES DE ACESSO
// ============================================================
// CORREÇÃO: importação correta do createClient
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://seu-projeto.supabase.co' // SUBSTITUA PELO SEU URL
const SUPABASE_ANON_KEY = 'sua-chave-anon' // SUBSTITUA PELA SUA CHAVE

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const STORAGE_BUCKET = 'sulsafe'

// ============================================================
// FUNÇÕES DE ACESSO AOS DADOS
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

export async function sbGetPendentes() {
    return await sb.from('usuarios').select('*').eq('status', 'pendente')
}

export async function sbLiberarUsuario(id) {
    return await sb.from('usuarios').update({ status: 'ativo' }).eq('id', id).select().single()
}

// Dashboard
export async function sbGetDashboardMetrics() {
    const { data: total_usuarios } = await sb.from('usuarios').select('*', { count: 'exact', head: true })
    const { data: total_alunos } = await sb.from('usuarios').select('*', { count: 'exact', head: true }).eq('role', 'aluno')
    const { data: total_professores } = await sb.from('usuarios').select('*', { count: 'exact', head: true }).eq('role', 'professor')
    const { data: pendentes } = await sb.from('usuarios').select('*', { count: 'exact', head: true }).eq('status', 'pendente')
    const { data: provas_pendentes } = await sb.from('provas').select('*', { count: 'exact', head: true }).eq('status', 'pendente')
    const { data: total_concluidas } = await sb.from('progresso_aulas').select('*', { count: 'exact', head: true }).eq('concluido', true)
    return {
        data: {
            total_usuarios,
            total_alunos,
            total_professores,
            pendentes,
            provas_pendentes,
            total_concluidas
        }
    }
}

export async function sbGetRankingAlunos() {
    const { data: usuarios } = await sb.from('usuarios').select('id, nome_completo').eq('role', 'aluno')
    if (!usuarios) return { data: [] }
    const ranking = []
    for (const u of usuarios) {
        const { data: progressos } = await sb.from('progresso_aulas').select('concluido').eq('usuario_id', u.id)
        const total = progressos?.length || 0
        const concluidos = progressos?.filter(p => p.concluido === true).length || 0
        const pct = total ? Math.round((concluidos / total) * 100) : 0
        ranking.push({ ...u, progresso: pct })
    }
    ranking.sort((a, b) => b.progresso - a.progresso)
    return { data: ranking }
}

// Videoaulas
export async function sbGetVideoaulas() {
    return await sb.from('videoaulas').select('*').order('ordem')
}

export async function sbCriarVideoaula(dados) {
    return await sb.from('videoaulas').insert(dados).select().single()
}

// Progresso
export async function sbGetProgressoUsuario(usuarioId) {
    return await sb.from('progresso_aulas').select('*').eq('usuario_id', usuarioId)
}

export async function sbSalvarProgresso(usuarioId, aulaId, tempo, concluido) {
    const { data: existente } = await sb
        .from('progresso_aulas')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('aula_id', aulaId)
        .single()
    if (existente) {
        return await sb
            .from('progresso_aulas')
            .update({ tempo_assistido: tempo, concluido })
            .eq('id', existente.id)
    } else {
        return await sb
            .from('progresso_aulas')
            .insert({ usuario_id: usuarioId, aula_id: aulaId, tempo_assistido: tempo, concluido })
    }
}

// Materiais
export async function sbGetMateriais() {
    return await sb.from('materiais').select('*').order('criado_em', { ascending: false })
}

export async function sbCriarMaterial(dados) {
    return await sb.from('materiais').insert(dados).select().single()
}

export async function sbUploadArquivo(bucket, path, file) {
    return await sb.storage.from(bucket).upload(path, file)
}

// Salas
export async function sbGetSalasAtivas() {
    return await sb.from('salas').select('*, profiles(nome_completo)').eq('ativa', true).order('created_at', { ascending: false })
}

export async function sbCriarSala(topico, meetId, criadoPor) {
    return await sb.from('salas').insert({ topico, meet_id: meetId, criado_por: criadoPor, ativa: true }).select().single()
}

// Notificações
export async function sbCriarNotificacao(usuarioId, titulo, mensagem, link) {
    return await sb.from('notificacoes').insert({
        usuario_id: usuarioId,
        titulo,
        mensagem,
        link,
        lida: false
    })
}

// Alunos
export async function sbGetAlunos() {
    return await sb.from('usuarios').select('id, nome_completo, email').eq('role', 'aluno')
}

// Notas
export async function sbGetNotasAluno(alunoId) {
    return await sb.from('notas').select('*').eq('aluno_id', alunoId).order('criado_em', { ascending: false })
}

export async function sbLancarNota(alunoId, nrId, nota, obs, professorId) {
    return await sb.from('notas').insert({
        aluno_id: alunoId,
        nr_id: nrId,
        nota,
        obs,
        professor_id: professorId
    }).select().single()
}

export async function sbGetMediasNRs() {
    const { data: notas } = await sb.from('notas').select('nr_id, nota')
    const medias = {}
    notas.forEach(n => {
        if (!medias[n.nr_id]) medias[n.nr_id] = { total: 0, count: 0 }
        medias[n.nr_id].total += Number(n.nota || 0)
        medias[n.nr_id].count++
    })
    const resultado = Object.keys(medias).map(nr_id => ({
        nr_id,
        media_nota: medias[nr_id].total / medias[nr_id].count
    }))
    return { data: resultado }
}

// Provas
export async function sbEnviarProva(alunoId, nrId, titulo, url) {
    return await sb.from('provas').insert({
        aluno_id: alunoId,
        nr_id: nrId,
        titulo,
        url,
        status: 'pendente'
    }).select().single()
}

export async function sbGetProvasPendentes() {
    return await sb.from('provas').select('*, profiles(nome_completo)').eq('status', 'pendente')
}

export async function sbGetProvasAluno(alunoId) {
    return await sb.from('provas').select('*').eq('aluno_id', alunoId).order('criado_em', { ascending: false })
}

export async function sbCorrigirProva(provaId, nota, status) {
    return await sb.from('provas').update({ nota, status }).eq('id', provaId)
}

// Certificados
export async function sbGetCertificados(usuarioId) {
    return await sb.from('certificados').select('*').eq('usuario_id', usuarioId).order('emitido_em', { ascending: false })
}

export async function sbGerarCertificado(usuarioId, nrId, titulo) {
    return await sb.from('certificados').insert({
        usuario_id: usuarioId,
        nr_id: nrId,
        titulo,
        emitido_em: new Date().toISOString(),
        revogado: false
    }).select().single()
}
