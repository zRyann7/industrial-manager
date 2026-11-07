import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ClipboardList,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Truck,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sair } from "@/lib/auth";

const menu = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/materiais", label: "Materiais", icon: Package },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck },
  { to: "/solicitacoes", label: "Solicitações de compra", icon: ClipboardList },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function Marca({ compacta }: { compacta: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep font-bold text-deep-foreground">
        G
      </div>
      {!compacta && (
        <div>
          <div className="font-semibold tracking-[0.2em] text-primary">GREENISH</div>
          <div className="label-mono">ERP têxtil</div>
        </div>
      )}
    </div>
  );
}

function Navegacao({ compacta, aoNavegar }: { compacta: boolean; aoNavegar?: () => void }) {
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {menu.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          title={item.label}
          onClick={aoNavegar}
          activeOptions={{ exact: item.to === "/" }}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${compacta ? "justify-center" : ""}`}
          activeProps={{ className: "bg-deep text-deep-foreground shadow-md" }}
          inactiveProps={{ className: "text-secondary-foreground hover:bg-card/60" }}
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={compacta ? "sr-only" : ""}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Indica que os números vêm da API Django. */
function FonteDados() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-wider text-primary">
      <span className="h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
      Dados da API
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [compacta, setCompacta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={`bg-sidebar-grad sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border p-4 transition-all lg:flex ${compacta ? "w-[76px]" : "w-60"}`}
      >
        <Marca compacta={compacta} />
        {!compacta && <div className="label-mono mb-2 mt-8 px-2">Menu</div>}
        <div className={compacta ? "mt-8" : ""}>
          <Navegacao compacta={compacta} />
        </div>
        <button
          type="button"
          onClick={() => setCompacta(!compacta)}
          aria-label={compacta ? "Expandir menu" : "Recolher menu"}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {compacta ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" /> Recolher
            </>
          )}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-glass px-4 py-3 backdrop-blur-md sm:px-8">
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar-grad w-64 p-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navegação principal</SheetDescription>
              </SheetHeader>
              <Marca compacta={false} />
              <div className="mt-8">
                <Navegacao compacta={false} aoNavegar={() => setMenuAberto(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <FonteDados />

          <div className="ml-auto flex items-center gap-2 border-l border-border pl-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-mint text-sm font-semibold text-deep">
              RR
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-medium">Ryan R.</div>
              <div className="label-mono">Almoxarife</div>
            </div>
            <button
              type="button"
              onClick={sair}
              aria-label="Sair"
              title="Sair"
              className="ml-1 grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="space-y-8 px-4 py-6 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
