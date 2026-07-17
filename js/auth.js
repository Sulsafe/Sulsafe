// 📁 auth.js - VERSÃO CORRIGIDA (sem criação automática de admin)

import { sb } from './supabase-client.js';
import { state } from './state.js';

// Constante ADMIN_EMAIL - mantenha apenas para verificação, NÃO para criar contas
const ADMIN_EMAIL = 'sulsafetreinamentos@gmail.com';

export async function handleLogin(email, password) {
    try {
        // Tenta fazer login normalmente
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.warn('Tentativa de login falhou:', email);
            return { 
                success: false, 
                error: 'Email ou senha incorretos. Verifique suas credenciais.' 
            };
        }

        // Login bem sucedido
        if (data?.user) {
            // Busca o perfil do usuário
            const { data: profile, error: profileError } = await sb
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.warn('Usuário logado mas sem perfil:', profileError);

                const { error: createError } = await sb
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        email: data.user.email,
                        nome_completo: data.user.user_metadata?.nome_completo || 'Usuário',
                        role: 'user'
                    }]);

                if (createError) {
                    console.error('Erro ao criar perfil:', createError);
                }
            }

        
            state.setUser({
                id: data.user.id,
                email: data.user.email,
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
        console.error('Erro na função handleLogin:', error);
        return { 
            success: false, 
            error: 'Erro ao realizar login. Tente novamente.' 
        };
    }
}

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
            console.error('Erro no cadastro:', error);
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
                console.error('Erro ao criar perfil:', profileError);
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
        console.error('Erro na função handleCadastro:', error);
        return { success: false, error: 'Erro ao realizar cadastro' };
    }
}

// Função de logout
export async function handleLogout() {
    try {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
        
        state.clearUser();
        return { success: true };
    } catch (error) {
        console.error('Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

// Verifica se usuário está logado
export async function checkAuth() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
            const { data: profile } = await sb
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            state.setUser({
                id: session.user.id,
                email: session.user.email,
                profile: profile || null
            });

            return { 
                isAuthenticated: true, 
                user: session.user,
                profile: profile || null
            };
        }
        return { isAuthenticated: false };
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return { isAuthenticated: false, error: error.message };
    }
}
