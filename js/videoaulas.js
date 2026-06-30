import { S } from './state.js'
import { sb } from './supabase-client.js'
// import { toast } from './app.js' //
export async function vVideoaulas() {
 const mc = document.getElementById('mc')
const { data: { user } } = await sb.auth.getUser()
const { data: perfil } = await sb.from('usuarios').select('tipo_usuario').eq('id', user.id).single()
const isAdmin = perfil?.tipo_usuario === 'admin'
const isAdmin = perfil?.tipo_usuario === 'admin'
console.log('DEBUG ADMIN:', isAdmin, perfil, user.email) 
  
  const { data: videoaulas } = await sb
    .from('videoaulas')
    .select('*')

  // 2. LISTA DAS 38 NRs
const nrs = [
  { num: 1, nome: 'Disposições Gerais', icon: 'fa-book' },
  { num: 2, nome: 'Inspeção Prévia', icon: 'fa-search' },
  { num: 3, nome: 'Embargo ou Interdição', icon: 'fa-ban' },
  { num: 4, nome: 'SESMT', icon: 'fa-user-shield' },
  { num: 5, nome: 'CIPA', icon: 'fa-users' },
  { num: 6, nome: 'EPI', icon: 'fa-hard-hat' },
  { num: 7, nome: 'PCMSO', icon: 'fa-heartbeat' },
  { num: 8, nome: 'Edificações', icon: 'fa-building' },
  { num: 9, nome: 'Avaliação e Controle', icon: 'fa-chart-line' },
  { num: 10, nome: 'Segurança em Instalações', icon: 'fa-bolt' },
  { num: 11, nome: 'Transporte e Movimentação', icon: 'fa-truck' },
  { num: 12, nome: 'Máquinas e Equipamentos', icon: 'fa-cogs' },
  { num: 13, nome: 'Caldeiras e Vasos', icon: 'fa-fire' },
  { num: 14, nome: 'Fornos', icon: 'fa-temperature-high' },
  { num: 15, nome: 'Atividades Insalubres', icon: 'fa-biohazard' },
  { num: 16, nome: 'Atividades Perigosas', icon: 'fa-radiation' },
  { num: 17, nome: 'Ergonomia', icon: 'fa-chair' },
  { num: 18, nome: 'Construção', icon: 'fa-hard-hat' },
  { num: 19, nome: 'Explosivos', icon: 'fa-bomb' },
  { num: 20, nome: 'Líquidos Combustíveis', icon: 'fa-gas-pump' },
  { num: 21, nome: 'Trabalhos a Céu Aberto', icon: 'fa-sun' },
  { num: 22, nome: 'Segurança em Mineração', icon: 'fa-mountain' },
  { num: 23, nome: 'Proteção Contra Incêndios', icon: 'fa-fire-extinguisher' },
  { num: 24, nome: 'Condições Sanitárias', icon: 'fa-restroom' },
  { num: 25, nome: 'Resíduos Industriais', icon: 'fa-trash' },
  { num: 26, nome: 'Sinalização', icon: 'fa-sign' },
  { num: 27, nome: 'Registro Profissional', icon: 'fa-id-card' },
  { num: 28, nome: 'Fiscalização', icon: 'fa-user-check' },
  { num: 29, nome: 'Segurança em Portos', icon: 'fa-anchor' },
  { num: 30, nome: 'Segurança Aquaviária', icon: 'fa-ship' },
  { num: 31, nome: 'Trabalho Rural', icon: 'fa-tractor' },
  { num: 32, nome: 'Serviços de Saúde', icon: 'fa-hospital' },
  { num: 33, nome: 'Espaços Confinados', icon: 'fa-compress-arrows-alt' },
  { num: 34, nome: 'Trabalho em Altura', icon: 'fa-level-up-alt' },
  { num: 35, nome: 'Trabalho em Altura', icon: 'fa-arrows-alt-v' },
  { num: 36, nome: 'Abate e Processamento', icon: 'fa-industry' },
  { num: 37, nome: 'Plataformas de Petróleo', icon: 'fa-oil-can' },
  { num: 38, nome: 'Limpeza Urbana', icon: 'fa-broom' }
]

  // 3. MONTA O HTML - SEM FORMZÃO GLOBAL
  let html = `
    <div class="page-hd">
      <h2><i class="fas fa-video"></i> Videoaulas por NR</h2>
      <p class="sub">${isAdmin ? 'Gerencie os links de cada NR' : 'Assista às videoaulas disponíveis'}</p>
    </div>
    <div class="grid-nrs">
  `

  nrs.forEach(nr => {
    const video = videoaulas?.find(v => v.nr === nr.num)
    const link = video?.link_youtube || ''
    
    html += `
      <div class="card-nr" data-nr="${nr.num}">
        <div class="card-nr-hd">
          <div class="nr-badge">
            <i class="fas ${nr.icon}"></i>
            <span>NR ${nr.num}</span>
          </div>
          <h4>${nr.nome}</h4>
        </div>

        ${isAdmin ? `
          <div class="admin-area">
            <label>Link do YouTube (embed)</label>
            <input type="text" 
                   class="input-link" 
                   placeholder="https://youtube.com/embed/..." 
                   value="${link}">
            <button class="btn btn-sm btn-p btn-salvar" data-nr="${nr.num}">
              <i class="fas fa-save"></i> ${link ? 'Atualizar' : 'Salvar'} Link
            </button>
          </div>
        ` : ''}

        <div class="aluno-area">
          ${link ? `
            <button class="btn btn-p btn-block btn-assistir" data-link="${link}" data-nr="${nr.num}">
              <i class="fas fa-play"></i> Assistir
            </button>
          ` : `
            <div class="sem-video">
              <i class="fas fa-clock"></i>
              <span>Nenhuma videoaula disponível</span>
            </div>
          `}
        </div>
      </div>
    `
  })

  html += '</div>'
  mc.innerHTML = html

  // 4. EVENTOS
  if (isAdmin) {
    document.querySelectorAll('.btn-salvar').forEach(btn => {
      btn.onclick = async (e) => {
        const nr = parseInt(e.target.dataset.nr)
        const card = e.target.closest('.card-nr')
        const input = card.querySelector('.input-link')
        const link = input.value.trim()
        
        if (!link) return toast('Cola um link válido', 'error')
        if (!link.includes('youtube.com/embed/') && !link.includes('youtu.be/')) {
          return toast('Use link embed do YouTube', 'error')
        }

        e.target.disabled = true
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'

        const { error } = await sb.from('videoaulas').upsert({
          nr: nr,
          link_youtube: link,
          atualizado_em: new Date().toISOString()
        })

        if (error) {
          toast('Erro ao salvar: ' + error.message, 'error')
          e.target.disabled = false
          e.target.innerHTML = '<i class="fas fa-save"></i> Salvar Link'
          return
        }

        toast(`Link da NR ${nr} salvo!`, 'success')
        vVideoaulas() // Recarrega a view
      }
    })
  }

  document.querySelectorAll('.btn-assistir').forEach(btn => {
    btn.onclick = (e) => {
      const link = e.currentTarget.dataset.link
      const nr = e.currentTarget.dataset.nr
      abrirModalVideo(link, nr)
    }
  })
}

