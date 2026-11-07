import axios from "axios";

import { getToken, setToken } from "./auth-store";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/";

/** Cliente único da API Django. Todas as chamadas de dados e de login passam por aqui. */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

// Anexa o JWT em toda requisição autenticada.
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// Token expirado/inválido: derruba a sessão e o app volta para a tela de login.
// (Um 401 no próprio login significa "credenciais erradas", não sessão expirada.)
http.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => {
    if (
      axios.isAxiosError(erro) &&
      erro.response?.status === 401 &&
      !erro.config?.url?.includes("auth/login")
    ) {
      setToken(null);
    }
    return Promise.reject(erro);
  },
);
