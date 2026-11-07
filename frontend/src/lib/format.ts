import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Categoria, SituacaoSolicitacao, Status, TipoMovimentacao, Unidade } from "./types";

const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
export const fmtNum = (n: number) => numero.format(n);

const unidades: Record<Unidade, [singular: string, plural: string]> = {
  rolo: ["rolo", "rolos"],
  un: ["un", "un"],
  m: ["m", "m"],
  kg: ["kg", "kg"],
  cone: ["cone", "cones"],
};

export function fmtUnidade(n: number, unidade: Unidade) {
  const [singular, plural] = unidades[unidade];
  return n === 1 ? singular : plural;
}

export const fmtQtd = (n: number, unidade: Unidade) => `${fmtNum(n)} ${fmtUnidade(n, unidade)}`;

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** "2026-03" → "mar" */
export function fmtMes(aaaaMm: string) {
  const mes = Number(aaaaMm.split("-")[1]);
  return meses[mes - 1] ?? aaaaMm;
}

export const fmtRelativo = (iso: string) =>
  formatDistanceToNow(new Date(iso), { locale: ptBR, addSuffix: true });

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
export const fmtDataHora = (iso: string) => dataHora.format(new Date(iso));

const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
export const fmtHora = (ms: number) => hora.format(new Date(ms));

export const ordemCategorias: Categoria[] = ["tecido", "aviamento", "linha", "embalagem"];

export const categoriaPlural: Record<Categoria, string> = {
  tecido: "Tecidos",
  aviamento: "Aviamentos",
  linha: "Linhas",
  embalagem: "Embalagens",
};

export const categoriaSingular: Record<Categoria, string> = {
  tecido: "Tecido",
  aviamento: "Aviamento",
  linha: "Linha",
  embalagem: "Embalagem",
};

export const statusLabel: Record<Status, string> = {
  em_estoque: "Em estoque",
  baixo: "Baixo",
  ruptura: "Ruptura",
};

export const tipoLabel: Record<TipoMovimentacao, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  perda: "Perda",
  devolucao: "Devolução",
};

export const situacaoLabel: Record<SituacaoSolicitacao, string> = {
  aberta: "Aberta",
  atendida: "Atendida",
  cancelada: "Cancelada",
};

/** "2026-03" → "mar/2026" */
export function fmtMesAno(aaaaMm: string) {
  return `${fmtMes(aaaaMm)}/${aaaaMm.split("-")[0] ?? ""}`;
}
