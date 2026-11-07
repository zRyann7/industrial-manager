import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCriarSolicitacao } from "@/lib/estoque-api";
import { categoriaSingular, fmtNum, fmtUnidade } from "@/lib/format";
import type { MaterialStatus, Status } from "@/lib/types";

const corTexto: Record<Status, string> = {
  em_estoque: "",
  baixo: "text-warn-text",
  ruptura: "text-destructive",
};
const corBarra: Record<Status, string> = {
  em_estoque: "bg-bar",
  baixo: "bg-warn",
  ruptura: "bg-destructive",
};

function Estoque({ m }: { m: MaterialStatus }) {
  const pct =
    m.estoque_minimo > 0 ? Math.min(100, (m.estoque_atual / m.estoque_minimo) * 100) : 100;
  return (
    <>
      <div className="font-mono text-xs">
        <span className={`font-medium ${corTexto[m.status]}`}>{fmtNum(m.estoque_atual)}</span> /{" "}
        {fmtNum(m.estoque_minimo)} {fmtUnidade(m.estoque_minimo, m.unidade)}
      </div>
      <div className="mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className={`h-full ${corBarra[m.status]}`} style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}

function AcaoReposicao({ material }: { material: MaterialStatus }) {
  const criar = useCriarSolicitacao();
  if (material.status === "em_estoque") return null;
  if (material.solicitacao_aberta) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Solicitada
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={criar.isPending}
      onClick={() => criar.mutate(material.id)}
      className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-deep-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      Solicitar compra
    </button>
  );
}

interface Props {
  itens: MaterialStatus[] | undefined;
  carregando: boolean;
  vazio: ReactNode;
  comAcao?: boolean;
}

export function MateriaisTable({ itens, carregando, vazio, comAcao = true }: Props) {
  const colunas = [
    "Código",
    "Material",
    "Categoria",
    "Estoque / mínimo",
    "Status",
    ...(comAcao ? [""] : []),
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border text-left">
            {colunas.map((c, i) => (
              <th key={`${c}-${i}`} scope="col" className="label-mono px-5 py-3 font-medium">
                {c || <span className="sr-only">Ação</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {carregando &&
            [0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-border/60">
                <td colSpan={colunas.length} className="px-5 py-3.5">
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            ))}
          {!carregando &&
            itens?.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border/60 transition-colors hover:bg-accent/40"
              >
                <td className="px-5 py-3.5 font-mono text-sm font-medium">{m.codigo}</td>
                <td className="px-5 py-3.5">
                  <div>{m.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.fornecedor_nome ?? "Sem fornecedor"}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-secondary-foreground">
                  {categoriaSingular[m.categoria]}
                </td>
                <td className="px-5 py-3.5">
                  <Estoque m={m} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={m.status} />
                </td>
                {comAcao && (
                  <td className="px-5 py-3.5 text-right">
                    <AcaoReposicao material={m} />
                  </td>
                )}
              </tr>
            ))}
          {!carregando && (!itens || itens.length === 0) && (
            <tr>
              <td colSpan={colunas.length} className="px-5 py-10 text-center text-muted-foreground">
                {vazio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
