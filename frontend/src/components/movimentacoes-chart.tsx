import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtMes, fmtMesAno } from "@/lib/format";
import type { MovimentacaoMensal } from "@/lib/types";

const config = {
  entradas: { label: "Entradas", color: "var(--primary)" },
  saidas: { label: "Saídas", color: "var(--warn)" },
} satisfies ChartConfig;

interface Props {
  dados: MovimentacaoMensal[] | undefined;
  carregando: boolean;
}

/** Nº de movimentações por mês. Conta lançamentos (não quantidades) porque as unidades variam. */
export function MovimentacoesChart({ dados, carregando }: Props) {
  if (carregando) return <Skeleton className="h-64 w-full" />;
  if (!dados || dados.every((d) => d.entradas + d.saidas === 0)) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem movimentações nos últimos 6 meses.
      </p>
    );
  }
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-64 w-full"
      role="img"
      aria-label="Gráfico de barras com o número de entradas e saídas por mês"
    >
      <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickFormatter={fmtMes} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={(valor) => fmtMesAno(String(valor))} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="saidas" fill="var(--color-saidas)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
