import { AlertTriangle, Hammer } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { explicarErro } from "@/lib/erros";

export function ErroCarregar({ erro, onTentar }: { erro: Error; onTentar: () => void }) {
  return (
    <div role="alert" className="glass-card flex flex-wrap items-center gap-3 p-4 text-sm">
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Não foi possível carregar os dados.</p>
        <p className="text-muted-foreground">{explicarErro(erro)}</p>
      </div>
      <button
        type="button"
        onClick={onTentar}
        className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Tentar de novo
      </button>
    </div>
  );
}

export function EmConstrucao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="glass-card mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-mint-soft text-primary">
        <Hammer className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="text-sm text-muted-foreground">{descricao}</p>
      <Link
        to="/"
        className="mt-2 rounded-xl bg-deep px-4 py-2 text-sm font-semibold text-deep-foreground hover:opacity-90"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
