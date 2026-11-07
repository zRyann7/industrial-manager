import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum } from "@/lib/format";

type Tom = "normal" | "atencao" | "critico";

const tons: Record<Tom, { icone: string; valor: string }> = {
  normal: { icone: "bg-mint-soft text-primary", valor: "text-primary" },
  atencao: { icone: "bg-warn-soft text-warn-text", valor: "text-warn-text" },
  critico: { icone: "bg-destructive/10 text-destructive", valor: "text-destructive" },
};

interface KpiCardProps {
  rotulo: string;
  valor: number | undefined;
  detalhe: string;
  icone: LucideIcon;
  tom?: Tom;
  carregando: boolean;
}

export function KpiCard({
  rotulo,
  valor,
  detalhe,
  icone: Icone,
  tom = "normal",
  carregando,
}: KpiCardProps) {
  const cores = tons[tom];
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <span className="label-mono">{rotulo}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${cores.icone}`}>
          <Icone className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      {carregando ? (
        <Skeleton className="mt-3 h-10 w-24" />
      ) : (
        <div className={`mt-3 text-4xl font-semibold ${cores.valor}`}>
          {valor === undefined ? "—" : fmtNum(valor)}
        </div>
      )}
      <div className="mt-2 font-mono text-xs text-muted-foreground">{detalhe}</div>
    </div>
  );
}
