import { isAxiosError } from "axios";

import { API_URL } from "./http";

/** Extrai a mensagem do formato padrão de erro do DRF ({ detail }, { campo: ["msg"] }, lista). */
function detalheDrf(dados: unknown): string | null {
  if (typeof dados === "string") return dados.length < 200 ? dados : null;
  if (Array.isArray(dados)) return typeof dados[0] === "string" ? dados[0] : null;
  if (dados && typeof dados === "object") {
    const obj = dados as Record<string, unknown>;
    if (typeof obj["detail"] === "string") return obj["detail"];
    for (const valor of Object.values(obj)) {
      const achado = detalheDrf(valor);
      if (achado) return achado;
    }
  }
  return null;
}

/** Mensagem em português para qualquer erro de chamada à API. */
export function explicarErro(erro: unknown): string {
  if (isAxiosError(erro)) {
    if (!erro.response) {
      return `Não foi possível falar com a API (${API_URL}). Confira se o Django está rodando e se o CORS libera esta origem.`;
    }
    const { status, data } = erro.response;
    if (status === 401) return "Sessão expirada. Entre novamente.";
    if (status === 403) return "Seu usuário não tem permissão para acessar este recurso.";
    if (status === 404) return "Endpoint não encontrado. Confira as rotas da API em /api/v1/.";
    if (status >= 500) return "A API retornou um erro interno. Veja o log do Django.";
    return detalheDrf(data) ?? `A API recusou a requisição (HTTP ${status}).`;
  }
  return erro instanceof Error ? erro.message : "Erro inesperado.";
}
