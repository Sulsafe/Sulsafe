// js/auth.js - VERSÃO CORRIGIDA
import { sb } from './supabase-client.js';
import { setUser, clearUser, isAuthenticated, ADMIN_EMAIL } from './state.js';

// ============================================================
// LOGIN
// ============================================================
export async function handleLogin(email, password) {
    try {
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.warn('❌ Tentativa de login falhou:', email);
            return { 
                success: false, 
                error: 'Email ou senha incorretos. Verifique suas credenciais.' 
            };
        }

        if (data?.user) {
            // Busca o perfil do usuário
            const { data: profile, error: profileError } = await sb
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.warn('⚠️ Usuário logado mas sem perfil:', profileError);

                // Tenta criar o perfil
                const { error: createError } = await sb
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        email: data.user.email,
                        nome_completo: data.user.user_metadata?.nome_completo || 'Usuário',
                        role: data.user.email === ADMIN_EMAIL ? 'admin' : 'user'
                    }]);

                if (createError) {
                    console.error('❌ Erro ao criar perfil:', createError);
                }
            }

            // Define o usuário no estado global
            setUser({
                id: data.user.id,
                email: data.user.email,
                role: data.user.email === ADMIN_EMAIL ? 'admin' : 'user',
                profile: profile || null
            });

            return { 
                success: true, 
                user: data.user,
                profile: profile || null
            };
        }

        return { success: false, error: 'Erro desconhecido no login' };
    } catch (error) {
        console.error('❌ Erro na função handleLogin:', error);
        return { 
            success: false, 
            error: 'Erro ao realizar login. Tente novamente.' 
        };
    }
}

// ============================================================
// CADASTRO
// ============================================================
export async function handleCadastro(email, password, nomeCompleto) {
    try {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome_completo: nomeCompleto,
                    role: 'user'
                }
            }
        });

        if (error) {
            console.error('❌ Erro no cadastro:', error);
            return { success: false, error: error.message };
        }

        if (data?.user) {
            // Cria o perfil do usuário
            const { error: profileError } = await sb
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    email: data.user.email,
                    nome_completo: nomeCompleto,
                    role: 'user'
                }]);

            if (profileError) {
                console.error('❌ Erro ao criar perfil:', profileError);
                return { 
                    success: false, 
                    error: 'Erro ao criar perfil. Tente novamente.' 
                };
            }

            return { 
                success: true, 
                user: data.user,
                message: 'Cadastro realizado com sucesso! Verifique seu email.' 
            };
        }

        return { success: false, error: 'Erro ao criar conta' };
    } catch (error) {
        console.error('❌ Erro na função handleCadastro:', error);
        return { success: false, error: 'Erro ao realizar cadastro' };
    }
}

// ============================================================
// LOGOUT
// ============================================================
export async function handleLogout() {
    try {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
        
        clearUser();
        return { success: true };
    } catch (error) {
        console.error('❌ Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// VERIFICA SESSÃO
// ============================================================
export async function checkAuth() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        
        if (session?.user) {
            // Busca o perfil
            const { data: profile } = await sb
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // Define usuário no estado
            const userData = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.email === ADMIN_EMAIL ? 'admin' : 'user',
                profile: profile || null
            };
            
            setUser(userData);

            return { 
                isAuthenticated: true, 
                user: session.user,
                profile: profile || null
            };
        }
        
        clearUser();
        return { isAuthenticated: false };
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        clearUser();
        return { isAuthenticated: false, error: error.message };
    }
}

// ============================================================
// LISTENER DE MUDANÇA DE AUTENTICAÇÃO
// ============================================================
export function initAuthListener() {
    console.log('🔐 Iniciando listener de autenticação...');
    
    sb.auth.onAuthStateChange(async (event, session) => {
        console.log('📡 Evento de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session) {
            console.log('✅ Usuário logou:', session.user.email);
            
            // Busca o perfil
            const { data: profile } = await sb
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setUser({
                id: session.user.id,
                email: session.user.email,
                role: session.user.email === ADMIN_EMAIL ? 'admin' : 'user',
                profile: profile || null
            });
            
            // Redireciona se estiver na página de login
            if (window.location.pathname.includes('login.html')) {
                window.location.href = '/index.html';
            }
        }

        if (event === 'SIGNED_OUT') {
            console.log('👋 Usuário deslogou');
            clearUser();
            
            // Redireciona para login se NÃO estiver lá
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/login.html';
            }
        }
    });
}
