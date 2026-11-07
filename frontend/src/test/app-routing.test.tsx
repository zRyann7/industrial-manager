import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
function rotaDe(caminho: string) {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  return router.matchRoutes(caminho).at(-1)?.routeId;
}

describe("App routing", () => {
  it.each([
    "/",
    "/materiais",
    "/movimentacoes",
    "/fornecedores",
    "/solicitacoes",
    "/relatorios",
    "/configuracoes",
  ])("matches a page for %s instead of falling back to not found", (caminho) => {
    expect(rotaDe(caminho)).not.toBe(rootRouteId);
  });

  it("falls back to not found for an unknown path", () => {
    expect(rotaDe("/nao-existe")).toBe(rootRouteId);
  });
});
