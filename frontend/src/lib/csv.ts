import { categoriaSingular, statusLabel } from "./format";
import type { MaterialStatus } from "./types";

const celula = (valor: string | number) => {
  const texto = typeof valor === "number" ? String(valor).replace(".", ",") : valor;
  return `"${texto.replace(/"/g, '""')}"`;
};

/** CSV com ";" e BOM para o Excel em português abrir com acentos e vírgula decimal. */
export function materiaisParaCsv(itens: MaterialStatus[]): string {
  const cabecalho = [
    "Código",
    "Material",
    "Categoria",
    "Unidade",
    "Estoque atual",
    "Estoque mínimo",
    "Status",
    "Fornecedor",
  ];
  const linhas = itens.map((m) => [
    m.codigo,
    m.nome,
    categoriaSingular[m.categoria],
    m.unidade,
    m.estoque_atual,
    m.estoque_minimo,
    statusLabel[m.status],
    m.fornecedor_nome ?? "",
  ]);
  return "\uFEFF" + [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
}

export function baixarCsv(nomeArquivo: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
