// Tipos do domínio de estoque. Espelham o JSON devolvido pela API Django (/api/).

export type Status = "em_estoque" | "baixo" | "ruptura";
export type Categoria = "tecido" | "aviamento" | "linha" | "embalagem";
export type Unidade = "rolo" | "un" | "m" | "kg" | "cone";
export type TipoMovimentacao = "entrada" | "saida" | "ajuste" | "perda" | "devolucao";
export type SituacaoSolicitacao = "aberta" | "atendida" | "cancelada";

/** Material como a API devolve. `estoque_atual`, `status` e `prioridade` são calculados no backend. */
export interface MaterialStatus {
  id: string;
  codigo: string;
  nome: string;
  categoria: Categoria;
  unidade: Unidade;
  estoque_atual: number;
  estoque_minimo: number;
  atualizado_em: string;
  fornecedor_nome: string | null;
  status: Status;
  prioridade: number;
  solicitacao_aberta: boolean;
}

/** GET dashboard/resumo/ */
export interface ResumoDashboard {
  total_materiais: number;
  abaixo_minimo: number;
  em_ruptura: number;
  movimentacoes_hoje: number;
}

/** GET dashboard/categorias/ */
export interface ResumoCategoria {
  categoria: Categoria;
  total: number;
  em_estoque: number;
  baixo: number;
  ruptura: number;
}

/** GET dashboard/movimentacoes-mensais/ — `mes` no formato AAAA-MM. */
export interface MovimentacaoMensal {
  mes: string;
  entradas: number;
  saidas: number;
}

export interface MaterialResumido {
  codigo: string;
  nome: string;
  unidade: Unidade;
}

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  lote: string | null;
  destino: string | null;
  criado_em: string;
  material: MaterialResumido | null;
}

export interface Fornecedor {
  id: string;
  nome: string;
  contato: string | null;
  total_materiais: number;
}

export interface Solicitacao {
  id: string;
  status: SituacaoSolicitacao;
  criado_em: string;
  material: MaterialResumido | null;
}

export interface FiltroMateriais {
  /** "atencao" = baixo + ruptura */
  status?: Status | "atencao" | undefined;
  categoria?: Categoria | undefined;
  q?: string | undefined;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
}
