// ============================================================
// AUTH - LOGIN, CADASTRO, LOGOUT, RECUPERAÇÃO
// ============================================================
import { sb } from './supabase-client.js'
import { S, loadCfg, toast, handleError, sanitizar, showT } from './utils.js'
import { enterDash } from './app.js' // <-- importa do app.js

// Funções auxiliares locais (ou você pode exportá-las do supabase-client.js)
async function sbGetUser(id) {
    const { data, error } = await sb
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

async function sbUpdateUser(id, updates) {
    const { data, error } = await sb
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function handleLogin(email, password) {
    try {
        const { data: authData, error: authError } = await sb.auth.signInWithPassword({
            email: email,
            password: password
        })
        if (authError) {
            // Tenta criar admin se for o email admin
            if (email === ADMIN_EMAIL) {
                const { data: signUpData, error: signUpError } = await sb.auth.signUp({
                    email,
                    password,
                    options: { data: { nome_completo: 'Administrador SulSafe', role: 'admin' } }
                })
                if (signUpError) throw signUpError
                const userId = signUpData.user.id
                await sbUpdateUser(userId, { role: 'admin', status: 'ativo' })
                const { data: loginData, error: loginError } = await sb.auth.signInWithPassword({ email, password })
                if (loginError) throw loginError
                const user = await sbGetUser(loginData.user.id)
                S.user = user
                localStorage.setItem('ss_session', JSON.stringify({ id: user.id }))
                localStorage.setItem('ss_user', JSON.stringify(user))
                loadCfg()
                enterDash()
                toast('Conta admin criada! Bem-vindo!')
                return
            }
            throw new Error('Email ou senha incorretos')
        }
        // Busca perfil
        let user
        try {
            user = await sbGetUser(authData.user.id)
        } catch (e) {
            // Se não existir, cria perfil básico
            await sbUpdateUser(authData.user.id, {
                nome_completo: authData.user.user_metadata?.nome_completo || 'Usuário',
                role: authData.user.user_metadata?.role || 'aluno',
                status: 'ativo'
            })
            user = await sbGetUser(authData.user.id)
        }
        if (user.status === 'pendente' && user.role === 'aluno') {
            throw new Error('Aguardando aprovação do administrador')
        }
        if (user.status === 'bloqueado') throw new Error('Usuário bloqueado')
        S.user = user
        localStorage.setItem('ss_session', JSON.stringify({ id: user.id }))
        localStorage.setItem('ss_user', JSON.stringify(user))
        loadCfg()
        enterDash()
        toast('Bem-vindo(a), ' + user.nome_completo + '!', 'success')
    } catch (error) {
        handleError(error)
    }
}

export async function handleCadastro(nome, email, password, confirmPassword, termos) {
    if (!termos) { toast('Você precisa aceitar os termos de uso', 'err'); return }
    if (password !== confirmPassword) { toast('As senhas não coincidem', 'err'); return }
    if (password.length < 6) { toast('Senha deve ter no mínimo 6 caracteres', 'err'); return }
    if (!nome) { toast('Nome é obrigatório', 'err'); return }
    try {
        const role = email === ADMIN_EMAIL ? 'admin' : 'aluno'
        const { data: authData, error: authError } = await sb.auth.signUp({
            email,
            password,
            options: { data: { nome_completo: nome, role: role } }
        })
        if (authError) throw authError
        const userId = authData.user.id
        // Cria perfil
        await sbUpdateUser(userId, {
            nome_completo: nome,
            role: role,
            status: role === 'admin' ? 'ativo' : 'pendente'
        })
        const user = await sbGetUser(userId)
        if (role === 'admin') {
            S.user = user
            localStorage.setItem('ss_session', JSON.stringify({ id: user.id }))
            localStorage.setItem('ss_user', JSON.stringify(user))
            loadCfg()
            enterDash()
            toast('Conta admin criada!', 'success')
        } else {
            toast('Cadastro realizado! Aguarde aprovação.', 'info')
            showT('tLogin')
            toast('Enviamos um email de confirmação para ' + email, 'info')
        }
    } catch (error) {
        handleError(error)
    }
}

export async function logout() {
    try {
        await sb.auth.signOut()
    } catch (e) {}
    S.user = null
    localStorage.removeItem('ss_session')
    localStorage.removeItem('ss_user')
    if (window.destroyCharts) window.destroyCharts()
    window.location.href = 'index.html'
}

export async function recuperarSenha() {
    const email = prompt('Digite seu email para recuperar a senha:')
    if (!email) return
    try {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        })
        if (error) throw error
        toast('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success')
    } catch (error) {
        handleError(error)
    }
}
