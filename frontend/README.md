# Greenish ERP Têxtil · controle de estoque

Controle de estoque de **matéria-prima e aviamentos** para uma fábrica de roupas
(tecidos, aviamentos, linhas e embalagens). Sem valores monetários.

Frontend em TanStack Start, React, Tailwind v4, shadcn/ui, Recharts, TanStack Query e Axios.
O backend é uma API **Django REST Framework** separada, com login por **JWT**.

## Rodando

```sh
bun install        # ou: npm i
bun run dev        # ou: npm run dev
```

O app espera a API em `http://localhost:8000/api/`. Para outro endereço, copie
`.env.example` para `.env.local` e ajuste `VITE_API_URL`.

No Django, libere a origem do frontend no CORS (por exemplo com `django-cors-headers`:
`CORS_ALLOWED_ORIGINS`), senão o navegador bloqueia as chamadas.

## Autenticação

Ao abrir o app sem sessão aparece a tela de login. Ela faz
`POST /api/auth/login/` com `{ "username": "...", "password": "..." }` e guarda o JWT
recebido (`access`, ou `token`) no `localStorage`. Toda requisição seguinte leva
`Authorization: Bearer <jwt>`. Um `401` da API encerra a sessão e volta ao login.

## Contrato com a API

Todas as rotas ficam em `src/lib/api.ts` (objeto `ROTAS`):

| Tela          | Requisição                                                                              |
| ------------- | --------------------------------------------------------------------------------------- |
| Dashboard     | `GET dashboard/resumo/`, `dashboard/categorias/`, `dashboard/movimentacoes-mensais/`    |
| Materiais     | `GET materiais/?status=&categoria=&search=&limit=`                                      |
| Movimentações | `GET movimentacoes/?limit=`                                                             |
| Fornecedores  | `GET fornecedores/`                                                                     |
| Solicitações  | `GET solicitacoes-compra/` · `POST solicitacoes-compra/ { material }` (409 = já existe) |

Listas podem vir puras ou paginadas (`{ count, results }`). Os formatos de resposta estão em
`src/lib/types.ts`.

### Saldo e status vêm do backend

O frontend **não calcula** o status do estoque. Cada material chega com `estoque_atual`,
`estoque_minimo` e `status` (`em_estoque`, `baixo` ou `ruptura`) já resolvidos pela API;
as telas só exibem esses valores. Campos decimais que o DRF serializa como string
(`"12.500"`) são apenas convertidos para número.

## Estrutura

- `src/routes/`: páginas (`/`, `/materiais`, `/movimentacoes`, `/fornecedores`, `/solicitacoes`)
- `src/components/`: shell com menu, login, KPIs, gráfico, tabela de materiais, badges
- `src/lib/http.ts`: instância do Axios (base URL, Bearer, tratamento de 401)
- `src/lib/api.ts`: chamadas à API · `src/lib/estoque-api.ts`: hooks do TanStack Query
- `src/lib/auth.ts`, `src/lib/auth-store.ts`: login e armazenamento do JWT
