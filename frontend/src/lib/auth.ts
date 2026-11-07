import { useSyncExternalStore } from "react";

import { assinarToken, getToken, setToken } from "./auth-store";
import { http } from "./http";

/** Nome do campo de usuário esperado pelo seu serializer de login (SimpleJWT usa "username"). */
const CAMPO_USUARIO = "username";

interface RespostaLogin {
  access?: string;
  token?: string;
}

/** Autentica no Django e guarda o JWT. Aceita `{ access }` (SimpleJWT) ou `{ token }`. */
export async function entrar(usuario: string, senha: string): Promise<void> {
  const { data } = await http.post<RespostaLogin>("auth/login/", {
    [CAMPO_USUARIO]: usuario,
    password: senha,
  });
  const jwt = data.access ?? data.token;
  if (!jwt) throw new Error("A API não devolveu um token JWT em /auth/login/.");
  setToken(jwt);
}

export function sair() {
  setToken(null);
}

/**
 * `undefined` = ainda não sabemos (renderização no servidor / hidratação),
 * `null` = sem sessão, `string` = JWT ativo.
 */
export function useToken(): string | null | undefined {
  return useSyncExternalStore(assinarToken, getToken, () => undefined);
}
