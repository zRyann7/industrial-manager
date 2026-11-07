import { createFileRoute } from "@tanstack/react-router";

import { EmConstrucao } from "@/components/estado";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · Greenish ERP Têxtil" }] }),
  component: () => (
    <>
      <PageHeader titulo="Relatórios" />
      <EmConstrucao
        titulo="Relatórios em construção"
        descricao="Aqui entrarão consumo por período, giro de estoque e itens parados."
      />
    </>
  ),
});
