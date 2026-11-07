import { createFileRoute } from "@tanstack/react-router";

import { EmConstrucao } from "@/components/estado";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · Greenish ERP Têxtil" }] }),
  component: () => (
    <>
      <PageHeader titulo="Configurações" />
      <EmConstrucao
        titulo="Configurações em construção"
        descricao="Aqui entrarão usuários, categorias, unidades de medida e estoque mínimo padrão."
      />
    </>
  ),
});
