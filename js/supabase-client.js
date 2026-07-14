// ============================================================
// SUPABASE CLIENT - VERSÃO CORRIGIDA
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://dhhvhiyoxadcwsfqlndw.supabase.co'

// ⚠️ ATENÇÃO: COPIE A CHAVE EXATA DO DASHBOARD
// Settings > API > Project API Keys > anon public
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoaXlveGFkY3dzZnFsbmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQ0NzIsImV4cCI6MjA5NjQ5MDQ3Mn0.3-We2KnsGekUMrDrG3F0qrP1ZCSwkG6sXcDUQ-ajuAQ'

console.log('🔑 Chave ANON carregada:', SUPABASE_ANON_KEY.substring(0, 20) + '...')

// ============================================================
// FETCH PERSONALIZADO - CORRIGIDO
// ============================================================
const customFetch = async (input, init = {}) => {
  // Monta os headers com a chave API
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,  // ← ESSENCIAL
    ...init?.headers
  }

  // Se for uma requisição autenticada, adiciona o token
  const session = localStorage.getItem('ss_session')
  if (session) {
    try {
      const { access_token } = JSON.parse(session)
      if (access_token) {
        headers['Authorization'] = `Bearer ${access_token}`
      }
    } catch (e) {
      // Ignora erro de parsing
    }
  }

  const options = {
    ...init,
    credentials: 'include',
    headers: headers
  }

  console.log('📡 Fetch:', typeof input === 'string' ? input : input.url)
  console.log('🔑 Headers enviados:', { 
    'apikey': headers['apikey'].substring(0, 20) + '...',
    'Authorization': headers['Authorization'] ? 'Bearer ***' : 'Não enviado'
  })

  const response = await fetch(input, options)
  console.log('📡 Response status:', response.status)
  
  if (response.status === 401) {
    console.error('❌ ERRO 401 - Chave API inválida ou não enviada')
    console.error('🔑 Verifique se a chave ANON está correta no Dashboard')
  }
  
  return response
}

// ============================================================
// CLIENTE SUPABASE
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

console.log('✅ Supabase client inicializado')

// ============================================================
// TESTE RÁPIDO DE CONEXÃO
// ============================================================
export async function testConnection() {
  try {
    console.log('🔄 Testando conexão com Supabase...')
    const { data, error } = await sb.auth.getSession()
    if (error) {
      console.error('❌ Erro:', error)
      return false
    }
    console.log('✅ Conexão OK!')
    return true
  } catch (e) {
    console.error('❌ Falha:', e.message)
    return false
  }
}

// ============================================================
// TESTE DA CHAVE API
// ============================================================
export async function testApiKey() {
  try {
    console.log('🔄 Testando chave API...')
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    })
    console.log('📡 Status da API:', response.status)
    if (response.status === 200) {
      console.log('✅ Chave API VÁLIDA!')
      return true
    } else if (response.status === 401) {
      console.error('❌ Chave API INVÁLIDA! Verifique no Dashboard.')
      return false
    }
  } catch (e) {
    console.error('❌ Erro no teste:', e.message)
    return false
  }
}

// ============================================================
// FUNÇÕES DE ACESSO AO BANCO
// ============================================================

export async function sbGetUser(id) {
  console.log('🔍 Buscando usuário:', id)
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

// Dashboard
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

// Videoaulas
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

// Progresso
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

// Materiais
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

// Notificações
export async function sbCriarNotificacao(usuario_id, titulo, mensagem, link) {
  const { data, error } = await sb
    .from('notificacoes')
    .insert({ usuario_id, titulo, mensagem, link, lida: false })
  if (error) throw error
  return { data }
}

// Provas
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

// Salas
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

// Notas
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

// Storage
export const STORAGE_BUCKET = 'sulsafe-arquivos'

export async function sbUploadArquivo(bucket, path, file) {
  const { data, error } = await sb.storage.from(bucket).upload(path, file)
  if (error) throw error
  return { data }
}

// Certificados
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
