import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  MessageSquare,
  GraduationCap,
  Calculator,
  CalendarDays,
  PanelLeft,
  Sparkles,
  Moon,
  Sun,
  Languages,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppProvider } from "@/lib/app-context";
import { useTheme } from "@/hooks/use-theme";
import { I18nProvider, LANGUAGES, useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

type NavItem = {
  to: "/" | "/universities" | "/calculator" | "/deadlines";
  labelKey: string;
  icon: typeof MessageSquare;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", labelKey: "nav.chat", icon: MessageSquare, exact: true },
  { to: "/universities", labelKey: "nav.universities", icon: GraduationCap },
  { to: "/calculator", labelKey: "nav.calculator", icon: Calculator },
  { to: "/deadlines", labelKey: "nav.deadlines", icon: CalendarDays },
];

function AppLayout() {
  return (
    <I18nProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </I18nProvider>
  );
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { toggle, isDark } = useTheme();
  const { t, lang, setLang } = useI18n();

  return (
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <aside
          className={cn(
            "flex flex-col bg-sidebar transition-[width] duration-300 ease-out",
            collapsed ? "w-[68px]" : "w-[248px]",
          )}
        >
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            {!collapsed && (
              <span className="truncate text-[15px] font-semibold tracking-tight">
                {t("brand")}
              </span>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV.map((item) => {
              const isActive = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-1 p-3">
            <LanguageMenu collapsed={collapsed} lang={lang} setLang={setLang} />

            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              aria-label={isDark ? t("sidebar.theme.light") : t("sidebar.theme.dark")}
              title={isDark ? t("sidebar.theme.light") : t("sidebar.theme.dark")}
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              ) : (
                <Moon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              )}
              {!collapsed && (
                <span>{isDark ? t("sidebar.theme.light") : t("sidebar.theme.dark")}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              aria-label={t("sidebar.collapse")}
            >
              <PanelLeft className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>{t("sidebar.collapse")}</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
  );
}

function LanguageMenu({
  collapsed,
  lang,
  setLang,
}: {
  collapsed: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        aria-label={t("sidebar.language")}
        title={t("sidebar.language")}
      >
        <Languages className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        {!collapsed && (
          <span className="flex flex-1 items-center justify-between">
            <span>{t("sidebar.language")}</span>
            <span className="text-xs text-muted-foreground">{current.short}</span>
          </span>
        )}
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-30 mb-2 overflow-hidden rounded-xl bg-popover p-1 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)]",
            collapsed ? "bottom-0 left-full ml-2 w-44" : "bottom-full left-0 right-0",
          )}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                l.code === lang
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span>{l.label}</span>
              {l.code === lang && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}