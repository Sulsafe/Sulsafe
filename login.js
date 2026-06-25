document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    alert('Erro: ' + error.message)
    return
  }
  
  // Se login ok, redireciona pro painel
  window.location.href = '/admin.html'
})

// Verifica se já tá logado
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = '/admin.html'
  }
})
