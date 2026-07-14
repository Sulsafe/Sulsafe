// ============================================================
// SUPABASE CLIENT - CONFIGURAÇÃO E EXPORTAÇÕES
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://dhhvhiyoxadcwsfqlndw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ'

// ============================================================
// FETCH PERSONALIZADO COM CREDENTIALS
// ============================================================
const customFetch = async (input, init = {}) => {
  const options = {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    }
  }
  return fetch(input, options)
}

// ============================================================
// CLIENTE SUPABASE COM FETCH PERSONALIZADO
// ============================================================
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // @ts-ignore
  fetch: customFetch
})

// ============================================================
// FUNÇÃO DE TESTE DE CONEXÃO COM RETRY
// ============================================================
export async function testConnection(retries = 5, delay = 1000) {
  console.log(`🔄 Testando conexão com Supabase... (${retries} tentativas)`)

  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await sb.auth.getSession()
      if (!error) {
        console.log('✅ Conexão com Supabase estabelecida!')
        return true
      }
      console.warn(`⚠️ Tentativa ${i + 1}/${retries} falhou:`, error?.message || 'Erro desconhecido')
    } catch (e) {
      console.warn(`⚠️ Tentativa ${i + 1}/${retries} falhou:`, e.message)
    }

    if (i < retries - 1) {
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  console.error('❌ Falha ao conectar ao Supabase após várias tentativas')
  return false
}

// ============================================================
// USUÁRIOS
// ============================================================
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
  const { data, error } = await sb.from('usuarios').select('*')
  if (error) throw error
  return { data }
}

export async function sbGetAlunos() {
  const { data, error } = await sb.from('usuarios').select('*').eq('role', 'aluno')
  if (error) throw error
  return { data }
}

export async function sbGetPendentes() {
  const { data, error } = await sb.from('usuarios').select('*').eq('status', 'pendente')
  if (error) throw error
  return { data }
}

export async function sbLiberarUsuario(id) {
  const { data, error } = await sb.from('usuarios').update({ status: 'ativo' }).eq('id', id)
  if (error) throw error
  return { data }
}

// ============================================================
// DASHBOARD
// ============================================================
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

// ============================================================
// VIDEOAULAS
// ============================================================
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

// ============================================================
// PROGRESSO
// ============================================================
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

// ============================================================
// MATERIAIS
// ============================================================
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

// ============================================================
// NOTIFICAÇÕES
// ============================================================
export async function sbCriarNotificacao(usuario_id, titulo, mensagem, link) {
  const { data, error } = await sb
    .from('notificacoes')
    .insert({ usuario_id, titulo, mensagem, link, lida: false })
  if (error) throw error
  return { data }
}

// ============================================================
// PROVAS
// ============================================================
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

// ============================================================
// SALAS
// ============================================================
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

// ============================================================
// NOTAS
// ============================================================
export async function sbGetNotasAluno(aluno_id) {
  const { data, error } = await sb
    .from('notas')
    .select('*')
    .eq('aluno_id', aluno_id)
  if (error) throw error
  return { data }
}

export async function sbLancarNota(aluno_id, nr_id, nota, obs, professor_id) {
  const { data, error } = await sb
    .from('notas')
    .insert({ aluno_id, nr_id, nota, obs, professor_id })
  if (error) throw error
  return { data }
}

export async function sbGetMediasNRs() {
  return { data: [] }
}

// ============================================================
// STORAGE (UPLOAD DE ARQUIVOS)
// ============================================================
export const STORAGE_BUCKET = 'sulsafe-arquivos'

export async function sbUploadArquivo(bucket, path, file) {
  const { data, error } = await sb.storage.from(bucket).upload(path, file)
  if (error) throw error
  return { data }
}

// ============================================================
// CERTIFICADOS
// ============================================================
export async function sbGetCertificados(userId) {
  const { data, error } = await sb
    .from('certificados')
    .select('*')
    .eq('user_id', userId)
    .eq('revogado', false)
    .order('emitido_em', { ascending: false })
  if (error) throw error
  return { data }
}

export async function sbGerarCertificado(userId, nrId, titulo) {
  const { data, error } = await sb
    .from('certificados')
    .insert({
      user_id: userId,
      nr_id: nrId,
      titulo: titulo,
      emitido_em: new Date().toISOString(),
      revogado: false
    })
  if (error) throw error
  return { data }
}
