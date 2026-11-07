import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { fmtHora } from "@/lib/format";

/** Recarrega todas as consultas. `atualizadoEm` é o instante da última leitura (ms). */
export function AtualizarButton({ atualizadoEm }: { atualizadoEm?: number | undefined }) {
  const queryClient = useQueryClient();
  const buscando = useIsFetching() > 0;
  return (
    <>
      {atualizadoEm ? (
        <span className="font-mono text-xs text-muted-foreground">
          Atualizado às {fmtHora(atualizadoEm)}
        </span>
      ) : null}
      <button
        type="button"
        disabled={buscando}
        onClick={() => void queryClient.invalidateQueries()}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${buscando ? "animate-spin" : ""}`} aria-hidden="true" />
        Atualizar
      </button>
    </>
  );
}
