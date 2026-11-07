import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { ErroCarregar } from "@/components/estado";
import { MateriaisTable } from "@/components/materiais-table";
import { PageHeader } from "@/components/page-header";
import { baixarCsv, materiaisParaCsv } from "@/lib/csv";
import { useMateriais } from "@/lib/estoque-api";
import { categoriaPlural, ordemCategorias } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const filtrosSchema = z.object({
  status: z.enum(["atencao", "baixo", "ruptura", "em_estoque"]).optional().catch(undefined),
  categoria: z.enum(["tecido", "aviamento", "linha", "embalagem"]).optional().catch(undefined),
});

export const Route = createFileRoute("/materiais")({
  validateSearch: (busca) => filtrosSchema.parse(busca),
  head: () => ({
    meta: [
      { title: "Materiais · Greenish ERP Têxtil" },
      { name: "description", content: "Tecidos, aviamentos, linhas e embalagens em estoque." },
    ],
  }),
  component: Materiais,
});

const LIMITE = 200;

const opcoesStatus = [
  { valor: undefined, rotulo: "Todos" },
  { valor: "atencao", rotulo: "Precisa de atenção" },
  { valor: "em_estoque", rotulo: "Em estoque" },
  { valor: "baixo", rotulo: "Baixo" },
  { valor: "ruptura", rotulo: "Ruptura" },
] as const;

function Materiais() {
  const { status, categoria } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [texto, setTexto] = useState("");
  const q = useDebouncedValue(texto.trim(), 300);

  const consulta = useMateriais({ status, categoria, q }, LIMITE);
  const itens = consulta.data?.itens;
  const total = consulta.data?.total ?? 0;
  const filtrando = Boolean(status || categoria || q);

  return (
    <>
      <PageHeader
        titulo="Materiais"
        descricao="Tecidos, aviamentos, linhas e embalagens"
        acoes={
          <button
            type="button"
            disabled={!itens || itens.length === 0}
            onClick={() => itens && baixarCsv("materiais.csv", materiaisParaCsv(itens))}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </button>
        }
      />

      {consulta.error && (
        <ErroCarregar erro={consulta.error} onTentar={() => void consulta.refetch()} />
      )}

      <section className="glass-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar código ou nome"
              aria-label="Buscar material por código ou nome"
              className="w-64 rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={categoria ?? ""}
            onChange={(e) => {
              const valor = ordemCategorias.find((c) => c === e.target.value);
              void navigate({ search: (anterior) => ({ ...anterior, categoria: valor }) });
            }}
            aria-label="Filtrar por categoria"
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as categorias</option>
            {ordemCategorias.map((c) => (
              <option key={c} value={c}>
                {categoriaPlural[c]}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
            {opcoesStatus.map((o) => (
              <button
                key={o.rotulo}
                type="button"
                aria-pressed={status === o.valor}
                onClick={() =>
                  void navigate({ search: (anterior) => ({ ...anterior, status: o.valor }) })
                }
                className={`rounded-xl px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  status === o.valor
                    ? "bg-deep text-deep-foreground"
                    : "border border-border bg-card text-secondary-foreground"
                }`}
              >
                {o.rotulo}
              </button>
            ))}
          </div>

          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {itens
              ? total > itens.length
                ? `Mostrando ${itens.length} de ${total}. Refine a busca para ver o restante.`
                : `${total} ${total === 1 ? "material" : "materiais"}`
              : "—"}
          </span>
        </div>

        <MateriaisTable
          itens={itens}
          carregando={consulta.isPending}
          vazio={filtrando ? "Nenhum material com esses filtros." : "Nenhum material cadastrado."}
        />
      </section>
    </>
  );
}
