import { Link, createFileRoute } from "@tanstack/react-router";

import { ErroCarregar } from "@/components/estado";
import { PageHeader } from "@/components/page-header";
import { SituacaoBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSolicitacoes } from "@/lib/estoque-api";
import { fmtDataHora } from "@/lib/format";

export const Route = createFileRoute("/solicitacoes")({
  head: () => ({
    meta: [
      { title: "Solicitações de compra · Greenish ERP Têxtil" },
      { name: "description", content: "Pedidos de reposição abertos a partir do estoque." },
    ],
  }),
  component: Solicitacoes,
});

function Solicitacoes() {
  const consulta = useSolicitacoes();
  const itens = consulta.data;

  return (
    <>
      <PageHeader
        titulo="Solicitações de compra"
        descricao="Reposições pedidas a partir do dashboard"
      />

      {consulta.error && (
        <ErroCarregar erro={consulta.error} onTentar={() => void consulta.refetch()} />
      )}

      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Material", "Solicitada em", "Situação"].map((c) => (
                  <th key={c} scope="col" className="label-mono px-5 py-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consulta.isPending &&
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td colSpan={3} className="px-5 py-3.5">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))}
              {itens?.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/60 transition-colors hover:bg-accent/40"
                >
                  <td className="px-5 py-3.5">
                    <div>{s.material?.nome ?? "Material removido"}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {s.material?.codigo ?? "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {fmtDataHora(s.criado_em)}
                  </td>
                  <td className="px-5 py-3.5">
                    <SituacaoBadge situacao={s.status} />
                  </td>
                </tr>
              ))}
              {!consulta.isPending && (!itens || itens.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                    Nenhuma solicitação ainda. Peça uma reposição na tabela{" "}
                    <Link to="/" className="font-medium text-primary underline underline-offset-4">
                      Precisa de atenção
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
