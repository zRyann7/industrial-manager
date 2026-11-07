import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";

import { entrar } from "@/lib/auth";
import { explicarErro } from "@/lib/erros";

const campo =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

/** Tela de login: envia usuário/senha para /auth/login/ e guarda o JWT recebido. */
export function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await entrar(usuario.trim(), senha);
    } catch (falha) {
      const recusado =
        isAxiosError(falha) && (falha.response?.status === 400 || falha.response?.status === 401);
      setErro(recusado ? "Email ou senha inválidos." : explicarErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={(e) => void aoEnviar(e)} className="glass-card w-full max-w-sm space-y-5 p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep font-bold text-deep-foreground">
            G
          </div>
          <div>
            <div className="font-semibold tracking-[0.2em] text-primary">GREENISH</div>
            <div className="label-mono">ERP têxtil</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="label-mono">
            Usuário
          </label>
          <input
            id="email"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="email"
            required
            autoFocus
            className={campo}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="senha" className="label-mono">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            className={campo}
          />
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando || !usuario || !senha}
          className="w-full rounded-xl bg-deep px-4 py-2.5 text-sm font-semibold text-deep-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
