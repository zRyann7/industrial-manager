import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeftRight, Layers, PackageX } from "lucide-react";

import { AtualizarButton } from "@/components/atualizar-button";
import { CategoriaSaude } from "@/components/categoria-saude";
import { ErroCarregar } from "@/components/estado";
import { KpiCard } from "@/components/kpi-card";
import { MateriaisTable } from "@/components/materiais-table";
import { MovimentacoesChart } from "@/components/movimentacoes-chart";
import { PageHeader } from "@/components/page-header";
import { useCategorias, useMateriais, useMovimentacoesMensais, useResumo } from "@/lib/estoque-api";

const DESCRICAO = "Controle de estoque de matéria-prima e aviamentos para confecção e têxtil.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Greenish ERP Têxtil" },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: "Dashboard · Greenish ERP Têxtil" },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const LIMITE_ATENCAO = 8;

function Dashboard() {
  const resumo = useResumo();
  const categorias = useCategorias();
  const mensais = useMovimentacoesMensais();
  const atencao = useMateriais({ status: "atencao" }, LIMITE_ATENCAO);

  const consultas = [resumo, categorias, mensais, atencao];
  const erro = consultas.find((c) => c.error)?.error ?? null;
  const tentarDeNovo = () => consultas.forEach((c) => void c.refetch());

  const totalAtencao = atencao.data?.total ?? 0;
  const semMateriais = resumo.data?.total_materiais === 0;

  return (
    <>
      <PageHeader
        titulo="Controle de estoque"
        descricao="Matéria-prima e aviamentos"
        acoes={<AtualizarButton atualizadoEm={resumo.dataUpdatedAt || undefined} />}
      />

      {erro && <ErroCarregar erro={erro} onTentar={tentarDeNovo} />}

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          rotulo="Materiais ativos"
          valor={resumo.data?.total_materiais}
          detalhe="tecidos, aviamentos, linhas, embalagens"
          icone={Layers}
          carregando={resumo.isPending}
        />
        <KpiCard
          rotulo="Abaixo do mínimo"
          valor={resumo.data?.abaixo_minimo}
          detalhe="pedir reposição"
          icone={AlertTriangle}
          tom="atencao"
          carregando={resumo.isPending}
        />
        <KpiCard
          rotulo="Em ruptura"
          valor={resumo.data?.em_ruptura}
          detalhe="estoque zerado"
          icone={PackageX}
          tom="critico"
          carregando={resumo.isPending}
        />
        <KpiCard
          rotulo="Movimentações hoje"
          valor={resumo.data?.movimentacoes_hoje}
          detalhe="entradas, saídas e ajustes"
          icone={ArrowLeftRight}
          carregando={resumo.isPending}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="glass-card p-5 xl:col-span-3">
          <h2 className="text-lg font-semibold">Entradas e saídas por mês</h2>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            nº de movimentações, últimos 6 meses
          </p>
          <MovimentacoesChart dados={mensais.data} carregando={mensais.isPending} />
        </div>
        <div className="glass-card p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Situação por categoria</h2>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            itens em dia vs. abaixo do mínimo
          </p>
          <CategoriaSaude categorias={categorias.data} carregando={categorias.isPending} />
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-semibold">Precisa de atenção</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {atencao.data
                ? totalAtencao > LIMITE_ATENCAO
                  ? `${LIMITE_ATENCAO} mais urgentes de ${totalAtencao} itens`
                  : `${totalAtencao} ${totalAtencao === 1 ? "item" : "itens"}`
                : "—"}
            </p>
          </div>
          <Link
            to="/materiais"
            search={{ status: "atencao" }}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver todos
          </Link>
        </div>
        <MateriaisTable
          itens={atencao.data?.itens}
          carregando={atencao.isPending}
          vazio={
            erro
              ? "Sem dados para exibir."
              : semMateriais
                ? "Nenhum material cadastrado. Se a API já tem dados, confira as permissões do usuário."
                : "Nenhum material abaixo do mínimo. Tudo em dia."
          }
        />
      </section>
    </>
  );
}
