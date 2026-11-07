import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buscarMateriais, buscarMovimentacoesMensais, criarSolicitacao } from "@/lib/api";
import { entrar } from "@/lib/auth";
import { getToken, setToken } from "@/lib/auth-store";
import { materiaisParaCsv } from "@/lib/csv";
import { explicarErro } from "@/lib/erros";
import { fmtMes, fmtMesAno, fmtUnidade } from "@/lib/format";
import { http } from "@/lib/http";

describe("formatação", () => {
  it("usa plural só quando faz sentido", () => {
    expect(fmtUnidade(1, "rolo")).toBe("rolo");
    expect(fmtUnidade(4, "rolo")).toBe("rolos");
    expect(fmtUnidade(4, "un")).toBe("un");
  });

  it("abrevia o mês em português", () => {
    expect(fmtMes("2026-03")).toBe("mar");
    expect(fmtMesAno("2026-11")).toBe("nov/2026");
  });
});

// Troca o adaptador do Axios por uma resposta fixa: nada sai para a rede e dá para inspecionar a requisição.
let ultima: InternalAxiosRequestConfig | undefined;
const adaptadorOriginal = http.defaults.adapter;

function responder(status: number, data: unknown) {
  const adaptador: AxiosAdapter = (config) => {
    ultima = config;
    const resposta = { data, status, statusText: String(status), headers: {}, config };
    if (status >= 400) {
      return Promise.reject(
        Object.assign(new Error(`HTTP ${status}`), {
          isAxiosError: true,
          config,
          response: resposta,
        }),
      );
    }
    return Promise.resolve(resposta);
  };
  http.defaults.adapter = adaptador;
}

beforeEach(() => {
  ultima = undefined;
  setToken(null);
});
afterEach(() => {
  if (adaptadorOriginal) http.defaults.adapter = adaptadorOriginal;
});

describe("API Django (Axios)", () => {
  it("lê saldo e status exatamente como o backend enviou, sem recalcular", async () => {
    // Saldo 0 com status "em_estoque" só existe aqui para provar que o frontend não deriva o status.
    responder(200, {
      count: 1,
      results: [
        {
          id: "1",
          codigo: "TEC-0001",
          nome: "Malha",
          categoria: "tecido",
          unidade: "rolo",
          estoque_atual: "0.000",
          estoque_minimo: "5.000",
          atualizado_em: "2026-11-05T10:00:00Z",
          fornecedor_nome: null,
          status: "em_estoque",
          prioridade: 3,
          solicitacao_aberta: false,
        },
      ],
    });
    const { itens, total } = await buscarMateriais({ status: "atencao", q: "malha" }, 8);
    expect(total).toBe(1);
    expect(itens[0]).toMatchObject({ status: "em_estoque", estoque_atual: 0, estoque_minimo: 5 });
    expect(ultima?.url).toBe("materiais/");
    expect(ultima?.params).toEqual({
      status: "atencao",
      categoria: undefined,
      search: "malha",
      limit: 8,
    });
  });

  it("aceita lista simples quando a paginação do DRF está desligada", async () => {
    responder(200, []);
    expect(await buscarMateriais({}, 10)).toEqual({ itens: [], total: 0 });
  });

  it("ordena os meses para o gráfico", async () => {
    responder(200, [
      { mes: "2026-04", entradas: 1, saidas: 1 },
      { mes: "2026-03", entradas: 2, saidas: 2 },
    ]);
    expect((await buscarMovimentacoesMensais()).map((m) => m.mes)).toEqual(["2026-03", "2026-04"]);
  });

  it("trata 409 como solicitação que já existia", async () => {
    responder(201, {});
    expect(await criarSolicitacao("7")).toBe("criada");
    expect(ultima?.data).toBe(JSON.stringify({ material: "7" }));
    responder(409, { detail: "Já existe solicitação aberta." });
    expect(await criarSolicitacao("7")).toBe("ja_existia");
  });
});

describe("autenticação JWT", () => {
  it("guarda o token devolvido pelo login (campo access)", async () => {
    responder(200, { access: "jwt-abc", refresh: "x" });
    await entrar("ryan", "senha");
    expect(ultima?.url).toBe("auth/login/");
    expect(getToken()).toBe("jwt-abc");
  });

  it("envia o Bearer nas requisições seguintes", async () => {
    setToken("jwt-abc");
    responder(200, { total_materiais: 0, abaixo_minimo: 0, em_ruptura: 0, movimentacoes_hoje: 0 });
    await http.get("dashboard/resumo/");
    // O interceptor de request roda antes do adaptador.
    expect(ultima?.headers.get("Authorization")).toBe("Bearer jwt-abc");
  });

  it("derruba a sessão num 401 fora do login, mas não no próprio login", async () => {
    setToken("jwt-velho");
    responder(401, { detail: "Token expirado" });
    await expect(http.get("materiais/")).rejects.toBeTruthy();
    expect(getToken()).toBeNull();

    setToken("outro");
    await expect(http.post("auth/login/", {})).rejects.toBeTruthy();
    expect(getToken()).toBe("outro");
  });

  it("explica erros da API em português", async () => {
    responder(400, { non_field_errors: ["Credenciais inválidas."] });
    const erro = await http.get("x/").catch((e: unknown) => e);
    expect(explicarErro(erro)).toBe("Credenciais inválidas.");
  });
});

describe("exportação CSV", () => {
  it("usa ; , BOM e vírgula decimal", () => {
    const csv = materiaisParaCsv([
      {
        id: "1",
        codigo: "INS-0422",
        nome: "Elástico 25mm",
        categoria: "aviamento",
        unidade: "m",
        estoque_atual: 12.5,
        estoque_minimo: 20,
        atualizado_em: "2026-11-05T10:00:00Z",
        fornecedor_nome: null,
        status: "baixo",
        prioridade: 2,
        solicitacao_aberta: false,
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Código";"Material"');
    expect(csv).toContain('"Elástico 25mm"');
    expect(csv).toContain('"12,5"');
    expect(csv).toContain('"Baixo"');
  });
});
