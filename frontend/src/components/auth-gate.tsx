import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { LoginForm } from "@/components/login-form";
import { useToken } from "@/lib/auth";

/** Só mostra o app com sessão ativa; sem token (ou com 401 da API) volta para o login. */
export function AuthGate({ children }: { children: ReactNode }) {
  const token = useToken();
  const queryClient = useQueryClient();

  // Sem sessão não deve sobrar nenhum dado do usuário anterior em cache.
  useEffect(() => {
    if (token === null) queryClient.clear();
  }, [token, queryClient]);

  // `undefined`: servidor/hidratação, ainda não dá para saber se existe token no navegador.
  if (token === undefined) return <div className="min-h-screen" aria-busy="true" />;
  if (token === null) return <LoginForm />;
  return <>{children}</>;
}
