import { isAxiosError } from "axios";

import { ordemCategorias } from "./format";
import { http } from "./http";
import type {
  Fornecedor,
  FiltroMateriais,
  MaterialStatus,
  Movimentacao,
  MovimentacaoMensal,
  Pagina,
  ResumoCategoria,
  ResumoDashboard,
  Solicitacao,
} from "./types";

// Endpoints esperados em http://localhost:8000/api/ — ajuste só aqui se as rotas forem outras.
const ROTAS = {
  resumo: "dashboard/resumo/",
  categorias: "dashboard/categorias/",
  movimentacoesMensais: "dashboard/movimentacoes-mensais/",
  materiais: "materiais/",
  movimentacoes: "movimentacoes/",
  fornecedores: "fornecedores/",
  solicitacoes: "solicitacoes-compra/",
} as const;

/** DRF devolve lista pura ou paginada ({ count, results }), conforme a paginação configurada. */
type Lista<T> = T[] | { count: number; results: T[] };

function lista<T>(dados: Lista<T>): Pagina<T> {
  if (Array.isArray(dados)) return { itens: dados, total: dados.length };
  return { itens: dados.results, total: dados.count };
}

/** DecimalField do DRF serializa como string ("12.500"); aqui só convertemos para número. */
const num = (valor: number | string) => Number(valor);

type Decimal = number | string;
type MaterialCru = Omit<MaterialStatus, "estoque_atual" | "estoque_minimo"> & {
  estoque_atual: Decimal;
  estoque_minimo: Decimal;
};
type MovimentacaoCrua = Omit<Movimentacao, "quantidade"> & { quantidade: Decimal };

// O saldo (`estoque_atual`) e o `status` chegam prontos do backend. Nada é recalculado aqui.
const paraMaterial = (m: MaterialCru): MaterialStatus => ({
  ...m,
  estoque_atual: num(m.estoque_atual),
  estoque_minimo: num(m.estoque_minimo),
});

export async function buscarResumo() {
  const { data } = await http.get<ResumoDashboard>(ROTAS.resumo);
  return data;
}

export async function buscarCategorias() {
  const { data } = await http.get<ResumoCategoria[]>(ROTAS.categorias);
  // Só a ordem de exibição dos cards; os números vêm do backend.
  return [...data].sort(
    (a, b) => ordemCategorias.indexOf(a.categoria) - ordemCategorias.indexOf(b.categoria),
  );
}

export async function buscarMovimentacoesMensais() {
  const { data } = await http.get<MovimentacaoMensal[]>(ROTAS.movimentacoesMensais);
  return [...data].sort((a, b) => a.mes.localeCompare(b.mes));
}

export async function buscarMateriais(
  filtro: FiltroMateriais,
  limite: number,
): Promise<Pagina<MaterialStatus>> {
  const { data } = await http.get<Lista<MaterialCru>>(ROTAS.materiais, {
    params: {
      status: filtro.status, // "atencao" = baixo + ruptura (o backend interpreta)
      categoria: filtro.categoria,
      search: filtro.q || undefined,
      limit: limite,
    },
  });
  const { itens, total } = lista(data);
  return { itens: itens.map(paraMaterial), total };
}

export async function buscarMovimentacoes(limite: number): Promise<Movimentacao[]> {
  const { data } = await http.get<Lista<MovimentacaoCrua>>(ROTAS.movimentacoes, {
    params: { limit: limite },
  });
  return lista(data).itens.map((m) => ({ ...m, quantidade: num(m.quantidade) }));
}

export async function buscarFornecedores() {
  const { data } = await http.get<Lista<Fornecedor>>(ROTAS.fornecedores);
  return lista(data).itens;
}

export async function buscarSolicitacoes() {
  const { data } = await http.get<Lista<Solicitacao>>(ROTAS.solicitacoes, {
    params: { limit: 100 },
  });
  return lista(data).itens;
}

/** 201 → "criada". 409 (já há solicitação aberta para o material) → "ja_existia". */
export async function criarSolicitacao(materialId: string): Promise<"criada" | "ja_existia"> {
  try {
    await http.post(ROTAS.solicitacoes, { material: materialId });
    return "criada";
  } catch (erro) {
    if (isAxiosError(erro) && erro.response?.status === 409) return "ja_existia";
    throw erro;
  }
}
