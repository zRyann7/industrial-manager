import { useEffect, useState } from "react";

/** Devolve `valor` somente depois de `atrasoMs` sem mudanças (evita uma consulta por tecla). */
export function useDebouncedValue<T>(valor: T, atrasoMs = 300): T {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setAtrasado(valor), atrasoMs);
    return () => clearTimeout(id);
  }, [valor, atrasoMs]);
  return atrasado;
}
