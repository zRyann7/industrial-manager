import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ErroCarregar } from "@/components/estado";
import { PageHeader } from "@/components/page-header";
import { TipoBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovimentacoes } from "@/lib/estoque-api";
import { fmtDataHora, fmtQtd, tipoLabel } from "@/lib/format";
import type { TipoMovimentacao } from "@/lib/types";

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({
    meta: [
      { title: "Movimentações · Greenish ERP Têxtil" },
      { name: "description", content: "Entradas, saídas, ajustes e perdas de estoque." },
    ],
  }),
  component: Movimentacoes,
});

const LIMITE = 100;
const tipos: TipoMovimentacao[] = ["entrada", "saida", "ajuste", "perda", "devolucao"];

/** Entrada soma; ajuste usa o sinal gravado; os demais tipos subtraem. */
function sinal(tipo: TipoMovimentacao, quantidade: number) {
  if (tipo === "entrada") return "+";
  if (tipo === "ajuste") return quantidade < 0 ? "−" : "+";
  return "−";
}

function Movimentacoes() {
  const consulta = useMovimentacoes(LIMITE);
  const [tipo, setTipo] = useState<TipoMovimentacao | undefined>(undefined);
  const itens = consulta.data?.filter((m) => !tipo || m.tipo === tipo);

  return (
    <>
      <PageHeader titulo="Movimentações" descricao={`Últimos ${LIMITE} lançamentos de estoque`} />

      {consulta.error && (
        <ErroCarregar erro={consulta.error} onTentar={() => void consulta.refetch()} />
      )}

      <section className="glass-card overflow-hidden">
        <div
          className="flex flex-wrap items-center gap-2 p-5"
          role="group"
          aria-label="Filtrar por tipo"
        >
          {[undefined, ...tipos].map((t) => (
            <button
              key={t ?? "todos"}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
              className={`rounded-xl px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                tipo === t
                  ? "bg-deep text-deep-foreground"
                  : "border border-border bg-card text-secondary-foreground"
              }`}
            >
              {t ? tipoLabel[t] : "Todos"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left">
                {["Data", "Tipo", "Material", "Quantidade", "Lote", "Destino"].map((c) => (
                  <th key={c} scope="col" className="label-mono px-5 py-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consulta.isPending &&
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td colSpan={6} className="px-5 py-3.5">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))}
              {itens?.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/60 transition-colors hover:bg-accent/40"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {fmtDataHora(m.criado_em)}
                  </td>
                  <td className="px-5 py-3.5">
                    <TipoBadge tipo={m.tipo} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div>{m.material?.nome ?? "Material removido"}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {m.material?.codigo ?? "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs">
                    {sinal(m.tipo, m.quantidade)}
                    {m.material
                      ? fmtQtd(Math.abs(m.quantidade), m.material.unidade)
                      : Math.abs(m.quantidade)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">{m.lote ?? "—"}</td>
                  <td className="px-5 py-3.5 text-secondary-foreground">{m.destino ?? "—"}</td>
                </tr>
              ))}
              {!consulta.isPending && (!itens || itens.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    {tipo ? "Nenhuma movimentação desse tipo." : "Nenhuma movimentação registrada."}
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
