import { Skeleton } from "@/components/ui/skeleton";
import { categoriaPlural } from "@/lib/format";
import type { ResumoCategoria } from "@/lib/types";

function resumoTexto(c: ResumoCategoria): { texto: string; classe: string } {
  if (c.total === 0) return { texto: "Nenhum item cadastrado", classe: "text-muted-foreground" };
  const partes: string[] = [];
  if (c.ruptura > 0) partes.push(`${c.ruptura} em ruptura`);
  if (c.baixo > 0) partes.push(`${c.baixo} abaixo do mínimo`);
  if (partes.length === 0) return { texto: "Tudo em dia", classe: "text-muted-foreground" };
  return {
    texto: partes.join(", "),
    classe: c.ruptura > 0 ? "text-destructive" : "text-warn-text",
  };
}

interface Props {
  categorias: ResumoCategoria[] | undefined;
  carregando: boolean;
}

/** Situação do estoque por categoria: quantos itens estão em dia, abaixo do mínimo ou zerados. */
export function CategoriaSaude({ categorias, carregando }: Props) {
  if (carregando) {
    return (
      <div className="space-y-5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (!categorias || categorias.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sem dados para exibir.</p>;
  }
  return (
    <ul className="space-y-5">
      {categorias.map((c) => {
        const { texto, classe } = resumoTexto(c);
        const pct = (n: number) => (c.total === 0 ? 0 : (n / c.total) * 100);
        return (
          <li key={c.categoria}>
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">{categoriaPlural[c.categoria]}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {c.total} {c.total === 1 ? "item" : "itens"}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${categoriaPlural[c.categoria]}: ${c.em_estoque} em dia, ${c.baixo} abaixo do mínimo, ${c.ruptura} em ruptura`}
              className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="bg-mint" style={{ width: `${pct(c.em_estoque)}%` }} />
              <div className="bg-warn" style={{ width: `${pct(c.baixo)}%` }} />
              <div className="bg-destructive" style={{ width: `${pct(c.ruptura)}%` }} />
            </div>
            <div className={`mt-1.5 text-xs ${classe}`}>{texto}</div>
          </li>
        );
      })}
    </ul>
  );
}
