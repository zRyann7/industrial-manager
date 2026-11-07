import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  buscarCategorias,
  buscarFornecedores,
  buscarMateriais,
  buscarMovimentacoes,
  buscarMovimentacoesMensais,
  buscarResumo,
  buscarSolicitacoes,
  criarSolicitacao,
} from "./api";
import { explicarErro } from "./erros";
import type { FiltroMateriais } from "./types";

export const useResumo = () => useQuery({ queryKey: ["resumo"], queryFn: buscarResumo });

export const useCategorias = () =>
  useQuery({ queryKey: ["categorias"], queryFn: buscarCategorias });

export const useMovimentacoesMensais = () =>
  useQuery({ queryKey: ["movimentacoes-mensais"], queryFn: buscarMovimentacoesMensais });

export const useMateriais = (filtro: FiltroMateriais, limite: number) =>
  useQuery({
    queryKey: ["materiais", filtro, limite],
    queryFn: () => buscarMateriais(filtro, limite),
    placeholderData: keepPreviousData,
  });

export const useMovimentacoes = (limite: number) =>
  useQuery({ queryKey: ["movimentacoes", limite], queryFn: () => buscarMovimentacoes(limite) });

export const useFornecedores = () =>
  useQuery({ queryKey: ["fornecedores"], queryFn: buscarFornecedores });

export const useSolicitacoes = () =>
  useQuery({ queryKey: ["solicitacoes"], queryFn: buscarSolicitacoes });

/** Abre uma solicitação de compra para o material e atualiza as telas que dependem dela. */
export function useCriarSolicitacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => criarSolicitacao(materialId),
    onSuccess: (resultado) => {
      toast.success(
        resultado === "criada"
          ? "Solicitação de compra criada."
          : "Já existe uma solicitação aberta para este material.",
      );
      void queryClient.invalidateQueries({ queryKey: ["materiais"] });
      void queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
    },
    onError: (erro: unknown) => {
      toast.error("Não foi possível criar a solicitação.", { description: explicarErro(erro) });
    },
  });
}
