// Guarda o token JWT em memória + localStorage e avisa quem estiver ouvindo (useAuth).
// Fica separado do React para o interceptor do Axios poder ler o token sem hooks.

const CHAVE = "erp-estoque:token";

let token: string | null | undefined;
const ouvintes = new Set<() => void>();

function lerDoStorage(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

/** Token atual. No servidor (SSR) não existe sessão, então devolve sempre `null`. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (token === undefined) token = lerDoStorage();
  return token;
}

export function setToken(novo: string | null) {
  token = novo;
  try {
    if (novo) window.localStorage.setItem(CHAVE, novo);
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // Storage indisponível (modo privado, por exemplo): a sessão vale só até recarregar.
  }
  ouvintes.forEach((fn) => fn());
}

export function assinarToken(fn: () => void) {
  ouvintes.add(fn);
  // Login/logout em outra aba.
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      token = lerDoStorage();
      fn();
    }
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(fn);
    window.removeEventListener("storage", aoMudarStorage);
  };
}
