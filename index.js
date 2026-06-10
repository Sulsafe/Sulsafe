import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const supabase=createClient('https://dhhvhyieoattdhrdwkrt.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHZoeWllb2F0dGRocmR3a3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNDAsImV4cCI6MjA3MDQxMjA0MH0.YGLgdVdk6Garg8R4US9CFqNKbzVxoYRzITcfhA0eFBs')

const CONFIG={
    nomeEmpresa:'Sulsafe',
    logoUrl:'https://sulsafe.com.br/logo1.png' // ou a URL do teu logo
}

let usuarioAtual=null,usuarioId=null,perfilUsuario=null,ehProfessor=false,cursoAtual=null,arquivosSelecionados=[]

if(window.location.protocol==='file:'){const a=document.getElementById('avisoFileProtocol');if(a)a.style.display='block'}
document.getElementById('nomeEmpresa').innerText=CONFIG.nomeEmpresa
document.getElementById('dashEmpresaNome').innerText=CONFIG.nomeEmpresa
document.getElementById('logoText').innerText=CONFIG.nomeEmpresa
if(CONFIG.logoUrl){['logoIcon','logoIconCad','logoIconRec','dashLogoIcon'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.classList.add('has-img');el.innerHTML=`<img src="${CONFIG.logoUrl}" alt="logo">`})}
if(window.location.hash==='#cadastro')mostrarTela('cadastro')

supabase.auth.getSession().then(({data:{session}})=>{
    if(session?.user){
        usuarioAtual=session.user.email;usuarioId=session.user.id
        garantirPerfil(session.user).then(role=>{
            perfilUsuario=role;
            ehProfessor=(role==='admin'||role==='professor');
            document.getElementById('dashUserName').innerHTML=usuarioAtual
            atualizarPainelProfessor();entrarDashboard()
        })
    }
})
// RESTO DAS FUNÇÕES AQUI: login, logout, mostrarTela, etc

window.mostrarTela = function(tela) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'))
    document.getElementById('tela-' + tela).classList.add('ativa')
    window.location.hash = '#' + tela
}

window.login = async function() {
    const email = document.getElementById('loginEmail').value
    const senha = document.getElementById('loginSenha').value
    const btn = document.getElementById('btnLogin')
    btn.disabled = true; btn.innerText = 'Entrando...'
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    
    btn.disabled = false; btn.innerText = 'Entrar'
    if (error) return alert('Erro no login: ' + error.message)
    
    usuarioAtual = data.user.email
    usuarioId = data.user.id
    const role = await garantirPerfil(data.user)
    perfilUsuario = role
    ehProfessor = (role === 'admin' || role === 'professor')
    document.getElementById('dashUserName').innerHTML = usuarioAtual
    atualizarPainelProfessor()
    entrarDashboard()
}

window.logout = async function() {
    await supabase.auth.signOut()
    usuarioAtual = null; usuarioId = null; perfilUsuario = null; ehProfessor = false
    mostrarTela('login')
}

window.entrarDashboard = function() {
    mostrarTela('dashboard')
}

async function garantirPerfil(user) {
    let { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!perfil) {
        await supabase.from('profiles').insert({ id: user.id, email: user.email, role: 'aluno' })
        return 'aluno'
    }
    return perfil.role
}

window.atualizarPainelProfessor = function() {
    const painel = document.getElementById('painelProfessor')
    if (painel) painel.style.display = ehProfessor ? 'block' : 'none'
}

window.cadastrar = async function() {
    const email = document.getElementById('cadEmail').value
    const senha = document.getElementById('cadSenha').value
    const btn = document.getElementById('btnCad')
    btn.disabled = true; btn.innerText = 'Cadastrando...'
    
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    
    btn.disabled = false; btn.innerText = 'Cadastrar'
    if (error) return alert('Erro no cadastro: ' + error.message)
    alert('Cadastro feito! Confirma o email e faz login.')
    mostrarTela('login')
}
