import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descricao?: string | undefined;
  acoes?: ReactNode;
}

export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="label-mono">Greenish · Almoxarifado</div>
        <h1 className="mt-1 text-3xl font-semibold text-primary">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-muted-foreground">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}
