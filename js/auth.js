import { supabase } from "./supabaseClient.js";

/**
 * Registra um novo usuário
 */
export async function signUp({ nome, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Faz login do usuário
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Faz logout do usuário
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Obtém o usuário atual
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Monitora mudanças no estado de autenticação
 */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

/**
 * Solicita recuperação de senha
 * Envia um link de redefinição para o e-mail do usuário
 */
export async function requestPasswordReset(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://netofrazao-dev.github.io/chamada-de-turma-pra-vender/?view=reset-password"
  });

  if (error) throw error;
  return data;
}

/**
 * Atualiza a senha do usuário
 * Deve ser chamado após validar o token de redefinição
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

/**
 * Verifica se há um token de redefinição de senha na URL
 */
export function getPasswordResetToken() {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const type = params.get("type");
  const token = params.get("access_token");

  if (type === "recovery" && token) {
    return token;
  }

  return null;
}

/**
 * Verifica se o usuário está autenticado via token de redefinição
 */
export async function verifyPasswordResetToken(token) {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  } catch (error) {
    return null;
  }
}