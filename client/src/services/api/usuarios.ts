import type { Usuario, UsuarioInput } from "@/types/usuario";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function createUsuario(data: UsuarioInput): Promise<Usuario> {
  const response = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      senha: data.senha,
      papel: data.papel,
      ativo: data.ativo,
      nome: data.nome,
      nick: data.nick,
      short_nome: data.short_nome,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Dados inválidos. Verifique os campos e tente novamente.");
    }
    if (response.status === 409) {
      throw new Error("Este email já está cadastrado.");
    }
    if (response.status >= 500) {
      throw new Error("Erro no servidor. Tente novamente mais tarde.");
    }
    throw new Error("Erro ao criar usuário. Tente novamente.");
  }

  return response.json();
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const response = await fetch(`${BASE_URL}/usuarios`);

  if (!response.ok) {
    throw new Error("Erro ao carregar usuários.");
  }

  return response.json();
}
