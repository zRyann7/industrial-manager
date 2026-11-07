import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Resposta 4xx da API (401, 403, 404…) não melhora com nova tentativa.
        retry: (tentativas, erro) =>
          tentativas < 2 && !(isAxiosError(erro) && (erro.response?.status ?? 500) < 500),
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