function abrirModalVideo(link, nr) {
  const mdlBg = document.getElementById('mdlBg')
  const mdlBox = document.getElementById('mdlBox')
  
  // Garante que é embed
  let embedLink = link
  if (link.includes('watch?v=')) {
    embedLink = link.replace('watch?v=', 'embed/')
  } else if (link.includes('youtu.be/')) {
    embedLink = link.replace('youtu.be/', 'youtube.com/embed/')
  }
  
  mdlBox.innerHTML = `
    <div class="mdl-hd">
      <h3><i class="fas fa-play-circle"></i> NR ${nr} - Videoaula</h3>
      <button class="mdl-x" onclick="window.closeMdl()"><i class="fas fa-times"></i></button>
    </div>
    <div class="mdl-bd" style="padding:0;background:#000">
      <iframe width="100%" height="500" 
              src="${embedLink}?autoplay=1" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
    </div>
  `
  mdlBg.classList.add('show')
}

window.closeMdl = () => {
  document.getElementById('mdlBg').classList.remove('show')
  // Para o vídeo ao fechar
  document.querySelector('#mdlBox iframe')?.remove()
}
// Toast local
function toast(msg, type = 'info') {
  const t = document.getElementById('toast')
  if (!t) return console.log(msg)
  
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.innerHTML = `<i class="fas fa-${type === 'error' ? 'times-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${msg}`
  t.appendChild(el)
  
  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3000)
}
