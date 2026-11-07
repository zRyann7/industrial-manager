import { CircleCheck, CircleX, TrendingDown } from "lucide-react";

import { situacaoLabel, statusLabel, tipoLabel } from "@/lib/format";
import type { SituacaoSolicitacao, Status, TipoMovimentacao } from "@/lib/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider";

const estilosStatus: Record<Status, string> = {
  em_estoque: "bg-mint-soft text-primary",
  baixo: "bg-warn-soft text-warn-text",
  ruptura: "bg-destructive/10 text-destructive",
};

const iconesStatus = { em_estoque: CircleCheck, baixo: TrendingDown, ruptura: CircleX } as const;

/** Mostra o status exatamente como o backend calculou (campo `status` da API). */
export function StatusBadge({ status }: { status: Status }) {
  const Icone = iconesStatus[status];
  return (
    <span className={`${base} ${estilosStatus[status]}`}>
      <Icone className="h-3 w-3" aria-hidden="true" />
      {statusLabel[status]}
    </span>
  );
}

const estilosTipo: Record<TipoMovimentacao, string> = {
  entrada: "bg-mint-soft text-primary",
  saida: "bg-warn-soft text-warn-text",
  ajuste: "bg-secondary text-secondary-foreground",
  perda: "bg-destructive/10 text-destructive",
  devolucao: "bg-secondary text-secondary-foreground",
};

export function TipoBadge({ tipo }: { tipo: TipoMovimentacao }) {
  return <span className={`${base} ${estilosTipo[tipo]}`}>{tipoLabel[tipo]}</span>;
}

const estilosSituacao: Record<SituacaoSolicitacao, string> = {
  aberta: "bg-warn-soft text-warn-text",
  atendida: "bg-mint-soft text-primary",
  cancelada: "bg-secondary text-secondary-foreground",
};

export function SituacaoBadge({ situacao }: { situacao: SituacaoSolicitacao }) {
  return <span className={`${base} ${estilosSituacao[situacao]}`}>{situacaoLabel[situacao]}</span>;
}
