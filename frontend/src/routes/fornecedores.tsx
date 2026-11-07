import { createFileRoute } from "@tanstack/react-router";

import { ErroCarregar } from "@/components/estado";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useFornecedores } from "@/lib/estoque-api";

export const Route = createFileRoute("/fornecedores")({
  head: () => ({
    meta: [
      { title: "Fornecedores · Greenish ERP Têxtil" },
      { name: "description", content: "Fornecedores de tecidos, aviamentos, linhas e embalagens." },
    ],
  }),
  component: Fornecedores,
});

function Fornecedores() {
  const consulta = useFornecedores();
  const itens = consulta.data;

  return (
    <>
      <PageHeader titulo="Fornecedores" descricao="Quem fornece cada material" />

      {consulta.error && (
        <ErroCarregar erro={consulta.error} onTentar={() => void consulta.refetch()} />
      )}

      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Fornecedor", "Contato", "Materiais"].map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`label-mono px-5 py-3 font-medium ${i === 2 ? "text-right" : ""}`}
                  >
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
              {itens?.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-border/60 transition-colors hover:bg-accent/40"
                >
                  <td className="px-5 py-3.5 font-medium">{f.nome}</td>
                  <td className="px-5 py-3.5 text-secondary-foreground">{f.contato ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs">{f.total_materiais}</td>
                </tr>
              ))}
              {!consulta.isPending && (!itens || itens.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                    Nenhum fornecedor cadastrado.
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
